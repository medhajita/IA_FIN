import { useEffect, useRef, useState } from 'react';
import { CheckCircle, FileSpreadsheet, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { uploadCSV } from '../../services/transactionService';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { notifyDataChanged } from '../../utils/dataEvents';

function storageKey(userId) {
  return `fincoach_onboarded_${userId}`;
}

export default function OnboardingModal({ onDone, visible }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const firstName = user?.first_name || user?.name?.split(' ')[0] || '';
  const navigate = useNavigate();
  const [step, setStep] = useState('check'); // check | show | loading | done
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!visible || !user?.id) return;

    let cancelled = false;
    const key = storageKey(user.id);
    const alreadyOnboarded = localStorage.getItem(key);

    setError('');
    setProgress('');
    setStep(alreadyOnboarded ? 'check' : 'show');

    api.get('/transactions', { params: { limit: 1 } })
      .then((res) => {
        if (cancelled) return;
        const count = res.data?.data?.transactions?.length ?? 0;
        if (count > 0) {
          localStorage.setItem(key, '1');
          onDone();
        } else {
          localStorage.removeItem(key);
          setStep('show');
        }
      })
      .catch(() => {
        if (!cancelled) setStep('show');
      });

    return () => { cancelled = true; };
  }, [visible, user?.id, onDone]);

  function markDone() {
    if (user?.id) localStorage.setItem(storageKey(user.id), '1');
    onDone();
    navigate('/dashboard', { replace: true });
  }

  async function prepareDashboard() {
    setProgress(t('onboarding.preparingDashboard') || 'Preparing your dashboard...');
    const [txRes] = await Promise.all([
      api.get('/transactions', { params: { limit: 1 } }),
      api.get('/dashboard/summary'),
      api.get('/dashboard/by-category'),
    ]);
    const count = txRes.data?.data?.transactions?.length ?? 0;
    if (count <= 0) throw new Error(t('onboarding.noImportedRows') || 'No transactions were imported from this CSV.');
    notifyDataChanged({ source: 'onboarding', transactionCount: count });
  }

  async function handleDemo() {
    setStep('loading');
    setProgress(t('onboarding.loadingDemo') || 'Loading demo data…');
    try {
      await api.post('/transactions/seed-demo');
      await prepareDashboard();
      setStep('done');
      setTimeout(markDone, 700);
    } catch (err) {
      setError(err?.response?.data?.error || 'Error loading demo data');
      setStep('show');
    }
  }

  async function handleFile(f) {
    if (!f) return;
    setFile(f);
    setStep('loading');
    setProgress(t('onboarding.uploadingCSV') || 'Importing your CSV…');
    try {
      const res = await uploadCSV(f);
      const imported = Number(res.data?.data?.imported || 0);
      if (imported <= 0) throw new Error(t('onboarding.noImportedRows') || 'No transactions were imported from this CSV.');
      await prepareDashboard();
      setStep('done');
      setTimeout(markDone, 700);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Error importing CSV');
      setFile(null);
      setStep('show');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  if (!visible) return null;
  if (step === 'check') return null;
  if (step === 'done') return (
    <Overlay>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <CheckCircle size={56} color="var(--fc-green)" strokeWidth={1.5} />
        <strong style={{ fontSize: 20 }}>{t('onboarding.allSet') || 'All set!'}</strong>
        <span style={{ color: 'var(--fc-muted)', fontSize: 14 }}>{t('onboarding.redirecting') || 'Opening your dashboard…'}</span>
      </div>
    </Overlay>
  );
  if (step === 'loading') return (
    <Overlay>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="fc-spinner" style={{ width: 44, height: 44, border: '4px solid var(--fc-border)', borderTopColor: 'var(--fc-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--fc-muted)', fontSize: 14 }}>{progress}</span>
      </div>
    </Overlay>
  );
  if (step !== 'show') return null;

  return (
    <Overlay>
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <BrandLockup />
          <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {t('onboarding.title', { name: firstName })}
          </h2>
          <p style={{ margin: 0, color: 'var(--fc-muted)', fontSize: 14, lineHeight: 1.6 }}>
            {t('onboarding.subtitle')}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)', borderRadius: 10, padding: '10px 14px', color: 'var(--fc-red)', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* CSV Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--fc-blue)' : 'var(--fc-border)'}`,
            borderRadius: 16,
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(47,107,255,0.06)' : 'var(--fc-sidebar)',
            transition: 'all 0.15s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(47,107,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Upload size={22} color="var(--fc-blue)" />
          </div>
          <strong style={{ fontSize: 15 }}>{t('onboarding.dropCSV') || 'Drop your CSV file here'}</strong>
          <span style={{ fontSize: 13, color: 'var(--fc-muted)' }}>{t('onboarding.orClick') || 'or click to browse'}</span>
          {file && <span style={{ fontSize: 12, color: 'var(--fc-green)', marginTop: 4 }}>{file.name}</span>}
          <input hidden ref={fileRef} type="file" accept=".csv" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--fc-muted)', fontSize: 12, fontWeight: 600 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--fc-border)' }} />
          {t('onboarding.or') || 'OR'}
          <div style={{ flex: 1, height: 1, background: 'var(--fc-border)' }} />
        </div>

        {/* Demo button */}
        <button
          onClick={handleDemo}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 24px', borderRadius: 12,
            background: 'rgba(118,87,255,0.12)', border: '1px solid rgba(118,87,255,0.25)',
            color: 'var(--fc-purple)', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(118,87,255,0.2)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(118,87,255,0.12)'}
        >
          <FileSpreadsheet size={18} />
          {t('onboarding.useDemo') || 'Use demo data instead'}
        </button>
      </div>
    </Overlay>
  );
}

function BrandLockup() {
  return (
    <div
      aria-label="FinCoach AI Finance Assistant"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 18,
        rowGap: 14,
        margin: '0 auto clamp(36px, 8vw, 64px)',
      }}
    >
      <img
        src="/favicon.svg"
        alt=""
        aria-hidden="true"
        style={{
          width: 'clamp(72px, 18vw, 96px)',
          height: 'clamp(72px, 18vw, 96px)',
          flex: '0 0 auto',
          display: 'block',
        }}
      />
      <div style={{ textAlign: 'left', transform: 'translateY(2px)' }}>
        <div
          style={{
            fontSize: 'clamp(36px, 8vw, 48px)',
            lineHeight: 0.95,
            fontWeight: 850,
            letterSpacing: '-0.055em',
            color: 'var(--fc-text)',
            whiteSpace: 'nowrap',
          }}
        >
          Fin{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Coach
          </span>
        </div>
        <div
          style={{
            marginTop: 12,
            color: 'var(--fc-muted)',
            fontSize: 'clamp(12px, 2.6vw, 16px)',
            lineHeight: 1,
            fontWeight: 850,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          AI Finance Assistant
        </div>
      </div>
    </div>
  );
}

function Overlay({ children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--fc-bg, #0b0e15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--fc-card)',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 520,
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        border: '1px solid var(--fc-border)',
      }}>
        {children}
      </div>
    </div>
  );
}
