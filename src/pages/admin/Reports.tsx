// src/pages/admin/Reports.tsx
import { useMemo, useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Wallet,
  Receipt,
  CheckCircle2,
  Download,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useI18n } from '@/lib/i18n';
import { exportReportToExcel } from '@/lib/exportExcel';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrencyUZS } from '@/lib/utils';

// Xarajat kategoriyalari
const EXPENSE_CATEGORIES = [
  { key: 'ijara',    label: "Ijara to'lovi",                    emoji: '🏢' },
  { key: 'kommunal', label: 'Kommunal xizmatlar',               emoji: '💡' },
  { key: 'jihozlar', label: 'Jihozlar / Kir yuvish vositalari', emoji: '🧴' },
  { key: 'oylik',    label: 'Xodimlar oyligi',                  emoji: '👷' },
  { key: 'boshqa',   label: 'Boshqa xarajatlar',                emoji: '📦' },
] as const;

// Oldindan belgilangan davr variantlari
const PERIOD_PRESETS = [
  { label: 'Bu oy',         value: 'thisMonth' },
  { label: 'O\'tgan oy',    value: 'lastMonth' },
  { label: 'So\'nggi 2 oy', value: 'last2Months' },
  { label: 'So\'nggi 3 oy', value: 'last3Months' },
  { label: 'So\'nggi 30 kun', value: 'last30Days' },
  { label: 'Maxsus sana',   value: 'custom' },
] as const;

type PeriodPreset = typeof PERIOD_PRESETS[number]['value'];

