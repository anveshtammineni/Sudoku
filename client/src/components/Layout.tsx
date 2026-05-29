import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-game-grid text-white">{children}</div>;
}
