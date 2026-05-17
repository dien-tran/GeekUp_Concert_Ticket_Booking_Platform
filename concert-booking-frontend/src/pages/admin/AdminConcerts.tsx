import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Select,
    MenuItem,
    TablePagination,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import { adminConcertService } from '../../services/adminApi';
import { API_BASE_URL, tokenStorage } from '../../services/api';
import { Concert } from '../../types';

const CONCERT_STATUS = ['COMING_SOON', 'NOW_SHOWING', 'ENDED'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    NOW_SHOWING: { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
    COMING_SOON: { bg: 'rgba(124,58,237,0.1)', text: '#7C3AED' },
    ENDED: { bg: 'rgba(107,114,128,0.1)', text: '#4B5563' },
};

const defaultForm = {
    title: '',
    description: '',
    duration: '',
    posterUrl: '',
    openDate: '',
    startTime: '',
    status: 'COMING_SOON',
    totalTickets: '',
    standardPrice: '',
    vipPrice: '',
    standardQuantity: '',
    vipQuantity: '',
};

// ─── Upload poster to backend → Cloudinary ───────────────────────────────────
const uploadPosterToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = tokenStorage.get();
    const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed (${res.status})`);
    }
    // Backend returns plain string URL
    return res.text();
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AdminConcerts: React.FC = () => {
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingConcert, setEditingConcert] = useState<Concert | null>(null);
    const [formData, setFormData] = useState(defaultForm);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false, message: '', severity: 'success',
    });

    // Upload state
    const [uploadingPoster, setUploadingPoster] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchConcerts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminConcertService.getConcerts();
            setConcerts(response.data?.result || []);
        } catch {
            showSnackbar('Không thể tải danh sách concert.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConcerts(); }, [fetchConcerts]);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') =>
        setSnackbar({ open: true, message, severity });

    // ─── File picker → upload → fill posterUrl ───
    const handlePosterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('image/')) {
            showSnackbar('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP…)', 'error'); return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showSnackbar('Ảnh không được vượt quá 10 MB.', 'error'); return;
        }

        setUploadingPoster(true);
        setUploadProgress(10);

        // Fake intermediate progress for UX
        const progressTimer = setInterval(() => {
            setUploadProgress(p => Math.min(p + 15, 85));
        }, 400);

        try {
            const url = await uploadPosterToCloudinary(file);
            clearInterval(progressTimer);
            setUploadProgress(100);
            setFormData(prev => ({ ...prev, posterUrl: url }));
            showSnackbar('Upload ảnh thành công!', 'success');
        } catch (err: any) {
            clearInterval(progressTimer);
            showSnackbar(`Upload thất bại: ${err.message}`, 'error');
        } finally {
            setUploadingPoster(false);
            setUploadProgress(0);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ─── Dialog open/close ───
    const handleOpenDialog = (concert?: Concert) => {
        if (concert) {
            setEditingConcert(concert);
            setFormData({
                title: concert.title,
                description: concert.description || '',
                duration: String(concert.duration || ''),
                posterUrl: concert.posterUrl || concert.imageUrl || '',
                openDate: concert.openDate ? concert.openDate.split('T')[0] : '',
                startTime: concert.startTime ? concert.startTime.replace(' ', 'T').substring(0, 16) : '',
                status: concert.status,
                totalTickets: '',
                standardPrice: '',
                vipPrice: '',
                standardQuantity: '',
                vipQuantity: '',
            });
        } else {
            setEditingConcert(null);
            setFormData(defaultForm);
        }
        setOpenDialog(true);
    };

    const handleClose = () => { setOpenDialog(false); setEditingConcert(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as any;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ─── Submit ───
    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            showSnackbar('Tên concert là bắt buộc.', 'error'); return;
        }
        if (!formData.duration) {
            showSnackbar('Thời lượng là bắt buộc.', 'error'); return;
        }
        const durationValue = Number(formData.duration);
        if (!Number.isInteger(durationValue) || durationValue < 1) {
            showSnackbar('Thời lượng phải là số nguyên dương.', 'error'); return;
        }
        const payload: any = {
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            duration: durationValue,
            status: formData.status,
            posterUrl: formData.posterUrl.trim() || undefined,
            openDate: formData.openDate || undefined,
            startTime: formData.startTime || undefined,
            totalTickets: Number(formData.totalTickets) || undefined,
            standardPrice: Number(formData.standardPrice) || undefined,
            vipPrice: Number(formData.vipPrice) || undefined,
            standardQuantity: Number(formData.standardQuantity) || undefined,
            vipQuantity: Number(formData.vipQuantity) || undefined,
        };
        try {
            if (editingConcert) {
                await adminConcertService.updateConcert(editingConcert.id, payload);
                showSnackbar('Cập nhật concert thành công!', 'success');
            } else {
                await adminConcertService.createConcert(payload);
                showSnackbar('Tạo concert thành công!', 'success');
            }
            handleClose();
            fetchConcerts();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Không thể lưu concert.';
            showSnackbar(msg, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Xoá concert này? Hành động không thể hoàn tác.')) return;
        try {
            await adminConcertService.deleteConcert(id);
            showSnackbar('Concert đã được xoá.', 'success');
            fetchConcerts();
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Không thể xoá concert.';
            showSnackbar(msg, 'error');
        }
    };

    const paginatedConcerts = concerts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>Concert Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                        borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600,
                    }}
                >
                    Add Concert
                </Button>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Poster</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Open Date</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && paginatedConcerts.map(concert => (
                            <TableRow key={concert.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                                <TableCell>
                                    <img
                                        src={concert.posterUrl || concert.imageUrl || '/placeholder-concert.jpg'}
                                        alt={concert.title}
                                        style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 8 }}
                                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder-concert.jpg'; }}
                                    />
                                </TableCell>
                                <TableCell><Typography fontWeight={600}>{concert.title}</Typography></TableCell>
                                <TableCell>{concert.duration} min</TableCell>
                                <TableCell>
                                    <Chip
                                        label={concert.status}
                                        size="small"
                                        sx={{
                                            backgroundColor: STATUS_COLORS[concert.status]?.bg ?? 'rgba(0,0,0,0.06)',
                                            color: STATUS_COLORS[concert.status]?.text ?? '#333',
                                            fontWeight: 600,
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {concert.openDate
                                        ? new Date(concert.openDate).toLocaleDateString('vi-VN')
                                        : 'TBA'}
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" onClick={() => handleOpenDialog(concert)} sx={{ color: '#3B82F6' }}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" onClick={() => handleDelete(concert.id)} sx={{ color: '#EF4444' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && concerts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                    No concerts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {concerts.length > rowsPerPage && (
                <TablePagination
                    component="div"
                    count={concerts.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 20]}
                />
            )}

            {/* ─── Create / Edit Dialog ─── */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                    {editingConcert ? 'Edit Concert' : 'Add New Concert'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Basic info */}
                        <TextField
                            fullWidth label="Concert Title *" name="title"
                            value={formData.title} onChange={handleChange}
                        />
                        <TextField
                            fullWidth label="Description" name="description"
                            value={formData.description} onChange={handleChange}
                            multiline rows={3}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth label="Duration (minutes) *" name="duration"
                                type="number" value={formData.duration} onChange={handleChange}
                                inputProps={{ min: 1, step: 1 }}
                            />
                            <Select fullWidth name="status" value={formData.status} onChange={handleChange as any}>
                                {CONCERT_STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth label="Open Date" name="openDate" type="date"
                                value={formData.openDate} onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth label="Start Time" name="startTime" type="datetime-local"
                                value={formData.startTime} onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>

                        {/* ─── Poster Upload ─── */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Poster Image
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {/* Preview */}
                                <Box
                                    sx={{
                                        width: 120, height: 160, borderRadius: 2,
                                        border: '2px dashed rgba(124,58,237,0.35)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0, backgroundColor: 'rgba(124,58,237,0.03)',
                                        position: 'relative',
                                    }}
                                >
                                    {uploadingPoster ? (
                                        <CircularProgress size={32} sx={{ color: '#7C3AED' }} />
                                    ) : formData.posterUrl ? (
                                        <img
                                            src={formData.posterUrl}
                                            alt="Poster preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <ImageIcon sx={{ fontSize: 40, color: 'rgba(124,58,237,0.3)' }} />
                                    )}
                                </Box>

                                {/* Controls */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 200 }}>
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="poster-upload-input"
                                        onChange={handlePosterFileChange}
                                    />
                                    <Button
                                        component="label"
                                        htmlFor="poster-upload-input"
                                        variant="outlined"
                                        startIcon={uploadingPoster ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                        disabled={uploadingPoster}
                                        sx={{
                                            borderColor: '#7C3AED', color: '#7C3AED',
                                            textTransform: 'none', fontWeight: 600,
                                            '&:hover': { borderColor: '#6D28D9', backgroundColor: 'rgba(124,58,237,0.06)' },
                                        }}
                                    >
                                        {uploadingPoster ? 'Đang upload...' : 'Upload từ máy tính'}
                                    </Button>

                                    {uploadingPoster && (
                                        <LinearProgress
                                            variant="determinate"
                                            value={uploadProgress}
                                            sx={{ borderRadius: 4, height: 6, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #7C3AED, #DB2777)' } }}
                                        />
                                    )}

                                    <Typography variant="caption" color="text.secondary">
                                        Hoặc dán URL trực tiếp vào ô bên dưới
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Poster URL"
                                        name="posterUrl"
                                        value={formData.posterUrl}
                                        onChange={handleChange}
                                        placeholder="https://res.cloudinary.com/..."
                                        size="small"
                                        disabled={uploadingPoster}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        JPG, PNG, WEBP — tối đa 10 MB. Ảnh sẽ được crop thành 280×420.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Ticket pricing (create only) */}
                        {!editingConcert && (
                            <>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                                    Ticket Pricing (tuỳ chọn — có thể cấu hình sau)
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField fullWidth label="Total Tickets" name="totalTickets" type="number" value={formData.totalTickets} onChange={handleChange} />
                                    <TextField fullWidth label="Standard Price" name="standardPrice" type="number" value={formData.standardPrice} onChange={handleChange} />
                                    <TextField fullWidth label="VIP Price" name="vipPrice" type="number" value={formData.vipPrice} onChange={handleChange} />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField fullWidth label="Standard Qty" name="standardQuantity" type="number" value={formData.standardQuantity} onChange={handleChange} />
                                    <TextField fullWidth label="VIP Qty" name="vipQuantity" type="number" value={formData.vipQuantity} onChange={handleChange} />
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={uploadingPoster}
                        sx={{
                            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                            textTransform: 'none', px: 3, fontWeight: 600,
                        }}
                    >
                        {editingConcert ? 'Update Concert' : 'Create Concert'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
