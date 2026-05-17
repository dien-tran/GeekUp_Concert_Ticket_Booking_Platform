import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, Select, MenuItem, TablePagination, Alert, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { adminVoucherService, adminConcertService } from '../../services/adminApi';
import { Voucher } from '../../types';

const defaultForm = {
    concertId: '',
    code: '',
    discountValue: '',
    discountType: 'FIXED_AMOUNT',
    usageLimit: '',
    status: 'ACTIVE',
    minOrderAmount: '',
    maxDiscountAmount: '',
};

export const AdminVouchers: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [concerts, setConcerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [formData, setFormData] = useState(defaultForm);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [voucherRes, concertRes] = await Promise.all([
                adminVoucherService.getAllVouchers(),
                adminConcertService.getConcerts(),
            ]);
            setVouchers(voucherRes.data?.result || []);
            setConcerts(concertRes.data?.result || []);
        } catch {
            showSnackbar('Failed to load vouchers.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') =>
        setSnackbar({ open: true, message, severity });

    const handleOpenDialog = (voucher?: Voucher) => {
        if (voucher) {
            setEditingVoucher(voucher);
            setFormData({
                concertId: voucher.concertId || '',
                code: voucher.code,
                discountValue: String(voucher.discountValue),
                discountType: voucher.discountType || 'FIXED_AMOUNT',
                usageLimit: String(voucher.usageLimit || voucher.usedCount || 0),
                status: voucher.status,
                minOrderAmount: String(voucher.minOrderAmount || ''),
                maxDiscountAmount: String(voucher.maxDiscountAmount || ''),
            });
        } else {
            setEditingVoucher(null);
            setFormData(defaultForm);
        }
        setOpenDialog(true);
    };

    const handleClose = () => { setOpenDialog(false); setEditingVoucher(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as any;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.code || !formData.discountValue) {
            showSnackbar('Code and discount value are required.', 'error'); return;
        }
        const payload: any = {
            code: formData.code.trim().toUpperCase(),
            concertId: formData.concertId || undefined,
            discountValue: Number(formData.discountValue),
            discountType: formData.discountType,
            usageLimit: Number(formData.usageLimit) || 100,
            status: formData.status,
            minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
            maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        };
        try {
            if (editingVoucher) {
                await adminVoucherService.updateVoucher(editingVoucher.id, payload);
                showSnackbar('Voucher updated!', 'success');
            } else {
                await adminVoucherService.createVoucher(payload);
                showSnackbar('Voucher created!', 'success');
            }
            handleClose();
            fetchAll();
        } catch (err: any) {
            showSnackbar(err?.response?.data?.message || 'Failed to save voucher.', 'error');
        }
    };

    const getConcertTitle = (id: string | undefined) =>
        !id ? 'All Concerts' : (concerts.find((c: any) => c.id === id)?.title || id?.slice(0, 8) || 'N/A');

    const paginatedVouchers = vouchers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>Voucher Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                    sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)', borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}>
                    Add Voucher
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Concert</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Used / Limit</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Loading...</TableCell></TableRow>}
                        {!loading && paginatedVouchers.map(voucher => (
                            <TableRow key={voucher.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                                <TableCell>
                                    <Typography fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#7C3AED' }}>
                                        {voucher.code}
                                    </Typography>
                                </TableCell>
                                <TableCell><Typography variant="body2">{getConcertTitle(voucher.concertId)}</Typography></TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>
                                        {voucher.discountType === 'PERCENTAGE'
                                            ? `${voucher.discountValue}%`
                                            : `${Number(voucher.discountValue).toLocaleString('vi-VN')} VND`
                                        }
                                    </Typography>
                                </TableCell>
                                <TableCell>{voucher.usedCount || 0} / {voucher.usageLimit || '∞'}</TableCell>
                                <TableCell>
                                    <Chip label={voucher.status} size="small" sx={{
                                        backgroundColor: voucher.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 
                                                         voucher.status === 'OUT_OF_STOCK' ? 'rgba(245,158,11,0.1)' :
                                                         voucher.status === 'EXPIRED' ? 'rgba(107,114,128,0.1)' :
                                                         'rgba(239,68,68,0.1)',
                                        color: voucher.status === 'ACTIVE' ? '#059669' : 
                                               voucher.status === 'OUT_OF_STOCK' ? '#D97706' :
                                               voucher.status === 'EXPIRED' ? '#4B5563' :
                                               '#EF4444',
                                        fontWeight: 600,
                                    }} />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => handleOpenDialog(voucher)} sx={{ color: '#3B82F6' }}><EditIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && vouchers.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 8, color: 'text.secondary' }}>No vouchers found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {vouchers.length > rowsPerPage && (
                <TablePagination component="div" count={vouchers.length} page={page}
                    onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 20]} />
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{editingVoucher ? 'Edit Voucher' : 'Add Voucher'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField fullWidth label="Voucher Code *" name="code" value={formData.code} onChange={handleChange}
                            placeholder="e.g. SUMMER25" inputProps={{ style: { textTransform: 'uppercase' } }}
                            disabled={!!editingVoucher} />
                        <Select fullWidth name="concertId" value={formData.concertId} onChange={handleChange as any}
                            displayEmpty renderValue={v => v ? getConcertTitle(v as string) : '— All Concerts —'}>
                            <MenuItem value="">— All Concerts —</MenuItem>
                            {concerts.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                        </Select>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Select fullWidth name="discountType" value={formData.discountType} onChange={handleChange as any}>
                                <MenuItem value="FIXED_AMOUNT">Fixed Amount (VND)</MenuItem>
                                <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                            </Select>
                            <TextField fullWidth label="Discount Value *" name="discountValue" type="number"
                                value={formData.discountValue} onChange={handleChange} inputProps={{ min: 0 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField fullWidth label="Usage Limit" name="usageLimit" type="number"
                                value={formData.usageLimit} onChange={handleChange} inputProps={{ min: 1 }} />
                            <Select fullWidth name="status" value={formData.status} onChange={handleChange as any}>
                                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                                <MenuItem value="OUT_OF_STOCK">OUT_OF_STOCK</MenuItem>
                            </Select>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField fullWidth label="Min Order Amount (VND)" name="minOrderAmount" type="number"
                                value={formData.minOrderAmount} onChange={handleChange} inputProps={{ min: 0 }} />
                            <TextField fullWidth label="Max Discount Amount (VND)" name="maxDiscountAmount" type="number"
                                value={formData.maxDiscountAmount} onChange={handleChange} inputProps={{ min: 0 }} />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}
                        sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)', textTransform: 'none', px: 3, fontWeight: 600 }}>
                        {editingVoucher ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};
