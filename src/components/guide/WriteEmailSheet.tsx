import { useEffect, useState, useCallback } from 'react';
import { X, Building2, Zap, User, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SERVICE_LINES = ['Temporary Housing', 'Travel', 'Hotels', 'Destination Services'];
const TONES = [
  { id: 'direct', label: 'Direct' },
  { id: 'warm', label: 'Warm' },
  { id: 'analytical', label: 'Analytical' },
  { id: 'consultative', label: 'Consultative' },
  { id: 'bold', label: 'Bold' },
];

interface EmailRecipient {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

interface WriteEmailSheetProps {
  open: boolean;
  onClose: () => void;
  company: string;
  signal: string;
  contacts?: EmailRecipient[];
}

const WriteEmailSheet = ({ open, onClose, company, signal, contacts = [] }: WriteEmailSheetProps) => {
  const [companyVal, setCompanyVal] = useState(company);
  const [signalVal, setSignalVal] = useState(signal);
  const [buyerTitle, setBuyerTitle] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [serviceLine, setServiceLine] = useState('');
  const [tone, setTone] = useState('direct');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setCompanyVal(company);
      setSignalVal(signal);
      setResult(null);
      setError('');
      const first = contacts.find(c => c.email);
      setRecipientEmail(first?.email ?? '');
      if (first?.title && !buyerTitle) setBuyerTitle(first.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, company, signal]);

  const canGenerate = companyVal.trim() && signalVal.trim() && buyerTitle.trim() && serviceLine;

  const generate = useCallback(async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('email-generator', {
        body: {
          company: companyVal.trim(),
          signal: signalVal.trim(),
          buyer_title: buyerTitle.trim(),
          service_line: serviceLine,
          tone,
        },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult({ subject: data.subject, body: data.body });
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [canGenerate, companyVal, signalVal, buyerTitle, serviceLine, tone]);

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: '1px solid #E2E8F0',
    borderRadius: 6,
    fontSize: 13,
    color: '#0F172A',
    background: '#FFFFFF',
    outline: 'none',
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 480,
          bottom: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 49,
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 56,
          right: 0,
          width: 480,
          height: 'calc(100vh - 56px)',
          background: '#FFFFFF',
          borderLeft: '1px solid #E2E8F0',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
          zIndex: 50,
          overflowY: 'auto',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <header style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Write Outreach</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '2px 0 0' }}>Generate your first email</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <X size={18} color="#94A3B8" />
          </button>
        </header>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Building2 size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={companyVal} onChange={e => setCompanyVal(e.target.value)} placeholder="Company" style={inputStyle} />
          </div>
          <div style={{ position: 'relative' }}>
            <Zap size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <textarea
              value={signalVal}
              onChange={e => setSignalVal(e.target.value)}
              placeholder="Signal"
              rows={3}
              style={{ ...inputStyle, paddingTop: 10, resize: 'vertical' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <User size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={buyerTitle} onChange={e => setBuyerTitle(e.target.value)} placeholder="Job title (e.g. VP Operations)" style={inputStyle} />
          </div>
          <div style={{ position: 'relative' }}>
            <Briefcase size={14} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select value={serviceLine} onChange={e => setServiceLine(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="">Select service line</option>
              {SERVICE_LINES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Tone</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TONES.map(t => {
                const active = tone === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 6,
                      border: '1px solid ' + (active ? '#0F172A' : '#E2E8F0'),
                      background: active ? '#0F172A' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#0F172A',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!canGenerate || loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 6,
              border: 'none',
              background: !canGenerate || loading ? '#E2E8F0' : '#0F172A',
              color: !canGenerate || loading ? '#94A3B8' : '#FFFFFF',
              cursor: !canGenerate || loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Generating…' : 'Generate Email'}
          </button>

          {error && <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{error}</p>}

          {result && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Subject</p>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>{result.subject}</div>
              <textarea
                readOnly
                value={result.body}
                rows={12}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#0F172A',
                  background: '#FFFFFF',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <button
                onClick={copy}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied ✓' : 'Copy Email'}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default WriteEmailSheet;
