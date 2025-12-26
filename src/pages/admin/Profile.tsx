import { useState, ChangeEvent } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

export default function Profile() {
  const { user, companies, updateCompany } = useApp();
  const { toast } = useToast();

  // Faqat kompaniya admini uchun
  if (!user || user.type !== 'admin' || !user.companyId) {
    return (
      <div className="text-center text-muted-foreground">
        Profil sahifasi faqat kompaniya adminlari uchun mavjud.
      </div>
    );
  }

  const company = companies.find((c) => c.id === user.companyId);

  if (!company) {
    return (
      <div className="text-center text-muted-foreground">
        Kompaniya ma’lumotlari topilmadi.
      </div>
    );
  }

  const [firstName, setFirstName] = useState(
    company.adminFirstName || 'Admin',
  );
  const [lastName, setLastName] = useState(company.adminLastName || '');
  const [login, setLogin] = useState(company.login);
  const [password, setPassword] = useState(company.password);
  const [avatar, setAvatar] = useState<string | undefined>(
    company.adminAvatar,
  );

  const initials =
    (firstName?.[0] || 'A').toUpperCase() +
    (lastName?.[0] || '').toUpperCase();

  // Rasm yuklash
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Rasmni o'chirish
  const handleAvatarDelete = () => {
    setAvatar(undefined);
    updateCompany(company.id, { adminAvatar: undefined });

    toast({
      title: 'Rasm olib tashlandi',
      description: 'Profil rasmi muvaffaqiyatli o‘chirildi.',
    });
  };

  // Barcha ma'lumotlarni saqlash
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateCompany(company.id, {
      adminFirstName: firstName,
      adminLastName: lastName,
      login,
      password,
      adminAvatar: avatar,
    });

    toast({
      title: 'Profil saqlandi',
      description: 'Profil ma’lumotlari muvaffaqiyatli yangilandi.',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground">
          Shaxsiy ma’lumotlaringizni va hisob ma’lumotlarini o‘zgartiring
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shaxsiy ma'lumotlar */}
        <Card>
          <CardHeader>
            <CardTitle>Shaxsiy ma’lumotlar</CardTitle>
            <CardDescription>
              Ismingiz, familiyangiz va profil rasmini o‘zgartiring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              {/* Avatar blok */}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20">
                  {avatar && (
                    <AvatarImage src={avatar} alt="Profil rasmi" />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-center gap-1">
                  <Label
                    htmlFor="avatar"
                    className="cursor-pointer text-xs text-primary underline"
                  >
                    Rasm yuklash
                  </Label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleAvatarDelete}
                      className="text-xs text-destructive underline"
                    >
                      Rasmni o‘chirish
                    </button>
                  )}
                </div>
              </div>

              {/* Ism / familiya */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="space-y-2">
                  <Label>Ism</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Familiya</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hisob ma'lumotlari */}
        <Card>
          <CardHeader>
            <CardTitle>Hisob ma’lumotlari</CardTitle>
            <CardDescription>
              Kirish uchun login va parolni bu yerdan o‘zgartirishingiz
              mumkin
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Login</Label>
              <Input value={login} onChange={(e) => setLogin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Parol</Label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Eslatma: bu login va parol orqali kompaniya boshqaruv
                paneliga kiriladi.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">O‘zgarishlarni saqlash</Button>
        </div>
      </form>
    </div>
  );
}