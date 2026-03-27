import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex" style={{ overflowX: 'hidden', minHeight: '100vh', width: '100vw', minWidth: 0 }}>
      <Sidebar />
      <main className="flex-1" style={{ marginLeft: 280, minWidth: 0, width: 'calc(100vw - 280px)', background: '#f7f8fa' }}>
        {children}
      </main>
    </div>
  );
}
