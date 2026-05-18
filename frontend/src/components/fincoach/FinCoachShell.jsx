import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  FileText,
  Goal,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import FloatingAssistant from './FloatingAssistant';
import OnboardingModal from './OnboardingModal';
import { subscribeDataChanged } from '../../utils/dataEvents';
import './FinCoachApp.css';

const navItems = [
  { to: '/dashboard', key: 'dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', key: 'transactions', fallback: 'Transactions', icon: WalletCards },
  { to: '/goals', key: 'goals', fallback: 'Goals', icon: Goal },
  { to: '/documents', key: 'documents', fallback: 'Documents', icon: FileText },
  { to: '/analytics', key: 'analytics', fallback: 'Analytics', icon: BarChart3 },
];

function getName(user) {
  if (!user) return 'Anika';
  if (user.name) return user.name;
  if (user.first_name || user.last_name) return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return 'Anika';
}

function getInitials(user) {
  const name = getName(user);
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

export default function FinCoachShell() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const pageLabel = useMemo(() => {
    if (location.pathname.startsWith('/profile')) {
      const label = t('nav.myProfile');
      return label === 'nav.myProfile' ? 'Profile' : label;
    }
    const item = navItems.find((n) => location.pathname.startsWith(n.to));
    if (!item) return t('nav.dashboard');
    return t(`nav.${item.key}`) || item.fallback;
  }, [location.pathname, t]);

  const handleOnboardingDone = useCallback(() => {
    setOnboardingDone(true);
  }, []);

  useEffect(() => {
    return subscribeDataChanged(() => {
      setOnboardingDone(false);
    });
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const sidebar = (
    <>
      <Link className="fc-brand" to="/dashboard" onClick={() => setDrawerOpen(false)}>
        <span className="fc-logo-mark">
          <img src="/favicon.svg" alt="" aria-hidden="true" />
        </span>
        <span>FinCoach</span>
      </Link>

      <nav className="fc-nav" aria-label="Main navigation">
        {navItems.map(({ to, key, fallback, icon: Icon }) => (
          <NavLink key={to} to={to} className="fc-nav-link" onClick={() => setDrawerOpen(false)}>
            <Icon size={20} strokeWidth={2.1} />
            <span>{t(`nav.${key}`) === `nav.${key}` ? fallback : t(`nav.${key}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="fc-sidebar-bottom">
        <button type="button" className="fc-sidebar-action" onClick={toggle}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          </span>
          <span className="fc-switch" aria-hidden="true"><span /></span>
        </button>
        <button
          type="button"
          className="fc-sidebar-action"
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          aria-label="Toggle language"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Languages size={18} />
            {lang === 'fr' ? 'Français' : 'English'}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 6,
            background: 'rgba(118,87,255,0.18)',
            color: 'var(--fc-purple)',
            letterSpacing: '0.5px',
          }}>
            {lang === 'fr' ? 'FR' : 'EN'}
          </span>
        </button>
        <Link className="fc-sidebar-action" to="/profile" onClick={() => setDrawerOpen(false)}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Settings size={18} />
            {t('nav.profile')}
          </span>
        </Link>
        <button type="button" className="fc-sidebar-action" onClick={handleLogout}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <LogOut size={18} />
            {t('nav.signOut')}
          </span>
        </button>
        <div className="fc-user-card">
          <span className="fc-avatar">{getInitials(user)}</span>
          <div className="fc-user-meta">
            <strong>{getName(user)}</strong>
            <span>{user?.email || 'anika@fincoach.app'}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="fc-app">
      <div className="fc-shell">
        <aside className="fc-sidebar">{sidebar}</aside>

        <main className="fc-main">
          <header className="fc-mobile-topbar">
            <button type="button" className="fc-icon-button" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <strong>{pageLabel}</strong>
            <span style={{ width: 44 }} aria-hidden="true" />
          </header>

          <Outlet />
        </main>
      </div>

      {drawerOpen && (
        <>
          <div className="fc-mobile-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="fc-mobile-drawer">
            <button type="button" className="fc-icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ marginLeft: 'auto' }}>
              <X size={18} />
            </button>
            {sidebar}
          </aside>
        </>
      )}

      <FloatingAssistant />
      <OnboardingModal onDone={handleOnboardingDone} visible={!onboardingDone} />
    </div>
  );
}

export function GlobalSearch() {
  return (
    <label className="fc-search">
      <Search size={18} color="var(--fc-muted)" />
      <input placeholder="Search everywhere..." />
    </label>
  );
}
