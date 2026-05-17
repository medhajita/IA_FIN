import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Languages,
  LayoutDashboard,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  WalletCards,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import '../pages/AuthPages.css';

const previewStats = [
  { key: 'income', value: '+3 250,00 EUR', icon: BarChart3, tone: 'green' },
  { key: 'balance', value: '1 358,27 EUR', icon: WalletCards, tone: 'blue' },
  { key: 'goals', value: '42%', icon: Target, tone: 'purple' },
];

const trustIcons = [ShieldCheck, CheckCircle2, Sparkles];

export default function AuthShell({ mode, children }) {
  const i18n = useI18n() || {};
  const themeContext = useTheme() || {};
  const { t } = i18n;
  const lang = i18n.lang || 'fr';
  const setLang = i18n.setLang || (() => {});
  const theme = themeContext.theme || 'light';
  const toggleTheme = themeContext.toggle || (() => {});
  const isRegister = mode === 'register';

  const translate = typeof t === 'function' ? t : (key) => key;

  return (
    <div className={`auth-page auth-page-${mode}`}>
      <div className="auth-page-pattern" aria-hidden="true" />

      <header className="auth-topbar">
        <Link className="auth-brand" to="/">
          <img src="/logo.svg" alt="" aria-hidden="true" />
          <span>FinCoach</span>
        </Link>

        <div className="auth-top-actions">
          <Link className="auth-back-link" to="/">
            <ArrowLeft size={16} />
            <span>{translate('auth.backHome')}</span>
          </Link>
          <button
            type="button"
            className="auth-control"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            aria-label={translate('auth.toggleLanguage')}
          >
            <Languages size={16} />
            <span>{lang === 'fr' ? 'FR' : 'EN'}</span>
          </button>
          <button
            type="button"
            className="auth-control auth-theme-control"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? translate('auth.lightMode') : translate('auth.darkMode')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? translate('auth.lightModeShort') : translate('auth.darkModeShort')}</span>
          </button>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-visual-panel" aria-label={translate(`${mode}.heroTitle`)}>
          <div className="auth-hero-copy">
            <div className="auth-eyebrow">
              <BadgeCheck size={16} />
              <span>{translate(`${mode}.kicker`)}</span>
            </div>
            <h2>{translate(`${mode}.heroTitle`)}</h2>
            <p>{translate(`${mode}.heroText`)}</p>
          </div>

          <div className="auth-preview-stage">
            <div className="auth-preview-card">
              <div className="auth-preview-top">
                <div className="auth-preview-icon">
                  <LayoutDashboard size={22} strokeWidth={2.2} />
                </div>
                <div>
                  <span>{translate('auth.previewLabel')}</span>
                  <strong>{translate('auth.previewTitle')}</strong>
                </div>
              </div>

              <div className="auth-balance-card">
                <span>{translate('auth.availableBalance')}</span>
                <strong>1 358,27 EUR</strong>
                <small>{isRegister ? translate('auth.setupHint') : translate('auth.liveHint')}</small>
              </div>

              <div className="auth-stat-grid">
                {previewStats.map(({ key, value, icon: Icon, tone }) => (
                  <div className={`auth-stat auth-stat-${tone}`} key={key}>
                    <Icon size={16} strokeWidth={2.2} />
                    <span>{translate(`auth.preview.${key}`)}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="auth-ai-note">
                <Sparkles size={17} strokeWidth={2.2} />
                <div>
                  <strong>{translate('auth.aiNoteTitle')}</strong>
                  <span>{translate('auth.aiNoteText')}</span>
                </div>
              </div>
            </div>

            <div className="auth-flow-card">
              <span>{translate('auth.flowTitle')}</span>
              <div className="auth-flow-line">
                <i />
                <i />
                <i />
              </div>
              <strong>{translate(isRegister ? 'auth.flowRegister' : 'auth.flowLogin')}</strong>
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="auth-trust-row">
            {trustIcons.map((Icon, index) => (
              <div className="auth-trust-item" key={translate(`auth.trust.${index}`)}>
                <Icon size={16} strokeWidth={2.2} />
                <span>{translate(`auth.trust.${index}`)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-form-panel">
          {children}
        </section>
      </main>
    </div>
  );
}
