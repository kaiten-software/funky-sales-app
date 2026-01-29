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

    useEffect(() => {
        fetchUserPOS();
        fetchSalesTypes();
    }, []);

    const fetchUserPOS = async () => {
        try {
            const response = await axios.get('/pos/user-pos');
            setUserPOSList(response.data);

            // Auto-select if only one POS
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

            // Initialize entries with 0 for all types
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
        setEntries(prev => ({
            ...prev,
            [typeId]: value
        }));
    };

    const handleFileChange = (typeId, file) => {
        setAttachments(prev => ({
            ...prev,
            [typeId]: file
        }));
    };

    const validateForm = () => {
        // Check all amounts are filled
        for (const type of salesTypes) {
            if (entries[type.id] === '' || entries[type.id] === null) {
                alert(`Please enter amount for ${type.name} (enter 0 if no sales)`);
                return false;
            }
        }

        // Check required attachments
        for (const type of salesTypes) {
            if (type.attachment_required && !attachments[type.id]) {
                alert(`Attachment is required for ${type.name}`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('pos_id', selectedPOS.id);
            formData.append('entry_date', selectedDate);
            formData.append('entries', JSON.stringify(entries));

            // Append files
            Object.keys(attachments).forEach(typeId => {
                if (attachments[typeId]) {
                    formData.append(`attachment_${typeId}`, attachments[typeId]);
                }
            });

            await axios.post('/sales-entries/submit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Sales data submitted successfully!');

            // Reset form
            setStep(1);
            setSelectedPOS(null);
            setEntries({});
            setAttachments({});
            fetchSalesTypes(); // Reinitialize entries

        } catch (error) {
            console.error('Error submitting data:', error);
            alert(error.response?.data?.message || 'Failed to submit data');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value) return '';
        return new Intl.NumberFormat('en-IN').format(value);
    };

    const getTodayIST = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const canEditDate = user?.role !== 'regular_user';

    return (
        <div className="data-entry">
            <div className="data-entry-header">
                <h1>📝 Enter Sales Data</h1>
                <p>Submit your daily sales information</p>
            </div>

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Select POS</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Enter Data</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Review & Submit</div>
                </div>
            </div>

            {/* Step 1: POS Selection */}
            {step === 1 && (
                <div className="step-content fade-in">
                    <h2>Select Point of Sale</h2>
                    <p className="step-description">Choose the POS terminal for which you want to enter sales data</p>

                    <div className="pos-grid">
                        {userPOSList.map(pos => (
                            <div
                                key={pos.id}
                                className="pos-card glass-card"
                                onClick={() => handlePOSSelect(pos)}
                            >
                                <div className="pos-icon">🏪</div>
                                <h3>{pos.name}</h3>
                                <div className="pos-details">
                                    <div className="pos-detail">
                                        <span className="label">Location:</span>
                                        <span className="value">{pos.location_name}</span>
                                    </div>
                                    <div className="pos-detail">
                                        <span className="label">City:</span>
                                        <span className="value">{pos.city_name}</span>
                                    </div>
                                </div>
                                <div className="pos-arrow">→</div>
                            </div>
                        ))}
                    </div>

                    {userPOSList.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <h3>No POS Assigned</h3>
                            <p>You don't have any POS terminals assigned. Please contact your administrator.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Data Entry */}
            {step === 2 && (
                <div className="step-content fade-in">
                    <div className="entry-header">
                        <div>
                            <h2>Enter Sales Data</h2>
                            <p className="step-description">
                                POS: <strong>{selectedPOS?.name}</strong> |
                                Location: <strong>{selectedPOS?.location_name}</strong>
                            </p>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                            ← Change POS
                        </button>
                    </div>

                    <div className="date-selector glass-card">
                        <label htmlFor="entry-date" className="form-label">
                            📅 Entry Date
                        </label>
                        <input
                            id="entry-date"
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={getTodayIST()}
                            disabled={!canEditDate}
                        />
                        {!canEditDate && (
                            <p className="date-note">Regular users can only enter data for today's date</p>
                        )}
                    </div>

                    <div className="sales-types-grid">
                        {salesTypes.map(type => (
                            <div key={type.id} className="sales-type-card glass-card">
                                <div className="sales-type-header">
                                    <h3>{type.name}</h3>
                                    {type.attachment_required && (
                                        <span className="badge badge-warning">Attachment Required</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter amount (0 if no sales)"
                                        value={entries[type.id] || ''}
                                        onChange={(e) => handleAmountChange(type.id, e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {type.attachment_applicable && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            Attachment {type.attachment_required && <span className="required">*</span>}
                                        </label>
                                        <div className="file-upload">
                                            <input
                                                type="file"
                                                id={`file-${type.id}`}
                                                className="file-upload-input"
                                                accept="image/*,.pdf"
                                                onChange={(e) => handleFileChange(type.id, e.target.files[0])}
                                            />
                                            <label htmlFor={`file-${type.id}`} className="file-upload-label">
                                                <span>📎</span>
                                                <span>
                                                    {attachments[type.id]
                                                        ? attachments[type.id].name
                                                        : 'Choose file or drag here'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="entry-actions">
                        <button className="btn btn-ghost" onClick={() => setStep(1)}>
                            ← Back
                        </button>
                        <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                            Review & Submit →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="step-content fade-in">
                    <h2>Review Your Submission</h2>
                    <p className="step-description">Please verify all information before submitting</p>

                    <div className="review-section glass-card">
                        <h3>📋 Submission Details</h3>
                        <div className="review-grid">
                            <div className="review-item">
                                <span className="review-label">POS:</span>
                                <span className="review-value">{selectedPOS?.name}</span>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Location:</span>
                                <span className="review-value">{selectedPOS?.location_name}</span>
                            </div>
                            <div className="review-item">
                                <span className="review-label">City:</span>
                                <span className="review-value">{selectedPOS?.city_name}</span>
                            </div>
                            <div className="review-item">
                                <span className="review-label">Date:</span>
                                <span className="review-value">
                                    {new Date(selectedDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="review-section glass-card">
                        <h3>💰 Sales Breakdown</h3>
                        <div className="review-table">
                            {salesTypes.map(type => (
                                <div key={type.id} className="review-row">
                                    <span className="review-type">{type.name}</span>
                                    <span className="review-amount">
                                        ₹{formatCurrency(entries[type.id] || 0)}
                                    </span>
                                    {attachments[type.id] && (
                                        <span className="review-attachment">
                                            📎 {attachments[type.id].name}
                                        </span>
                                    )}
                                </div>
                            ))}
                            <div className="review-row review-total">
                                <span className="review-type"><strong>Total</strong></span>
                                <span className="review-amount">
                                    <strong>
                                        ₹{formatCurrency(
                                            Object.values(entries).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                                        )}
                                    </strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="entry-actions">
                        <button className="btn btn-ghost" onClick={() => setStep(2)}>
                            ← Edit
                        </button>
                        <button
                            className="btn btn-success btn-lg"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <span>✓ Submit Data</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataEntry;
