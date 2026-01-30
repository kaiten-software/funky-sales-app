import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todaySales: 0,
        weekSales: 0,
        monthSales: 0,
        pendingSubmissions: 0,
    });
    const [recentEntries, setRecentEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, entriesRes] = await Promise.all([
                axios.get('/dashboard/stats'),
                axios.get('/dashboard/recent-entries'),
            ]);

            setStats(statsRes.data);
            setRecentEntries(entriesRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };

    const statCards = [
        { title: "Today", value: formatCurrency(stats.todaySales), icon: '💰' },
        { title: 'This Week', value: formatCurrency(stats.weekSales), icon: '📊' },
        { title: 'This Month', value: formatCurrency(stats.monthSales), icon: '📈' },
        { title: 'Pending', value: stats.pendingSubmissions || 0, icon: '⏳' },
    ];

    const quickActions = [
        {
            title: 'Enter Sales',
            description: 'Add sales data',
            icon: '📝',
            action: () => navigate('/data-entry'),
            roles: ['regular_user', 'administrator', 'super_admin'],
        },
        {
            title: 'Reports',
            description: 'View analytics',
            icon: '📊',
            action: () => navigate('/reports'),
            roles: ['administrator', 'super_admin'],
        },
        {
            title: 'Submissions',
            description: 'Track status',
            icon: '✅',
            action: () => navigate('/submission-tracker'),
            roles: ['administrator', 'super_admin'],
        },
        {
            title: 'Admin',
            description: 'System settings',
            icon: '⚙️',
            action: () => navigate('/admin'),
            roles: ['super_admin'],
        },
    ];

    const filteredActions = quickActions.filter(action =>
        action.roles.includes(user?.role)
    );

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Hero */}
            <div className="dashboard-hero">
                <div className="hero-content">
                    <h1>Welcome, {user?.name}</h1>
                    <p>Here's your sales overview</p>
                </div>
                <div className="hero-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/data-entry')}>
                        + New Entry
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-header">
                            <span className="stat-icon">{stat.icon}</span>
                            <span className="stat-label">{stat.title}</span>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    {filteredActions.map((action, index) => (
                        <div key={index} className="action-card" onClick={action.action}>
                            <div className="action-icon">{action.icon}</div>
                            <div className="action-content">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                            <div className="action-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Entries */}
            {user?.role !== 'regular_user' && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Recent Entries</h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>
                            View All
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>POS</th>
                                    <th>Location</th>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(recentEntries) && recentEntries.length > 0 ? (
                                    recentEntries.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(entry.entry_date)}</td>
                                            <td>{entry.pos_name}</td>
                                            <td>{entry.location_name}</td>
                                            <td>{entry.user_name}</td>
                                            <td className="amount-cell">{formatCurrency(entry.total_amount)}</td>
                                            <td>
                                                <span className={`badge badge-${entry.status === 'submitted' ? 'success' : 'warning'}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="empty-state">
                                                <div className="empty-state-icon">📭</div>
                                                <div className="empty-state-title">No entries yet</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
