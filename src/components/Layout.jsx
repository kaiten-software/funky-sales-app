import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">🎮</div>
                        <div className="logo-text">
                            <h2>PlayZone</h2>
                            <p>Sales Tracker</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role">
                                {user?.role === 'super_admin' ? 'Super Admin' :
                                    user?.role === 'administrator' ? 'Administrator' : 'User'}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
