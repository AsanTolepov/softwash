// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Droplets, ShieldCheck } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Login() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const navigate  = useNavigate();
  const { login } = useApp();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 480));
    const success = login(username, password);
    setIsLoading(false);

    if (success) {
      navigate(username === 'superadmin' ? '/superadmin' : '/admin');
    } else {
      toast({
        variant:     'destructive',
        title:       'Kirish amalga oshmadi',
        description: "Login yoki parol noto'g'ri. Iltimos, qaytadan urinib ko'ring.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow-primary mb-4">
            <Droplets className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Softwash</h1>
          <p className="text-muted-foreground mt-1 text-sm">Professional kirxona boshqaruv tizimi</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card-md overflow-hidden">
          {/* Card header strip */}
          <div className="gradient-primary px-6 py-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white/80" />
            <div>
              <p className="text-sm font-semibold text-white">Qaytib xush kelibsiz!</p>
              <p className="text-xs text-white/70">Davom etish uchun tizimga kiring</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">Login</Label>
              <Input
                id="username"
                type="text"
                placeholder="Loginni kiriting"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Parol</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Parolni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                'w-full h-11 rounded-xl font-semibold text-sm',
                'gradient-primary text-white border-0 shadow-glow-primary',
                'btn-shimmer hover:opacity-90 transition-opacity',
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Tizimga kirilmoqda...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Tizimga kirish
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          © 2026 Softwash — Professional kirxona boshqaruv tizimi
        </p>
      </div>
    </div>
  );
}
