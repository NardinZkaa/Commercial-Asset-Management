import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('Layout rendered', { sidebarOpen });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <Navigation isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}