function getDateRange(preset: PeriodPreset, customFrom: string, customTo: string) {
  const today = new Date();
  switch (preset) {
    case 'thisMonth':
      return {
        from: format(startOfMonth(today), 'yyyy-MM-dd'),
        to:   format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'lastMonth': {
      const last = subMonths(today, 1);
      return {
        from: format(startOfMonth(last), 'yyyy-MM-dd'),
        to:   format(endOfMonth(last), 'yyyy-MM-dd'),
      };
    }
    case 'last2Months':
      return {
        from: format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd'),
        to:   format(today, 'yyyy-MM-dd'),
      };
    case 'last3Months':
      return {
        from: format(startOfMonth(subMonths(today, 2)), 'yyyy-MM-dd'),
        to:   format(today, 'yyyy-MM-dd'),
      };
    case 'last30Days':
      return {
        from: format(subDays(today, 29), 'yyyy-MM-dd'),
        to:   format(today, 'yyyy-MM-dd'),
      };
    case 'custom':
      return { from: customFrom, to: customTo };
    default:
      return { from: format(startOfMonth(today), 'yyyy-MM-dd'), to: format(today, 'yyyy-MM-dd') };
  }
}

// ─── Export dialogi ───────────────────────────────────────────────────────

function ExportDialog({
  orders,
  expenses,
  companyName,
}: {
  orders: ReturnType<typeof Array.prototype.filter>;
  expenses: ReturnType<typeof Array.prototype.filter>;
  companyName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodPreset>('thisMonth');
  const [customFrom, setCustomFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [customTo,   setCustomTo]   = useState(format(new Date(), 'yyyy-MM-dd'));
  const [includeOrders,   setIncludeOrders]   = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [includeSummary,  setIncludeSummary]  = useState(true);
  const [loading, setLoading] = useState(false);

  const { from, to } = getDateRange(period, customFrom, customTo);

  // Filtrlangan yozuvlar soni (preview)
  const previewOrders   = (orders as any[]).filter((o: any) => {
    const d = o.details?.dateIn || o.createdAt?.slice(0, 10);
    return d >= from && d <= to;
  });
  const previewExpenses = (expenses as any[]).filter((e: any) => e.date >= from && e.date <= to);

  const handleExport = async () => {
    setLoading(true);
    try {
      exportReportToExcel(orders as any, expenses as any, {
        dateFrom:        from,
        dateTo:          to,
        includeOrders,
        includeExpenses,
        includeSummary,
        companyName,
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Excel yuklab olish
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Hisobot eksport sozlamalari
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">

          {/* Davr tanlash */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Hisobot davri
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PERIOD_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${period === p.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/40 hover:bg-muted/60'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Dan</Label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Gacha</Label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Davr preview */}
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              📅 {from} → {to} &nbsp;|&nbsp;
              <strong>{previewOrders.length}</strong> ta buyurtma,{' '}
              <strong>{previewExpenses.length}</strong> ta xarajat
            </div>
          </div>

          {/* Ma'lumot tanlash */}
          <div className="space-y-3">
            <Label className="font-medium">Qaysi ma'lumotlarni eksport qilish?</Label>
            <div className="space-y-2">
              {[
                { label: 'Umumiy hisobot (daromad, foyda, xulosa)', state: includeSummary,  set: setIncludeSummary },
                { label: 'Buyurtmalar ro\'yxati',                    state: includeOrders,   set: setIncludeOrders },
                { label: 'Xarajatlar ro\'yxati',                     state: includeExpenses, set: setIncludeExpenses },
              ].map(({ label, state, set }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all
                      ${state ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}
                    onClick={() => set(!state)}
                  >
                    {state && (
                      <svg viewBox="0 0 10 10" className="h-3 w-3" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.5 5l2.5 2.5 4.5-4" />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm text-foreground cursor-pointer select-none"
                    onClick={() => set(!state)}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Eksport tugmasi */}
          <Button
            className="w-full"
            onClick={handleExport}
            disabled={loading || (!includeSummary && !includeOrders && !includeExpenses)}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Tayyorlanmoqda...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Excel (.xlsx) yuklab olish
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Davlat soliq qo'mitasiga taqdim etish uchun yaroqli format
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Asosiy komponent ─────────────────────────────────────────────────────

export default function Reports() {
  const {
    user,
    getOrdersByCompany,
    getExpensesByCompany,
    getEmployeesByCompany,
    companies,
  } = useApp();
  const { t } = useI18n();

  const companyId = user?.companyId || '';
  const company   = companies.find((c) => c.id === companyId);

  const orders    = getOrdersByCompany(companyId);
  const expenses  = getExpensesByCompany(companyId);
  const employees = getEmployeesByCompany(companyId);

  // ── Asosiy statistika ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const revenue      = orders.reduce((sum, o) => sum + o.payment.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit       = revenue - totalExpenses;
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
    const activeEmployees = employees.filter((e) => e.isActive).length;

    return { revenue, totalExpenses, profit, completedOrders, activeEmployees };
  }, [orders, expenses, employees]);

  // ── Kategoriyalar bo'yicha xarajatlar ────────────────────────────────────
  const expenseByCategory = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => {
      const catExpenses = expenses.filter(
        (e) => (e.category ?? 'boshqa') === cat.key,
      );
      return {
        ...cat,
        total: catExpenses.reduce((s, e) => s + e.amount, 0),
        count: catExpenses.length,
      };
    }).filter((row) => row.total > 0);
  }, [expenses]);

  // ── Grafik uchun ma'lumot (30 kun) ───────────────────────────────────────
  const chartData = useMemo(() => {
    const data: { date: string; revenue: number; expenses: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date    = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');

      const dayRevenue  = orders
        .filter((o) => format(new Date(o.createdAt), 'yyyy-MM-dd') === dateKey)
        .reduce((s, o) => s + o.payment.total, 0);

      const dayExpenses = expenses
        .filter((e) => e.date === dateKey)
        .reduce((s, e) => s + e.amount, 0);

      data.push({ date: format(date, 'dd/MM'), revenue: dayRevenue, expenses: dayExpenses });
    }
    return data;
  }, [orders, expenses]);

  const isProfit = stats.profit >= 0;

  return (
    <div className="space-y-6">
      {/* Sarlavha + Eksport tugmasi */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('reportsPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('reportsPage.subtitle')}
          </p>
        </div>

        <ExportDialog
          orders={orders}
          expenses={expenses}
          companyName={company?.name}
        />
      </div>

      {/* ── 1. Daromad + Yakunlangan buyurtmalar ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Daromad */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('reportsPage.stats.revenue')}
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {formatCurrencyUZS(stats.revenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Barcha yetkazilgan va to'langan buyurtmalar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yakunlangan buyurtmalar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {t('reportsPage.stats.completedOrders')}
                </p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {stats.completedOrders}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jami {orders.length} ta buyurtmadan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. Xarajatlar tafsiloti ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-destructive" />
            {t('reportsPage.expenseBreakdownTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {t('reportsPage.expenseBreakdownNoData')}
            </p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {expenseByCategory.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{row.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.count} ta yozuv</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-destructive">
                    {formatCurrencyUZS(row.total)}
                  </p>
                </div>
              ))}

              {/* Jami xarajat */}
              <div className="flex items-center justify-between py-3 pt-4">
                <p className="text-sm font-bold text-foreground">Jami xarajat</p>
                <p className="text-base font-bold text-destructive">
                  {formatCurrencyUZS(stats.totalExpenses)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Sof foyda ─────────────────────────────────────────────────── */}
      <Card className={`border-2 ${isProfit ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 ${
              isProfit ? 'bg-success/15' : 'bg-destructive/15'
            }`}>
              {isProfit
                ? <TrendingUp  className="h-7 w-7 text-success" />
                : <TrendingDown className="h-7 w-7 text-destructive" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('reportsPage.netProfitLabel')}
                </p>
                {isProfit && <CheckCircle2 className="h-4 w-4 text-success" />}
              </div>
              <p className={`text-3xl font-bold mt-1 ${isProfit ? 'text-success' : 'text-destructive'}`}>
                {formatCurrencyUZS(stats.profit)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrencyUZS(stats.revenue)} (daromad) −{' '}
                {formatCurrencyUZS(stats.totalExpenses)} (xarajat)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Grafik ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reportsPage.chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M`
                    : v >= 1000    ? `${(v / 1000).toFixed(0)}K`
                    : String(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    background:   'hsl(var(--card))',
                    border:       '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize:     '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrencyUZS(value),
                    name === 'revenue' ? 'Daromad' : 'Xarajat',
                  ]}
                />
                <Line type="monotone" dataKey="revenue"  stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
              <span className="text-xs text-muted-foreground">Daromad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
              <span className="text-xs text-muted-foreground">Xarajat</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
