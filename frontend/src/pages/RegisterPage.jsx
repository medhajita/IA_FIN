import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../context/I18nContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, email, password, confirm } = form;
    if (!name || !email || !password || !confirm) return setError(t('register.errRequired'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('register.errEmail'));
    if (password !== confirm) return setError(t('register.errMismatch'));
    if (password.length < 6) return setError(t('register.errLength'));
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess(t('register.success'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || t('register.errFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  const fields = [
    { label: t('register.fullName'),        name: 'name',     type: 'text',     icon: User, placeholder: t('register.namePlaceholder') },
    { label: t('register.email'),           name: 'email',    type: 'email',    icon: Mail, placeholder: 'alice@example.com' },
    { label: t('register.password'),        name: 'password', type: 'password', icon: Lock, placeholder: t('register.passwordPlaceholder') },
    { label: t('register.confirmPassword'), name: 'confirm',  type: 'password', icon: Lock, placeholder: t('register.confirmPlaceholder') },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-secondary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'var(--purple)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <User size={26} color="#fff" strokeWidth={1.75} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: '0 0 6px' }}>
            {t('register.title')}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            {t('register.subtitle')}
          </p>
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
            {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {label}
                </label>
                <div className="input-icon-wrap">
                  <Icon size={15} className="icon-left" strokeWidth={1.75} />
                  <input
                    type={type} name={name} value={form[name]}
                    onChange={handleChange} placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              </div>
            ))}

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
