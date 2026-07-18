'use strict';
'use client';

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5001/api';

const PLATFORM_DETAILS = {
  facebook: { color: '#1877f2', label: 'FB', placeholder: 'Page Access Token' },
  instagram: { color: '#e1306c', label: 'IG', placeholder: 'Instagram Graph Token' },
  whatsapp: { color: '#25d366', label: 'WA', placeholder: 'WhatsApp Token', hasExtra: true },
  linkedin: { color: '#0077b5', label: 'IN', placeholder: 'LinkedIn UGC Access Token' },
  googlephotos: { color: '#4285f4', label: 'GP', placeholder: 'Google API Key (AIzaSy...)' },
  openai: { color: '#10a37f', label: 'AI', placeholder: 'OpenAI API Key (sk-...)' }
};

export default function Home() {
  const [connections, setConnections] = useState([]);
  const [logs, setLogs] = useState([
    'System ready. Toggle a service connection to get started.'
  ]);
  const [credentials, setCredentials] = useState({});
  const [isSyncing, setIsSyncing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncProfile, setSyncProfile] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(null);
  const [syncUserId, setSyncUserId] = useState('');
  const [syncIgUserId, setSyncIgUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('default_user');
  const [viewerPlatform, setViewerPlatform] = useState('facebook');
  const [viewerData, setViewerData] = useState(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  // Chat Simulator states
  const [simPlatform, setSimPlatform] = useState('whatsapp');
  const [simSender, setSimSender] = useState('Jane Doe');
  const [simMessage, setSimMessage] = useState('Hello! Can you help me order a custom print of this photo?');
  const [simPhone, setSimPhone] = useState('+15550199');

  useEffect(() => {
    fetchConnections();

    // Fetch config keys and load Meta Javascript SDK
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(config => {
        window.fbAsyncInit = function() {
          window.FB.init({
            appId      : config.facebookClientId || '2244105523091641',
            cookie     : true,
            xfbml      : true,
            version    : 'v25.0'
          });
          console.log('[Meta SDK] Facebook JS SDK initialized.');
        };

        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "https://connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      })
      .catch(err => console.error('Failed to load SDK config:', err));

    // Check for OAuth callback parameters
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    if (authStatus === 'linkedin_success') {
      addLog('LinkedIn OAuth Authorization Successful! Connected successfully.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'linkedin_failed') {
      const errorMsg = params.get('error') || 'Unknown OAuth error';
      addLog(`LinkedIn OAuth Failed: ${decodeURIComponent(errorMsg)}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'google_success') {
      addLog('Google Photos OAuth Authorization Successful! Connected successfully.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'google_failed') {
      const errorMsg = params.get('error') || 'Unknown OAuth error';
      addLog(`Google Photos OAuth Failed: ${decodeURIComponent(errorMsg)}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'facebook_success') {
      addLog('Meta (Facebook & Instagram) OAuth Authorization Successful! Connected successfully.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'facebook_failed') {
      const errorMsg = params.get('error') || 'Unknown OAuth error';
      addLog(`Meta OAuth Failed: ${decodeURIComponent(errorMsg)}`, 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchViewerData = async (platform = viewerPlatform, userId = activeUserId) => {
    setIsViewerLoading(true);
    try {
      const res = await fetch(`${API_BASE}/data/${platform}?userId=${userId}`);
      const data = await res.json();
      setViewerData(data);
    } catch (err) {
      addLog(`Failed to fetch tabular database data for ${platform}: ${err.message}`, 'error');
    } finally {
      setIsViewerLoading(false);
    }
  };

  useEffect(() => {
    fetchViewerData(viewerPlatform, activeUserId);
  }, [viewerPlatform, activeUserId]);

  const addLog = (message, type = 'system') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${message}`, ...prev]);
  };

  const fetchConnections = async (userId = activeUserId) => {
    try {
      const res = await fetch(`${API_BASE}/connections?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConnections(data);
        
        // Initialize credential states
        const creds = {};
        data.forEach(c => {
          creds[c.platform] = {
            accessToken: c.credentials?.accessToken || '',
            apiKey: c.credentials?.apiKey || '',
            phoneNumberId: c.credentials?.phoneNumberId || '',
          };
        });
        setCredentials(creds);
      } else {
        addLog(`Failed to load connections: ${data.error || 'Invalid backend format'}`, 'error');
      }
      setIsLoading(false);
    } catch (err) {
      addLog(`Failed to load connections from backend: ${err.message}`, 'error');
      setIsLoading(false);
    }
  };

  const handleToggle = async (platform) => {
    const isConnecting = !connections.find(c => c.platform === platform)?.connected;

    if (isConnecting) {
      if (platform === 'linkedin') {
        addLog('Redirecting to LinkedIn OAuth login...');
        window.location.href = `http://localhost:5001/api/auth/linkedin?userId=${activeUserId}`;
        return;
      }
      if (platform === 'googlephotos') {
        addLog('Redirecting to Google Photos OAuth login...');
        window.location.href = `http://localhost:5001/api/auth/google?userId=${activeUserId}`;
        return;
      }
      if (platform === 'facebook' || platform === 'instagram') {
        const platformCreds = credentials[platform] || {};
        let token = platformCreds.accessToken;

        if (!token) {
          token = prompt(`Please enter your Facebook Access Token for ${platform.toUpperCase()}:`);
          if (!token) {
            addLog(`Cancelled ${platform.toUpperCase()} connection activation.`, 'system');
            return;
          }
        }

        addLog(`Activating Meta session for ${platform.toUpperCase()}...`);
        try {
          const res = await fetch(`${API_BASE}/connections/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform,
              credentials: { accessToken: token },
              forceConnect: true,
              userId: activeUserId
            })
          });
          const data = await res.json();
          if (data.success) {
            setConnections(prev =>
              prev.map(c => c.platform === platform ? { ...c, connected: true } : c)
            );
            setCredentials(prev => ({
              ...prev,
              [platform]: { ...prev[platform], accessToken: token }
            }));
            addLog(`${platform.toUpperCase()} connection active!`, 'success');
          } else {
            addLog(`Failed to activate: ${data.error}`, 'error');
          }
        } catch (err) {
          addLog(`Failed to toggle Meta session: ${err.message}`, 'error');
        }
        return;
      }

      // Check credentials for other platforms before connecting
      const platformCreds = credentials[platform] || {};
      const requiredKey = platform === 'openai' ? platformCreds.apiKey : platformCreds.accessToken;
      if (!requiredKey) {
        addLog(`Cannot connect ${platform.toUpperCase()}: Please input your API key/token credentials first.`, 'error');
        alert(`Please input your credentials in the configuration box before toggling ${platform.toUpperCase()} ON.`);
        return;
      }
    }

    addLog(`${isConnecting ? 'Connecting' : 'Disconnecting'} ${platform.toUpperCase()}...`);
    const platformCreds = credentials[platform] || {};
    
    try {
      const res = await fetch(`${API_BASE}/connections/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          credentials: {
            accessToken: platformCreds.accessToken || platformCreds.apiKey || '',
            apiKey: platformCreds.apiKey || '',
            phoneNumberId: platformCreds.phoneNumberId || ''
          },
          userId: activeUserId
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setConnections(prev =>
          prev.map(c => c.platform === platform ? { ...c, connected: data.connection.connected } : c)
        );
        addLog(
          `${platform.toUpperCase()} is now ${data.connection.connected ? 'CONNECTED (Toggled ON)' : 'DISCONNECTED (Toggled OFF)'}`,
          data.connection.connected ? 'success' : 'system'
        );
      } else {
        addLog(`Toggle failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Toggle request failed: ${err.message}`, 'error');
    }
  };

  const handleCredChange = (platform, field, value) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const triggerSync = async (platform) => {
    setIsSyncing(platform);
    setSyncProfile(null);
    addLog(`Starting 1-Click Photos Sync Pipeline for ${platform.toUpperCase()}...`, 'system');
    
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetPlatform: platform,
          userId: activeUserId
        })
      });
      const data = await res.json();
      
      if (data.logs) {
        data.logs.forEach(logLine => {
          if (logLine.includes('Successfully')) {
            addLog(logLine, 'success');
          } else if (logLine.includes('Failed')) {
            addLog(logLine, 'error');
          } else {
            addLog(logLine, 'system');
          }
        });
      }
      
      if (res.ok && data.success) {
        addLog(`${platform.toUpperCase()} Sync Process Finished Successfully!`, 'success');
        addLog(`API Response: ${JSON.stringify(data, null, 2)}`, 'success');
        if (data.profile) {
          setSyncProfile({ ...data.profile, platform });
        }
      } else {
        addLog(`Sync error: ${data.error}`, 'error');
        addLog(`API Response Payload: ${JSON.stringify(data, null, 2)}`, 'error');
      }
    } catch (err) {
      addLog(`Sync pipeline request failed: ${err.message}`, 'error');
    } finally {
      setIsSyncing(null);
    }
  };
  const runAiAnalysis = async (platform) => {
    setIsAnalyzing(platform);
    setAiAnalysis('');
    addLog(`Running AI brand footprint analysis on ${platform.toUpperCase()} synced data...`, 'system');
    try {
      const res = await fetch(`${API_BASE}/analyze/${platform}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis);
        addLog(`AI Footprint Analysis for ${platform.toUpperCase()} ready!`, 'success');
      } else {
        alert(data.error || 'Failed to analyze platform data. Ensure you have synced the platform first!');
      }
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(null);
    }
  };
  const simulateIncomingChat = async () => {
    addLog(`[Simulator] Simulating incoming message on ${simPlatform.toUpperCase()} from ${simSender}...`);
    try {
      const res = await fetch(`${API_BASE}/webhook/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: simPlatform,
          senderName: simSender,
          messageContent: simMessage,
          recipientPhone: simPhone
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`[Incoming Message] ${simSender}: "${simMessage}"`, 'system');
        addLog(`[Auto AI Response] Sent reply: "${data.reply}"`, 'success');
      } else {
        addLog(`Chat automation simulation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Chat simulator query failed: ${err.message}`, 'error');
    }
  };

  const copyLogsToClipboard = () => {
    // Reverse the logs array because in state we prepend newest logs to the top
    const textToCopy = [...logs].reverse().join('\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        addLog('Logs successfully copied to clipboard!', 'success');
      })
      .catch((err) => {
        addLog(`Failed to copy logs: ${err.message}`, 'error');
      });
  };


  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>OmniSync & Social AI Automation</h1>
        <p>Integrate Google Photos, generate descriptions via OpenAI, and automatically publish across social channels.</p>
      </header>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h2>Connecting to backend service...</h2>
        </div>
      ) : (
        <>
          <div className="platforms-grid">
            {connections.map((c) => {
              const details = PLATFORM_DETAILS[c.platform] || {};
              return (
                <div
                  key={c.platform}
                  className="glass-panel platform-card"
                  style={{ '--platform-color': details.color }}
                >
                  <div>
                    <div className="platform-header">
                      <div className="platform-name">
                        <span className="platform-icon">{details.label}</span>
                        {c.platform}
                      </div>
                      <span className={`status-badge ${c.connected ? 'connected' : 'disconnected'}`}>
                        {c.connected ? 'Active' : 'Offline'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                      {c.platform === 'openai' ? 'Processes chat replies & auto-generates tags/captions.' : `Publish posts & handle direct-chat updates on ${c.platform}.`}
                    </p>

                    {c.platform === 'openai' && (
                      <div className="credentials-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                          <input
                            type="password"
                            placeholder="OpenAI API Key (sk-...)"
                            value={credentials[c.platform]?.apiKey || ''}
                            onChange={(e) =>
                              handleCredChange(c.platform, 'apiKey', e.target.value)
                            }
                            style={{ flexGrow: 1 }}
                          />
                          <button
                            onClick={async () => {
                              try {
                                const platformCreds = credentials[c.platform] || {};
                                const res = await fetch(`${API_BASE}/connections/toggle`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    platform: c.platform,
                                    credentials: {
                                      apiKey: platformCreds.apiKey || ''
                                    },
                                    forceConnect: true,
                                    userId: activeUserId
                                  })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setConnections(prev =>
                                    prev.map(item => item.platform === c.platform ? { ...item, connected: true } : item)
                                  );
                                  addLog('Saved OpenAI API Key successfully!', 'success');
                                  alert('OpenAI API Key updated successfully!');
                                } else {
                                  alert(`Failed to save: ${data.error}`);
                                }
                              } catch (err) {
                                alert(`Error saving credentials: ${err.message}`);
                              }
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {c.connected && ['googlephotos', 'linkedin', 'facebook', 'instagram'].includes(c.platform) && (
                    <div style={{ marginTop: '15px' }}>
                      <button
                        onClick={() => triggerSync(c.platform)}
                        disabled={isSyncing !== null}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, var(--platform-color) 0%, rgba(0,0,0,0.4) 100%)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                          transition: 'opacity 0.2s'
                        }}
                      >
                        {isSyncing === c.platform 
                          ? 'Syncing...' 
                          : `🔄 1-Click Sync ${c.platform === 'googlephotos' ? 'Photos' : c.platform.toUpperCase()}`}
                      </button>

                      {['facebook', 'instagram', 'linkedin'].includes(c.platform) && (
                        <button
                          onClick={() => runAiAnalysis(c.platform)}
                          disabled={isAnalyzing !== null}
                          style={{
                            width: '100%',
                            marginTop: '8px',
                            background: 'linear-gradient(135deg, #a855f7 0%, rgba(0,0,0,0.4) 100%)',
                            color: 'white',
                            border: '1px solid rgba(168,85,247,0.3)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 10px rgba(168,85,247,0.2)',
                            transition: 'opacity 0.2s'
                          }}
                        >
                          {isAnalyzing === c.platform ? 'Analyzing...' : `🤖 AI Brand Analytics`}
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={c.connected}
                        onChange={() => handleToggle(c.platform)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabular Data Viewer Section */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🗂️</span>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Operator Database Tabular Viewer</h3>
                </div>
                {viewerData && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to permanently delete all local database records for ${viewerPlatform.toUpperCase()}?`)) {
                        return;
                      }
                      try {
                        setIsViewerLoading(true);
                        const res = await fetch(`${API_BASE}/data/clear`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            platform: viewerPlatform,
                            userId: activeUserId
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          addLog(`Successfully cleared all ${viewerPlatform.toUpperCase()} database records.`, 'system');
                          setViewerData(null);
                        } else {
                          alert(data.error || 'Failed to clear data.');
                        }
                      } catch (err) {
                        alert(`Request failed: ${err.message}`);
                      } finally {
                        setIsViewerLoading(false);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                  >
                    🗑️ Clear Platform Data
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['facebook', 'instagram', 'linkedin', 'whatsapp', 'agent'].map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setViewerPlatform(plat)}
                    style={{
                      background: viewerPlatform === plat ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'rgba(255,255,255,0.05)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}
                  >
                    {plat === 'googlephotos' ? 'Photos' : plat}
                  </button>
                ))}
              </div>
            </div>

            {isViewerLoading ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                <span>Loading operator database records...</span>
              </div>
            ) : !viewerData ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                <span>No synced records fetched yet. Click "1-Click Sync" on any platform to import data.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                {/* Facebook Table */}
                {viewerPlatform === 'facebook' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '10px' }}>ID / Type</th>
                        <th style={{ padding: '10px' }}>Post Title / Message</th>
                        <th style={{ padding: '10px' }}>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Render Pages */}
                      {viewerData.pages && viewerData.pages.length > 0 ? (
                        viewerData.pages.map((pg, idx) => (
                          <tr key={`page-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', color: '#a855f7', fontWeight: '600' }}>Page Profile</td>
                            <td style={{ padding: '10px' }}>
                              <strong>{pg.name}</strong> ({pg.category})
                            </td>
                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>-</td>
                          </tr>
                        ))
                      ) : null}

                      {/* Render Posts */}
                      {viewerData.personalFeed && viewerData.personalFeed.length > 0 ? (
                        viewerData.personalFeed.map((post, idx) => (
                          <tr key={`post-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', color: '#c084fc' }}>Feed Post</td>
                            <td style={{ padding: '10px' }}>{post.message || post.story || '(No message)'}</td>
                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{new Date(post.created_time).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : null}

                      {(!viewerData.pages || viewerData.pages.length === 0) && (!viewerData.personalFeed || viewerData.personalFeed.length === 0) && (
                        <tr>
                          <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No Facebook Feed or Page records found in DB.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* Instagram Table */}
                {viewerPlatform === 'instagram' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '10px' }}>Property</th>
                        <th style={{ padding: '10px' }}>Logged Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewerData.profile && Object.keys(viewerData.profile).length > 0 ? (
                        Object.entries(viewerData.profile).map(([key, val]) => (
                          <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', textTransform: 'capitalize', color: '#f43f5e', fontWeight: '600' }}>{key.replace('_', ' ')}</td>
                            <td style={{ padding: '10px' }}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No Instagram profile data found in DB.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* LinkedIn Table */}
                {viewerPlatform === 'linkedin' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '10px' }}>Post ID</th>
                        <th style={{ padding: '10px' }}>Content / Text</th>
                        <th style={{ padding: '10px' }}>Likes</th>
                        <th style={{ padding: '10px' }}>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewerData.feeds && viewerData.feeds.length > 0 ? (
                        viewerData.feeds.map((feed, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', color: '#0ea5e9' }}>{feed.id || `feed_idx_${idx}`}</td>
                            <td style={{ padding: '10px' }}>{feed.text || '(Image / External Share)'}</td>
                            <td style={{ padding: '10px' }}>{feed.likesCount || 0}</td>
                            <td style={{ padding: '10px' }}>{feed.commentsCount || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No LinkedIn feed items found in DB.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* WhatsApp Table */}
                {viewerPlatform === 'whatsapp' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '10px' }}>Timestamp</th>
                        <th style={{ padding: '10px' }}>Direction</th>
                        <th style={{ padding: '10px' }}>Sender/Recipient</th>
                        <th style={{ padding: '10px' }}>Message Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewerData.messageHistory && viewerData.messageHistory.length > 0 ? (
                        viewerData.messageHistory.map((msg, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{new Date(msg.timestamp).toLocaleString()}</td>
                            <td style={{ padding: '10px', color: msg.direction === 'inbound' ? '#10b981' : '#a855f7', fontWeight: 'bold' }}>
                              {msg.direction || 'Inbound'}
                            </td>
                            <td style={{ padding: '10px' }}>{msg.sender || msg.recipient}</td>
                            <td style={{ padding: '10px' }}>{msg.messageText}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No WhatsApp messages logged in DB.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {/* Agent Activity Log Table */}
                {viewerPlatform === 'agent' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '10px' }}>Logged Time</th>
                        <th style={{ padding: '10px' }}>Platform</th>
                        <th style={{ padding: '10px' }}>Event Action</th>
                        <th style={{ padding: '10px' }}>Log Detail Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewerData.activityLogs && viewerData.activityLogs.length > 0 ? (
                        viewerData.activityLogs.map((log, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                            <td style={{ padding: '10px', textTransform: 'uppercase', fontWeight: '600' }}>{log.platform}</td>
                            <td style={{ padding: '10px', color: '#f43f5e' }}>{log.event}</td>
                            <td style={{ padding: '10px' }}>{log.details}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No activity logs recorded in DB.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          <div className="control-hub">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel">
                <h3 style={{ marginBottom: '15px' }}>Chat Automation Simulator</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Platform</label>
                    <select
                      value={simPlatform}
                      onChange={(e) => {
                        const platform = e.target.value;
                        setSimPlatform(platform);
                        if (platform === 'linkedin') {
                          setSimSender('Sarah Jenkins');
                          setSimPhone('urn:li:person:sarah_jenkins_recruiter');
                        } else {
                          setSimSender('Jane Doe');
                          setSimPhone('+15550199');
                        }
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '6px'
                      }}
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook Messenger</option>
                      <option value="instagram">Instagram Direct</option>
                      <option value="linkedin">LinkedIn Messages</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Sender Name</label>
                    {simPlatform === 'linkedin' ? (
                      <select
                        value={simSender}
                        onChange={(e) => {
                          const name = e.target.value;
                          setSimSender(name);
                          const urnMap = {
                            'Sarah Jenkins': 'urn:li:person:sarah_jenkins_recruiter',
                            'David Miller': 'urn:li:person:david_miller_director',
                            'Emily Chen': 'urn:li:person:emily_chen_stripe',
                            'Marcus Vance': 'urn:li:person:marcus_vance_openai',
                            'Jessica Taylor': 'urn:li:person:jessica_taylor_meta'
                          };
                          setSimPhone(urnMap[name] || 'urn:li:person:unknown');
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      >
                        <option value="Sarah Jenkins">Sarah Jenkins (HR Recruiter @ Google)</option>
                        <option value="David Miller">David Miller (Director @ Microsoft)</option>
                        <option value="Emily Chen">Emily Chen (Product Lead @ Stripe)</option>
                        <option value="Marcus Vance">Marcus Vance (Talent Acquisition @ OpenAI)</option>
                        <option value="Jessica Taylor">Jessica Taylor (Tech Recruiter @ Meta)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={simSender}
                        onChange={(e) => setSimSender(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Message</label>
                    <input
                      type="text"
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                  <button
                    onClick={simulateIncomingChat}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Simulate Message Inflow
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-panel console-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="console-header">
                <span>Activity & Synchronization Feed</span>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {syncProfile && (
                    <button
                      onClick={() => setSyncProfile(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Show Logs
                    </button>
                  )}
                  <button
                    onClick={copyLogsToClipboard}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    📋 Copy Feed
                  </button>
                  <button
                    onClick={() => { setLogs([]); setSyncProfile(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Clear Feed
                  </button>
                </div>
              </div>

              {aiAnalysis && (
                <div style={{
                  margin: '15px 24px 0 24px',
                  padding: '16px 20px',
                  background: 'rgba(168, 85, 247, 0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'white',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🤖</span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#c084fc' }}>
                        AI Brand Strategic Analysis
                      </h4>
                    </div>
                    <button
                      onClick={() => setAiAnalysis('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Close [x]
                    </button>
                  </div>
                  <div style={{
                    fontSize: '0.88rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: '#e9d5ff',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: '6px'
                  }}>
                    {aiAnalysis}
                  </div>
                </div>
              )}

              {syncProfile ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '24px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  flexGrow: 1,
                  color: 'white',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <img
                    src={syncProfile.picture}
                    alt="Profile"
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      border: `3px solid ${PLATFORM_DETAILS[syncProfile.platform]?.color || '#8b5cf6'}`,
                      objectFit: 'cover',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
                        {syncProfile.firstName} {syncProfile.lastName}
                      </h2>
                      <span style={{
                        background: PLATFORM_DETAILS[syncProfile.platform]?.color || '#8b5cf6',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {syncProfile.platform}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#10b981', fontWeight: '500' }}>
                      {syncProfile.email}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      <strong>Bio:</strong> {syncProfile.bio}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <strong>Date of Birth:</strong> {syncProfile.birthday}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="console-logs">
                  {logs.map((log, index) => {
                    let logClass = 'system';
                    if (log.includes('CONNECTED') || log.includes('Successfully')) {
                      logClass = 'success';
                    } else if (log.includes('failed') || log.includes('error') || log.includes('Failed')) {
                      logClass = 'error';
                    }
                    return (
                      <div key={index} className={`console-log-entry ${logClass}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
