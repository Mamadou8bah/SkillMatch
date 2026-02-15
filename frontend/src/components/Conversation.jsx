import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MoreVertical, Phone, Video, Smile, Paperclip, AlertCircle, Clock, Check } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import '../styles/conversation.css'
import { apiFetch, BASE_URL } from '../utils/api'
import { chatCache } from '../utils/cache'
import { motion, AnimatePresence } from 'framer-motion'

const COMMON_EMOJIS = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃"
]

export const Conversation = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [recipient, setRecipient] = useState(null)
    const [chatMessages, setChatMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const messagesEndRef = useRef(null)
    const stompClient = useRef(null)
    const emojiPickerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                if (!event.target.closest('.emoji-btn')) {
                    setShowEmojiPicker(false)
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    useEffect(() => {
        const fetchRecipient = async () => {
            const cachedRecipient = chatCache.get(`recipient_${id}`);
            if (cachedRecipient) {
                setRecipient(cachedRecipient);
            }

            try {
                const data = await apiFetch(`/api/users/${id}`)
                if (data.success) {
                    setRecipient(data.data)
                    chatCache.set(`recipient_${id}`, data.data);
                }
            } catch (err) {
                console.error("Failed to fetch recipient", err)
            }
        }

        const fetchHistory = async () => {
            const cachedHistory = chatCache.get(`history_${id}`);
            if (cachedHistory) {
                setChatMessages(cachedHistory);
            }

            try {
                const data = await apiFetch(`/api/messages/conversation/${id}`)
                if (data.success) {
                    setChatMessages(data.data)
                    chatCache.set(`history_${id}`, data.data);
                }
            } catch (err) {
                console.error("Failed to fetch history", err)
            }
        }

        fetchRecipient()
        fetchHistory()
    }, [id])

    useEffect(() => {
        const socket = new SockJS(`${BASE_URL}/ws`)
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe('/user/queue/messages', (message) => {
                    const receivedMessage = JSON.parse(message.body)
                    const otherUserId = id;
                    
                    // Only care about messages from the person we are talking to
                    const isFromOther = receivedMessage.sender.id.toString() === otherUserId;

                    if (isFromOther) {
                        setChatMessages(prev => {
                            if (prev.find(m => m.id === receivedMessage.id)) return prev;
                            const newMessages = [...prev, receivedMessage];
                            chatCache.set(`history_${id}`, newMessages); // Update cache on new message
                            return newMessages;
                        })
                    }
                })
            },
            onDisconnect: () => {
            },
            onStompError: (frame) => {
                console.error("STOMP error", frame)
            },
            onWebSocketClose: () => {
            }
        })

        client.activate()
        stompClient.current = client

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate()
            }
        }
    }, [id])

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const currentUserId = localStorage.getItem('userId');
        const tempId = Date.now(); // Temporary ID for optimistic update
        
        const messageObject = {
            recipientId: id,
            content: newMessage,
            timestamp: new Date().toISOString()
        }

        // Optimistic update
        const optimisticMessage = {
            id: tempId,
            content: newMessage,
            timestamp: messageObject.timestamp,
            sender: { id: currentUserId },
            recipient: { id: id },
            isOptimistic: true,
            status: 'sending' // Added status
        }

        setChatMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("")
        setShowEmojiPicker(false)

        try {
            const data = await apiFetch(`/api/messages/send`, {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: id,
                    content: newMessage
                })
            })

            if (data.success) {
                // Update our optimistic message with the real one from the server
                setChatMessages(prev => {
                    const updated = prev.map(m => 
                        m.id === tempId ? { ...data.data, isOptimistic: false } : m
                    );
                    chatCache.set(`history_${id}`, updated); // Update cache on sent message
                    return updated;
                });
            } else {
                throw new Error(data.message || "Failed to send message")
            }
        } catch (err) {
            console.error("Failed to send message", err)
            setChatMessages(prev => prev.map(m => 
                m.id === tempId ? { ...m, status: 'error' } : m
            ))
        }
    }

    const formatChatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatMessageDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return '';
        const now = new Date()
        
        if (date.toDateString() === now.toDateString()) return 'Today'
        
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
        
        return date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
        })
    }

    return (
        <div className="conversation-container">
            <header className="chat-header">
                <div className="header-left-side">
                    <button className="back-btn" onClick={() => navigate('/messages')}>
                        <ArrowLeft size={24} />
                    </button>
                    {recipient && (
                        <div className="chat-user-info">
                            <div className="chat-avatar-wrapper">
                                <img 
                                    src={recipient.profileImageUrl || recipient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.fullName)}&background=random`} 
                                    alt={recipient.fullName} 
                                    className="chat-avatar"
                                />
                                <span className={`chat-online-dot ${recipient.online ? 'active' : ''}`}></span>
                            </div>
                            <div className="chat-user-details">
                                <h3>{recipient.fullName}</h3>
                                <span className="chat-status">{recipient.online ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="header-right-side">
                    <button className="icon-btn"><Phone size={20} /></button>
                    <button className="icon-btn"><Video size={20} /></button>
                    <button className="icon-btn"><MoreVertical size={20} /></button>
                </div>
            </header>

            <main className="chat-body">
                <div className="messages-scroller">
                    <AnimatePresence>
                        {chatMessages.map((msg, index) => {
                            const isMe = msg.sender.id.toString() === localStorage.getItem('userId');
                            const prevMsg = chatMessages[index - 1];
                            const nextMsg = chatMessages[index + 1];
                            
                            const isFirstInGroup = !prevMsg || prevMsg.sender.id !== msg.sender.id;
                            const isLastInGroup = !nextMsg || nextMsg.sender.id !== msg.sender.id;
                            
                            const showDateSeparator = !prevMsg || 
                                new Date(msg.timestamp || msg.sentAt).toDateString() !== new Date(prevMsg.timestamp || prevMsg.sentAt).toDateString();

                            return (
                                <React.Fragment key={msg.id || index}>
                                    {showDateSeparator && (
                                        <div className="date-separator">
                                            <span>{formatMessageDate(msg.timestamp || msg.sentAt)}</span>
                                        </div>
                                    )}
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`message-bubble-wrapper ${isMe ? 'sent' : 'received'} ${msg.status || ''} ${isFirstInGroup ? 'first' : ''} ${isLastInGroup ? 'last' : ''}`}
                                    >
                                        <div className="bubble-content">
                                            <p className="message-text">{msg.content}</p>
                                            <div className="message-meta-info">
                                                <span className="message-time">{formatChatTime(msg.timestamp || msg.sentAt)}</span>
                                                {isMe && (
                                                    <div className="message-status-indicator">
                                                        {msg.status === 'sending' && <Clock size={12} className="status-icon rotating" />}
                                                        {msg.status === 'error' && <AlertCircle size={12} className="status-icon error" />}
                                                        {!msg.status && <Check size={12} className="status-icon" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            )
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="chat-footer">
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div 
                            ref={emojiPickerRef}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="custom-emoji-picker"
                        >
                            <div className="emoji-grid">
                                {COMMON_EMOJIS.map((emoji, idx) => (
                                    <button 
                                        key={idx} 
                                        type="button" 
                                        className="emoji-item"
                                        onClick={() => {
                                            setNewMessage(prev => prev + emoji)
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="input-actions">
                    <button className="action-btn-circle"><Paperclip size={20} /></button>
                </div>
                <form className="chat-form" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onFocus={() => setShowEmojiPicker(false)}
                        className="chat-input"
                    />
                    <button 
                        type="button" 
                        className={`emoji-btn ${showEmojiPicker ? 'active' : ''}`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Smile size={20} />
                    </button>
                    <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    )
}
