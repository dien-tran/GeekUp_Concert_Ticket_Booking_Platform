import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { ShowTimeDetail } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';

interface ShowtimeHeaderProps {
    showtime: ShowTimeDetail;
    availableSeatsCount: number;
}

export const ShowtimeHeader: React.FC<ShowtimeHeaderProps> = ({ 
    showtime, 
    availableSeatsCount 
}) => {
    // Format thời gian
    const startDateTime = new Date(showtime.startTime);
    const endDateTime = showtime.endTime ? new Date(showtime.endTime) : null;
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };
    
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: '0 6px 18px -14px rgba(0,0,0,0.25)' }}>
            <Grid container spacing={2} alignItems="center">
                {/* Movie Title */}
                <Grid item xs={12}>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {showtime.movie?.title || 'Phim'}
                    </Typography>
                </Grid>

                {/* Info Row */}
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {formatDate(startDateTime)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {formatTime(startDateTime)} {endDateTime ? `- ${formatTime(endDateTime)}` : ''}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoomIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            Phòng {showtime.roomName || 'Không có'}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalActivityIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" color="primary.main" fontWeight={700}>
                            {availableSeatsCount} ghế còn trống
                        </Typography>
                    </Box>
                </Grid>

                {/* Status */}
                <Grid item xs={12}>
                    <Chip
                        label={showtime.status === 'ACTIVE' ? 'Đang mở bán' : 'Đã hủy'}
                        color={showtime.status === 'ACTIVE' ? 'success' : 'error'}
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};
