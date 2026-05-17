import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Snackbar,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    MenuItem,
    Tooltip,
    TablePagination,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Html5Qrcode } from 'html5-qrcode';
import { adminBookingService, adminUserService } from '../services/adminApi';
import { Booking } from '../types';

export const AdminBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [userEmailMap, setUserEmailMap] = useState<Record<string, string>>({});
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanDialogOpen, setScanDialogOpen] = useState(false);
    const [scanError, setScanError] = useState('');
    const [manualToken, setManualToken] = useState('');
    const [scanRequestLoading, setScanRequestLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scanInProgressRef = useRef(false);
    const lastScanAtRef = useRef(0);
    const QR_READER_REGION_ID = 'admin-booking-qr-reader';
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const [bookingResponse, usersResponse] = await Promise.all([
                adminBookingService.getAllBookings(),
                adminUserService.getAllUsers(),
            ]);

            setBookings(bookingResponse.data.result || []);

            const nextUserEmailMap = (usersResponse.data.result || []).reduce<Record<string, string>>((acc, user: any) => {
                acc[user.id] = user.email;
                return acc;
            }, {});
            setUserEmailMap(nextUserEmailMap);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (bookingId: string) => {
        setProcessingId(bookingId);
        try {
            await adminBookingService.confirmBooking(bookingId);
            setSnackbar({ open: true, severity: 'success', message: 'Đặt vé đã được xác nhận thành công!' });
            await fetchBookings();
        } catch (err: any) {
            setSnackbar({ open: true, severity: 'error', message: err?.response?.data?.message || 'Xác nhận thất bại.' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (bookingId: string) => {
        setProcessingId(bookingId);
        try {
            await adminBookingService.cancelBooking(bookingId);
            setSnackbar({ open: true, severity: 'info', message: 'Đặt vé đã bị hủy.' });
            await fetchBookings();
        } catch (err: any) {
            setSnackbar({ open: true, severity: 'error', message: err?.response?.data?.message || 'Hủy thất bại.' });
        } finally {
            setProcessingId(null);
        }
    };

    const extractTokenFromQrContent = (rawContent: string) => {
        const content = rawContent?.trim();
        if (!content) return '';

        // Direct token formats first (short token / JWT)
        const directMatch = content.match(/(TCK_[A-Za-z0-9_-]{8,}|[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
        if (directMatch?.[0]) return directMatch[0];

        try {
            const parsed = JSON.parse(content);
            if (typeof parsed === 'string') {
                const parsedMatch = parsed.match(/(TCK_[A-Za-z0-9_-]{8,}|[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
                return parsedMatch?.[0] || parsed.trim();
            }
            if (parsed?.token && typeof parsed.token === 'string') {
                return parsed.token.trim();
            }
            if (parsed?.qrToken && typeof parsed.qrToken === 'string') {
                return parsed.qrToken.trim();
            }
        } catch {
            // not json, continue parsing as raw string or url
        }

        try {
            const url = new URL(content);
            const queryToken = url.searchParams.get('token') || url.searchParams.get('qrToken');
            if (queryToken) return queryToken;
        } catch {
            // not url, fallback to raw
        }

        return content;
    };

    const executeScanConfirm = useCallback(async (rawContent: string) => {
        const token = extractTokenFromQrContent(rawContent);
        if (!token) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: 'Không đọc được token từ mã QR.',
            });
            return;
        }

        try {
            setScanRequestLoading(true);
            await adminBookingService.scanQr(token);
            setSnackbar({
                open: true,
                severity: 'success',
                message: 'Quét QR thành công. Vé đã được xác nhận sử dụng.',
            });
            setScanDialogOpen(false);
            setManualToken('');
            await fetchBookings();
        } catch (error: any) {
            setSnackbar({
                open: true,
                severity: 'error',
                message: error?.response?.data?.message || 'Quét QR thất bại. Vui lòng kiểm tra lại mã.',
            });
        } finally {
            setScanRequestLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!scanDialogOpen) {
            setScanError('');
            return;
        }

        let disposed = false;

        const startScanner = async () => {
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (!cameras?.length) {
                    setScanError('Không tìm thấy camera. Bạn có thể dán token QR thủ công bên dưới.');
                    return;
                }

                const scanner = new Html5Qrcode(QR_READER_REGION_ID);
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1,
                    },
                    async (decodedText) => {
                        if (scanInProgressRef.current || disposed) return;

                        const now = Date.now();
                        if (now - lastScanAtRef.current < 1800) return;
                        lastScanAtRef.current = now;

                        scanInProgressRef.current = true;
                        await executeScanConfirm(decodedText);
                        scanInProgressRef.current = false;
                    },
                    () => {
                        // ignore decode errors frame-by-frame
                    }
                );
            } catch {
                setScanError('Không thể mở camera. Vui lòng cấp quyền camera hoặc dán token thủ công.');
            }
        };

        startScanner();

        return () => {
            disposed = true;
            scanInProgressRef.current = false;
            const scanner = scannerRef.current;
            scannerRef.current = null;

            if (scanner) {
                scanner
                    .stop()
                    .catch(() => undefined)
                    .finally(() => {
                        try {
                            scanner.clear();
                        } catch {
                            // ignore cleanup errors
                        }
                    });
            }
        };
    }, [executeScanConfirm, scanDialogOpen]);

    const getConcertLabel = (booking: Booking) => booking.concertId ? `Concert #${booking.concertId.slice(0, 8)}` : 'N/A';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' };
            case 'PENDING':
                return { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' };
            case 'CANCELLED':
                return { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336' };
            default:
                return { bg: 'rgba(0, 0, 0, 0.1)', color: '#666' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Đã Xác Nhận';
            case 'PENDING':
                return 'Chờ Xử Lý';
            case 'CANCELLED':
                return 'Đã Hủy';
            default:
                return status;
        }
    };

    const filteredBookings = bookings
        .filter((booking) => {
            const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
            const displayUserEmail = userEmailMap[booking.userId] || booking.userId;
            const matchesSearch =
                searchQuery === '' ||
                displayUserEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.bookingId.includes(searchQuery);
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            const timeA = new Date(a.bookingTime).getTime();
            const timeB = new Date(b.bookingTime).getTime();
            return timeB - timeA;
        });

    const paginatedBookings = filteredBookings.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const truncateId = (value: string, start = 8, end = 6) => {
        if (value.length <= start + end + 3) return value;
        return `${value.slice(0, start)}...${value.slice(-end)}`;
    };

    useEffect(() => {
        setPage(0);
    }, [filterStatus, searchQuery, rowsPerPage]);

    useEffect(() => {
        const maxPage = Math.max(0, Math.ceil(filteredBookings.length / rowsPerPage) - 1);
        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [filteredBookings.length, rowsPerPage, page]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 0 }}>
                    Quản Lý Đặt Vé
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<QrCodeScannerIcon />}
                    onClick={() => setScanDialogOpen(true)}
                >
                    Quét QR vé
                </Button>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="Tìm kiếm"
                    placeholder="Tìm theo mã đặt vé hoặc email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 300 }}
                    size="small"
                />
                <TextField
                    select
                    label="Trạng Thái"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ width: 200 }}
                    size="small"
                >
                    <MenuItem value="all">Tất Cả</MenuItem>
                    <MenuItem value="CONFIRMED">Đã Xác Nhận</MenuItem>
                    <MenuItem value="PENDING">Chờ Xử Lý</MenuItem>
                    <MenuItem value="CANCELLED">Đã Hủy</MenuItem>
                </TextField>
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2">Đang tải dữ liệu...</Typography>
                    </Box>
                )}
            </Box>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Mã Đặt Vé</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Concert ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Ghế</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Thời Gian Đặt</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedBookings.map((booking) => {
                            const statusStyle = getStatusColor(booking.status);
                            const displayUserEmail = userEmailMap[booking.userId] || booking.userId;
                            return (
                                <TableRow
                                    key={booking.bookingId}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Tooltip title={booking.bookingId} arrow>
                                            <Typography fontWeight={600}>
                                                #{truncateId(booking.bookingId)}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={displayUserEmail} arrow>
                                            <Typography>
                                                {truncateId(displayUserEmail)}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                <TableCell>
                                            {getConcertLabel(booking)}
                                    </TableCell>
                                    <TableCell>{booking.seatCodes?.join(', ') || 'N/A'}</TableCell>
                                    <TableCell>
                                        {new Date(booking.bookingTime).toLocaleString('vi-VN', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(booking.status)}
                                            size="small"
                                            sx={{
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.color,
                                                fontWeight: 600,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {booking.status === 'PENDING' && (
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                <Tooltip title="Xác nhận đặt vé">
                                                    <span>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            disabled={processingId === booking.bookingId}
                                                            onClick={() => handleConfirm(booking.bookingId)}
                                                            startIcon={processingId === booking.bookingId ? <CircularProgress size={12} /> : <CheckCircleIcon />}
                                                            sx={{ textTransform: 'none', fontSize: 12, px: 1.5, py: 0.5, minWidth: 0 }}
                                                        >
                                                            Xác nhận
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Hủy đặt vé">
                                                    <span>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            disabled={processingId === booking.bookingId}
                                                            onClick={() => handleCancel(booking.bookingId)}
                                                            startIcon={<CancelIcon />}
                                                            sx={{ textTransform: 'none', fontSize: 12, px: 1.5, py: 0.5, minWidth: 0 }}
                                                        >
                                                            Hủy
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            </Box>
                                        )}
                                        {booking.status !== 'PENDING' && (
                                            <Typography variant="caption" color="text.disabled">—</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {filteredBookings.length > 0 && (
                <TablePagination
                    component="div"
                    count={filteredBookings.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 20]}
                    labelRowsPerPage="Số dòng mỗi trang"
                />
            )}

            {filteredBookings.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        color: 'text.secondary',
                    }}
                >
                    <Typography variant="h6">Không có dữ liệu</Typography>
                </Box>
            )}

            <Dialog
                open={scanDialogOpen}
                onClose={() => {
                    if (!scanRequestLoading) {
                        setScanDialogOpen(false);
                    }
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Quét QR xác nhận vé</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Hướng camera vào mã QR của khách để xác nhận vé đã sử dụng.
                    </Typography>

                    <Box
                        id={QR_READER_REGION_ID}
                        sx={{
                            width: '100%',
                            minHeight: 280,
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                        }}
                    />

                    {scanError && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {scanError}
                        </Alert>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Hoặc dán token QR thủ công:
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Dán token hoặc nội dung QR..."
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        disabled={scanRequestLoading}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setScanDialogOpen(false)}
                        disabled={scanRequestLoading}
                    >
                        Đóng
                    </Button>
                    <Button
                        variant="contained"
                        disabled={scanRequestLoading || !manualToken.trim()}
                        onClick={() => executeScanConfirm(manualToken)}
                        startIcon={scanRequestLoading ? <CircularProgress size={16} /> : undefined}
                    >
                        Xác nhận token
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
