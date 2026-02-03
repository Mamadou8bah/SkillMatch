import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, MapPin, Briefcase, MessageSquare, UserPlus, Check, Users, Search, XCircle } from 'lucide-react'
import '../styles/network.css'
import Loader from './Loader'

export const Candidates = () => {
    const [users, setUsers] = useState([])
    const [connections, setConnections] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('discover')
    const [searchQuery, setSearchQuery] = useState('')
    const myRole = localStorage.getItem('userRole')
    const myId = localStorage.getItem('userId')

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const baseUrl = 'http://localhost:8080'
            const headers = { 'Authorization': `Bearer ${token}` }
            const [usersRes, connRes, pendingRes, recRes] = await Promise.all([
                fetch(`${baseUrl}/api/users/network`, { headers }),
                fetch(`${baseUrl}/api/connections`, { headers }),
                fetch(`${baseUrl}/api/connections/pending`, { headers }),
                fetch(`${baseUrl}/api/recommendations/connections`, { headers })
            ])
            
            const usersData = await usersRes.json()
            const connData = await connRes.json()
            const pendingData = await pendingRes.json()
            const recData = await recRes.json()
            
            if (usersData.success) setUsers(usersData.data)
            if (connData.success) setConnections(connData.data)
            if (pendingData.success) setPendingRequests(pendingData.data)
            if (recData.success) setRecommendations(recData.data)
        } catch (err) {
            console.error("Failed to fetch data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleConnect = async (targetId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/connections/request/${targetId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                fetchData()
            }
        } catch (err) {
            console.error('Failed to send request', err)
        }
    }

    const handleAccept = async (requestId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:8080/api/connections/accept/${requestId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await response.json()
            if (data.success) {
                fetchData()
            }
        } catch (err) {
            console.error('Failed to accept request', err)
        }
    }

    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const isUserConnected = (userId) => {
        return connections.some(c => c.id === userId)
    }

    const renderUserGrid = (userList) => {
        if (userList.length === 0) {
            return (
                <div className="empty-state">
                    <Users size={48} />
                    <p>No users found in this section.</p>
                </div>
            )
        }

        if (userList.length === 0) {
            return (
                <div className="no-jobs-container" style={{ gridColumn: '1 / -1' }}>
                    <p className="no-jobs-title">No members found</p>
                    <p className="no-jobs-text">Try adjusting your filters or check back later.</p>
                </div>
            )
        }

        return (
            <div className="network-grid">
                {userList.map(user => {
                    const connected = isUserConnected(user.id)
                    const canMessage = (myRole === 'EMPLOYER' && user.role === 'CANDIDATE') || connected

                    return (
                        <div key={user.id} className="user-card">
                            <img 
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=128`} 
                                alt={user.fullName} 
                                className="user-card-avatar" 
                            />
                            <div className="user-card-info">
                                <h3>{user.fullName}</h3>
                                <span className="user-card-role">{user.role || 'Member'}</span>
                                <div className="user-card-location">
                                    <MapPin size={14} />
                                    <span>{user.location || 'Remote'}</span>
                                </div>
                            </div>
                            <div className="user-card-actions">
                                {connected || canMessage ? (
                                    <Link to={`/messages/${user.id}`} className="action-btn btn-primary">
                                        <MessageSquare size={18} />
                                        <span>Message</span>
                                    </Link>
                                ) : (
                                    <button onClick={() => handleConnect(user.id)} className="action-btn btn-secondary">
                                        <UserPlus size={18} />
                                        <span>Connect</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className='network-container'>
            <div className="network-header">
                <h2>Network</h2>
                <p>Grow your professional community on SkillMatch</p>
            </div>

            <div className="network-tabs">
                <button 
                    className={`network-tab ${activeTab === 'discover' ? 'active' : ''}`}
                    onClick={() => setActiveTab('discover')}
                >
                    Discover
                </button>
                <button 
                    className={`network-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('suggestions')}
                >
                    Suggestions
                </button>
                <button 
                    className={`network-tab ${activeTab === 'connections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('connections')}
                >
                    Connections ({connections.length})
                </button>
                {pendingRequests.length > 0 && (
                    <button 
                        className={`network-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending ({pendingRequests.length})
                    </button>
                )}
            </div>

            {activeTab === 'discover' && (
                <div className="search-section" style={{ marginBottom: '20px' }}>
                    <div className="d-search-bar" style={{ padding: 0 }}>
                        <div className="d-search-input" style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 15px' }}>
                            <Search size={20} color="var(--text-secondary)" />
                            <input 
                                type="text" 
                                placeholder="Search by name or role..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none', color: 'var(--text-color)' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="network-content">
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        {activeTab === 'discover' && renderUserGrid(filteredUsers)}
                        {activeTab === 'suggestions' && renderUserGrid(recommendations)}
                        {activeTab === 'connections' && renderUserGrid(connections)}
                        {activeTab === 'pending' && (
                            <div className="pending-list">
                                {pendingRequests.length === 0 ? (
                                    <div className="no-jobs-container" style={{ width: '100%' }}>
                                        <p className="no-jobs-title">No pending requests</p>
                                        <p className="no-jobs-text">All caught up!</p>
                                    </div>
                                ) : pendingRequests.map(req => (
                                    <div key={req.id} className="pending-request-card">
                                        <img 
                                            src={req.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.fullName)}&background=random`} 
                                            alt="" 
                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
                                        />
                                        <div className="pending-request-info">
                                            <h4>{req.requester.fullName}</h4>
                                            <p>{req.requester.role || 'Member'}</p>
                                        </div>
                                        <div className="pending-actions">
                                            <button onClick={() => handleAccept(req.id)} className="accept-btn">Accept</button>
                                            <button className="decline-btn">Decline</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

