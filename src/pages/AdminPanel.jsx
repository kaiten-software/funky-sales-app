import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
    const [activeTab, setActiveTab] = useState('cities');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);

    // Sorting and filtering state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    // Dropdown options
    const [cities, setCities] = useState([]);
    const [locations, setLocations] = useState([]);

    const tabs = [
        { id: 'cities', label: 'Cities', icon: '🏙️' },
        { id: 'locations', label: 'Locations', icon: '📍' },
        { id: 'pos', label: 'POS Terminals', icon: '🏪' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'sales-types', label: 'Sales Types', icon: '💰' },
    ];

    useEffect(() => {
        fetchData();
        fetchDropdownData();
        // Reset filters when tab changes
        setFilters({});
        setSearchTerm('');
        setSortConfig({ key: null, direction: 'asc' });
    }, [activeTab]);

    const fetchDropdownData = async () => {
        try {
            const [citiesRes, locationsRes] = await Promise.all([
                axios.get('/admin/cities'),
                axios.get('/admin/locations')
            ]);
            setCities(citiesRes.data || []);
            setLocations(locationsRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            setCities([]);
            setLocations([]);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/admin/${activeTab}`);
            setData(response.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Sorting logic
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    // Filtered and sorted data
    const processedData = useMemo(() => {
        if (!Array.isArray(data)) return [];

        let result = [...data];

        // Apply search filter
        if (searchTerm) {
            result = result.filter(item => {
                const searchLower = searchTerm.toLowerCase();
                return Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchLower)
                );
            });
        }

        // Apply column filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(item => {
                    const itemValue = String(item[key] || '').toLowerCase();
                    return itemValue.includes(value.toLowerCase());
                });
            }
        });

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key] ?? '';
                const bVal = b[sortConfig.key] ?? '';

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [data, searchTerm, filters, sortConfig]);

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({ status: 'active' });
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({ ...item });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await axios.delete(`/admin/${activeTab}/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete item');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await axios.put(`/admin/${activeTab}/${editingId}`, formData);
            } else {
                await axios.post(`/admin/${activeTab}`, formData);
            }
            setShowModal(false);
            fetchData();
            fetchDropdownData();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save item');
        }
    };

    const getFilteredLocations = () => {
        if (!formData.city_id) return locations;
        return locations.filter(loc => loc.city_id === parseInt(formData.city_id));
    };

    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'cities':
                return (
                    <>
                        <div className="form-group">
                            <label className="form-label">City Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Mumbai, Delhi"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status || 'active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </>
                );

            case 'locations':
                return (
                    <>
                        <div className="form-group">
                            <label className="form-label">Location Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Phoenix Mall, Select City Walk"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City *</label>
                            <select
                                className="form-select"
                                value={formData.city_id || ''}
                                onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                                required
                            >
                                <option value="">-- Select City --</option>
                                {cities.filter(c => c.status === 'active').map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status || 'active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </>
                );

            case 'pos':
                return (
                    <>
                        <div className="form-group">
                            <label className="form-label">POS Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., POS-MUM-PHX-01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City *</label>
                            <select
                                className="form-select"
                                value={formData.city_id || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    city_id: e.target.value,
                                    location_id: '' // Reset location when city changes
                                })}
                                required
                            >
                                <option value="">-- Select City --</option>
                                {cities.filter(c => c.status === 'active').map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <select
                                className="form-select"
                                value={formData.location_id || ''}
                                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                                required
                                disabled={!formData.city_id}
                            >
                                <option value="">-- Select Location --</option>
                                {getFilteredLocations().filter(l => l.status === 'active').map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                            {!formData.city_id && (
                                <small className="text-muted">Please select a city first</small>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status || 'active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </>
                );

            case 'users':
                return (
                    <>
                        <div className="form-group">
                            <label className="form-label">Full Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        {!editingId && (
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password || ''}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter password"
                                    required={!editingId}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label">Role *</label>
                            <select
                                className="form-select"
                                value={formData.role || 'regular_user'}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                required
                            >
                                <option value="regular_user">Regular User</option>
                                <option value="administrator">Administrator</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status || 'active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="disabled">Disabled</option>
                            </select>
                        </div>
                    </>
                );

            case 'sales-types':
                return (
                    <>
                        <div className="form-group">
                            <label className="form-label">Sales Type Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Cash Sales, Bank Deposit"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Attachment Settings</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.attachment_applicable || false}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            attachment_applicable: e.target.checked,
                                            attachment_required: e.target.checked ? formData.attachment_required : false
                                        })}
                                    />
                                    <span>Attachment Applicable</span>
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.attachment_required || false}
                                        onChange={(e) => setFormData({ ...formData, attachment_required: e.target.checked })}
                                        disabled={!formData.attachment_applicable}
                                    />
                                    <span>Attachment Required</span>
                                </label>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status || 'active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    const getTableConfig = () => {
        switch (activeTab) {
            case 'cities':
                return {
                    columns: [
                        { key: 'id', label: 'ID', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                    ]
                };
            case 'locations':
                return {
                    columns: [
                        { key: 'id', label: 'ID', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'city_name', label: 'City', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                    ]
                };
            case 'pos':
                return {
                    columns: [
                        { key: 'id', label: 'ID', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'location_name', label: 'Location', sortable: true },
                        { key: 'city_name', label: 'City', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                    ]
                };
            case 'users':
                return {
                    columns: [
                        { key: 'id', label: 'ID', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'email', label: 'Email', sortable: true },
                        { key: 'role', label: 'Role', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                    ]
                };
            case 'sales-types':
                return {
                    columns: [
                        { key: 'id', label: 'ID', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'attachment_applicable', label: 'Attachment', sortable: true },
                        { key: 'attachment_required', label: 'Required', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                    ]
                };
            default:
                return { columns: [] };
        }
    };

    const renderCellContent = (item, key) => {
        const value = item[key];

        // Handle status fields
        if (key === 'status') {
            const statusClass = value === 'active' ? 'success' :
                value === 'pending' ? 'warning' : 'error';
            return <span className={`badge badge-${statusClass}`}>{value}</span>;
        }

        // Handle role field
        if (key === 'role') {
            return (
                <span className="badge badge-primary">
                    {String(value || '').replace(/_/g, ' ')}
                </span>
            );
        }

        // Handle boolean fields
        if (key === 'attachment_applicable' || key === 'attachment_required') {
            return (
                <span className={`badge badge-${value ? 'success' : 'secondary'}`}>
                    {value ? 'Yes' : 'No'}
                </span>
            );
        }

        // Handle name field with bold
        if (key === 'name') {
            return <strong>{value}</strong>;
        }

        return value;
    };

    const tableConfig = getTableConfig();

    return (
        <div className="admin-panel">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Panel</h1>
                    <p className="page-description">Manage system configuration and settings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label className="filter-label">Search:</label>
                    <input
                        type="text"
                        className="form-input filter-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label className="filter-label">Status:</label>
                    <select
                        className="form-select filter-input"
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        {activeTab === 'users' && <option value="pending">Pending</option>}
                        {activeTab === 'users' && <option value="disabled">Disabled</option>}
                    </select>
                </div>
                {(searchTerm || Object.values(filters).some(v => v)) && (
                    <button className="btn btn-ghost btn-sm filter-clear" onClick={clearFilters}>
                        Clear Filters
                    </button>
                )}
                <div style={{ marginLeft: 'auto' }}>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        + Add New
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                {loading ? (
                    <div className="empty-state">
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '1rem' }}>Loading...</p>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                {tableConfig.columns.map(col => (
                                    <th
                                        key={col.key}
                                        className={col.sortable ? 'sortable' : ''}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        {col.label}
                                        {col.sortable && (
                                            <span className={`sort-icon ${sortConfig.key === col.key ? 'sorted' : ''}`}>
                                                {getSortIcon(col.key)}
                                            </span>
                                        )}
                                    </th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.length > 0 ? (
                                processedData.map(item => (
                                    <tr key={item.id}>
                                        {tableConfig.columns.map(col => (
                                            <td key={col.key}>
                                                {renderCellContent(item, col.key)}
                                            </td>
                                        ))}
                                        <td className="actions-cell">
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon"
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm btn-icon"
                                                onClick={() => handleDelete(item.id)}
                                                title="Delete"
                                                style={{ color: 'var(--error-500)' }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableConfig.columns.length + 1}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📭</div>
                                            <div className="empty-state-title">No data found</div>
                                            <div className="empty-state-description">
                                                {searchTerm || Object.values(filters).some(v => v)
                                                    ? 'Try adjusting your filters'
                                                    : 'Click "Add New" to create an entry'}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Results count */}
            {!loading && processedData.length > 0 && (
                <div className="text-muted" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                    Showing {processedData.length} of {data.length} records
                </div>
            )}

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingId ? 'Edit' : 'Add New'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1) || 'Item'}
                            </h3>
                            <button type="button" className="modal-close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {renderForm()}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingId ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;
