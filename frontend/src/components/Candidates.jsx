import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Target } from 'lucide-react'
import '../styles/network.css'
import Loader from './Loader'
import { apiFetch } from '../utils/api'

export const Candidates = () => {
    const [users, setUsers] = useState([])
    const [connections, setConnections] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [myIndustry, setMyIndustry] = useState(null)
    const [activeTab, setActiveTab] = useState('discover')
    const [searchQuery, setSearchQuery] = useState('')
    const [processingId, setProcessingId] = useState(null)
    const myRole = localStorage.getItem('userRole')

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true)
        try {
            const userId = localStorage.getItem('userId')
            const [usersData, connData, pendingData, sentData, recData, profileData] = await Promise.all([
                apiFetch('/api/users/network'),
                apiFetch('/api/connections'),
                apiFetch('/api/connections/pending'),
                apiFetch('/api/connections/sent'),
                apiFetch('/api/recommendations/connections'),
                apiFetch(`/api/users/${userId}`)
            ])
            
            if (usersData.success) setUsers(usersData.data)
            if (connData.success) setConnections(connData.data)
            if (pendingData.success) setPendingRequests(pendingData.data)
            if (sentData.success) setSentRequests(sentData.data)
            if (recData.success) setRecommendations(recData.data)
            if (profileData.success) setMyIndustry(profileData.data.industry)
        } catch (err) {
            console.error("Failed to fetch data", err)
        } finally {
            if (!silent) setIsLoading(false)
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
                await fetchData(true)
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
                await fetchData(true)
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

    const displayedUsers = searchQuery.trim() !== '' 
        ? users.filter(user => 
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : recommendations;

    const isUserConnected = (userId) => {
        return connections.some(c => c.id === userId)
    }

    const hasPendingRequest = (userId) => {
        return pendingRequests.some(r => r.requester.id === userId)
    }

    const hasSentRequest = (userId) => {
        return sentRequests.some(r => r.target.id === userId)
    }

    const renderRecommendations = () => {
        if (recommendations.length === 0) {
            return (
                <div className="no-jobs-container">
                    <p className="no-jobs-title">No recommendations yet</p>
                    <p className="no-jobs-text">Grow your profile to get better matches.</p>
                </div>
            )
        }

        const highMatch = recommendations.filter(u => u.industry === myIndustry || !myIndustry).slice(0, 7)
        const diverse = recommendations.filter(u => u.industry !== myIndustry && myIndustry).slice(0, 3)

        return (
            <div className="recommendations-section">
                {highMatch.length > 0 && (
                    <div className="rec-group">
                        <h3 className="rec-group-title" style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                            <Target size={18} style={{ marginRight: '8px' }} /> Matched for You (Top Picks)
                        </h3>
                        {renderUserList(highMatch)}
                    </div>
                )}
                {diverse.length > 0 && (
                    <div className="rec-group" style={{ marginTop: '30px' }}>
                        <h3 className="rec-group-title" style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} style={{ marginRight: '8px' }} /> Diverse Discovery (Expanding your Circle)
                        </h3>
                        {renderUserList(diverse)}
                    </div>
                )}
            </div>
        )
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
                    const isRequested = hasSentRequest(user.id)
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
                                    <div className="user-name-wrapper">
                                        <span className="user-name">{user.fullName}</span>
                                    </div>
                                    <p className="user-bio">
                                        {user.profession || 'Professional'} {user.location && `• ${user.location}`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="user-actions-section">
                                {connected ? (
                                    <Link to={`/messages/${user.id}`} className="action-btn btn-primary">
                                        <span>Message</span>
                                    </Link>
                                ) : isPending ? (
                                    <button className="action-btn btn-outline" disabled style={{ opacity: 0.6 }}>
                                        <span>Pending</span>
                                    </button>
                                ) : isRequested ? (
                                    <button className="action-btn btn-outline" disabled style={{ opacity: 0.8 }}>
                                        <span>Requested</span>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleConnect(user.id)} 
                                        className="action-btn btn-primary"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? '...' : (
                                            <span>{myRole === 'EMPLOYER' ? 'Hire' : 'Connect'}</span>
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
                    className={`network-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Requests {pendingRequests.length > 0 && <span className="tab-badge">{pendingRequests.length}</span>}
                </button>                
                <button 
                    className={`network-tab ${activeTab === 'connections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('connections')}
                >
                    Connections ({connections.length})
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
                        {activeTab === 'discover' && (
                            searchQuery.trim() !== '' 
                                ? renderUserList(displayedUsers) 
                                : renderRecommendations()
                        )}
                        {activeTab === 'connections' && renderUserList(connections)}
                        {activeTab === 'pending' && (
                            <div className="pending-list">
                                {pendingRequests.length === 0 ? (
                                    <div className="no-jobs-container" style={{ width: '100%' }}>
                                        <p className="no-jobs-title">No pending requests</p>
                                        <p className="no-jobs-text">All caught up!</p>
                                    </div>
                                ) : pendingRequests.map(req => (
                                    <div key={req.id} className="user-list-item">
                                        <div className="user-info-section">
                                            <img 
                                                src={req.requester.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.requester.fullName)}&background=random`} 
                                                alt="" 
                                                className="user-list-avatar"
                                            />
                                            <div className="user-details">
                                                <div className="user-name-wrapper">
                                                    <span className="user-name">{req.requester.fullName}</span>
                                                </div>
                                                <p className="user-bio">{req.requester.profession || req.requester.role || 'Member'}</p>
                                            </div>
                                        </div>
                                        <div className="user-actions-section">
                                            <button onClick={() => handleAccept(req.id)} className="action-btn btn-primary" style={{ marginRight: '8px', minWidth: '70px', padding: '6px 14px' }}>Accept</button>
                                            <button className="action-btn btn-outline" style={{ minWidth: '70px', padding: '6px 14px' }}>Decline</button>
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

