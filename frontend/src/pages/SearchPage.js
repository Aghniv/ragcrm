import React, { useState } from 'react';
import { searchAPI } from '../services/api';
import { toast } from 'react-toastify';
import BerryCard from '../components/BerryCard';

function SearchPage() {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [raw, setRaw] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState('answer'); // 'answer' or 'search'

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    setAnswer(''); setSources([]); setRaw([]);
    try {
      if (mode === 'answer') {
        const r = await searchAPI.answer(q);
        setAnswer(r.data?.answer || '');
        setSources(r.data?.sources || []);
      } else {
        const r = await searchAPI.search(q, 10);
        setRaw(r.data || []);
      }
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h1 className="page-title">🔍 Ask Your CRM</h1>
          <p className="page-subtitle">RAG-powered search across customers, opportunities, and notes</p>
        </div>
      </div>

      <form onSubmit={handleAsk} className="rag-search-form" style={{ gap: '10px', marginBottom: '24px' }}>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="search-input"
          style={{ flex: 'none', width: '140px', cursor: 'pointer' }}
        >
          <option value="answer">AI answer</option>
          <option value="search">Raw results</option>
        </select>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Which deals are stuck in negotiation?"
          className="rag-search-input"
        />
        <button type="submit" className="btn-primary" disabled={searching}>
          {searching ? '🤔 Thinking…' : '🔍 Search'}
        </button>
      </form>

      {mode === 'answer' && answer && (
        <div className="rag-answer" style={{ marginBottom: '24px' }}>
          <h3 className="rag-answer-label" style={{ marginBottom: 10, fontSize: 14 }}>Answer</h3>
          <div className="rag-answer-text">{answer}</div>
        </div>
      )}

      {sources.length > 0 && (
        <BerryCard title="Sources" subtitle={`${sources.length} matching chunks`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sources.map((s, i) => (
              <div key={i} className="rag-answer" style={{ background: 'var(--bg-paper)', borderColor: 'var(--border-subtle)' }}>
                <div className="rag-answer-label" style={{ color: 'var(--text-muted)' }}>
                  {s.entityType} #{s.entityId}{s.score !== undefined && ` · score ${s.score?.toFixed?.(3)}`}
                </div>
                <div className="rag-answer-text" style={{ color: 'var(--text-primary)' }}>{s.text}</div>
              </div>
            ))}
          </div>
        </BerryCard>
      )}

      {mode === 'search' && raw.length > 0 && (
        <BerryCard title="Raw matches" subtitle={`${raw.length} matches`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {raw.map((s, i) => (
              <div key={i} className="rag-answer" style={{ background: 'var(--bg-paper)', borderColor: 'var(--border-subtle)' }}>
                <div className="rag-answer-label" style={{ color: 'var(--text-muted)' }}>{s.entityType} #{s.entityId}</div>
                <div className="rag-answer-text" style={{ color: 'var(--text-primary)' }}>{s.text || s.content}</div>
              </div>
            ))}
          </div>
        </BerryCard>
      )}
    </div>
  );
}

export default SearchPage;