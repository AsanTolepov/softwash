// src/pages/admin/Settings.tsx
import { useEffect, useState } from 'react';
import {
  Moon,
  Sun,
  Globe2,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();

  const [form, setForm] = useState(settings);

  // Contextdagi settings o‘zgarsa, formani yangilab turamiz
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);

    toast({
      title: t('settingsPage.toasts.savedTitle'),
      description: t('settingsPage.toasts.savedDescription'),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('settingsPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('settingsPage.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* UMUMIY */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('settingsPage.generalTitle')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.generalDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Til */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                {t('settingsPage.languageLabel')}
              </Label>
              <Select
                value={form.language}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    language: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'settingsPage.languageLabel',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz">O‘zbekcha</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valyuta */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                {t('settingsPage.currencyLabel')}
              </Label>
              <Select
                value={form.currency}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    currency: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'settingsPage.currencyLabel',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZS">UZS (so‘m)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KO‘RINISH VA DASHBOARD MAVZUSI */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('settingsPage.appearanceTitle')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.appearanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tema (light/dark) */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" />
                {t('settingsPage.themeLabel')}
              </Label>

              <div className="space-y-2">
                {/* Light */}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      theme: 'light',
                    }))
                  }
                  className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    form.theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t('settingsPage.lightTheme')}
                  </span>
                  {form.theme === 'light' && (
                    <span className="text-xs text-primary font-medium">
                      {t('settingsPage.selectedLabel')}
                    </span>
                  )}
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      theme: 'dark',
                    }))
                  }
                  className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    form.theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t('settingsPage.darkTheme')}
                  </span>
                  {form.theme === 'dark' && (
                    <span className="text-xs text-primary font-medium">
                      {t('settingsPage.selectedLabel')}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Dashboard Mavzusi */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-primary" />
                {t('settingsPage.dashboardThemeLabel')}
              </Label>
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  {/* Classic */}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        dashboardTheme: 'classic',
                      }))
                    }
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                      form.dashboardTheme === 'classic'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <span>
                      {t('settingsPage.dashboardThemeClassic')}
                    </span>
                    {form.dashboardTheme === 'classic' && (
                      <span className="text-xs text-primary font-medium">
                        {t('settingsPage.selectedLabel')}
                      </span>
                    )}
                  </button>

                  {/* Compact */}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        dashboardTheme: 'compact',
                      }))
                    }
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                      form.dashboardTheme === 'compact'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <span>
                      {t('settingsPage.dashboardThemeCompact')}
                    </span>
                    {form.dashboardTheme === 'compact' && (
                      <span className="text-xs text-primary font-medium">
                        {t('settingsPage.selectedLabel')}
                      </span>
                    )}
                  </button>

                  {/* Cards */}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        dashboardTheme: 'cards',
                      }))
                    }
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                      form.dashboardTheme === 'cards'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <span>
                      {t('settingsPage.dashboardThemeCards')}
                    </span>
                    {form.dashboardTheme === 'cards' && (
                      <span className="text-xs text-primary font-medium">
                        {t('settingsPage.selectedLabel')}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settingsPage.dashboardThemeHint')}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            {t('settingsPage.saveButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}