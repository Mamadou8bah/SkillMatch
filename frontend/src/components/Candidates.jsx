import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, MessageSquare, UserPlus, Search, Clock } from 'lucide-react'
import '../styles/network.css'
import Loader from './Loader'
import { apiFetch } from '../utils/api'

export const Candidates = () => {
    const [users, setUsers] = useState([])
    const [connections, setConnections] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('discover')
    const [searchQuery, setSearchQuery] = useState('')
    const [processingId, setProcessingId] = useState(null)
    const myRole = localStorage.getItem('userRole')

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [usersData, connData, pendingData, recData] = await Promise.all([
                apiFetch('/api/users/network'),
                apiFetch('/api/connections'),
                apiFetch('/api/connections/pending'),
                apiFetch('/api/recommendations/connections')
            ])
            
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
        setProcessingId(targetId)
        try {
            const data = await apiFetch(`/api/connections/request/${targetId}`, {
                method: 'POST'
            })
            if (data.success) {
                await fetchData()
            } else {
                alert(data.message || 'Failed to send connection request')
            }
        } catch (err) {
            console.error('Failed to send request', err)
            if (err.message !== 'Unauthorized' && err.message !== 'Token expired') {
                alert('A network error occurred. Please try again.')
            }
        } finally {
            setProcessingId(null)
        }
    }

    const handleAccept = async (requestId) => {
        setProcessingId(requestId)
        try {
            const data = await apiFetch(`/api/connections/accept/${requestId}`, {
                method: 'POST'
            })
            if (data.success) {
                await fetchData()
            } else {
                alert(data.message || 'Failed to accept request')
            }
        } catch (err) {
            console.error('Failed to accept request', err)
            if (err.message !== 'Unauthorized' && err.message !== 'Token expired') {
                alert('A network error occurred. Please try again.')
            }
        } finally {
            setProcessingId(null)
        }
    }

    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const isUserConnected = (userId) => {
        return connections.some(c => c.id === userId)
    }

    const hasPendingRequest = (userId) => {
        return pendingRequests.some(r => r.requester.id === userId)
    }

    const renderUserList = (userList) => {
        if (userList.length === 0) {
            return (
                <div className="no-jobs-container">
                    <p className="no-jobs-title">No members found</p>
                    <p className="no-jobs-text">Try adjusting your filters or check back later.</p>
                </div>
            )
        }

        return (
            <div className="network-list">
                {userList.map(user => {
                    const connected = isUserConnected(user.id)
                    const isPending = hasPendingRequest(user.id)
                    const isProcessing = processingId === user.id
                    
                    return (
                        <div key={user.id} className="user-list-item">
                            <div className="user-info-section">
                                <img 
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=128`} 
                                    alt={user.fullName} 
                                    className="user-list-avatar" 
                                />
                                <div className="user-details">
                                    <div className="user-name-row">
                                        <h3>{user.fullName}</h3>
                                        {user.profession?.includes('Senior') && <span className="pro-badge">PRO</span>}
                                    </div>
                                    <div className="user-meta-row">
                                        <MapPin size={14} />
                                        <span>{user.location || 'Gambia'}</span>
                                        <span className="separator">•</span>
                                        <span className="user-profession">{user.profession || 'Professional'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="user-actions-section">
                                {connected ? (
                                    <Link to={`/messages/${user.id}`} className="action-btn btn-primary">
                                        <MessageSquare size={16} style={{ marginRight: '8px' }} />
                                        <span>Message</span>
                                    </Link>
                                ) : isPending ? (
                                    <button className="action-btn btn-outline" disabled>
                                        <Clock size={16} style={{ marginRight: '8px' }} />
                                        <span>Pending</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleConnect(user.id)} 
                                        className="action-btn btn-primary"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? '...' : (
                                            <>
                                                <UserPlus size={16} style={{ marginRight: '8px' }} />
                                                <span>{myRole === 'EMPLOYER' ? 'Hire' : 'Connect'}</span>
                                            </>
                                        )}
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
                <h2>Connections</h2>
                <p>Build your professional community on SkillMatch</p>
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
                <button 
                    className={`network-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Requests {pendingRequests.length > 0 && <span className="tab-badge">{pendingRequests.length}</span>}
                </button>
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
                        {activeTab === 'discover' && renderUserList(filteredUsers)}
                        {activeTab === 'suggestions' && renderUserList(recommendations)}
                        {activeTab === 'connections' && renderUserList(connections)}
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

