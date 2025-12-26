import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useApp();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password);
    setIsLoading(false);

    if (success) {
      if (username === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/admin');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Kirish amalga oshmadi',
        description: 'Login yoki parol noto‘g‘ri. Iltimos, qaytadan urinib ko‘ring.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-2xl">PC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">PureClean Kirxonasi</h1>
          <p className="text-muted-foreground mt-1">Boshqaruv paneli</p>
        </div>

        {/* Login Card */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle>Qaytib xush kelibsiz</CardTitle>
            <CardDescription>Davom etish uchun tizimga kiring</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Login</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Loginni kiriting"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Parolni kiriting"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Demo hisoblar:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Superadmin:</span> superadmin / superadmin
                </p>
                <p>
                  <span className="font-medium">Kompaniya (CleanWave):</span> cleanwave / clean123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}