import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
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
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch(`/api/messages/conversation/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await response.json()
                if (data.success) {
                    setChatMessages(data.data)
                    // Assuming the first message or another endpoint gives us recipient info
                    // For now, let's just set a placeholder if we don't have a specific user fetch
                    if (data.data.length > 0) {
                        const firstMsg = data.data[0]
                        const isMe = firstMsg.sender.id === parseInt(localStorage.getItem('userId'))
                        setRecipient(isMe ? firstMsg.recipient : firstMsg.sender)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch history", err)
            }
        }
        fetchHistory()
    }, [id])

    // Setup WebSocket
    useEffect(() => {
        const socket = new SockJS('/ws')
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
            const response = await fetch('/api/messages/send', {
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
                <div className="first-part">
                    <div className="back-button" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="profile">
                        <div className="profile-img">
                            <img src={recipient?.avatar || 'https://via.placeholder.com/40'} alt="" />
                        </div>
                        <div className="profile-name">
                            <p className='contact-name'>{recipient?.fullName || 'Loading...'}</p>
                            <p className="online-status">{connected ? 'Connected' : 'Connecting...'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="conversation-body">
                {chatMessages.map((msg) => {
                    const isMe = msg.sender.id.toString() !== id
                    return (
                        <div key={msg.id} className={`message-row ${isMe ? 'sent' : 'received'}`}>
                            <div className="message-bubble">
                                {msg.content}
                            </div>
                            <div className="message-time">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="conversation-footer">
                <form onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" disabled={!connected}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 12L4 4L6 12M20 12L4 20L6 12M20 12H6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}
