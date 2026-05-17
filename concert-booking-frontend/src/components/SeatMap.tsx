import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { SeatShowTimeResponse } from '../types';
import { showtimeService } from '../services/api';
import { SeatButton } from './SeatButton';
import { SeatLegend } from './SeatLegend';

interface SeatMapProps {
    showtimeId: string;
    selectedSeats: SeatShowTimeResponse[];
    onSelectSeat: (seat: SeatShowTimeResponse) => void;
    onDeselectSeat: (seatCode: string) => void;
    refreshTrigger?: number;  // Trigger to force refresh seats
}

export const SeatMap: React.FC<SeatMapProps> = ({
    showtimeId,
    selectedSeats,
    onSelectSeat,
    onDeselectSeat,
    refreshTrigger = 0,
}) => {
    const [seats, setSeats] = useState<SeatShowTimeResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch seats on mount and setup polling
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await showtimeService.getSeatsByShowtime(showtimeId);
                setSeats(response.data.result);
                setError(null);
            } catch (err) {
                console.error('Error fetching seats:', err);
                setError('Không thể tải danh sách ghế');
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();

        // Poll for updates every 1.5 seconds for real-time seat status
        const pollInterval = setInterval(() => {
            fetchSeats();
        }, 1500);

        return () => clearInterval(pollInterval);
    }, [showtimeId, refreshTrigger]);

    const getSeatsByRow = (seatList: SeatShowTimeResponse[]) => {
        return seatList.reduce((acc, seat) => {
            const row = seat.seatCode.charAt(0);
            if (!acc[row]) acc[row] = [];
            acc[row].push(seat);
            return acc;
        }, {} as Record<string, SeatShowTimeResponse[]>);
    };

    const seatsByRow = useMemo(() => getSeatsByRow(seats), [seats]);
    const rows = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

    const handleSeatClick = (seat: SeatShowTimeResponse) => {
        const isSelected = selectedSeats.some(s => s.id === seat.id);
        const currentUserEmail = localStorage.getItem('userEmail');

        if (isSelected) {
            onDeselectSeat(seat.seatCode);
        } else if (seat.status === 'AVAILABLE') {
            onSelectSeat(seat);
        } else if (seat.status === 'HOLD' && currentUserEmail && seat.heldByUserEmail === currentUserEmail) {
            // Allow user to resume booking their own held seats
            onSelectSeat(seat);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                {error}
            </Typography>
        );
    }

    return (
        <Box>
            <SeatLegend />

            {/* Screen */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, textAlign: 'center', borderRadius: 2.5, border: '1px solid #E5E7EB', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    🎬 MÀN HÌNH
                </Typography>
            </Paper>

            {/* Seat Grid */}
            <Box sx={{ overflowX: 'auto', mb: 3 }}>
                {rows.map((row) => (
                    <Box
                        key={row}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1.5,
                            justifyContent: 'center',
                        }}
                    >
                        <Typography sx={{ minWidth: 22, fontWeight: 'bold', color: 'text.secondary' }}>
                            {row}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, p: 0.75, borderRadius: 2, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            {seatsByRow[row]
                                .sort((a, b) => {
                                    const numA = parseInt(a.seatCode.substring(1));
                                    const numB = parseInt(b.seatCode.substring(1));
                                    return numA - numB;
                                })
                                .map((seat) => {
                                    const currentUserEmail = localStorage.getItem('userEmail');
                                    const isUsersSeat = seat.status === 'HOLD' && currentUserEmail && seat.heldByUserEmail === currentUserEmail;
                                    const isDisabledSeat = seat.status !== 'AVAILABLE' && !isUsersSeat && !selectedSeats.some(s => s.id === seat.id);

                                    return (
                                        <SeatButton
                                            key={seat.id}
                                            seat={seat}
                                            isSelected={selectedSeats.some(s => s.id === seat.id)}
                                            isDisabled={isDisabledSeat}
                                            onClick={() => handleSeatClick(seat)}
                                        />
                                    );
                                })}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Summary */}
            {selectedSeats.length > 0 && (
                <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        Ghế đã chọn: {selectedSeats.map(s => s.seatCode).join(', ')}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" sx={{ mt: 1, color: 'primary.main' }}>
                        Tổng tiền: ₫{selectedSeats.reduce((sum, s) => sum + s.price, 0).toLocaleString('vi-VN')}
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}; 