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

    const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Sales Reports</h1>
                <p className="page-description">Analyze your sales performance</p>
            </div>

            {/* Filters */}
            <div className="filters-card">
                <div className="filters-row">
                    <div className="filter-item">
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
                            <div className="filter-item">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                            </div>
                            <div className="filter-item">
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

                    <div className="filter-item filter-action">
                        <button className="btn btn-primary btn-sm" onClick={fetchReportData}>
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Sales by Type</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
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
            <div className="table-card">
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
                                        <td className="amount-cell">₹{row.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📊</div>
                                            <div className="empty-state-title">No data available</div>
                                            <div className="empty-state-description">Select filters and click Apply</div>
                                        </div>
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
