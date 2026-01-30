import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './SubmissionTracker.css';

function SubmissionTracker() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // View details modal state
    const [viewModal, setViewModal] = useState({ show: false, submission: null, details: null });

    // Edit modal state (super_admin only)
    const [editModal, setEditModal] = useState({ show: false, submission: null, entries: {} });
    const [salesTypes, setSalesTypes] = useState([]);
    const [saving, setSaving] = useState(false);

    // Attachment popup
    const [attachmentPopup, setAttachmentPopup] = useState({ show: false, url: '', name: '' });

    useEffect(() => {
        fetchSubmissions();
        fetchSalesTypes();
    }, [selectedDate]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/submissions/tracker?date=${selectedDate}`);
            setSubmissions(response.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesTypes = async () => {
        try {
            const response = await axios.get('/sales-types/active');
            setSalesTypes(response.data);
        } catch (error) {
            console.error('Error fetching sales types:', error);
        }
    };

    const completedSubmissions = submissions.filter(s => s.status === 'submitted');
    const pendingSubmissions = submissions.filter(s => s.status !== 'submitted');

    const getInitials = (name) => {
        if (!name) return '??';
        const cleaned = name.trim();
        if (cleaned.length === 0) return '??';
        if (cleaned.length === 1) return cleaned.toUpperCase();
        return (cleaned[0] + cleaned[cleaned.length - 1]).toUpperCase();
    };

    // View entry details (for admin & super_admin)
    const handleViewDetails = async (submission) => {
        try {
            const response = await axios.get(`/sales-entries/view/${submission.entry_id}`);
            setViewModal({
                show: true,
                submission: submission,
                details: response.data
            });
        } catch (error) {
            console.error('Error fetching entry details:', error);
            alert('Failed to load entry details');
        }
    };

    // Open attachment in popup
    const handleViewAttachment = (url, name) => {
        setAttachmentPopup({ show: true, url, name });
    };

    // Edit entry (super_admin only)
    const handleEdit = async (submission) => {
        try {
            const response = await axios.get(`/sales-entries/entry/${submission.entry_id}`);
            const entryData = response.data;

            const entriesObj = {};
            if (entryData.sales_data) {
                entryData.sales_data.forEach(item => {
                    entriesObj[item.sales_type_id] = item.amount.toString();
                });
            }

            setEditModal({
                show: true,
                submission: submission,
                entry: entryData,
                entries: entriesObj
            });
        } catch (error) {
            console.error('Error fetching entry details:', error);
            alert('Failed to load entry details');
        }
    };

    const handleEntryChange = (typeId, value) => {
        setEditModal(prev => ({
            ...prev,
            entries: { ...prev.entries, [typeId]: value }
        }));
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            await axios.put(`/sales-entries/update/${editModal.entry.id}`, {
                entries: editModal.entries
            });

            setEditModal({ show: false, submission: null, entries: {} });
            fetchSubmissions();
            alert('Entry updated successfully');
        } catch (error) {
            console.error('Error updating entry:', error);
            alert(error.response?.data?.message || 'Failed to update entry');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '0';
        return new Intl.NumberFormat('en-IN').format(value);
    };

    const isSuperAdmin = user?.role === 'super_admin';
    const isAdminOrSuper = user?.role === 'administrator' || user?.role === 'super_admin';

    const renderCard = (submission, index, isCompleted) => (
        <div key={index} className={`tracker-card ${isCompleted ? 'completed' : 'pending'}`}>
            <div className="tracker-card-header">
                <div className="tracker-pos-info">
                    <h4>{submission.pos_name}</h4>
                    <span className="tracker-location">{submission.location_name}</span>
                </div>
                <div className="tracker-card-actions">
                    {/* View button for admin & super_admin */}
                    {isAdminOrSuper && isCompleted && submission.entry_id && (
                        <button
                            className="btn btn-ghost btn-sm view-btn"
                            onClick={() => handleViewDetails(submission)}
                            title="View Details"
                        >
                            👁️
                        </button>
                    )}
                    {/* Edit button for super_admin only */}
                    {isSuperAdmin && isCompleted && submission.entry_id && (
                        <button
                            className="btn btn-ghost btn-sm edit-btn"
                            onClick={() => handleEdit(submission)}
                            title="Edit Entry"
                        >
                            ✏️
                        </button>
                    )}
                    <div className={`tracker-status-badge ${isCompleted ? 'success' : 'warning'}`}>
                        {isCompleted ? 'Done' : 'Pending'}
                    </div>
                </div>
            </div>

            {submission.user_name ? (
                <div className="tracker-user">
                    <div className="user-avatar">
                        {submission.profile_photo ? (
                            <img src={submission.profile_photo} alt={submission.user_name} />
                        ) : (
                            <span className="avatar-initials">{getInitials(submission.user_name)}</span>
                        )}
                    </div>
                    <div className="user-details">
                        <span className="user-name">{submission.user_name}</span>
                        {isCompleted && submission.submitted_at && (
                            <span className="submit-time">
                                {new Date(submission.submitted_at).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                <div className="no-user">
                    <span className="no-user-icon">👤</span>
                    <span>Not assigned</span>
                </div>
            )}

            {/* Show total for completed entries */}
            {isCompleted && submission.total_amount !== undefined && (
                <div className="tracker-total">
                    ₹{formatCurrency(submission.total_amount)}
                </div>
            )}
        </div>
    );

    return (
        <div className="submission-tracker">
            {/* Attachment Popup */}
            {attachmentPopup.show && (
                <div className="modal-overlay" onClick={() => setAttachmentPopup({ show: false, url: '', name: '' })}>
                    <div className="modal attachment-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Attachment: {attachmentPopup.name}</h2>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setAttachmentPopup({ show: false, url: '', name: '' })}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body attachment-body">
                            {attachmentPopup.url.endsWith('.pdf') ? (
                                <iframe
                                    src={attachmentPopup.url}
                                    title="PDF Attachment"
                                    className="attachment-iframe"
                                />
                            ) : (
                                <img
                                    src={attachmentPopup.url}
                                    alt="Attachment"
                                    className="attachment-image"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewModal.show && (
                <div className="modal-overlay" onClick={() => setViewModal({ show: false, submission: null, details: null })}>
                    <div className="modal view-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Entry Details</h2>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setViewModal({ show: false, submission: null, details: null })}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-info">
                                <div><strong>POS</strong>{viewModal.submission?.pos_name}</div>
                                <div><strong>Date</strong>{new Date(selectedDate).toLocaleDateString('en-IN')}</div>
                                <div><strong>User</strong>{viewModal.submission?.user_name}</div>
                                <div><strong>Time</strong>{viewModal.details?.submitted_at ? new Date(viewModal.details.submitted_at).toLocaleTimeString('en-IN') : '-'}</div>
                            </div>

                            <div className="view-details-list">
                                {viewModal.details?.sales_data?.map((item, idx) => (
                                    <div key={idx} className="view-detail-row">
                                        <div className="view-detail-name">{item.sales_type_name}</div>
                                        <div className="view-detail-amount">₹{formatCurrency(item.amount)}</div>
                                        {item.attachment_path && (
                                            <button
                                                className="btn btn-ghost btn-sm attachment-btn"
                                                onClick={() => handleViewAttachment(item.attachment_path, item.sales_type_name)}
                                                title="View Attachment"
                                            >
                                                👁️ View
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="view-total">
                                <span>Total</span>
                                <span className="view-total-amount">
                                    ₹{formatCurrency(viewModal.details?.sales_data?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Super Admin Only) */}
            {editModal.show && (
                <div className="modal-overlay" onClick={() => setEditModal({ show: false, submission: null, entries: {} })}>
                    <div className="modal edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Entry</h2>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setEditModal({ show: false, submission: null, entries: {} })}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="edit-info">
                                <div><strong>POS:</strong> {editModal.submission?.pos_name}</div>
                                <div><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-IN')}</div>
                                <div><strong>User:</strong> {editModal.submission?.user_name}</div>
                            </div>

                            <div className="edit-form">
                                {salesTypes.map(type => (
                                    <div key={type.id} className="edit-row">
                                        <label>{type.name}</label>
                                        <div className="edit-input-group">
                                            <span>₹</span>
                                            <input
                                                type="number"
                                                value={editModal.entries[type.id] || ''}
                                                onChange={(e) => handleEntryChange(type.id, e.target.value)}
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setEditModal({ show: false, submission: null, entries: {} })}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSaveEdit}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="tracker-header">
                <div className="header-content">
                    <h1 className="page-title">Submission Tracker</h1>
                    <p className="page-description">Monitor daily submissions</p>
                </div>
                <div className="date-picker">
                    <input
                        type="date"
                        className="form-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="tracker-stats">
                <div className="tracker-stat completed">
                    <span className="stat-number">{completedSubmissions.length}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="tracker-stat pending">
                    <span className="stat-number">{pendingSubmissions.length}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="tracker-stat total">
                    <span className="stat-number">{submissions.length}</span>
                    <span className="stat-label">Total</span>
                </div>
            </div>

            {loading ? (
                <div className="tracker-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="tracker-sections">
                    {/* Pending */}
                    {pendingSubmissions.length > 0 && (
                        <div className="tracker-section">
                            <div className="section-header pending">
                                <span className="section-icon">⏳</span>
                                <h3>Pending</h3>
                                <span className="section-count">{pendingSubmissions.length}</span>
                            </div>
                            <div className="tracker-grid">
                                {pendingSubmissions.map((s, i) => renderCard(s, i, false))}
                            </div>
                        </div>
                    )}

                    {/* Completed */}
                    {completedSubmissions.length > 0 && (
                        <div className="tracker-section">
                            <div className="section-header completed">
                                <span className="section-icon">✅</span>
                                <h3>Completed</h3>
                                <span className="section-count">{completedSubmissions.length}</span>
                            </div>
                            <div className="tracker-grid">
                                {completedSubmissions.map((s, i) => renderCard(s, i, true))}
                            </div>
                        </div>
                    )}

                    {/* Empty */}
                    {submissions.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-title">No POS terminals</div>
                            <div className="empty-state-description">Configure POS in Admin Panel</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SubmissionTracker;
