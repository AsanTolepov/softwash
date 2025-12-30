// src/pages/admin/Settings.tsx
import { useEffect, useState } from 'react';
import {
  Moon,
  Sun,
  Globe2,
  DollarSign,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EmployeePermissions } from '@/types';

const defaultPermissions: EmployeePermissions = {
  canViewDashboard: false,

  canViewOrders: false,
  canManageOrders: false,

  canViewEmployees: false,
  canManageEmployees: false,

  canViewExpenses: false,
  canManageExpenses: false,

  canViewReports: false,

  canViewSettings: false,
};

export default function Settings() {
  const {
    settings,
    updateSettings,
    user,
    getEmployeesByCompany,
    updateEmployee,
  } = useApp();
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

  // Faqat kompaniya admini xodim ruxsatlarini boshqaradi
  const isAdmin = user?.type === 'admin' && user.companyId;
  const employees = isAdmin
    ? getEmployeesByCompany(user!.companyId!)
    : [];

  const handlePermissionChange = (
    employeeId: string,
    key: keyof EmployeePermissions,
    value: boolean,
  ) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const current: EmployeePermissions = {
      ...defaultPermissions,
      ...(emp.permissions || {}),
    };

    const updated: EmployeePermissions = {
      ...current,
      [key]: value,
    };

    updateEmployee(employeeId, { permissions: updated });
  };

  return (
    <div className="space-y-6 max-w-5xl">
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
                  <SelectItem value="UZS">
                    UZS (so‘m)
                  </SelectItem>
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
                      {t(
                        'settingsPage.dashboardThemeClassic',
                      )}
                    </span>
                    {form.dashboardTheme ===
                      'classic' && (
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
                      {t(
                        'settingsPage.dashboardThemeCompact',
                      )}
                    </span>
                    {form.dashboardTheme ===
                      'compact' && (
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
                      {t(
                        'settingsPage.dashboardThemeCards',
                      )}
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

        {/* XODIM RUXSATLARI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Xodim ruxsatlari
            </CardTitle>
            <CardDescription>
              Qaysi xodim saytning qaysi bo‘limlarini ko‘rishi va
              ayniqsa <b>buyurtmalarni boshqarishi</b> mumkinligini
              shu yerdan belgilang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                Xodim ruxsatlarini faqat kompaniya admini boshqarishi
                mumkin.
              </p>
            )}

            {isAdmin && employees.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Hozircha hech qanday xodim yo‘q. Avval “Xodimlar”
                bo‘limida xodimlarni qo‘shing.
              </p>
            )}

            {isAdmin && employees.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Xodim</TableHead>
                      <TableHead>
                        Bo‘limlar (ko‘rish)
                      </TableHead>
                      <TableHead>
                        Buyurtmalar bo‘yicha amallar
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const perms: EmployeePermissions = {
                        ...defaultPermissions,
                        ...(emp.permissions || {}),
                      };

                      return (
                        <TableRow key={emp.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="font-medium">
                              {emp.firstName}{' '}
                              {emp.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {emp.role.uz ||
                                emp.role.ru ||
                                emp.role.en ||
                                ''}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[260px]">
                            <div className="flex flex-wrap gap-3 text-xs">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canViewDashboard
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canViewDashboard',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Dashboard
                                </span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canViewOrders
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canViewOrders',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Buyurtmalar
                                </span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canViewEmployees
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canViewEmployees',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Xodimlar
                                </span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canViewExpenses
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canViewExpenses',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Xarajatlar
                                </span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canViewReports
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canViewReports',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Hisobotlar
                                </span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canViewSettings
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canViewSettings',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Sozlamalar
                                </span>
                              </label>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[220px]">
                            <div className="flex flex-col gap-2 text-xs">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={
                                    perms.canManageOrders
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      emp.id,
                                      'canManageOrders',
                                      e.target.checked,
                                    )
                                  }
                                />
                                <span>
                                  Buyurtmalarni boshqarish
                                  (status, to‘lov,
                                  o‘chirish)
                                </span>
                              </label>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
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