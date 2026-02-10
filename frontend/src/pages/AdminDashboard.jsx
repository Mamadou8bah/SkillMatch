import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Settings, LogOut, Bell, Search, Trash2, Edit, RefreshCw } from 'lucide-react';
import '../styles/admin.css';
import { apiFetch } from '../utils/api';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalJobs: 0,
        activeApplications: 0,
        newSignups: 0
    });
    const [activities, setActivities] = useState([]);
    const [isScraping, setIsScraping] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const statsRes = await apiFetch('/api/admin/stats');
                if (statsRes.success) setStats(statsRes.data);

                const activitiesRes = await apiFetch('/api/admin/activities');
                if (activitiesRes.success) setActivities(activitiesRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleScrape = async () => {
        setIsScraping(true);
        try {
            await apiFetch('/post/sync', { method: 'POST' });
            alert('Job scraping process started in the background. It may take a few minutes to complete.');
        } catch (err) {
            alert('Failed to start scraping process');
        } finally {
            setIsScraping(false);
        }
    };

    if (loading) return <div className="admin-content"><h2>Loading Dashboard...</h2></div>;

    return (
        <div className="admin-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Dashboard Overview</h2>
                <button 
                    onClick={handleScrape} 
                    disabled={isScraping}
                    className="action-btn" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: '#007bff', 
                        color: 'white', 
                        padding: '0.75rem 1.25rem', 
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    <RefreshCw size={18} className={isScraping ? 'spin' : ''} />
                    {isScraping ? 'Scraping...' : 'Scrape Jobs Now'}
                </button>
            </div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#e7f1ff', color: '#007bff' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fff4e5', color: '#ffa940' }}>
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Job Posts</h3>
                        <p>{stats.totalJobs}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#e6ffed', color: '#28a745' }}>
                        <LayoutDashboard size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Applications</h3>
                        <p>{stats.activeApplications}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fff1f0', color: '#ff4d4f' }}>
                        <Bell size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>New Signups (7d)</h3>
                        <p>{stats.newSignups}</p>
                    </div>
                </div>
            </div>

            <div className="admin-card">
                <h3>Recent Activity</h3>
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>User</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.length > 0 ? activities.map((activity, index) => (
                                <tr key={index}>
                                    <td><span className={`badge badge-${activity.status}`}>{activity.action}</span></td>
                                    <td>{activity.entity}</td>
                                    <td>{activity.user}</td>
                                    <td>{new Date(activity.date).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>No recent activity found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiFetch('/api/users');
                if (response.success) {
                    setUsers(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    const filteredUsers = users.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>User Management</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#777' }} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem 0.5rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                        />
                    </div>
                </div>
            </div>
            {loading ? <p>Loading users...</p> : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td><span className={`badge ${user.role === 'ADMIN' ? 'badge-danger' : 'badge-success'}`}>{user.role}</span></td>
                                    <td><span className="badge badge-success">Active</span></td>
                                    <td>
                                        <button className="action-btn" title="Edit"><Edit size={16} /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(user.id)} title="Delete"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isScraping, setIsScraping] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await apiFetch('/post');
            if (response.content) {
                setJobs(response.content);
            } else if (Array.isArray(response)) {
                setJobs(response);
            }
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleScrape = async () => {
        setIsScraping(true);
        try {
            await apiFetch('/post/sync', { method: 'POST' });
            alert('Scraping process started in background');
        } catch (err) {
            alert('Failed to start scraping');
        } finally {
            setIsScraping(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this job post?')) {
            try {
                await apiFetch(`/post/${id}`, { method: 'DELETE' });
                setJobs(jobs.filter(j => j.id !== id));
            } catch (err) {
                alert('Failed to delete job');
            }
        }
    };

    const filteredJobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.companyName || job.company)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Job Post Management</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: '#777' }} />
                        <input 
                            type="text" 
                            placeholder="Search jobs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem 0.5rem 0.5rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }} 
                        />
                    </div>
                    <button 
                        onClick={handleScrape} 
                        disabled={isScraping}
                        className="btn-primary" 
                        style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={isScraping ? 'spin' : ''} />
                        {isScraping ? 'Scraping...' : 'Scrape Jobs'}
                    </button>
                </div>
            </div>
            {loading ? <p>Loading jobs...</p> : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Company</th>
                                <th>Location</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map(job => (
                                <tr key={job.id}>
                                    <td>{job.title}</td>
                                    <td>{job.companyName || job.company}</td>
                                    <td>{job.locationType || job.location}</td>
                                    <td><span className="badge badge-warning">{job.source}</span></td>
                                    <td>
                                        <button className="action-btn" title="Edit"><Edit size={16} /></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(job.id)} title="Delete"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredJobs.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No jobs found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const AdminSettings = () => {
    return (
        <div className="admin-card">
            <h3>System Settings</h3>
            <p style={{ color: '#777', marginBottom: '1.5rem' }}>Configure global application parameters and administrative preferences.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>General Settings</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontWeight: '600', margin: 0 }}>System Maintenance Mode</p>
                            <span style={{ fontSize: '0.875rem', color: '#777' }}>Disable public access to the platform during updates.</span>
                        </div>
                        <input type="checkbox" style={{ width: '20px', height: '20px' }} />
                    </div>
                </div>

                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Job Scraping Configuration</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontWeight: '600', margin: 0 }}>Auto-Sync Frequency</p>
                        <select style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', maxWidth: '200px' }}>
                            <option>Every 6 hours</option>
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Manual Only</option>
                        </select>
                    </div>
                </div>

                <div>
                    <button className="btn-primary" style={{ background: '#007bff', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                        Save Configurations
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        if (userRole !== 'ADMIN') {
            navigate('/');
        }
    }, [userRole, navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <Briefcase size={32} />
                    <span>SkillMatch Admin</span>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <p>Overview</p>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <p>Users</p>
                    </NavLink>
                    <NavLink to="/admin/jobs" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Briefcase size={20} />
                        <p>Jobs</p>
                    </NavLink>
                    <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} />
                        <p>Settings</p>
                    </NavLink>
                </nav>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
                        <LogOut size={20} />
                        <p>Logout</p>
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                <header className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button className="action-btn"><Bell size={20} /></button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <img src="https://ui-avatars.com/api/?name=Admin+User" alt="Admin" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <span>System Admin</span>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route index element={<AdminOverview />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="jobs" element={<JobManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Routes>
            </main>
        </div>
    );
};
