import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MoreVertical } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import '../styles/conversation.css'

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
                const token = localStorage.getItem('token')
                const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await response.json()
                if (data.success) {
                    setRecipient(data.data)
                }
            } catch (err) {
                console.error("Failed to fetch recipient", err)
            }
        }

        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`http://localhost:8080/api/messages/conversation/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await response.json()
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
        const socket = new SockJS('http://localhost:8080/ws')
        const client = new Client({
            webSocketFactory: () => socket,
            // debug: (str) => console.log(str),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true)
                client.subscribe('/user/queue/messages', (message) => {
                    const receivedMessage = JSON.parse(message.body)
                    // If the message is from the current recipient, add it to the list
                    if (receivedMessage.sender.id.toString() === id || receivedMessage.recipient.id.toString() === id) {
                        setChatMessages(prev => [...prev, receivedMessage])
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

        try {
            const token = localStorage.getItem('token')
            const response = await fetch('http://localhost:8080/api/messages/send', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipientId: id,
                    content: newMessage
                })
            })
            const data = await response.json()
            if (data.success) {
                // The message will also be received via WebSocket, but we can add it here too if we want immediate feedback
                // or just rely on the WebSocket if the server broadcasts to sender too (common in STOMP user queues)
                setNewMessage("")
            }
        } catch (err) {
            console.error("Failed to send message", err)
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
                                    <div className="message-bubble">
                                        <p>{msg.content}</p>
                                    </div>
                                    <span className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
