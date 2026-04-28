import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, Package, Flower2, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-garden-800 border-b border-garden-700 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Flower2 className="text-garden-300" size={24} />
          <span className="font-semibold text-lg text-white">Plant Dashboard</span>
        </div>
        <nav className="flex gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/garden"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <Sprout size={18} />
            <span>Garden</span>
          </NavLink>
          <NavLink
            to="/shed"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <Package size={18} />
            <span>Shed</span>
          </NavLink>
          <NavLink
            to="/greenhouse"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <Flower2 size={18} />
            <span>Greenhouse</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
