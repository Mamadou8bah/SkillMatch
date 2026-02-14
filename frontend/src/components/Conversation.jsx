import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MoreVertical } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import '../styles/conversation.css'
import { apiFetch, BASE_URL } from '../utils/api'

export const Conversation = () => {
    const { id } = useParams() // This is the recipientId
    const navigate = useNavigate()
    const [recipient, setRecipient] = useState(null)
    const [chatMessages, setChatMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [connected, setConnected] = useState(false)
    const messagesEndRef = useRef(null)
    const stompClient = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    // Load conversation history and recipient details
    useEffect(() => {
        const fetchRecipient = async () => {
            try {
                const data = await apiFetch(`/api/users/${id}`)
                if (data.success) {
                    setRecipient(data.data)
                }
            } catch (err) {
                console.error("Failed to fetch recipient", err)
            }
        }

        const fetchHistory = async () => {
            try {
                const data = await apiFetch(`/api/messages/conversation/${id}`)
                if (data.success) {
                    setChatMessages(data.data)
                }
            } catch (err) {
                console.error("Failed to fetch history", err)
            }
        }

        fetchRecipient()
        fetchHistory()
    }, [id])

    // Setup WebSocket
    useEffect(() => {
        const socket = new SockJS(`${BASE_URL}/ws`)
        const client = new Client({
            webSocketFactory: () => socket,
            // debug: (str) => console.log(str),
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true)
                client.subscribe('/user/queue/messages', (message) => {
                    const receivedMessage = JSON.parse(message.body)
                    // If the message is part of this conversation, add it to the list
                    const otherUserId = id;
                    const isFromOther = receivedMessage.sender.id.toString() === otherUserId;
                    const isFromMe = receivedMessage.recipient.id.toString() === otherUserId;

                    if (isFromOther || isFromMe) {
                        setChatMessages(prev => {
                            // Avoid duplicates (especially for messages sent by us)
                            if (prev.find(m => m.id === receivedMessage.id)) return prev;
                            return [...prev, receivedMessage];
                        })
                    }
                })
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
        const tempId = Date.now();
        const content = newMessage;

        // Optimistically add message to UI
        const tempMessage = {
            id: tempId,
            content: content,
            sender: { id: currentUserId },
            recipient: { id: id },
            sentAt: new Date().toISOString(),
            isTemp: true
        };

        setChatMessages(prev => [...prev, tempMessage]);
        setNewMessage("");

        try {
            const data = await apiFetch('/api/messages/send', {
                method: 'POST',
                body: JSON.stringify({
                    recipientId: id,
                    content: content
                })
            })
            if (data.success) {
                // Replace temp message with actual message from server
                setChatMessages(prev => prev.map(msg => 
                    msg.id === tempId ? data.data : msg
                ));
            } else {
                // Mark as failed or remove? Let's mark as failed
                setChatMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { ...msg, error: true } : msg
                ));
            }
        } catch (err) {
            console.error("Failed to send message", err);
            setChatMessages(prev => prev.map(msg => 
                msg.id === tempId ? { ...msg, error: true } : msg
            ));
        }
    }

    return (
        <div className='conversation-page'>
            <div className="conversation-header">
                <div className="header-left">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="recipient-info">
                        <img 
                            src={recipient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.fullName || 'User')}&background=random`} 
                            alt={recipient?.fullName}
                            className="recipient-avatar"
                        />
                        <div className="recipient-details">
                            <h3>{recipient?.fullName || 'Loading...'}</h3>
                            <span className={`status ${connected ? 'online' : 'offline'}`}>
                                {connected ? 'Active now' : 'Connecting...'}
                            </span>
                        </div>
                    </div>
                </div>
                <button className="more-button">
                    <MoreVertical size={20} />
                </button>
            </div>
            
            <div className="conversation-body">
                {chatMessages.length === 0 ? (
                    <div className="no-messages">
                        <p>Start the conversation</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        const isMe = msg.sender.id.toString() !== id
                        return (
                            <div key={msg.id} className={`message-row ${isMe ? 'sent' : 'received'}`}>
                                {!isMe && (
                                    <img 
                                        src={recipient?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.fullName || 'User')}&background=random&size=32`}
                                        alt=""
                                        className="message-avatar"
                                    />
                                )}
                                <div className="message-content-wrapper">
                                    <div className={`message-bubble ${msg.error ? 'error' : ''} ${msg.isTemp ? 'pending' : ''}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                    <span className="message-time">
                                        {msg.error ? 'Failed' : msg.isTemp ? 'Sending...' : msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="conversation-footer">
                <form onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={!connected}
                    />
                    <button type="submit" disabled={!connected || !newMessage.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    )
}
