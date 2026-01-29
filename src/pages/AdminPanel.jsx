import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

function AdminPanel() {
    const [activeTab, setActiveTab] = useState('cities');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);

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
    }, [activeTab]);

    const fetchDropdownData = async () => {
        try {
            const [citiesRes, locationsRes] = await Promise.all([
                axios.get('/admin/cities'),
                axios.get('/admin/locations')
            ]);
            setCities(citiesRes.data);
            setLocations(locationsRes.data);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/admin/${activeTab}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

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
                                <small style={{ color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
                                    Please select a city first
                                </small>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
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

    const renderTableHeaders = () => {
        switch (activeTab) {
            case 'cities':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'locations':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'pos':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>City</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'users':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'sales-types':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Attachment</th>
                        <th>Required</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                );
            default:
                return null;
        }
    };

    const renderTableRow = (item) => {
        switch (activeTab) {
            case 'cities':
                return (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>
                            <span className={`badge badge-${item.status === 'active' ? 'success' : 'error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️ Edit</button>
                            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                        </td>
                    </tr>
                );
            case 'locations':
                return (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.city_name}</td>
                        <td>
                            <span className={`badge badge-${item.status === 'active' ? 'success' : 'error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️ Edit</button>
                            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                        </td>
                    </tr>
                );
            case 'pos':
                return (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.location_name}</td>
                        <td>{item.city_name}</td>
                        <td>
                            <span className={`badge badge-${item.status === 'active' ? 'success' : 'error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️ Edit</button>
                            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                        </td>
                    </tr>
                );
            case 'users':
                return (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.email}</td>
                        <td>
                            <span className="badge badge-primary">
                                {item.role.replace(/_/g, ' ')}
                            </span>
                        </td>
                        <td>
                            <span className={`badge badge-${item.status === 'active' ? 'success' : item.status === 'pending' ? 'warning' : 'error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️ Edit</button>
                            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                        </td>
                    </tr>
                );
            case 'sales-types':
                return (
                    <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td>
                            <span className={`badge badge-${item.attachment_applicable ? 'success' : 'secondary'}`}>
                                {item.attachment_applicable ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td>
                            <span className={`badge badge-${item.attachment_required ? 'warning' : 'secondary'}`}>
                                {item.attachment_required ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td>
                            <span className={`badge badge-${item.status === 'active' ? 'success' : 'error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="actions-cell">
                            <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️ Edit</button>
                            <button className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                        </td>
                    </tr>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>⚙️ Admin Panel</h1>
                <p>Manage system configuration and settings</p>
            </div>

            <div className="admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="admin-content glass-card">
                <div className="content-header">
                    <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <span>➕</span>
                        <span>Add New</span>
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                {renderTableHeaders()}
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map(item => renderTableRow(item))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No data found. Click "Add New" to create an entry.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingId ? '✏️ Edit' : '➕ Add New'} {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {renderForm()}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
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
