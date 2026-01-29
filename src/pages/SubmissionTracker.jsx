import { useState, useEffect } from 'react';
import axios from 'axios';

function SubmissionTracker() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSubmissions();
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

    return (
        <div className="submission-tracker">
            <div className="tracker-header">
                <h1>✅ Submission Tracker</h1>
                <p>Monitor daily submission status across all POS terminals</p>
            </div>

            <div className="date-selector glass-card">
                <label htmlFor="tracker-date" className="form-label">Select Date</label>
                <input
                    id="tracker-date"
                    type="date"
                    className="form-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            <div className="submissions-grid">
                {submissions.map((submission, index) => (
                    <div key={index} className={`submission-card glass-card ${submission.status}`}>
                        <div className="submission-status-icon">
                            {submission.status === 'submitted' ? '✅' : '❌'}
                        </div>
                        <h3>{submission.pos_name}</h3>
                        <p>{submission.location_name}, {submission.city_name}</p>
                        <div className="submission-user">{submission.user_name}</div>
                        {submission.status === 'submitted' && (
                            <div className="submission-time">
                                Submitted at {new Date(submission.submitted_at).toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SubmissionTracker;
