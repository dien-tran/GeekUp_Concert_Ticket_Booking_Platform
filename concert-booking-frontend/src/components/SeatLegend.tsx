import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export const SeatLegend: React.FC = () => {
    const statusLegends = [
        { color: '#1D4ED8', border: '#1E3A8A', status: 'AVAILABLE', label: 'Trống' },
        { color: '#DC2626', border: '#7F1D1D', status: 'SELECTED', label: 'Đã chọn' },
        { color: '#7C3AED', border: '#4C1D95', status: 'HOLD', label: 'Đang giữ' },
        { color: '#475569', border: '#1F2937', status: 'BOOKED', label: 'Đã đặt' },
    ];

    const seatTypeLegends = [
        { color: '#1D4ED8', border: '#1E3A8A', status: 'NORMAL', label: 'Ghế thường' },
        { color: '#F59E0B', border: '#92400E', status: 'VIP', label: 'Ghế VIP' },
    ];

    return (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #E5E7EB', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={2} color="text.primary">
                Chú Thích Ghế
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                Trạng thái
            </Typography>
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 2 }}>
                {statusLegends.map((legend) => (
                    <Box key={legend.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: legend.color,
                                borderRadius: 1.2,
                                border: `2px solid ${legend.border}`,
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{legend.label}</Typography>
                    </Box>
                ))}
            </Box>

            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 1 }}>
                Loại ghế
            </Typography>
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                {seatTypeLegends.map((legend) => (
                    <Box key={legend.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: legend.color,
                                borderRadius: 1.2,
                                border: `2px solid ${legend.border}`,
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{legend.label}</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
