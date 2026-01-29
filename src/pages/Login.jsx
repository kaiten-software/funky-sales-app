import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-container">
                <div className="login-card glass-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <div className="login-logo-icon">🎮</div>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to access your POS sales dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="alert alert-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p className="demo-credentials">
                            <strong>Demo Credentials:</strong><br />
                            Super Admin: admin@playzone.com / admin123<br />
                            Administrator: manager@playzone.com / manager123<br />
                            Regular User: user@playzone.com / user123
                        </p>
                    </div>
                </div>

                <div className="login-info">
                    <div className="info-card glass-card-static">
                        <div className="info-icon">📊</div>
                        <h3>Track Sales</h3>
                        <p>Monitor daily sales across all your entertainment locations</p>
                    </div>
                    <div className="info-card glass-card-static">
                        <div className="info-icon">📈</div>
                        <h3>Analyze Reports</h3>
                        <p>Get insights with beautiful charts and comprehensive reports</p>
                    </div>
                    <div className="info-card glass-card-static">
                        <div className="info-icon">⚙️</div>
                        <h3>Manage Locations</h3>
                        <p>Configure cities, locations, POS terminals, and sales types</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
