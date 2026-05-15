import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Navbar />
      {/* desktop: 24px · mobile: 96px for floating tab bar */}
      <main className="md:pb-6 pb-24">
        <Outlet />
      </main>
    </div>
  );
}
