import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BadgeCheck, Eye, EyeOff, Lock, Mail, Moon, Sun } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fr = lang === 'fr';

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const tags = fr
    ? ['Connexion sécurisée', 'Données chiffrées', 'IA intégrée']
    : ['Secure login', 'Encrypted data', 'Built-in AI'];

  return (
    <div className="auth-dark-split">

      {/* ── Left: landing-page hero ── */}
      <div className="auth-hero-panel">
        <Link className="auth-hero-brand" to="/">
          <img src="/favicon.svg" alt="" aria-hidden="true" />
          <span>FinCoach</span>
        </Link>
        <div className="auth-hero-body">
          <div className="auth-hero-pill auth-hero-pill-blue">
            {fr ? "Ravi de vous revoir" : 'Welcome back'}
          </div>
          <h1 className="auth-lp-heading">
            {fr ? 'Reprenez le contrôle de vos finances.' : 'Take back control of your finances.'}
          </h1>
          <p className="auth-hero-desc">
            {fr
              ? "FinCoach analyse vos transactions, catégorise vos dépenses et vous conseille avec l'IA — en temps réel."
              : 'FinCoach analyzes your transactions, categorizes spending, and gives AI advice — in real time.'}
          </p>
          <div className="auth-lp-tags">
            {tags.map((tag, i) => <span key={i} className="auth-lp-tag">{tag}</span>)}
          </div>
          <div className="auth-hero-bottom">
            {fr
              ? <>Chaque décision financière compte.<br /><a href="#" className="blue">Continuez à construire votre avenir.</a></>
              : <>Every financial decision matters.<br /><a href="#" className="blue">Keep building your future.</a></>}
          </div>
        </div>
      </div>

      {/* ── Right: card form ── */}
      <div className="auth-form-side">
        <div className="auth-form-toprow">
          <Link className="auth-mobile-brand" to="/">
            <img src="/favicon.svg" alt="" aria-hidden="true" />
            <span>FinCoach</span>
          </Link>
          <div className="auth-toprow-actions">
            <Link className="auth-top-btn" to="/"><ArrowLeft size={15} /><span className="auth-btn-label">{fr ? 'Accueil' : 'Home'}</span></Link>
            <button className="auth-top-btn" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}>
              <span>{fr ? 'FR' : 'EN'}</span>
            </button>
            <button className="auth-top-btn" onClick={toggle}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span className="auth-btn-label">{theme === 'dark' ? (fr ? 'Clair' : 'Light') : (fr ? 'Sombre' : 'Dark')}</span>
            </button>
          </div>
        </div>

        <div className="auth-form-side-body">
          <div className="auth-card">
            <div className="auth-card-title-row">
            </div>

            <h2 className="auth-card-title">{fr ? 'Connexion' : 'Sign in'}</h2>
            <p className="auth-bare-sub">{fr ? 'Accédez à votre tableau de bord FinCoach.' : 'Access your FinCoach dashboard.'}</p>

            {error && (
              <div className="auth-alert auth-alert-error">
                <AlertCircle size={15} strokeWidth={2} />{error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="l-email">{t('login.email')}</label>
                <div className="auth-input-wrap">
                  <Mail size={16} strokeWidth={1.75} />
                  <input id="l-email" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder={fr ? 'exemple@domaine.com' : 'example@domain.com'}
                    className="auth-input" autoComplete="email" aria-invalid={!!error} />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-bare-field-row">
                  <label htmlFor="l-password">{t('login.password')}</label>
                  <a href="#" className="auth-forgot">{fr ? 'Mot de passe oublié ?' : 'Forgot password?'}</a>
                </div>
                <div className="auth-input-wrap">
                  <Lock size={16} strokeWidth={1.75} />
                  <input id="l-password" type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} placeholder={fr ? 'Votre mot de passe' : 'Your password'}
                    className="auth-input auth-input-with-action"
                    autoComplete="current-password" aria-invalid={!!error} />
                  <button type="button" className="auth-input-action"
                    onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="auth-submit">
                {isLoading ? <span className="auth-spinner" /> : (fr ? 'Se connecter' : 'Sign in')}
              </button>
            </form>

            <div className="auth-switch">
              <span>{t('login.noAccount')}</span>
              <Link to="/register">{t('login.createOne')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
