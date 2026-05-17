import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BadgeCheck, CheckCircle2, Eye, EyeOff, Lock, Mail, Moon, Sun, User } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import './AuthPages.css';

function pwStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  const checks = [pw.length >= 10, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  return score >= 3 ? 3 : score >= 1 ? 2 : 1;
}

const METER = [
  null,
  { width: '28%', color: '#ef4444', label: { fr: 'Faible', en: 'Weak' } },
  { width: '64%', color: '#f97316', label: { fr: 'Moyen', en: 'Fair' } },
  { width: '100%', color: '#10b981', label: { fr: 'Fort', en: 'Strong' } },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const fr = lang === 'fr';
  const strength = pwStrength(form.password);
  const meter = METER[strength];

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { firstName, lastName, email, password, confirm } = form;
    if (!firstName || !lastName || !email || !password || !confirm) return setError(t('register.errRequired'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('register.errEmail'));
    if (password !== confirm) return setError(t('register.errMismatch'));
    if (password.length < 6) return setError(t('register.errLength'));
    setIsLoading(true);
    try {
      await api.post('/auth/register', { first_name: firstName, last_name: lastName, email, password });
      setSuccess(t('register.success'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || t('register.errFailed'));
    } finally {
      setIsLoading(false);
    }
  }

  const tags = fr
    ? ['Import CSV', 'Recommandations IA', 'Objectifs']
    : ['CSV Import', 'AI recommendations', 'Goals'];

  return (
    <div className="auth-dark-split">

      {/* ── Left: landing-page hero ── */}
      <div className="auth-hero-panel">
        <Link className="auth-hero-brand" to="/">
          <img src="/favicon.svg" alt="" aria-hidden="true" />
          <span>FinCoach</span>
        </Link>
        <div className="auth-hero-body">
          <div className="auth-hero-pill auth-hero-pill-green">
            {fr ? 'Commencez gratuitement' : 'Get started for free'}
          </div>
          <h1 className="auth-lp-heading">
            {fr
              ? "Votre avenir financier commence ici"
              : "Your financial future starts here"}
          </h1>
          <p className="auth-hero-desc">
            {fr
              ? "FinCoach transforme vos transactions en tableau de bord, catégories et réponses IA basées sur vos vraies données."
              : "FinCoach turns your transactions into a clear dashboard, useful categories, and AI answers based on your real data."}
          </p>
          <div className="auth-lp-tags">
            {tags.map((tag, i) => <span key={i} className="auth-lp-tag">{tag}</span>)}
          </div>
          <div className="auth-hero-bottom">
            {fr
              ? <>Rejoignez des utilisateurs qui comprennent<br /><a href="#">enfin où va leur argent.</a></>
              : <>Join users who finally understand<br /><a href="#">where their money goes.</a></>}
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
          <div className="auth-card auth-card-register">
            <div className="auth-card-title-row">
            </div>

            <h2 className="auth-card-title">{fr ? 'Créer votre compte' : 'Create account'}</h2>
            <p className="auth-bare-sub">{fr ? 'FinCoach — gérez vos finances plus intelligemment' : 'FinCoach — manage your finances smarter'}</p>

            {error && <div className="auth-alert auth-alert-error"><AlertCircle size={15} strokeWidth={2} />{error}</div>}
            {success && <div className="auth-alert auth-alert-success"><CheckCircle2 size={15} strokeWidth={2} />{success}</div>}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-form-row">
                <div className="auth-field">
                  <label htmlFor="r-fn">{t('register.firstName')}</label>
                  <div className="auth-input-wrap">
                    <User size={16} strokeWidth={1.75} />
                    <input id="r-fn" type="text" name="firstName" value={form.firstName}
                      onChange={handleChange} placeholder={fr ? 'Alice' : 'Alice'}
                      className="auth-input" autoComplete="given-name" />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="r-ln">{t('register.lastName')}</label>
                  <div className="auth-input-wrap">
                    <User size={16} strokeWidth={1.75} />
                    <input id="r-ln" type="text" name="lastName" value={form.lastName}
                      onChange={handleChange} placeholder={fr ? 'Martin' : 'Martin'}
                      className="auth-input" autoComplete="family-name" />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="r-email">{t('register.email')}</label>
                <div className="auth-input-wrap">
                  <Mail size={16} strokeWidth={1.75} />
                  <input id="r-email" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="alice@example.com"
                    className="auth-input" autoComplete="email" />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="r-pw">{t('register.password')}</label>
                <div className="auth-input-wrap">
                  <Lock size={16} strokeWidth={1.75} />
                  <input id="r-pw" type={showPw ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder={fr ? 'Min. 6 caractères' : 'Min. 6 characters'}
                    className="auth-input auth-input-with-action" autoComplete="new-password" />
                  <button type="button" className="auth-input-action" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && meter && (
                  <div className="auth-pw-meter">
                    <div className="auth-pw-meter-bar">
                      <div className="auth-pw-meter-fill" style={{ width: meter.width, background: meter.color }} />
                    </div>
                    <span className="auth-pw-meter-label" style={{ color: meter.color }}>{meter.label[lang] || meter.label.en}</span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="r-cf">{t('register.confirmPassword')}</label>
                <div className="auth-input-wrap">
                  <Lock size={16} strokeWidth={1.75} />
                  <input id="r-cf" type={showCf ? 'text' : 'password'} name="confirm" value={form.confirm}
                    onChange={handleChange} placeholder={fr ? 'Répéter le mot de passe' : 'Repeat password'}
                    className="auth-input auth-input-with-action" autoComplete="new-password"
                    aria-invalid={form.confirm && form.password !== form.confirm ? 'true' : undefined} />
                  <button type="button" className="auth-input-action" onClick={() => setShowCf(v => !v)} tabIndex={-1}>
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="auth-submit auth-submit-teal">
                {isLoading ? <span className="auth-spinner" /> : (fr ? 'Créer le compte' : 'Create account')}
              </button>
            </form>

            <div className="auth-switch">
              <span>{t('register.hasAccount')}</span>
              <Link to="/login">{t('register.signIn')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
