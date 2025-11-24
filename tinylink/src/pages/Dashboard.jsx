import React, { useEffect, useState } from 'react';
import { createLink, listLinks, deleteLink, getHealth, clickLink } from '../api';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState({ status: 'loading', uptime: 0 });

  const BASE_URL = import.meta.env.VITE_BASE_URL
    ? import.meta.env.VITE_BASE_URL.replace('/api/links', '/r')
    : `${window.location.origin}/r`;

  useEffect(() => {
    loadLinks();
    checkHealth();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const data = await listLinks();
      setLinks(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  }

  async function checkHealth() {
    const healthData = await getHealth();
    setHealth(healthData);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    if (!target) return setError('Target URL required');
    try { new URL(target); } catch { return setError('Invalid URL'); }

    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code))
      return setError('Code must be 6-8 alphanumeric characters');

    setFormLoading(true);
    try {
      const created = await createLink({ target, code: code || undefined });
      setTarget(''); setCode('');
      setLinks(prev => [created, ...prev]);
      await navigator.clipboard.writeText(`${BASE_URL}/${created.code}`).catch(()=>{});
      alert('Short link created and copied to clipboard!');
    } catch (err) {
      console.error(err);
      if (err.status === 409) setError('Code already exists');
      else setError(err.body?.error || 'Failed to create link');
    } finally { setFormLoading(false); }
  }

  async function handleDelete(linkCode) {
    if (!confirm('Delete this link?')) return;
    try {
      await deleteLink(linkCode);
      setLinks(prev => prev.filter(l => l.code !== linkCode));
    } catch { alert('Delete failed'); }
  }

  const handleCopy = async (text, code) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link is copied');
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
      <div className="mb-4 text-sm">
        API Health: <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
          {health.status} ({Math.floor(health.uptime)}s uptime)
        </span>
      </div>

      {/* Create link form */}
      <form className="mb-6 space-y-2" onSubmit={handleCreate}>
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded"
            placeholder="https://example.com/very/long/url"
            value={target}
            onChange={e => setTarget(e.target.value)}
            disabled={formLoading}
          />
          <input
            className="w-40 p-2 border rounded"
            placeholder="custom code(Name of Link)"
            value={code}
            onChange={e => setCode(e.target.value)}
            disabled={formLoading}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={formLoading}>
            {formLoading ? 'Saving...' : 'Create'}
          </button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>

      {/* Links table */}
      <div className="bg-white shadow rounded">
        {loading ? <div className="p-4">Loading…</div> :
          links.length === 0 ? <div className="p-4">No links yet — create one above.</div> :
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Target</th>
                <th className="text-left p-2">Clicks</th>
                <th className="text-left p-2">Last Clicked</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.code} className="border-t">
                  <td className="p-2"><a className="text-blue-600" href={`/code/${l.code}`}>{l.code}</a></td>
                  {/* Inside your table row */}
                    <td className="p-2 max-w-xl overflow-hidden text-ellipsis whitespace-nowrap">
                    <a
                        href={l.target}
                        target="_blank"
                        className="text-blue-600"
                        onClick={async (e) => {
                        e.preventDefault(); // prevent default navigation
                        try {
                            await clickLink(l.code); // increment click count
                            window.open(l.target, "_blank"); // then open the link
                            const updatedLinks = await listLinks();
                            setLinks(updatedLinks);
                        } catch (err) {
                            console.error(err);
                        }
                        }}>
                        {l.target}
                    </a>
                    </td>
                  <td className="p-2">{l.clicks}</td>
                  <td className="p-2">{l.last_clicked ? new Date(l.last_clicked).toLocaleString() : '-'}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleCopy(`${l.target}`, l.code)}
                      className="px-2 py-1 border rounded text-sm">
                      Copy
                    </button>
                    <button onClick={() => handleDelete(l.code)} className="px-2 py-1 border rounded text-sm text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
