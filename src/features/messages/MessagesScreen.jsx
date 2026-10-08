import React, { useState } from 'react';
import { cleanText } from '../../core/state.js';

export default function MessagesScreen({
  currentUser,
  allUsers,
  connections = [],
  conversations = [],
  onAcceptConnection,
  onDeclineConnection,
  onSendMessage,
  onOpenOutcomeModal,
  onOpenReportModal,
  selectedConversationId,
  setSelectedConversationId
}) {
  const [activeSubTab, setActiveSubTab] = useState('chats'); // 'chats' or 'requests'
  const [newMessageText, setNewMessageText] = useState('');
  const [showMobileChatPane, setShowMobileChatPane] = useState(false);

  // Connections where current user is receiver and status is pending
  const incomingRequests = connections.filter(
    c => c.receiverId === currentUser.id && c.status === 'pending'
  );

  // Connections where current user is sender and status is pending
  const outgoingRequests = connections.filter(
    c => c.senderId === currentUser.id && c.status === 'pending'
  );

  // Active accepted conversations for current user
  const userConversations = conversations.filter(conv => 
    conv.participants.includes(currentUser.id)
  );

  const activeConv = userConversations.find(c => c.id === selectedConversationId) || userConversations[0];

  const activePartnerId = activeConv?.participants.find(id => id !== currentUser.id);
  const activePartner = allUsers.find(u => u.id === activePartnerId);

  const handleSend = (e) => {
    e.preventDefault();
    const cleaned = cleanText(newMessageText, 1000);
    if (!cleaned || !activeConv) return;
    onSendMessage(activeConv.id, cleaned);
    setNewMessageText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 180px)', minHeight: '520px' }}>
      {/* Subtab Toggle Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeSubTab === 'chats' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
            onClick={() => setActiveSubTab('chats')}
          >
            Active Conversations ({userConversations.length})
          </button>
          <button
            className={`btn ${activeSubTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', position: 'relative' }}
            onClick={() => setActiveSubTab('requests')}
          >
            Connection Requests ({incomingRequests.length})
            {incomingRequests.length > 0 && (
              <span className="nav-badge-count" style={{ position: 'static', marginLeft: '6px' }}>
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          🔒 Privacy: Chat is unlocked exclusively for mutually accepted connections.
        </div>
      </div>

      {activeSubTab === 'requests' ? (
        /* Requests View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          {/* Incoming */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Incoming Requests ({incomingRequests.length})
            </h3>
            {incomingRequests.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No pending incoming connection requests right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incomingRequests.map(req => {
                  const sender = allUsers.find(u => u.id === req.senderId);
                  if (!sender) return null;
                  return (
                    <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img 
                            src={sender.avatar} 
                            alt={sender.name}
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
                              {sender.name} {sender.verified && <span style={{ color: 'var(--accent-primary)' }}>✓</span>}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {sender.role} • {sender.location}
                            </div>
                          </div>
                        </div>

                        <span className="badge badge-tag" style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
                          Purpose: {req.purpose}
                        </span>
                      </div>

                      <div style={{
                        padding: '12px',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        color: 'var(--text-primary)',
                        lineHeight: '1.4'
                      }}>
                        "{req.message}"
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <button 
                          className="btn btn-outline"
                          style={{ fontSize: '0.78rem', color: 'var(--badge-danger-text)' }}
                          onClick={() => onOpenReportModal(sender, 'block')}
                        >
                          Block / Report
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => onDeclineConnection(req.id)}
                          >
                            Decline
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={() => onAcceptConnection(req.id)}
                          >
                            Accept & Unlock Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outgoing */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
              Sent Requests Pending Approval ({outgoingRequests.length})
            </h3>
            {outgoingRequests.length === 0 ? (
              <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                You have no pending outgoing requests. Browse Discover or Ask to connect!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {outgoingRequests.map(req => {
                  const receiver = allUsers.find(u => u.id === req.receiverId);
                  if (!receiver) return null;
                  return (
                    <div key={req.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img 
                          src={receiver.avatar} 
                          alt={receiver.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{receiver.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Purpose: {req.purpose} • Sent {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-warn">Pending Receiver Approval</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Conversations Chat View */
        <div className="chat-container-split">
          {/* Conversation Sidebar */}
          <div className={`chat-sidebar-pane ${showMobileChatPane ? 'mobile-hidden' : ''}`}>
            {userConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active conversations yet. Connect with someone or accept an incoming request.
              </div>
            ) : (
              userConversations.map(conv => {
                const partnerId = conv.participants.find(id => id !== currentUser.id);
                const partner = allUsers.find(u => u.id === partnerId);
                const lastMsg = conv.messages[conv.messages.length - 1];
                const isSelected = conv.id === activeConv?.id;

                if (!partner) return null;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      setShowMobileChatPane(true);
                    }}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border)'}`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img 
                      src={partner.avatar} 
                      alt={partner.name}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {partner.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastMsg ? lastMsg.text : 'Conversation unlocked'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Chat Window */}
          {activeConv && activePartner ? (
            <div className={`chat-main-pane ${!showMobileChatPane ? 'mobile-hidden' : ''}`}>
              {/* Chat Header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-elevated)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="chat-mobile-back-btn"
                    onClick={() => setShowMobileChatPane(false)}
                    aria-label="Back to conversations list"
                  >
                    ← Chats
                  </button>
                  <img 
                    src={activePartner.avatar} 
                    alt={activePartner.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {activePartner.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {activePartner.role} • {activePartner.location}
                    </div>
                  </div>
                </div>

                {/* Outcome Button */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                    onClick={() => onOpenOutcomeModal(activePartner)}
                  >
                    ★ Log Professional Outcome
                  </button>
                  <button 
                    className="btn btn-icon"
                    title="Block or Report"
                    onClick={() => onOpenReportModal(activePartner, 'report')}
                  >
                    ⚠️
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Mutual connection confirmed • Private direct chat
                </div>

                {activeConv.messages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.88rem',
                        lineHeight: '1.4',
                        backgroundColor: isMe ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                        color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                        border: isMe ? 'none' : '1px solid var(--border)'
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {isMe ? '✓' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', background: 'var(--bg-surface-elevated)' }}>
                <input 
                  type="text"
                  className="form-input"
                  placeholder={`Message ${activePartner.name}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation from the left to start messaging.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
