import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['regular_user', 'administrator', 'super_admin'] },
        { path: '/data-entry', label: 'Data Entry', icon: '📝', roles: ['regular_user', 'administrator', 'super_admin'] },
        { path: '/reports', label: 'Reports', icon: '📈', roles: ['administrator', 'super_admin'] },
        { path: '/submission-tracker', label: 'Submissions', icon: '✅', roles: ['administrator', 'super_admin'] },
        { path: '/admin', label: 'Admin Panel', icon: '⚙️', roles: ['super_admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(user?.role)
    );

    // Get current page title
    const getCurrentPageTitle = () => {
        const currentItem = navItems.find(item => location.pathname.startsWith(item.path));
        return currentItem?.label || 'Dashboard';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatRole = (role) => {
        if (!role) return 'User';
        return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="layout">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">💼</div>
                        <span className="sidebar-logo-text">Funky Sales</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Main Menu</div>
                        {filteredNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `nav-item ${isActive ? 'active' : ''}`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="nav-item-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-menu">
                        <div className="user-avatar">
                            {getInitials(user?.name)}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user?.name || 'User'}</div>
                            <div className="user-role">{formatRole(user?.role)}</div>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            ⏻
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="content-header">
                    <div className="breadcrumb">
                        <span className="breadcrumb-current">{getCurrentPageTitle()}</span>
                    </div>
                    <div className="header-actions">
                        <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                            {new Date().toLocaleDateString('en-IN', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </header>

                <div className="content-body">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Toggle Button */}
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>
        </div>
    );
}

export default Layout;
