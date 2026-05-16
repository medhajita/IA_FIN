import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const mainClassName = ['/dashboard', '/transactions'].includes(location.pathname)
    ? 'md:pb-6 pb-24 dashboard-main-content'
    : 'md:pb-6 pb-24';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Navbar />
      {/* desktop: 24px · mobile: 96px for floating tab bar */}
      <main className={mainClassName}>
        <Outlet />
      </main>
    </div>
  );
}
