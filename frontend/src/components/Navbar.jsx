import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ChevronDown,
  Languages,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Sun,
  Target,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

const NAV_KEYS = [
  { to: '/dashboard', tKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transactions', tKey: 'nav.transactions', icon: ArrowUpDown },
  { to: '/goals', tKey: 'nav.goals', icon: Target },
  { to: '/assistant', tKey: 'nav.assistant', icon: MessageSquare },
];

function getDisplayName(user) {
  if (!user) return '';
  if (user.name) return user.name;
  if (user.first_name || user.last_name) return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return '';
}

function getInitials(user) {
  const name = getDisplayName(user);
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
}

function Avatar({ user }) {
  return <span className="premium-avatar">{getInitials(user)}</span>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [desktopDrop, setDesktopDrop] = useState(false);
  const [mobileDrop, setMobileDrop] = useState(false);
  const desktopDropRef = useRef(null);
  const mobileDropRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (desktopDropRef.current && !desktopDropRef.current.contains(e.target)) setDesktopDrop(false);
      if (mobileDropRef.current && !mobileDropRef.current.contains(e.target)) setMobileDrop(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function isActive(to) {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  }

  function handleLogout() {
    setDesktopDrop(false);
    setMobileDrop(false);
    logout();
    navigate('/login');
  }

  function handleProfile() {
    setDesktopDrop(false);
    setMobileDrop(false);
    navigate('/profile');
  }

  function toggleLang() {
    setLang(lang === 'fr' ? 'en' : 'fr');
  }

  const userName = getDisplayName(user);

  return (
    <>
      <nav className="top-nav premium-desktop-nav">
        <div className="premium-top-nav-inner">
          <div className="premium-brand">
            <img src="/logo.svg" alt="" aria-hidden="true" />
            <span>FinCoach</span>
          </div>

          <div className="premium-nav-links">
            {NAV_KEYS.map(({ to, tKey, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={`premium-nav-link ${isActive(to) ? 'active' : ''}`}
              >
                <Icon size={15} strokeWidth={2} />
                <span>{t(tKey)}</span>
              </NavLink>
            ))}
          </div>

          <div className="premium-nav-actions">
            <button
              type="button"
              className="premium-icon-button"
              onClick={toggleLang}
              aria-label="Changer la langue"
              title={lang === 'fr' ? 'FR / EN' : 'EN / FR'}
            >
              <Languages size={16} strokeWidth={2} />
              <span>{lang.toUpperCase()}</span>
            </button>
            <button
              type="button"
              className="premium-icon-button"
              onClick={toggle}
              aria-label={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
              title={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
            >
              {theme === 'dark' ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </button>

            <div ref={desktopDropRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="premium-profile-button"
                onClick={() => setDesktopDrop((value) => !value)}
                aria-expanded={desktopDrop}
                aria-label={t('nav.myProfile')}
              >
                <span>{userName || t('nav.profile')}</span>
                <Avatar user={user} />
                <ChevronDown size={15} strokeWidth={2} />
              </button>

              {desktopDrop && (
                <ProfileMenu
                  user={user}
                  t={t}
                  onProfile={handleProfile}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="premium-mobile-nav" ref={mobileDropRef}>
        {mobileDrop && (
          <ProfileMenu
            user={user}
            t={t}
            onProfile={handleProfile}
            onLogout={handleLogout}
            className="premium-menu-mobile"
          >
            <button type="button" className="premium-menu-button" onClick={toggleLang}>
              <Languages size={16} strokeWidth={2} />
              {lang === 'fr' ? 'FR / EN' : 'EN / FR'}
            </button>
            <button type="button" className="premium-menu-button" onClick={toggle}>
              {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
              {theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
            </button>
          </ProfileMenu>
        )}

        <div className="premium-mobile-bar">
          {NAV_KEYS.map(({ to, tKey, icon: Icon }) => {
            const active = isActive(to);
            const label = t(tKey);
            const short = label.length > 10 ? `${label.slice(0, 9)}...` : label;
            return (
              <NavLink
                key={to}
                to={to}
                className={`premium-mobile-link ${active ? 'active' : ''}`}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{short}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            className={`premium-mobile-profile ${mobileDrop ? 'active' : ''}`}
            onClick={() => setMobileDrop((value) => !value)}
            aria-expanded={mobileDrop}
            aria-label={t('nav.profile')}
          >
            <Avatar user={user} />
            <span>{t('nav.profile')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function ProfileMenu({ user, t, onProfile, onLogout, className = '', children }) {
  return (
    <div className={`premium-menu ${className}`}>
      <div className="premium-menu-user">
        <Avatar user={user} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getDisplayName(user)}
          </p>
          <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
        </div>
      </div>
      <div className="premium-menu-actions">
        {children}
        <button type="button" className="premium-menu-button" onClick={onProfile}>
          <UserCircle size={16} strokeWidth={2} />
          {t('nav.myProfile')}
        </button>
        <button type="button" className="premium-menu-button premium-menu-button-danger" onClick={onLogout}>
          <LogOut size={16} strokeWidth={2} />
          {t('nav.signOut')}
        </button>
      </div>
    </div>
  );
}
