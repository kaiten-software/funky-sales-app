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
            setRecentEntries(entriesRes.data);
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
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const statCards = [
        {
            title: "Today's Sales",
            value: formatCurrency(stats.todaySales),
            icon: '💰',
            gradient: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
            change: '+12.5%',
            changeType: 'positive',
        },
        {
            title: 'This Week',
            value: formatCurrency(stats.weekSales),
            icon: '📊',
            gradient: 'linear-gradient(135deg, var(--secondary-600), var(--secondary-500))',
            change: '+8.2%',
            changeType: 'positive',
        },
        {
            title: 'This Month',
            value: formatCurrency(stats.monthSales),
            icon: '📈',
            gradient: 'linear-gradient(135deg, var(--accent-500), var(--pink-500))',
            change: '+15.3%',
            changeType: 'positive',
        },
        {
            title: 'Pending Submissions',
            value: stats.pendingSubmissions,
            icon: '⏳',
            gradient: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
            change: user?.role !== 'regular_user' ? 'View All' : null,
            changeType: 'neutral',
        },
    ];

    const quickActions = [
        {
            title: 'Enter Sales Data',
            description: 'Add today\'s sales information',
            icon: '📝',
            action: () => navigate('/data-entry'),
            color: 'var(--primary-500)',
            roles: ['regular_user', 'administrator', 'super_admin'],
        },
        {
            title: 'View Reports',
            description: 'Analyze sales trends and patterns',
            icon: '📊',
            action: () => navigate('/reports'),
            color: 'var(--secondary-500)',
            roles: ['administrator', 'super_admin'],
        },
        {
            title: 'Track Submissions',
            description: 'Monitor daily submission status',
            icon: '✅',
            action: () => navigate('/submission-tracker'),
            color: 'var(--accent-500)',
            roles: ['administrator', 'super_admin'],
        },
        {
            title: 'Admin Panel',
            description: 'Manage system configuration',
            icon: '⚙️',
            action: () => navigate('/admin'),
            color: 'var(--pink-500)',
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
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, {user?.name}! 👋</h1>
                    <p>Here's what's happening with your sales today</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/data-entry')}>
                    <span>➕</span>
                    <span>New Entry</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="stat-card glass-card"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="stat-icon" style={{ background: stat.gradient }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-title">{stat.title}</div>
                            <div className="stat-value">{stat.value}</div>
                            {stat.change && (
                                <div className={`stat-change ${stat.changeType}`}>
                                    {stat.changeType === 'positive' && '↗'}
                                    {stat.change}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    {filteredActions.map((action, index) => (
                        <div
                            key={index}
                            className="action-card glass-card"
                            onClick={action.action}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="action-icon" style={{ color: action.color }}>
                                {action.icon}
                            </div>
                            <h3>{action.title}</h3>
                            <p>{action.description}</p>
                            <div className="action-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Entries */}
            {user?.role !== 'regular_user' && (
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Recent Entries</h2>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>
                            View All →
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
                                    <th>Total Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentEntries.length > 0 ? (
                                    recentEntries.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(entry.entry_date)}</td>
                                            <td>{entry.pos_name}</td>
                                            <td>{entry.location_name}</td>
                                            <td>{entry.user_name}</td>
                                            <td className="amount">{formatCurrency(entry.total_amount)}</td>
                                            <td>
                                                <span className={`badge badge-${entry.status === 'submitted' ? 'success' : 'warning'}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No entries found
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
