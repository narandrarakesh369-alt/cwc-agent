'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CWC_DEPARTMENTS } from '@/lib/agents/departments';
import { 
  ShieldCheck, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Cpu, 
  Layers, 
  Sparkles, 
  QrCode, 
  Share2, 
  Shirt, 
  MessageSquare,
  Clock,
  Terminal,
  RefreshCw
} from 'lucide-react';

export default function FounderDashboard() {
  const [drops, setDrops] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commissionOpen, setCommissionOpen] = useState(false);

  // Form state
  const [dropTitle, setDropTitle] = useState('');
  const [mythologyFigure, setMythologyFigure] = useState('');
  const [conceptTheme, setConceptTheme] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/orchestrate');
      if (res.ok) {
        const data = await res.json();
        setDrops(data.drops || []);
        setTasks(data.tasks || []);
        setApprovals(data.approvals || []);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to Realtime Supabase changes
    const channel = supabase
      .channel('cwc-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drops' }, () => fetchDashboardData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleResolveApproval = async (approvalId: string, decision: 'approved' | 'rejected') => {
    try {
      await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, decision }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to resolve approval:', err);
    }
  };

  const handleCommissionDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropTitle || !mythologyFigure) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dropTitle,
          mythologyFigure,
          theme: conceptTheme || 'Indian Mythology Anime Streetwear',
          conceptSummary: `Commissioned by Founder via Web Dashboard`,
        }),
      });

      if (res.ok) {
        setDropTitle('');
        setMythologyFigure('');
        setConceptTheme('');
        setCommissionOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to commission drop:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  return (
    <div className="min-h-screen bg-[#07080b] text-neutral-100 p-4 md:p-8">
      {/* HEADER SECTION */}
      <header className="border-b border-[#1b1f2b] pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#ff4655] text-white font-black text-xs px-2.5 py-1 rounded tracking-widest uppercase">
              CWC OS
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              CODE WEAR CONNECT <span className="text-[#e5b869] text-lg font-mono">/ FOUNDER COMMAND</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            <span className="text-[#00f0ff] font-semibold">SCAN • SHARE • WEAR</span> — "Think as one company. Work as one team. Execute with discipline. Report to the CEO. Answer to the Founder."
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 bg-[#12151e] hover:bg-[#1a202c] border border-[#252b3b] text-xs font-mono px-3 py-2 rounded transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            Sync Realtime
          </button>
          <button
            onClick={() => setCommissionOpen(true)}
            className="flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded shadow-lg shadow-[#ff4655]/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            Commission Drop
          </button>
        </div>
      </header>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0e1017] border border-[#1b1f2b] p-4 rounded-lg">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Active Drops</span>
          <div className="text-2xl font-black text-white mt-1">{drops.length}</div>
          <div className="text-[11px] text-[#00f0ff] mt-1 flex items-center gap-1">
            <Shirt className="w-3 h-3" /> Phygital Garments
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${pendingApprovals.length > 0 ? 'bg-[#ff4655]/10 border-[#ff4655]/50 glow-accent' : 'bg-[#0e1017] border-[#1b1f2b]'}`}>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Pending Founder Approvals</span>
          <div className={`text-2xl font-black mt-1 ${pendingApprovals.length > 0 ? 'text-[#ff4655]' : 'text-neutral-300'}`}>
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#ff4655]" /> External Gates Held
          </div>
        </div>

        <div className="bg-[#0e1017] border border-[#1b1f2b] p-4 rounded-lg">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Orchestrated Tasks</span>
          <div className="text-2xl font-black text-white mt-1">{tasks.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Under CEO Supervision
          </div>
        </div>

        <div className="bg-[#0e1017] border border-[#1b1f2b] p-4 rounded-lg">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">AI Workforce</span>
          <div className="text-2xl font-black text-[#e5b869] mt-1">10 / 10</div>
          <div className="text-[11px] text-[#e5b869] mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Departments Online
          </div>
        </div>
      </div>

      {/* PENDING APPROVALS QUEUE (HIGHEST PRIORITY) */}
      {pendingApprovals.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-[#ff4655] animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">
              Action Gatekeeper: Founder Authorization Required ({pendingApprovals.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="bg-[#141620] border border-[#ff4655]/40 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glow-accent"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ff4655]/20 text-[#ff4655] text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                      {approval.department_id}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      Action: <code className="text-neutral-200">{approval.action_type}</code>
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mt-1.5">{approval.summary}</h3>
                  <p className="text-xs text-neutral-400 mt-1 font-mono">
                    ID: {approval.id} • Submitted: {new Date(approval.created_at).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleResolveApproval(approval.id, 'approved')}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2 rounded transition"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Action
                  </button>
                  <button
                    onClick={() => handleResolveApproval(approval.id, 'rejected')}
                    className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase px-4 py-2 rounded transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10 DEPARTMENTS GRID */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase">
              The 10 CWC Specialized Departments
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">Coordinated by Central CEO Agent</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CWC_DEPARTMENTS.map((dept) => {
            const deptTasks = tasks.filter((t) => t.department_id === dept.id);
            const activeTask = deptTasks.find((t) => t.status === 'in_progress');

            return (
              <div
                key={dept.id}
                className="bg-[#0e1017] border border-[#1b1f2b] hover:border-[#2d3448] p-5 rounded-lg flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                      dept.pillar === 'WEAR' ? 'bg-[#ff4655]/15 text-[#ff4655]' :
                      dept.pillar === 'SCAN' ? 'bg-[#00f0ff]/15 text-[#00f0ff]' :
                      dept.pillar === 'SHARE' ? 'bg-[#e5b869]/15 text-[#e5b869]' :
                      'bg-purple-500/15 text-purple-400'
                    }`}>
                      {dept.pillar}
                    </span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3 group-hover:text-[#e5b869] transition">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {dept.role}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#181c26]">
                  <div className="text-[11px] font-mono text-neutral-400 mb-1">
                    Restricted Gates ({dept.restrictedActions.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dept.restrictedActions.map((act) => (
                      <span key={act} className="text-[10px] font-mono bg-[#141722] text-neutral-300 px-1.5 py-0.5 rounded border border-[#23293a]">
                        {act}
                      </span>
                    ))}
                  </div>

                  {activeTask && (
                    <div className="mt-2.5 text-[11px] text-[#00f0ff] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 animate-spin" /> {activeTask.title.slice(0, 30)}...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LIVE AUDIT LOG & RECENT DROPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COLLECTIONS / DROPS */}
        <div className="bg-[#0e1017] border border-[#1b1f2b] p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shirt className="w-4 h-4 text-[#ff4655]" /> CWC Collections & Drops
            </h3>
            <span className="text-xs font-mono text-neutral-500">{drops.length} total</span>
          </div>

          <div className="space-y-3">
            {drops.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-4">No collections commissioned yet. Use "Commission Drop" above.</p>
            ) : (
              drops.map((drop) => (
                <div key={drop.id} className="bg-[#12141c] border border-[#1c202d] p-3.5 rounded flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{drop.title}</h4>
                    <p className="text-xs text-neutral-400">Figure: <span className="text-[#e5b869]">{drop.mythology_figure}</span></p>
                    <span className="text-[10px] font-mono text-[#00f0ff] mt-0.5 block">QR: cwc.io/{drop.qr_code_slug}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#1d2230] text-neutral-300 uppercase">
                    {drop.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AUDIT LOG */}
        <div className="bg-[#0e1017] border border-[#1b1f2b] p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00f0ff]" /> Realtime Audit Log (Supabase)
            </h3>
            <span className="text-xs font-mono text-neutral-500">Immutable</span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-4">Zero events recorded. Database standing by.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-xs font-mono bg-[#11131a] border border-[#1a1e2a] p-2.5 rounded">
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-0.5">
                    <span className="text-[#e5b869] font-bold">[{log.source}]</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-neutral-300">{log.details}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COMMISSION DROP MODAL */}
      {commissionOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#10131a] border border-[#2b3245] max-w-md w-full p-6 rounded-lg shadow-2xl">
            <h3 className="text-lg font-black text-white tracking-wide uppercase mb-1">
              Commission New CWC Drop
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              The Central CEO Agent will decompose this directive into tasks across all 10 departments.
            </p>

            <form onSubmit={handleCommissionDrop} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                  Collection Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karna: The Defiant Sun Heavyweight Tee"
                  value={dropTitle}
                  onChange={(e) => setDropTitle(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-[#222838] focus:border-[#ff4655] rounded px-3 py-2 text-sm text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                  Indian Mythology Figure
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karna / Arjuna / Shiva / Garuda"
                  value={mythologyFigure}
                  onChange={(e) => setMythologyFigure(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-[#222838] focus:border-[#ff4655] rounded px-3 py-2 text-sm text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1">
                  Visual / Narrative Theme
                </label>
                <input
                  type="text"
                  placeholder="e.g. Golden Armor, Solar Flares, Cyber-Vedic Armor"
                  value={conceptTheme}
                  onChange={(e) => setConceptTheme(e.target.value)}
                  className="w-full bg-[#0a0c12] border border-[#222838] focus:border-[#ff4655] rounded px-3 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCommissionOpen(false)}
                  className="text-xs font-mono text-neutral-400 hover:text-white px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#ff4655] hover:bg-[#e03d4b] text-white font-bold text-xs uppercase px-4 py-2 rounded tracking-wider shadow"
                >
                  {isSubmitting ? 'Mobilizing CEO...' : 'Deploy Directive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
