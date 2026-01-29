import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Reports from './pages/Reports';
import AdminPanel from './pages/AdminPanel';
import SubmissionTracker from './pages/SubmissionTracker';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh'
            }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'super_admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="data-entry" element={<DataEntry />} />
                <Route
                    path="reports"
                    element={
                        <ProtectedRoute requiredRole="administrator">
                            <Reports />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin"
                    element={
                        <ProtectedRoute requiredRole="super_admin">
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="submission-tracker"
                    element={
                        <ProtectedRoute requiredRole="administrator">
                            <SubmissionTracker />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
