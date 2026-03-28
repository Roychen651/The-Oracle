import { ReactNode, useEffect } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import LegalDisclaimer from '../ui/LegalDisclaimer';
import AccessibilityMenu from '../ui/AccessibilityMenu';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { fontSize, reducedMotion, readableFont, highContrast } = useUIStore();

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return (
    <div
      className={`
        min-h-screen flex flex-col
        ${reducedMotion ? 'reduce-motion' : ''}
        ${readableFont ? 'readable-font' : ''}
        ${highContrast ? 'high-contrast' : ''}
      `}
      style={{ paddingBottom: '40px' }}
    >
      {/* Top Navigation */}
      <Navigation />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (right in RTL = rendered last in DOM but visually right) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px - 40px)' }}>
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebarOverlay />

      {/* Accessibility menu */}
      <AccessibilityMenu />

      {/* Legal footer */}
      <LegalDisclaimer />
    </div>
  );
}

function MobileSidebarOverlay() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <div className="md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        onClick={toggleSidebar}
      />
      {/* Sidebar positioned fixed */}
      <div className="fixed top-16 right-0 z-40 h-[calc(100vh-64px-40px)] overflow-y-auto w-80 bg-surface border-l border-border-custom">
        <Sidebar />
      </div>
    </div>
  );
}
