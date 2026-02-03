import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Eye, Users, Plus, Trash2, Edit } from 'lucide-react'
import '../styles/discover.css'
import Loader from './Loader'

export const ManageJobs = () => {
    const [myJobs, setMyJobs] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('http://localhost:8080/post/myjobs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await response.json()
                setMyJobs(data)
            } catch (err) {
                console.error("Failed to fetch my jobs", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMyJobs()
    }, [])

    return (
        <div className='discover-container'>
            <div className="discover-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Manage My Jobs</h2>
                <Link to="/jobs/new" className="action-btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: 'var(--primary-color)', color: 'white', textDecoration: 'none' }}>
                    <Plus size={20} />
                    <span>Post New Job</span>
                </Link>
            </div>

            {isLoading ? (
                <Loader />
            ) : myJobs.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} />
                    <p>You haven't posted any jobs yet.</p>
                </div>
            ) : (
                <div className="discover-list">
                    {myJobs.map(job => (
                        <div key={job.id} className="job-card" style={{ marginBottom: '15px' }}>
                            <div className="jc-upper">
                                <div className="jc-info">
                                    <h3>{job.title}</h3>
                                    <p>{job.locationType} • ${job.salary?.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="jc-lower" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                <div className="job-stats" style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        <Users size={16} />
                                        <span>Applications</span>
                                    </div>
                                </div>
                                <div className="job-actions" style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`/jobs/${job.id}`} className="icon-btn" title="View Details">
                                        <Eye size={18} />
                                    </Link>
                                    <Link to={`/jobs/edit/${job.id}`} className="icon-btn" title="Edit">
                                        <Edit size={18} />
                                    </Link>
                                    <button className="icon-btn delete" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
