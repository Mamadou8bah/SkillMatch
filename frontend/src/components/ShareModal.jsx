import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bookmark, Share2, Copy, X, ArrowLeft, Search, Check } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { chatCache } from '../utils/cache';
import '../styles/sharemodal.css';

const ShareModal = ({ isOpen, onClose, job, isBookmarked, onToggleBookmark }) => {
    const [step, setStep] = useState('options'); // 'options' or 'dm'
    const [searchTerm, setSearchTerm] = useState('');
    const [recipients, setRecipients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sendingTo, setSendingTo] = useState(null); // ID of user being sent to
    const [sentStatus, setSentStatus] = useState({}); // { [userId]: 'sent' | 'error' }

    const shareUrl = `${window.location.origin}/jobs/${job.id}`;

    useEffect(() => {
        if (isOpen) {
            setStep('options');
            setSentStatus({});
        }
    }, [isOpen]);

    useEffect(() => {
        if (step === 'dm' && recipients.length === 0) {
            fetchRecipients();
        }
    }, [step]);

    const fetchRecipients = async () => {
        // Try cache first
        const cachedInbox = chatCache.get('inbox_list');
        if (cachedInbox) {
            const currentUserId = localStorage.getItem('userId');
            const users = cachedInbox.map(msg => {
                return msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
            });
            const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
            setRecipients(uniqueUsers);
            // Don't show loader if we have cache
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }

        try {
            const data = await apiFetch('/api/messages/inbox');
            if (data.success) {
                chatCache.set('inbox_list', data.data);
                const currentUserId = localStorage.getItem('userId');
                const users = data.data.map(msg => {
                    return msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
                });
                // Unique users only
                const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
                setRecipients(uniqueUsers);
            }
        } catch (err) {
            console.error("Failed to fetch recipients", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendDM = async (recipient) => {
        setSendingTo(recipient.id);
        try {
            const message = `Check out this job: ${job.title} at ${job.company || job.employer?.name || 'Company'}\n${shareUrl}`;
            const data = await apiFetch('/api/messages/send', {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: recipient.id,
                    content: message
                })
            });

            if (data.success) {
                setSentStatus(prev => ({ ...prev, [recipient.id]: 'sent' }));
                
                // Update inbox cache
                const cachedInbox = chatCache.get('inbox_list');
                if (cachedInbox) {
                    const currentUserId = localStorage.getItem('userId');
                    const conversationIndex = cachedInbox.findIndex(msg => {
                        const otherUserInInbox = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
                        return otherUserInInbox.id.toString() === recipient.id.toString();
                    });

                    let newInbox;
                    if (conversationIndex !== -1) {
                        const updatedInbox = [...cachedInbox];
                        updatedInbox[conversationIndex] = { ...data.data };
                        const [movedItem] = updatedInbox.splice(conversationIndex, 1);
                        newInbox = [movedItem, ...updatedInbox];
                    } else {
                        newInbox = [data.data, ...cachedInbox];
                    }
                    chatCache.set('inbox_list', newInbox);
                }

                // Also update history cache if it exists
                const cachedHistory = chatCache.get(`history_${recipient.id}`);
                if (cachedHistory) {
                    chatCache.set(`history_${recipient.id}`, [...cachedHistory, data.data]);
                }
            } else {
                setSentStatus(prev => ({ ...prev, [recipient.id]: 'error' }));
            }
        } catch (err) {
            console.error("Failed to send DM", err);
            setSentStatus(prev => ({ ...prev, [recipient.id]: 'error' }));
        } finally {
            setSendingTo(null);
        }
    };

    const filteredRecipients = recipients.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const options = [
        {
            id: 'dm',
            label: 'Send in DM',
            icon: <Send size={20} />,
            onClick: () => {
                setStep('dm');
            }
        },
        {
            id: 'bookmark',
            label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
            icon: <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />,
            onClick: () => {
                onToggleBookmark();
                onClose();
            }
        },
        {
            id: 'share',
            label: 'Share via...',
            icon: <Share2 size={20} />,
            onClick: async () => {
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: job.title,
                            text: `Check out this job: ${job.title} at ${job.company || 'Company'}`,
                            url: shareUrl,
                        });
                    } catch (err) {
                        console.error('Error sharing:', err);
                    }
                } else {
                    alert('Sharing not supported on this browser');
                }
            }
        },
        {
            id: 'copy',
            label: 'Copy Link',
            icon: <Copy size={20} />,
            onClick: () => {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
                onClose();
            }
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        className="share-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div 
                        className="share-modal-content"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        <div className="share-modal-header">
                            <div className="share-modal-handle" />
                            <div className="share-modal-title-row">
                                {step === 'dm' && (
                                    <button className="share-modal-back" onClick={() => setStep('options')}>
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                <h3>{step === 'dm' ? 'Send in DM' : 'Share Job'}</h3>
                                <button className="share-modal-close" onClick={onClose}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {step === 'options' ? (
                            <div className="share-modal-options">
                                {options.map((option) => (
                                    <button 
                                        key={option.id} 
                                        className="share-modal-option"
                                        onClick={option.onClick}
                                    >
                                        <div className="option-icon">
                                            {option.icon}
                                        </div>
                                        <span className="option-label">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="share-modal-dm-view">
                                <div className="dm-search-bar">
                                    <Search size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search people..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="dm-recipients-list">
                                    {isLoading ? (
                                        <div className="dm-loading">Loading contacts...</div>
                                    ) : filteredRecipients.length > 0 ? (
                                        filteredRecipients.map((recipient) => (
                                            <div key={recipient.id} className="dm-recipient-item">
                                                <div className="recipient-info">
                                                    <img 
                                                        src={recipient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.fullName)}&background=random`} 
                                                        alt="" 
                                                    />
                                                    <span>{recipient.fullName}</span>
                                                </div>
                                                <button 
                                                    className={`dm-send-btn ${sentStatus[recipient.id] || ''}`}
                                                    onClick={() => handleSendDM(recipient)}
                                                    disabled={sendingTo === recipient.id || sentStatus[recipient.id] === 'sent'}
                                                >
                                                    {sendingTo === recipient.id ? 'Sending...' : 
                                                     sentStatus[recipient.id] === 'sent' ? <><Check size={16} /> Sent</> : 'Send'}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="dm-empty">No contacts found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
