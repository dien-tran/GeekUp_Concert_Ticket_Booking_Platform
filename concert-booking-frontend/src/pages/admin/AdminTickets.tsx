import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Chip, Select, MenuItem, TablePagination, Alert, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { Tooltip } from '@mui/material';
import { adminTicketService, adminConcertService } from '../../services/adminApi';

interface TicketCategory {
    id: string;
    concertId: string;
    name: string;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
    availableQuantity: number;
    status: string;
}

const defaultForm = {
    concertId: '',
    name: '',
    price: '',
    totalQuantity: '',
    status: 'AVAILABLE',
};

export const AdminTickets: React.FC = () => {
    const [tickets, setTickets] = useState<TicketCategory[]>([]);
    const [concerts, setConcerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTicket, setEditingTicket] = useState<TicketCategory | null>(null);
    const [formData, setFormData] = useState(defaultForm);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [ticketRes, concertRes] = await Promise.all([
                adminTicketService.getAllTickets(),
                adminConcertService.getConcerts(),
            ]);
            setTickets(ticketRes.data?.result || []);
            setConcerts(concertRes.data?.result || []);
        } catch {
            showSnackbar('Failed to load ticket categories.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') =>
        setSnackbar({ open: true, message, severity });

    const handleOpenDialog = (ticket?: TicketCategory) => {
        if (ticket) {
            setEditingTicket(ticket);
            setFormData({
                concertId: ticket.concertId,
                name: ticket.name,
                price: String(ticket.price),
                totalQuantity: String(ticket.totalQuantity),
                status: ticket.status || 'AVAILABLE',
            });
        } else {
            setEditingTicket(null);
            setFormData(defaultForm);
        }
        setOpenDialog(true);
    };

    const handleClose = () => { setOpenDialog(false); setEditingTicket(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as any;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.concertId || !formData.name || !formData.price || !formData.totalQuantity) {
            showSnackbar('All fields are required.', 'error'); return;
        }
        const payload = {
            concertId: formData.concertId,
            name: formData.name.trim(),
            price: Number(formData.price),
            totalQuantity: Number(formData.totalQuantity),
            status: formData.status,
        };
        try {
            if (editingTicket) {
                await adminTicketService.updateTicketCategory(editingTicket.id, payload);
                showSnackbar('Ticket category updated!', 'success');
            } else {
                await adminTicketService.createTicketCategory(payload);
                showSnackbar('Ticket category created!', 'success');
            }
            handleClose();
            fetchAll();
        } catch (err: any) {
            showSnackbar(err?.response?.data?.message || 'Failed to save ticket category.', 'error');
        }
    };

    const handleGenerateSeats = async (categoryId: string, categoryName: string) => {
        setGeneratingId(categoryId);
        try {
            await adminTicketService.generateSeats(categoryId);
            showSnackbar(`Seats generated for "${categoryName}" — users can now see the seat map!`, 'success');
            fetchAll();
        } catch (err: any) {
            showSnackbar(err?.response?.data?.message || 'Failed to generate seats.', 'error');
        } finally {
            setGeneratingId(null);
        }
    };

    const getConcertTitle = (id: string) => concerts.find((c: any) => c.id === id)?.title || id?.slice(0, 8) || 'N/A';

    const paginatedTickets = tickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>Ticket Category Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
                    sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)', borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}>
                    Add Ticket Category
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Concert</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Price (VND)</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sold</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Available</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>Loading...</TableCell></TableRow>}
                        {!loading && paginatedTickets.map(ticket => (
                            <TableRow key={ticket.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{getConcertTitle(ticket.concertId)}</Typography>
                                </TableCell>
                                <TableCell>{ticket.name}</TableCell>
                                <TableCell>{Number(ticket.price).toLocaleString('vi-VN')}</TableCell>
                                <TableCell>{ticket.totalQuantity}</TableCell>
                                <TableCell>{ticket.soldQuantity || 0}</TableCell>
                                <TableCell>{ticket.availableQuantity ?? (ticket.totalQuantity - (ticket.soldQuantity || 0))}</TableCell>
                                <TableCell>
                                    <Chip label={ticket.status} size="small" sx={{
                                        backgroundColor: ticket.status === 'AVAILABLE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                        color: ticket.status === 'AVAILABLE' ? '#059669' : '#EF4444',
                                        fontWeight: 600,
                                    }} />
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Edit category">
                                        <IconButton size="small" onClick={() => handleOpenDialog(ticket)} sx={{ color: '#3B82F6' }}><EditIcon /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Generate individual seat records (needed for seat map)">
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleGenerateSeats(ticket.id, ticket.name)}
                                                disabled={generatingId === ticket.id}
                                                sx={{ color: '#7C3AED', ml: 0.5 }}
                                            >
                                                {generatingId === ticket.id
                                                    ? <span style={{ fontSize: 12, padding: '0 4px' }}>…</span>
                                                    : <EventSeatIcon fontSize="small" />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && tickets.length === 0 && (
                            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 8, color: 'text.secondary' }}>No ticket categories found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {tickets.length > rowsPerPage && (
                <TablePagination component="div" count={tickets.length} page={page}
                    onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 20]} />
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{editingTicket ? 'Edit Ticket Category' : 'Add Ticket Category'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Select fullWidth name="concertId" value={formData.concertId} onChange={handleChange as any}
                            displayEmpty disabled={!!editingTicket}
                            renderValue={v => v ? getConcertTitle(v as string) : 'Select Concert *'}>
                            {concerts.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                        </Select>
                        <TextField fullWidth label="Category Name *" name="name" value={formData.name} onChange={handleChange}
                            placeholder="e.g. VIP, Standard, GA" />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField fullWidth label="Price (VND) *" name="price" type="number" value={formData.price} onChange={handleChange} inputProps={{ min: 0 }} />
                            <TextField fullWidth label="Total Quantity *" name="totalQuantity" type="number" value={formData.totalQuantity} onChange={handleChange} inputProps={{ min: 1 }} />
                        </Box>
                        <Select fullWidth name="status" value={formData.status} onChange={handleChange as any}>
                            <MenuItem value="AVAILABLE">AVAILABLE</MenuItem>
                            <MenuItem value="SOLD_OUT">SOLD_OUT</MenuItem>
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}
                        sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)', textTransform: 'none', px: 3, fontWeight: 600 }}>
                        {editingTicket ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar(p => ({ ...p, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};
