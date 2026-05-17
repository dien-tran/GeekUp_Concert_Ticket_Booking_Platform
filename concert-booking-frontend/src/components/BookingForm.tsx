import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

/**
 * BookingForm — legacy stub.
 * The new booking flow uses CheckoutConfirmationPage directly.
 * This component is kept for backward-compat with any pages that still reference it.
 */
interface BookingFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    showTimeId?: string;
    seatShowTimeIds?: string[];
    defaultUserId?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ open, onClose, onSubmit }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Xác nhận đặt vé</DialogTitle>
            <DialogContent>
                <p style={{ color: '#666', padding: '8px 0' }}>
                    Please use the seat selection page to book tickets.
                </p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Đóng</Button>
                {onSubmit && (
                    <Button onClick={onSubmit} variant="contained" color="primary">
                        Xác Nhận
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};