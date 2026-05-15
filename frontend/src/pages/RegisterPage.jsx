import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
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
    if (!name || !email || !password || !confirm) return setError('All fields are required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setIsLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess('Account created! Redirecting…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            width: 56, height: 56, borderRadius: 16, background: 'var(--purple)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <User size={26} color="#fff" strokeWidth={1.75} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: '0 0 6px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
            FinancIA — track your finances smarter
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
            {[
              { label: 'Full name', name: 'name', type: 'text', icon: User, placeholder: 'Alice Martin' },
              { label: 'Email', name: 'email', type: 'email', icon: Mail, placeholder: 'alice@example.com' },
              { label: 'Password', name: 'password', type: 'password', icon: Lock, placeholder: 'Min. 6 characters' },
              { label: 'Confirm password', name: 'confirm', type: 'password', icon: Lock, placeholder: 'Repeat password' },
            ].map(({ label, name, type, icon: Icon, placeholder }) => (
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
                : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
