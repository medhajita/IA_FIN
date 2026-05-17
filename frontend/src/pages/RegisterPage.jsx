import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../context/I18nContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, phone, email, password, confirm } = form;
    if (!firstName || !lastName || !email || !password || !confirm) return setError(t('register.errRequired'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('register.errEmail'));
    if (password !== confirm) return setError(t('register.errMismatch'));
    if (password.length < 6) return setError(t('register.errLength'));
    setIsLoading(true);
    try {
      await api.post('/auth/register', { first_name: firstName, last_name: lastName, phone: phone || undefined, email, password });
      setSuccess(t('register.success'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || t('register.errFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/favicon.svg" alt="" aria-hidden="true" style={{ width: 56, height: 56, display: 'inline-block', marginBottom: 16, filter: 'drop-shadow(0 12px 28px rgba(74,124,246,0.24))' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: '0 0 6px' }}>
            {t('register.title')}
          </h1>
          <div style={{
            display: 'inline', lineHeight: 1,
            background: 'var(--blue-bg)', border: '1px solid rgba(74,124,246,0.18)',
            borderRadius: 20, padding: '5px 14px', marginTop: 4,
            fontSize: 13, color: 'var(--blue-text)',
          }}>
            {t('register.subtitle').split('FinCoach').map((part, i, arr) =>
              i < arr.length - 1
                ? [part, <span key={i} style={{ fontWeight: 700, color: 'var(--blue)' }}>FinCoach</span>]
                : part
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--red-bg)', color: 'var(--red-text)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20, fontSize: 13,
            }}>
              <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--green-bg)', color: 'var(--green-text)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20, fontSize: 13,
            }}>
              <CheckCircle2 size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {t('register.firstName')}
                </label>
                <div className="input-icon-wrap">
                  <User size={15} className="icon-left" strokeWidth={1.75} />
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                    placeholder={t('register.firstNamePlaceholder')} className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {t('register.lastName')}
                </label>
                <div className="input-icon-wrap">
                  <User size={15} className="icon-left" strokeWidth={1.75} />
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                    placeholder={t('register.lastNamePlaceholder')} className="input-field" />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {t('register.phone')}
              </label>
              <div className="input-icon-wrap">
                <Phone size={15} className="icon-left" strokeWidth={1.75} />
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  placeholder={t('register.phonePlaceholder')} className="input-field" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {t('register.email')}
              </label>
              <div className="input-icon-wrap">
                <Mail size={15} className="icon-left" strokeWidth={1.75} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="alice@example.com" className="input-field" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {t('register.password')}
              </label>
              <div className="input-icon-wrap">
                <Lock size={15} className="icon-left" strokeWidth={1.75} />
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder={t('register.passwordPlaceholder')} className="input-field" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {t('register.confirmPassword')}
              </label>
              <div className="input-icon-wrap">
                <Lock size={15} className="icon-left" strokeWidth={1.75} />
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder={t('register.confirmPlaceholder')} className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {isLoading
                ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : t('register.submit')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 0 }}>
            {t('register.hasAccount')}{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
              {t('register.signIn')}
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
