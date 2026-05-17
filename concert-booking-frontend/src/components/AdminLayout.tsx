import React, { useEffect, useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItemIcon, ListItemText, ListItemButton, Avatar, Menu, MenuItem, Collapse } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAdminAuth } from '../context/AdminAuthContext';

import PeopleIcon from '@mui/icons-material/People';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const drawerWidth = 260;

interface MenuItemType {
    text: string;
    icon: JSX.Element;
    path: string;
}

const menuItems: MenuItemType[] = [
    { text: 'Bảng Điều Khiển', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Quản lý Concert', icon: <MusicNoteIcon />, path: '/admin/concerts' },
    { text: 'Vé & Hạng Vé', icon: <ConfirmationNumberIcon />, path: '/admin/tickets' },
    { text: 'Voucher', icon: <EventIcon />, path: '/admin/vouchers' },
    { text: 'Đặt Vé', icon: <EventIcon />, path: '/admin/bookings' },
];

const systemMenuItems: MenuItemType[] = [
    { text: 'Quản lý User', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Quản lý quyền (Role)', icon: <SecurityIcon />, path: '/admin/roles' },
    { text: 'Quản lý Permission', icon: <VpnKeyIcon />, path: '/admin/permissions' },
];

export const AdminLayout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [systemExpanded, setSystemExpanded] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdminLoggedIn, logoutAdmin, isAdminInitialized, adminEmail } = useAdminAuth() as any;

    const isSystemActive = systemMenuItems.some((item) => location.pathname === item.path);

    useEffect(() => {
        if (!isAdminInitialized) return;
        if (!isAdminLoggedIn) {
            navigate('/admin/login', { replace: true });
        }
    }, [isAdminInitialized, isAdminLoggedIn, navigate]);

    useEffect(() => {
        if (isSystemActive) {
            setSystemExpanded(true);
        }
    }, [isSystemActive]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logoutAdmin();
        handleMenuClose();
        navigate('/admin/login');
    };

    const drawer = (
        <Box sx={{ height: '100%', backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}>
            <Box
                sx={{
                    p: 3,
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #E5E7EB',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                }}
            >
                <AdminPanelSettingsIcon sx={{ fontSize: 34, color: '#E50914' }} />
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Khu Vực Quản Trị
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Quản Lý Concert & Vé
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <List sx={{ px: 2, py: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2,
                                mb: 1,
                                borderLeft: '3px solid',
                                borderLeftColor: isActive ? '#E50914' : 'transparent',
                                backgroundColor: isActive ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                                color: isActive ? '#E50914' : 'text.primary',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                    backgroundColor: isActive ? 'rgba(229, 9, 20, 0.14)' : 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive ? '#E50914' : 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            />
                        </ListItemButton>
                    );
                })}

                <ListItemButton
                    onClick={() => setSystemExpanded((prev) => !prev)}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        borderLeft: '3px solid',
                        borderLeftColor: isSystemActive ? '#E50914' : 'transparent',
                        backgroundColor: isSystemActive ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                        color: isSystemActive ? '#E50914' : 'text.primary',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                            backgroundColor: isSystemActive ? 'rgba(229, 9, 20, 0.14)' : 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: isSystemActive ? '#E50914' : 'inherit', minWidth: 40 }}>
                        <SettingsSuggestIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Hệ thống"
                        primaryTypographyProps={{
                            fontWeight: isSystemActive ? 600 : 400,
                        }}
                    />
                    {systemExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>

                <Collapse in={systemExpanded} timeout="auto" unmountOnExit>
                    <List disablePadding>
                        {systemMenuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <ListItemButton
                                    key={item.text}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.75,
                                        ml: 2,
                                        borderLeft: '3px solid',
                                        borderLeftColor: isActive ? '#E50914' : 'transparent',
                                        backgroundColor: isActive ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                                        color: isActive ? '#E50914' : 'text.secondary',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            backgroundColor: isActive ? 'rgba(229, 9, 20, 0.14)' : 'rgba(0, 0, 0, 0.04)',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ color: isActive ? '#E50914' : 'inherit', minWidth: 36 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 600 : 400,
                                            variant: 'body2',
                                        }}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Collapse>
            </List>
            <Divider />
        
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(12px)',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        Quản Trị Hệ Thống
                    </Typography>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                        <Avatar sx={{ bgcolor: '#E50914' }}>A</Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem disabled>
                            <Typography variant="body2" color="text.secondary">
                                {adminEmail || 'admin'}
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                            Đăng xuất
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    backgroundColor: '#F3F4F6',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};
