import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowUpDown,
  Target, MessageSquare, Sun, Moon, LogOut, UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

const NAV_KEYS = [
  { to: '/dashboard',    tKey: 'nav.dashboard',    icon: LayoutDashboard },
  { to: '/transactions', tKey: 'nav.transactions',  icon: ArrowUpDown },
  { to: '/goals',        tKey: 'nav.goals',         icon: Target },
  { to: '/assistant',    tKey: 'nav.assistant',     icon: MessageSquare },
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
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Avatar({ user, size = 28, fontSize = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--blue)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, letterSpacing: '0.03em', flexShrink: 0,
      userSelect: 'none',
    }}>
      {getInitials(user)}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [desktopDrop, setDesktopDrop] = useState(false);
  const [mobileDrop, setMobileDrop]   = useState(false);
  const desktopDropRef = useRef(null);
  const mobileDropRef  = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (desktopDropRef.current && !desktopDropRef.current.contains(e.target)) setDesktopDrop(false);
      if (mobileDropRef.current  && !mobileDropRef.current.contains(e.target))  setMobileDrop(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  function isActive(to) {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  }

  const langSegment = {
    wrap: {
      display: 'flex', alignItems: 'center',
      background: 'var(--bg-tertiary)',
      borderRadius: 20, padding: 3, gap: 2,
      border: '1px solid var(--border)',
    },
    btn: (active) => ({
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      padding: '4px 11px', borderRadius: 16, border: 'none',
      background: active ? 'var(--blue)' : 'transparent',
      color: active ? '#fff' : 'var(--text-secondary)',
      cursor: 'pointer', transition: 'all 0.18s',
      boxShadow: active ? '0 1px 4px rgba(74,124,246,0.30)' : 'none',
      lineHeight: 1,
    }),
  };

  return (
    <>
      {/* ══ DESKTOP TOP NAV (md+) ═════════════════ */}
      <nav className="top-nav hidden md:block">
        <div style={{ width: 'min(1680px, calc(100% - clamp(48px, 8vw, 144px)))', margin: '0 auto', position: 'relative', display: 'flex', alignItems: 'center', height: 56 }}>

          {/* Left — Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img src="/favicon.svg" alt="" aria-hidden="true" style={{ width: 34, height: 34, display: 'block', filter: 'drop-shadow(0 8px 18px rgba(74,124,246,0.22))' }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              FinCoach
            </span>
          </div>

          {/* Center — Nav links */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            {NAV_KEYS.map(({ to, tKey, icon: Icon }) => {
              const active = isActive(to);
              return (
                <NavLink key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 13px', borderRadius: 'var(--radius-sm)',
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  color: active ? 'var(--blue)' : 'var(--text-secondary)',
                  background: active ? 'var(--blue-bg)' : 'transparent',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                  <Icon size={14} strokeWidth={1.75} />
                  {t(tKey)}
                </NavLink>
              );
            })}
          </div>

          {/* Right — Lang toggle + Theme toggle + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>

            {/* Lang switcher */}
            <div style={langSegment.wrap}>
              <button onClick={() => setLang('fr')} style={langSegment.btn(lang === 'fr')}>FR</button>
              <button onClick={() => setLang('en')} style={langSegment.btn(lang === 'en')}>EN</button>
            </div>

            {/* Theme toggle */}
            <button onClick={toggle} style={{
              background: 'none', border: 'none', padding: 4,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {theme === 'dark'
                ? <Sun  size={22} strokeWidth={1.75} color="var(--orange)" />
                : <Moon size={22} strokeWidth={1.75} color="var(--blue)"   />}
            </button>

            {/* Avatar dropdown */}
            <div ref={desktopDropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDesktopDrop((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Avatar user={user} size={32} fontSize={12} />
              </button>

              {desktopDrop && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)', minWidth: 220,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={user} size={40} fontSize={15} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {getDisplayName(user)}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 4 }}>
                    <button
                      onClick={handleProfile}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', background: 'none', border: 'none',
                        borderRadius: 10, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                        textAlign: 'left', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <UserCircle size={14} strokeWidth={1.75} />
                      {t('nav.myProfile')}
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', background: 'none', border: 'none',
                        borderRadius: 10, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, color: 'var(--red-text)',
                        textAlign: 'left', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={14} strokeWidth={1.75} />
                      {t('nav.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══ MOBILE BOTTOM TAB BAR (<md) ═══════════ */}
      <div className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--bg-secondary)', paddingBottom: 10 }}>

        {mobileDrop && (
          <div
            ref={mobileDropRef}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)', minWidth: 200,
              boxShadow: '0 -4px 24px rgba(0,0,0,0.16)', zIndex: 110, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar user={user} size={38} fontSize={14} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getDisplayName(user)}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            {/* Lang switcher in mobile dropdown */}
            <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
              <div style={langSegment.wrap}>
                <button onClick={() => setLang('fr')} style={langSegment.btn(lang === 'fr')}>FR</button>
                <button onClick={() => setLang('en')} style={langSegment.btn(lang === 'en')}>EN</button>
              </div>
            </div>
            {/* Theme toggle in mobile dropdown */}
            <button
              onClick={toggle}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', background: 'none', border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                color: 'var(--text-primary)', textAlign: 'left',
              }}
            >
              {theme === 'dark'
                ? <Sun  size={14} strokeWidth={1.75} color="var(--orange)" />
                : <Moon size={14} strokeWidth={1.75} color="var(--blue)"   />}
              {theme === 'dark' ? t('nav.lightMode') || 'Mode clair' : t('nav.darkMode') || 'Mode sombre'}
            </button>
            <div style={{ padding: 4 }}>
              <button
                onClick={handleProfile}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', background: 'none', border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <UserCircle size={14} strokeWidth={1.75} />
                {t('nav.myProfile')}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', background: 'none', border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: 'var(--red-text)',
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14} strokeWidth={1.75} />
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        )}

        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: 22,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-around',
          padding: '6px 4px 8px',
          margin: '0 10px',
        }}>
          {NAV_KEYS.map(({ to, tKey, icon: Icon }) => {
            const active = isActive(to);
            const label  = t(tKey);
            // Shorten label for mobile tab bar
            const short  = label.length > 9 ? label.slice(0, 8) + '…' : label;
            return (
              <NavLink key={to} to={to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 10px', borderRadius: 14, textDecoration: 'none',
                background: active ? 'var(--blue-bg)' : 'transparent',
                transition: 'background 0.15s', minWidth: 52,
              }}>
                <Icon size={20} strokeWidth={1.5} color={active ? 'var(--blue)' : 'var(--text-secondary)'} />
                <span style={{
                  fontSize: 9.5, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--blue)' : 'var(--text-secondary)',
                  letterSpacing: '0.01em', lineHeight: 1,
                }}>
                  {short}
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setMobileDrop((v) => !v)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 10px', borderRadius: 14, background: mobileDrop ? 'var(--blue-bg)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'background 0.15s', minWidth: 52,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: mobileDrop ? 'var(--blue)' : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8.5, fontWeight: 700, color: mobileDrop ? '#fff' : 'var(--text-secondary)',
              letterSpacing: '0.03em',
            }}>
              {getInitials(user)}
            </div>
            <span style={{
              fontSize: 9.5, fontWeight: mobileDrop ? 600 : 500,
              color: mobileDrop ? 'var(--blue)' : 'var(--text-secondary)',
              letterSpacing: '0.01em', lineHeight: 1,
            }}>
              {t('nav.profile')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
