import { useState } from 'react';
import { User, Phone, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/profileService';

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [infoForm, setInfoForm] = useState({
    phone: user?.phone || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [infoMsg, setInfoMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function handleInfoSave(e) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    try {
      await updateProfile({ phone: infoForm.phone || null });
      updateUser({ phone: infoForm.phone || null });
      setInfoMsg({ ok: true, text: t('profile.successInfo') });
    } catch {
      setInfoMsg({ ok: false, text: t('profile.errFailed') });
    } finally {
      setSavingInfo(false);
    }
  }

  async function handlePwSave(e) {
    e.preventDefault();
    setPwMsg(null);
    if (!pwForm.current) return setPwMsg({ ok: false, text: t('profile.errCurrentRequired') });
    if (pwForm.next !== pwForm.confirm) return setPwMsg({ ok: false, text: t('profile.errMismatch') });
    if (pwForm.next.length < 6) return setPwMsg({ ok: false, text: t('profile.errLength') });
    setSavingPw(true);
    try {
      await updateProfile({ current_password: pwForm.current, new_password: pwForm.next });
      setPwForm({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: t('profile.successPassword') });
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.error || t('profile.errFailed') });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
        }}>
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: 'linear-gradient(135deg, var(--purple) 0%, #7c3aed 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={22} color="#fff" strokeWidth={1.75} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
            {t('profile.title')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {t('profile.subtitle')}
          </p>
        </div>
      </div>

      {/* Info section */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
          {t('profile.infoSection')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
              {t('profile.firstName')}
            </label>
            <div className="input-icon-wrap">
              <User size={14} className="icon-left" strokeWidth={1.75} />
              <input className="input-field" value={user?.first_name || ''} readOnly
                style={{ background: 'var(--bg-secondary)', cursor: 'default' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
              {t('profile.lastName')}
            </label>
            <div className="input-icon-wrap">
              <User size={14} className="icon-left" strokeWidth={1.75} />
              <input className="input-field" value={user?.last_name || ''} readOnly
                style={{ background: 'var(--bg-secondary)', cursor: 'default' }} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
            {t('profile.email')}
          </label>
          <div className="input-icon-wrap">
            <Mail size={14} className="icon-left" strokeWidth={1.75} />
            <input className="input-field" value={user?.email || ''} readOnly
              style={{ background: 'var(--bg-secondary)', cursor: 'default' }} />
          </div>
        </div>

        {infoMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
            color: infoMsg.ok ? 'var(--green-text)' : 'var(--red-text)',
            background: infoMsg.ok ? 'var(--green-bg)' : 'var(--red-bg)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12,
          }}>
            {infoMsg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {infoMsg.text}
          </div>
        )}

        <form onSubmit={handleInfoSave}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
              {t('profile.phone')}
            </label>
            <div className="input-icon-wrap">
              <Phone size={14} className="icon-left" strokeWidth={1.75} />
              <input type="tel" className="input-field" value={infoForm.phone}
                onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
                placeholder={t('profile.phonePlaceholder')} />
            </div>
          </div>
          <button type="submit" disabled={savingInfo} className="btn-primary" style={{ width: '100%' }}>
            {savingInfo ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
          {t('profile.passwordSection')}
        </h2>

        {pwMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
            color: pwMsg.ok ? 'var(--green-text)' : 'var(--red-text)',
            background: pwMsg.ok ? 'var(--green-bg)' : 'var(--red-bg)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12,
          }}>
            {pwMsg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handlePwSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: t('profile.currentPassword'), key: 'current' },
            { label: t('profile.newPassword'), key: 'next' },
            { label: t('profile.confirmPassword'), key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                {label}
              </label>
              <div className="input-icon-wrap">
                <Lock size={14} className="icon-left" strokeWidth={1.75} />
                <input type="password" className="input-field" value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-primary" style={{ width: '100%' }}>
            {savingPw ? t('profile.saving') : t('profile.save')}
          </button>
        </form>
      </div>
    </div>
  );
}
