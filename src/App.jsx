import React, { useState, useEffect } from 'react';
import { loadAppState, saveAppState } from './core/storage.js';
import { getStoredTheme, setAppTheme, THEME_CHANGE_EVENT } from './core/theme.js';
import HomeScreen from './features/home/HomeScreen.jsx';
import DiscoverScreen from './features/discover/DiscoverScreen.jsx';
import AskScreen from './features/ask/AskScreen.jsx';
import MessagesScreen from './features/messages/MessagesScreen.jsx';
import ProfileScreen from './features/profile/ProfileScreen.jsx';
import ConnectionModal from './components/ConnectionModal.jsx';
import OutcomeModal from './components/OutcomeModal.jsx';
import ReportBlockModal from './components/ReportBlockModal.jsx';
import AnalyticsModal from './components/AnalyticsModal.jsx';
import Toast from './components/Toast.jsx';
import { getVisibleUsers } from './core/state.js';

export default function App() {
  const [appState, setAppState] = useState(() => loadAppState());
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'discover', 'ask', 'messages', 'profile'
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const triggerToast = (message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modal states
  const [activeConnectionCandidate, setActiveConnectionCandidate] = useState(null);
  const [activeOutcomePartner, setActiveOutcomePartner] = useState(null);
  const [activeReportModal, setActiveReportModal] = useState(null); // { user, mode }
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [inspectedProfile, setInspectedProfile] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // Keyboard accessibility: Escape closes profile inspection
  useEffect(() => {
    if (!inspectedProfile) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setInspectedProfile(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedProfile]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Synchronize HTML theme attribute and local storage
  useEffect(() => {
    const cur = appState.theme || getStoredTheme();
    setAppTheme(cur);
  }, [appState.theme]);

  // Listen for theme changes from other components / Landing page
  useEffect(() => {
    const onThemeChange = (e) => {
      if (e.detail && e.detail !== appState.theme) {
        setAppState(prev => ({ ...prev, theme: e.detail }));
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, [appState.theme]);

  const currentUser = appState.users.find(u => u.id === appState.currentUserId) || appState.users[0];
  const visibleUsers = getVisibleUsers(appState.users, appState.blocks, currentUser.id);

  // Helper actions
  const toggleTheme = () => {
    const next = appState.theme === 'dark' ? 'light' : 'dark';
    setAppTheme(next);
    setAppState(prev => ({
      ...prev,
      theme: next
    }));
  };

  const handleSwitchUser = (userId) => {
    const targetUser = appState.users.find(u => u.id === userId);
    setAppState(prev => ({
      ...prev,
      currentUserId: userId
    }));
    if (targetUser) {
      triggerToast(`Switched active persona to ${targetUser.name} (${targetUser.role})`, 'info');
    }
  };

  const handleSendConnectionRequest = ({ receiverId, purpose, message }) => {
    const receiver = appState.users.find(u => u.id === receiverId);
    const newConn = {
      id: `conn_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      status: 'pending',
      purpose,
      message,
      createdAt: new Date().toISOString()
    };

    setAppState(prev => ({
      ...prev,
      connections: [...prev.connections, newConn]
    }));
    setActiveConnectionCandidate(null);
    triggerToast(`Connection request for "${purpose}" sent to ${receiver ? receiver.name : 'peer'}!`, 'success');
  };

  const handleAcceptConnection = (connectionId) => {
    const conn = appState.connections.find(c => c.id === connectionId);
    if (!conn) return;

    const newConvId = `conv_${Date.now()}`;
    const newConversation = {
      id: newConvId,
      connectionId,
      participants: [conn.senderId, conn.receiverId],
      outcomeLogged: null,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: conn.senderId,
          text: conn.message,
          createdAt: conn.createdAt,
          read: true
        },
        {
          id: `msg_${Date.now() + 1}`,
          senderId: currentUser.id,
          text: `Hi! Thanks for connecting. I'd be glad to discuss ${conn.purpose.toLowerCase()}.`,
          createdAt: new Date().toISOString(),
          read: true
        }
      ]
    };

    setAppState(prev => ({
      ...prev,
      connections: prev.connections.map(c => c.id === connectionId ? { ...c, status: 'accepted', conversationId: newConvId } : c),
      conversations: [...prev.conversations, newConversation]
    }));

    setSelectedConversationId(newConvId);
    setActiveTab('messages');
    triggerToast('Connection accepted! Direct chat unlocked.', 'success');
  };

  const handleDeclineConnection = (connectionId) => {
    setAppState(prev => ({
      ...prev,
      connections: prev.connections.map(c => c.id === connectionId ? { ...c, status: 'declined' } : c)
    }));
    triggerToast('Connection request declined.', 'info');
  };

  const handleSendMessage = (conversationId, text) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      text,
      createdAt: new Date().toISOString(),
      read: true
    };

    setAppState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg]
          };
        }
        return conv;
      })
    }));
  };

  const handleLogOutcome = (outcomeData) => {
    const newOutcome = {
      id: `out_${Date.now()}`,
      ...outcomeData
    };

    setAppState(prev => ({
      ...prev,
      outcomes: [newOutcome, ...prev.outcomes]
    }));

    setActiveOutcomePartner(null);
    setShowAnalyticsModal(true);
    triggerToast('Outcome logged! +points awarded to North Star score.', 'success');
  };

  const handleReportOrBlock = ({ userId, mode, reason, details }) => {
    if (mode === 'block') {
      setAppState(prev => ({
        ...prev,
        blocks: [
          ...(prev.blocks || []).filter(b => !(b.blockerId === currentUser.id && b.blockedId === userId)),
          { blockerId: currentUser.id, blockedId: userId }
        ],
        connections: prev.connections.filter(c => !(c.senderId === userId && c.receiverId === currentUser.id) && !(c.senderId === currentUser.id && c.receiverId === userId)),
        conversations: prev.conversations.filter(c => !c.participants.includes(userId) || !c.participants.includes(currentUser.id))
      }));
      triggerToast('User has been blocked and removed from all views.', 'warn');
    } else {
      setAppState(prev => ({
        ...prev,
        reports: [...prev.reports, { id: `rep_${Date.now()}`, reporterId: currentUser.id, targetUserId: userId, reason, details, status: 'Pending Review' }]
      }));
      triggerToast('Report submitted. Safety engine has logged the incident.', 'success');
    }
    setActiveReportModal(null);
  };

  const handleUpdateProfile = (updatedUser) => {
    setAppState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
    triggerToast('Profile information successfully saved!', 'success');
  };

  // Badge counts
  const pendingRequestsCount = appState.connections.filter(
    c => c.receiverId === currentUser.id && c.status === 'pending'
  ).length;

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="top-header">
        <div 
          className="logo-group" 
          onClick={() => setActiveTab('home')}
          role="button"
          tabIndex={0}
          aria-label="Return to Home Screen"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('home');
            }
          }}
        >
          <div className="logo-badge">
            <span className="logo-orb" />
            <span>P</span>
          </div>
          <div>
            <div className="logo-text">Proviqra</div>
            <div className="logo-sub">Intent Network</div>
          </div>
        </div>

        <div className="header-actions">
          {/* 3D Showcase Quick Link */}
          <a
            href="#/"
            className="btn btn-3d-link"
            title="View 3D Showcase Landing Page"
            id="nav-to-landing"
          >
            <span className="sparkle-glow">✦</span>
            <span>3D Experience</span>
          </a>

          {/* User Switcher Dropdown */}
          <div 
            className="user-switcher" 
            title="Switch Active Persona"
            onClick={() => setActiveTab('profile')}
            role="button"
            tabIndex={0}
            aria-label={`Active persona: ${currentUser.name}. Press to manage profile or switch accounts.`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('profile');
              }
            }}
            id="nav-user-switcher"
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-tiny" />
            <span style={{ color: 'var(--text-primary)' }}>{currentUser.name.split(' ')[0]}</span>
            <span className="badge badge-tag" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{currentUser.role}</span>
          </div>

          {/* North Star Analytics Button */}
          <button 
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            title="View North Star Funnel & Outcomes"
            onClick={() => setShowAnalyticsModal(true)}
            id="nav-north-star"
          >
            ★ North Star ({appState.outcomes.length})
          </button>

          {/* Minimalist Dark / Light Mode Toggle on Top Corner */}
          <button 
            type="button"
            className="theme-toggle-switch"
            onClick={toggleTheme}
            title={`Switch to ${appState.theme === 'dark' ? 'Light' : 'Dark'} mode`}
            id="nav-theme-toggle"
            aria-label="Toggle theme mode"
          >
            <span className={`theme-toggle-indicator ${appState.theme === 'dark' ? 'is-dark' : 'is-light'}`} />
            <span className={`theme-toggle-icon ${appState.theme !== 'dark' ? 'active' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </span>
            <span className={`theme-toggle-icon ${appState.theme === 'dark' ? 'active' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
          </button>
        </div>
      </header>

      {/* Main Tab Screen Display */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomeScreen 
            currentUser={currentUser}
            allUsers={visibleUsers}
            connections={appState.connections}
            opportunities={appState.opportunities}
            onNavigateTab={setActiveTab}
            onConnect={setActiveConnectionCandidate}
            onViewProfile={setInspectedProfile}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverScreen 
            currentUser={currentUser}
            allUsers={visibleUsers}
            opportunities={appState.opportunities}
            onConnect={setActiveConnectionCandidate}
            onViewProfile={setInspectedProfile}
          />
        )}

        {activeTab === 'ask' && (
          <AskScreen 
            currentUser={currentUser}
            allUsers={visibleUsers}
            onConnect={setActiveConnectionCandidate}
            onViewProfile={setInspectedProfile}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesScreen 
            currentUser={currentUser}
            allUsers={visibleUsers}
            connections={appState.connections}
            conversations={appState.conversations}
            onAcceptConnection={handleAcceptConnection}
            onDeclineConnection={handleDeclineConnection}
            onSendMessage={handleSendMessage}
            onOpenOutcomeModal={setActiveOutcomePartner}
            onOpenReportModal={(user, mode) => setActiveReportModal({ user, mode })}
            selectedConversationId={selectedConversationId}
            setSelectedConversationId={setSelectedConversationId}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileScreen 
            currentUser={currentUser}
            allUsers={appState.users}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUser={handleSwitchUser}
          />
        )}
      </main>

      {/* 5-Tab Floating Glass Navigation Dock */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button 
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
            id="dock-home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
            id="dock-discover"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
            <span>Discover</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'ask' ? 'active' : ''}`}
            onClick={() => setActiveTab('ask')}
            id="dock-ask"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9.5 9h.01M14.5 9h.01M12 13h.01"/>
            </svg>
            <span>Ask</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
            id="dock-messages"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
            </svg>
            <span>Messages</span>
            {pendingRequestsCount > 0 && (
              <span className="nav-badge-count">{pendingRequestsCount}</span>
            )}
          </button>

          <button 
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            id="dock-profile"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Connect Modal */}
      {activeConnectionCandidate && (
        <ConnectionModal 
          candidate={activeConnectionCandidate}
          onClose={() => setActiveConnectionCandidate(null)}
          onSend={handleSendConnectionRequest}
        />
      )}

      {/* Outcome Modal */}
      {activeOutcomePartner && (
        <OutcomeModal 
          partner={activeOutcomePartner}
          onClose={() => setActiveOutcomePartner(null)}
          onLogOutcome={handleLogOutcome}
        />
      )}

      {/* Report or Block Modal */}
      {activeReportModal && (
        <ReportBlockModal 
          user={activeReportModal.user}
          mode={activeReportModal.mode}
          onClose={() => setActiveReportModal(null)}
          onSubmit={handleReportOrBlock}
        />
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <AnalyticsModal 
          outcomes={appState.outcomes}
          connections={appState.connections}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* Inspect Profile Details Modal */}
      {inspectedProfile && (
        <div 
          className="modal-overlay" 
          onClick={() => setInspectedProfile(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-profile-title"
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" id="modal-profile-title">{inspectedProfile.name}</h3>
              <button className="btn-icon" onClick={() => setInspectedProfile(null)} aria-label="Close profile details">✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img 
                  src={inspectedProfile.avatar} 
                  alt={inspectedProfile.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{inspectedProfile.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {inspectedProfile.role} • {inspectedProfile.location} ({inspectedProfile.remotePreference})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    {inspectedProfile.collegeCompany}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>HEADLINE</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>{inspectedProfile.headline}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>BIO & BACKGROUND</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{inspectedProfile.bio}</p>
              </div>

              {inspectedProfile.intent && (
                <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-primary)' }}>CURRENT INTENT</h4>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginTop: '2px' }}>
                    {inspectedProfile.intent.type} • Seeking: {inspectedProfile.intent.roleNeeded}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    "{inspectedProfile.intent.description}"
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>VERIFIED SKILLS</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(inspectedProfile.skills || []).map((s, idx) => (
                    <span key={idx} className="badge badge-tag">
                      {s.name} ({s.level})
                    </span>
                  ))}
                </div>
              </div>

              {inspectedProfile.proofOfWork && inspectedProfile.proofOfWork.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>PROOF OF WORK</h4>
                  {inspectedProfile.proofOfWork.map((pw, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'center', margin: '4px 0' }}>
                      <span className="badge badge-match">{pw.type}</span>
                      <a href={pw.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                        {pw.title}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setInspectedProfile(null)}>
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const p = inspectedProfile;
                  setInspectedProfile(null);
                  setActiveConnectionCandidate(p);
                }}
              >
                Connect with {inspectedProfile.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
