import { ReactNode, useEffect } from 'react'
import { useUIStore } from '../../stores/useUIStore'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import BottomSheet from '../ui/BottomSheet'
import LegalDisclaimer from '../ui/LegalDisclaimer'
import AccessibilityMenu from '../ui/AccessibilityMenu'
interface AppShellProps {
  children: ReactNode
  onShowAuth?: () => void
}

export default function AppShell({ children, onShowAuth }: AppShellProps) {
  const { fontSize, reducedMotion, readableFont, highContrast, sidebarOpen, toggleSidebar } = useUIStore()

  // Apply accessibility font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
  }, [fontSize])

  // BUG FIX: Reset mobile sheet state when resizing to desktop.
  // Without this, sidebarOpen could remain true on desktop after a mobile open,
  // causing the BottomSheet to be open on a screen where the sidebar is always visible.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sidebarOpen) {
        toggleSidebar()
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [sidebarOpen, toggleSidebar])

  return (
    <div
      className={[
        'oracle-bg min-h-dvh flex flex-col',
        reducedMotion ? 'reduce-motion' : '',
        readableFont ? 'readable-font' : '',
        highContrast ? 'high-contrast' : '',
      ].join(' ')}
      style={{ paddingBottom: '40px' }}
    >
      {/* Sticky navigation */}
      <Navigation onShowAuth={onShowAuth} />

      {/* Layout: sidebar + main */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/*
          DESKTOP SIDEBAR — always visible on md+.
          Uses CSS `hidden md:flex` — NOT controlled by JS sidebarOpen state.
          This is the key fix for the resize bug: CSS controls visibility on desktop,
          not the JS boolean that drives the mobile BottomSheet.
        */}
        <aside
          className="hidden md:flex flex-shrink-0 flex-col overflow-y-auto border-l border-border-custom"
          style={{
            width: 'var(--sidebar-width)',
            maxHeight: 'calc(100dvh - var(--nav-height) - 40px)',
            background: 'var(--surface)',
          }}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: 'calc(100dvh - var(--nav-height) - 40px)' }}
        >
          {children}
        </main>
      </div>

      {/*
        MOBILE BOTTOM SHEET — only rendered on mobile.
        sidebarOpen JS state only affects this component.
        The md:hidden wrapper ensures the sheet never interferes on desktop.
      */}
      <div className="md:hidden">
        <BottomSheet
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          title="הגדרות סימולציה"
        >
          <Sidebar />
        </BottomSheet>
      </div>

      <AccessibilityMenu />
      <LegalDisclaimer />
    </div>
  )
}
