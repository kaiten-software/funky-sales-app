import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

function Reports() {
    const [dateRange, setDateRange] = useState('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [activeSalesTypes, setActiveSalesTypes] = useState({});
    const [reportData, setReportData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#22c55e', '#ef4444'];

    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'lastmonth', label: 'Last Month' },
        { value: 'thisquarter', label: 'This Quarter' },
        { value: 'custom', label: 'Custom Range' },
    ];

    useEffect(() => {
        fetchReportData();
    }, [dateRange, selectedCity, selectedLocation, activeSalesTypes]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/reports/sales-data', {
                params: {
                    dateRange,
                    customStartDate,
                    customEndDate,
                    city: selectedCity,
                    location: selectedLocation,
                    salesTypes: JSON.stringify(activeSalesTypes),
                },
            });
            setReportData(response.data.tableData);
            setChartData(response.data.chartData);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reports">
            <div className="reports-header">
                <h1>📈 Sales Reports & Analytics</h1>
                <p>Comprehensive insights into your sales performance</p>
            </div>

            {/* Filters */}
            <div className="filters-section glass-card">
                <h3>📊 Filters</h3>
                <div className="filters-grid">
                    <div className="form-group">
                        <label className="form-label">Date Range</label>
                        <select
                            className="form-select"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            {dateRangeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {dateRange === 'custom' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <button className="btn btn-primary" onClick={fetchReportData}>
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-section">
                <div className="chart-card glass-card">
                    <h3>Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card glass-card">
                    <h3>Sales by Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Data Table */}
            <div className="table-section glass-card">
                <h3>Detailed Report</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>POS</th>
                                <th>Location</th>
                                <th>City</th>
                                <th>Sales Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length > 0 ? (
                                reportData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.date}</td>
                                        <td>{row.pos}</td>
                                        <td>{row.location}</td>
                                        <td>{row.city}</td>
                                        <td>{row.salesType}</td>
                                        <td className="amount">₹{row.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        No data available for the selected filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reports;
