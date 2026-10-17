import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageBackground from '../components/PageBackground';
import revealTextTree from '../components/TextReveal';
import { useAuth } from '../context/AuthContext';
import { Shield, Flag, Trash2, EyeOff, Eye, Ban, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'flagged' | 'users'
  const [reports, setReports] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resReports, resFlagged, resUsers] = await Promise.all([
        fetch('/api/admin/reports'),
        fetch('/api/admin/flagged'),
        fetch('/api/admin/users'),
      ]);

      if (resReports.ok) {
        const data = await resReports.json();
        setReports(data.reports || []);
      }
      if (resFlagged.ok) {
        const data = await resFlagged.json();
        setFlaggedPosts(data.posts || []);
      }
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleReportAction = async (reportId, action) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`Action '${action}' applied successfully.`);
        fetchAdminData();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = async (handle, currentBanned) => {
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, is_banned: !currentBanned }),
      });
      if (res.ok) {
        setActionMessage(`User '${handle}' status updated.`);
        fetchAdminData();
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearSampleData = async () => {
    const confirmClear = window.confirm(
      'Are you sure you want to clear all sample data? This will delete only sample posts and sample comments (is_sample = 1).'
    );
    if (!confirmClear) return;

    try {
      const res = await fetch('/api/admin/clear-sample-data', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        fetchAdminData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') {
    return revealTextTree((
      <div className="relative min-h-screen bg-transparent pt-36 pb-20 px-4 flex flex-col items-center">
        <PageBackground image="/images/img-01.jpg" />
        <div className="relative z-10 w-full max-w-md liquid-glass rounded-3xl p-8 border border-white/15 text-center shadow-2xl">
          <Shield className="w-8 h-8 text-white mx-auto mb-3" />
          <h1 className="font-serif text-3xl text-white mb-2">Restricted Sanctuary</h1>
          <p className="text-zinc-300 text-sm mb-6">
            Admin console access is restricted to sanctuary stewards.
          </p>
          <Link
            to="/auth"
            className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 block transition-all"
          >
            Log in with admin account
          </Link>
        </div>
      </div>
    ));
  }

  return revealTextTree((
    <div className="relative min-h-screen bg-transparent pt-32 pb-24 px-4 flex flex-col items-center">
      <PageBackground image="/images/img-01.jpg" />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-left">
        {/* Header */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 mb-8 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
              <Shield className="w-4 h-4 text-white" />
              <span>Admin Moderation Console</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white text-aura">
              Sanctuary Oversight
            </h1>
            <p className="text-xs text-zinc-300 mt-1">
              Logged in as <strong className="text-white">{user.handle}</strong> (Admin)
            </p>
          </div>

          {/* Clear sample data button */}
          <button
            onClick={handleClearSampleData}
            className="px-4 py-2.5 rounded-full border border-red-500/30 text-zinc-300 hover:text-white hover:bg-red-950/20 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            title="Deletes all entries flagged with is_sample = 1"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Clear sample data</span>
          </button>
        </div>

        {actionMessage && (
          <div className="liquid-glass border border-white/20 p-3.5 rounded-2xl mb-6 text-xs text-zinc-200 text-center animate-fade-in">
            {actionMessage}
          </div>
        )}

        {/* Tab Selector */}
        <div className="liquid-glass rounded-full p-1.5 flex max-w-md mx-auto mb-8 border border-white/10">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('flagged')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'flagged' ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Auto-Flagged ({flaggedPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users' ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Users ({users.length})</span>
          </button>
        </div>

        {/* Tab 1: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-4">
            {reports.length === 0 ? (
              <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
                No moderation reports pending. The sanctuary is calm.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="liquid-glass rounded-3xl p-6 border border-white/15 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/10 pb-2">
                    <span className="font-semibold text-white">
                      Report #{rep.id} • Target: {rep.target_type} #{rep.target_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                      rep.status === 'pending' ? 'bg-amber-900/40 text-amber-200 border border-amber-500/30' : 'bg-white/10 text-zinc-400'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-zinc-400">Reason: </span>
                    <strong className="text-white">{rep.reason}</strong>
                    {rep.details && <p className="text-zinc-300 italic mt-1">“{rep.details}”</p>}
                  </div>

                  {rep.target && (
                    <div className="liquid-glass rounded-2xl p-3.5 border border-white/10 text-xs">
                      <span className="text-zinc-400 block mb-1">
                        Reported Content by <strong className="text-white">{rep.target.author_handle}</strong>:
                      </span>
                      <p className="text-zinc-200 font-normal leading-relaxed whitespace-pre-wrap">
                        {rep.target.body}
                      </p>
                      {rep.target.is_hidden ? (
                        <span className="text-[10px] text-red-300 mt-1 block">[Content currently HIDDEN]</span>
                      ) : null}
                    </div>
                  )}

                  {/* Moderation Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleReportAction(rep.id, 'dismiss')}
                      className="px-3.5 py-1.5 rounded-full border border-white/15 text-xs text-zinc-300 hover:text-white"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, rep.target?.is_hidden ? 'restore' : 'hide')}
                      className="px-3.5 py-1.5 rounded-full liquid-glass border border-white/20 text-xs text-zinc-200 hover:text-white flex items-center gap-1"
                    >
                      {rep.target?.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{rep.target?.is_hidden ? 'Restore Content' : 'Hide Content'}</span>
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, 'remove')}
                      className="px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 text-xs text-zinc-200 hover:text-white flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Auto-Flagged Posts */}
        {activeTab === 'flagged' && (
          <div className="flex flex-col gap-4">
            {flaggedPosts.length === 0 ? (
              <div className="liquid-glass rounded-3xl p-12 text-center text-zinc-400 text-sm border border-white/10">
                No auto-flagged posts in the safety queue.
              </div>
            ) : (
              flaggedPosts.map((post) => (
                <div
                  key={post.id}
                  className="liquid-glass rounded-3xl p-6 border border-white/15 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold text-white">{post.author_handle}</span>
                    <span className="text-amber-300 font-medium">Flag: {post.flag_reason || 'Safety trigger'}</span>
                  </div>

                  {post.title && <h3 className="font-serif text-lg text-white">{post.title}</h3>}
                  <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-zinc-400">
                    <span>Topic: {post.topic}</span>
                    <button
                      onClick={async () => {
                        await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
                        fetchAdminData();
                      }}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: User Management */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-3">
            <div className="liquid-glass rounded-3xl overflow-hidden border border-white/15">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-white/15 bg-white/5 text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Handle</th>
                    <th className="p-4">Email (Admin View Only)</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-semibold text-white">{u.handle}</td>
                      <td className="p-4 text-zinc-400">{u.email}</td>
                      <td className="p-4 text-zinc-300 capitalize">{u.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          u.is_banned ? 'bg-red-950/60 text-red-200 border border-red-500/30' : 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/30'
                        }`}>
                          {u.is_banned ? 'Restricted' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBan(u.handle, u.is_banned)}
                            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                              u.is_banned
                                ? 'bg-white text-black hover:bg-zinc-200'
                                : 'border border-white/20 text-zinc-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {u.is_banned ? 'Unban Handle' : 'Ban Handle'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  ));
}
