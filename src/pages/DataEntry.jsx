import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './DataEntry.css';

function DataEntry() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedPOS, setSelectedPOS] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [userPOSList, setUserPOSList] = useState([]);
    const [salesTypes, setSalesTypes] = useState([]);
    const [entries, setEntries] = useState({});
    const [attachments, setAttachments] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    useEffect(() => {
        fetchUserPOS();
        fetchSalesTypes();
    }, []);

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
    };

    const closeToast = () => {
        setToast({ ...toast, show: false });
    };

    const fetchUserPOS = async () => {
        try {
            const response = await axios.get('/pos/user-pos');
            setUserPOSList(response.data);
            if (response.data.length === 1) {
                setSelectedPOS(response.data[0]);
                setStep(2);
            }
        } catch (error) {
            console.error('Error fetching POS:', error);
        }
    };

    const fetchSalesTypes = async () => {
        try {
            const response = await axios.get('/sales-types/active');
            setSalesTypes(response.data);
            const initialEntries = {};
            response.data.forEach(type => {
                initialEntries[type.id] = '';
            });
            setEntries(initialEntries);
        } catch (error) {
            console.error('Error fetching sales types:', error);
        }
    };

    const handlePOSSelect = (pos) => {
        setSelectedPOS(pos);
        setStep(2);
    };

    const handleAmountChange = (typeId, value) => {
        setEntries(prev => ({ ...prev, [typeId]: value }));
    };

    const handleFileChange = (typeId, file) => {
        setAttachments(prev => ({ ...prev, [typeId]: file }));
    };

    // Validate before going to step 3
    const validateBeforeContinue = () => {
        // Check all amounts are filled
        const missingAmounts = [];
        for (const type of salesTypes) {
            if (entries[type.id] === '' || entries[type.id] === null || entries[type.id] === undefined) {
                missingAmounts.push(type.name);
            }
        }

        if (missingAmounts.length > 0) {
            if (missingAmounts.length === salesTypes.length) {
                showToast('Please enter amounts for all sales types (enter 0 if no sales)', 'error');
            } else {
                showToast(`Please enter amount for: ${missingAmounts.join(', ')}`, 'error');
            }
            return false;
        }

        // Check required attachments
        const missingAttachments = [];
        for (const type of salesTypes) {
            if (type.attachment_required && !attachments[type.id]) {
                missingAttachments.push(type.name);
            }
        }

        if (missingAttachments.length > 0) {
            showToast(`Attachment required for: ${missingAttachments.join(', ')}`, 'error');
            return false;
        }

        return true;
    };

    const handleContinue = () => {
        if (validateBeforeContinue()) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        if (!validateBeforeContinue()) return;
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('pos_id', selectedPOS.id);
            formData.append('entry_date', selectedDate);
            formData.append('entries', JSON.stringify(entries));

            Object.keys(attachments).forEach(typeId => {
                if (attachments[typeId]) {
                    formData.append(`attachment_${typeId}`, attachments[typeId]);
                }
            });

            await axios.post('/sales-entries/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setStep(1);
                setSelectedPOS(null);
                setEntries({});
                setAttachments({});
                fetchSalesTypes();
            }, 2000);

        } catch (error) {
            console.error('Error submitting data:', error);
            showToast(error.response?.data?.message || 'Failed to submit data', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '0';
        return new Intl.NumberFormat('en-IN').format(value);
    };

    const getTodayIST = () => new Date().toISOString().split('T')[0];
    const canEditDate = user?.role !== 'regular_user';
    const totalAmount = Object.values(entries).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    // Success Screen
    if (success) {
        return (
            <div className="data-entry">
                <div className="success-screen">
                    <div className="success-icon">✓</div>
                    <h2>Submitted Successfully</h2>
                    <p>Your sales data has been recorded</p>
                </div>
            </div>
        );
    }

    return (
        <div className="data-entry">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast toast-${toast.type}`}>
                    <div className="toast-content">
                        <span className="toast-icon">
                            {toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✓' : 'ℹ️'}
                        </span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                    <button className="toast-close" onClick={closeToast}>×</button>
                </div>
            )}

            {/* Header with Progress */}
            <div className="entry-header-bar">
                <div className="entry-title">
                    <h1>Sales Entry</h1>
                </div>
                <div className="progress-indicator">
                    <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
                    <span className="step-line"></span>
                    <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
                    <span className="step-line"></span>
                    <span className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</span>
                </div>
            </div>

            {/* Step 1: POS Selection */}
            {step === 1 && (
                <div className="step-panel">
                    <div className="step-header">
                        <h2>Select POS Terminal</h2>
                        <p>Choose the terminal you want to enter sales for</p>
                    </div>

                    <div className="pos-list">
                        {userPOSList.map(pos => (
                            <button
                                key={pos.id}
                                className="pos-item"
                                onClick={() => handlePOSSelect(pos)}
                            >
                                <div className="pos-main">
                                    <span className="pos-name">{pos.name}</span>
                                    <span className="pos-location">{pos.location_name}, {pos.city_name}</span>
                                </div>
                                <span className="pos-arrow">›</span>
                            </button>
                        ))}
                    </div>

                    {userPOSList.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-title">No POS Assigned</div>
                            <div className="empty-state-description">Contact your administrator</div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Data Entry */}
            {step === 2 && (
                <div className="step-panel">
                    <div className="step-header">
                        <div className="step-header-main">
                            <h2>Enter Sales Data</h2>
                            <p><strong>{selectedPOS?.name}</strong> · {selectedPOS?.location_name}</p>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                            Change
                        </button>
                    </div>

                    {/* Date Selector */}
                    <div className="form-row">
                        <label className="form-label">Entry Date</label>
                        <input
                            type="date"
                            className="form-input date-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={getTodayIST()}
                            disabled={!canEditDate}
                        />
                        {!canEditDate && (
                            <span className="form-hint">You can only enter data for today</span>
                        )}
                    </div>

                    {/* Sales Types */}
                    <div className="sales-form">
                        {salesTypes.map(type => (
                            <div key={type.id} className={`sales-row ${entries[type.id] !== '' && entries[type.id] !== null && entries[type.id] !== undefined ? 'filled' : ''}`}>
                                <div className="sales-row-header">
                                    <span className="sales-type-name">{type.name}</span>
                                    {type.attachment_required && (
                                        <span className="required-badge">Required</span>
                                    )}
                                </div>
                                <div className="sales-row-inputs">
                                    <div className="amount-input-group">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                            type="number"
                                            className="form-input amount-input"
                                            placeholder="0"
                                            value={entries[type.id] || ''}
                                            onChange={(e) => handleAmountChange(type.id, e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                    {type.attachment_applicable && (
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id={`file-${type.id}`}
                                                className="file-input-hidden"
                                                accept="image/*,.pdf"
                                                onChange={(e) => handleFileChange(type.id, e.target.files[0])}
                                            />
                                            <label htmlFor={`file-${type.id}`} className={`file-btn ${attachments[type.id] ? 'has-file' : ''}`}>
                                                {attachments[type.id] ? '✓' : '📎'}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="step-footer">
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                        <button className="btn btn-primary" onClick={handleContinue}>Continue</button>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="step-panel">
                    <div className="step-header">
                        <h2>Review & Submit</h2>
                        <p>Verify your entry before submitting</p>
                    </div>

                    <div className="review-card">
                        <div className="review-info">
                            <div className="review-info-row">
                                <span className="review-label">POS Terminal</span>
                                <span className="review-value">{selectedPOS?.name}</span>
                            </div>
                            <div className="review-info-row">
                                <span className="review-label">Location</span>
                                <span className="review-value">{selectedPOS?.location_name}</span>
                            </div>
                            <div className="review-info-row">
                                <span className="review-label">Date</span>
                                <span className="review-value">
                                    {new Date(selectedDate).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="review-divider"></div>

                        <div className="review-sales">
                            {salesTypes.map(type => (
                                <div key={type.id} className="review-sales-row">
                                    <span className="review-sales-name">{type.name}</span>
                                    <span className="review-sales-amount">₹{formatCurrency(entries[type.id])}</span>
                                </div>
                            ))}
                        </div>

                        <div className="review-total">
                            <span>Total</span>
                            <span className="review-total-amount">₹{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="step-footer">
                        <button className="btn btn-secondary" onClick={() => setStep(2)}>Edit</button>
                        <button
                            className="btn btn-success"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Submit Entry'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataEntry;
