import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function CustomerLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">PC</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">
                PureClean Kirxonasi
              </h1>
              <p className="text-sm text-muted-foreground">
                Mijozlar uchun onlayn buyurtma shakli
              </p>
            </div>
          </div>

          {/* Login tugmasi */}
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      
    </div>
  );
}