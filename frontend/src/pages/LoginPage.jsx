import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) return setError(t('login.errRequired'));
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t('login.errFailed'));
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
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'var(--blue)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <TrendingUp size={26} color="#fff" strokeWidth={1.75} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: '0 0 6px' }}>
            {t('login.title')}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            {t('login.subtitle')}
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--red-bg)', border: '1px solid var(--red-bg)',
              color: 'var(--red-text)', borderRadius: 'var(--radius-sm)',
              padding: '10px 14px', marginBottom: 20, fontSize: 13,
            }}>
              <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {t('login.email')}
              </label>
              <div className="input-icon-wrap">
                <Mail size={15} className="icon-left" strokeWidth={1.75} />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="alice@example.com"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                {t('login.password')}
              </label>
              <div className="input-icon-wrap">
                <Lock size={15} className="icon-left" strokeWidth={1.75} />
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} placeholder={t('login.passwordPlaceholder')}
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
              {isLoading
                ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : t('login.submit')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 0 }}>
            {t('login.noAccount')}{' '}
            <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
              {t('login.createOne')}
            </Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
