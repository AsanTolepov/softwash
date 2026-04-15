// src/components/layouts/CustomerLayout.tsx
import { Outlet, Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold text-foreground tracking-tight">Softwash</h1>
              <p className="text-[11px] text-muted-foreground">Kirxona xizmatlari</p>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="h-8 text-xs rounded-lg">
            <Link to="/login">Tizimga kirish</Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center p-6 pt-8">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground/60">
        © 2026 Softwash — Professional kirxona boshqaruv tizimi
      </footer>
    </div>
  );
}
