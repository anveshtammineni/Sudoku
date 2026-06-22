import type { ReactNode } from 'react';
import { Background3D } from './Background3D';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <Background3D />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
