import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/app/Sidebar';

export default function AppLayout() {
  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#050A30', color: '#FAFAFA' }}>
      <Sidebar />
      <Outlet />
    </div>
  );
}
