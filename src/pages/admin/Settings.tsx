// src/pages/admin/Settings.tsx
import { useEffect, useState } from 'react';
import {
  Moon,
  Sun,
  Globe2,
  DollarSign,
  LayoutDashboard,
  ShieldCheck,
  CalendarDays,
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

  // Contextdagi settings o'zgarsa, formani yangilab turamiz
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
                  <SelectItem value="uz">O'zbekcha</SelectItem>
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
                    UZS (so'm)
                  </SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buyurtma sozlamalari */}
            <div className="col-span-full border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <CalendarDays className="h-4 w-4 text-primary" />
                Buyurtma sozlamalari
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* processingDays */}
                <div className="space-y-2">
                  <Label>Ishlash kunlari (kechikish)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={form.processingDays ?? 3}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        processingDays: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Buyurtma qabul qilinganidan necha ish kunidan keyin yuvish boshlanadi (default: 3)
                  </p>
                </div>

                {/* dailyOrderLimit */}
                <div className="space-y-2">
                  <Label>Kunlik buyurtma chegarasi</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={form.dailyOrderLimit ?? 100}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        dailyOrderLimit: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Bir kunda qabul qilinadigan maksimal buyurtmalar soni (default: 100)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KO'RINISH VA DASHBOARD MAVZUSI */}
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
              {t('settingsPage.permissions.title')}
            </CardTitle>
            <CardDescription>
              {t('settingsPage.permissions.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                {t('settingsPage.permissions.notAdmin')}
              </p>
            )}

            {isAdmin && employees.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('settingsPage.permissions.noEmployees')}
              </p>
            )}

            {isAdmin && employees.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('settingsPage.permissions.colEmployee')}</TableHead>
                      <TableHead>{t('settingsPage.permissions.colSections')}</TableHead>
                      <TableHead>{t('settingsPage.permissions.colActions')}</TableHead>
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
                                  checked={perms.canViewDashboard}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canViewDashboard', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelDashboard')}</span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={perms.canViewOrders}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canViewOrders', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelOrders')}</span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={perms.canViewEmployees}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canViewEmployees', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelEmployees')}</span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={perms.canViewExpenses}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canViewExpenses', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelExpenses')}</span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={perms.canViewReports}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canViewReports', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelReports')}</span>
                              </label>

                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={perms.canViewSettings}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canViewSettings', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelSettings')}</span>
                              </label>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[220px]">
                            <div className="flex flex-col gap-2 text-xs">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={perms.canManageOrders}
                                  onChange={(e) =>
                                    handlePermissionChange(emp.id, 'canManageOrders', e.target.checked)
                                  }
                                />
                                <span>{t('settingsPage.permissions.labelManageOrders')}</span>
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