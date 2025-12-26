// src/pages/admin/Settings.tsx
import { useEffect, useState } from 'react';
import { Moon, Sun, Globe2, DollarSign, Target } from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();

  const [form, setForm] = useState(settings);

  // Settings o'zgarganda formani yangilab turamiz
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Barcha sozlamalarni yangilaymiz (tema, til, valyuta, maqsad)
    updateSettings(form);

    toast({
      title: 'Sozlamalar saqlandi',
      description: 'Tanlangan parametrlar muvaffaqiyatli yangilandi.',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sozlamalar</h1>
        <p className="text-muted-foreground">
          Tizim tilini, valyutani va tashqi ko‘rinishni sozlang
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* UMUMIY */}
        <Card>
          <CardHeader>
            <CardTitle>Umumiy</CardTitle>
            <CardDescription>
              Tizimning asosiy tili va valyutasini tanlang
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Til */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                Til
              </Label>
              <Select
                value={form.language}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tilni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">O‘zbekcha</SelectItem>
                  <SelectItem value="ru">Ruscha</SelectItem>
                  <SelectItem value="en">Inglizcha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valyuta */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Valyuta
              </Label>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Valyutani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZS">UZS (so‘m)</SelectItem>
                  <SelectItem value="USD">USD (AQSH dollari)</SelectItem>
                  <SelectItem value="EUR">EUR (Yevro)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KO‘RINISH VA MAQSADLAR */}
        <Card>
          <CardHeader>
            <CardTitle>Ko‘rinish va maqsadlar</CardTitle>
            <CardDescription>
              Tungi/kunlik rejim va kundalik daromad maqsadini belgilang
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tema (mavzu) */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" />
                Mavzu (tema)
              </Label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, theme: 'light' }))
                  }
                  className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    form.theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Yorug‘ (light)
                  </span>
                  {form.theme === 'light' && (
                    <span className="text-xs text-primary font-medium">
                      Tanlangan
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, theme: 'dark' }))
                  }
                  className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    form.theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Tungi (dark)
                  </span>
                  {form.theme === 'dark' && (
                    <span className="text-xs text-primary font-medium">
                      Tanlangan
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Kundalik daromad maqsadi */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Kundalik daromad maqsadi (so‘m)
              </Label>
              <Input
                type="number"
                min={0}
                value={form.dailyRevenueTarget}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dailyRevenueTarget: Number(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Hisobot va tahlil uchun foydalaniladi.
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