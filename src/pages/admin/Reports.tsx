// src/pages/admin/Reports.tsx
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import {
  DollarSign,
  Receipt,
  ShoppingBag,
  Users,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useI18n } from '@/lib/i18n';
import { serviceTypes } from '@/data/mockData';

import { StatCard } from '@/components/ui/stat-card';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrencyUZS } from '@/lib/utils';

export default function Reports() {
  const {
    user,
    getOrdersByCompany,
    getExpensesByCompany,
    getEmployeesByCompany,
  } = useApp();
  const { t } = useI18n();

  const companyId = user?.companyId || '';

  const orders = getOrdersByCompany(companyId);
  const expenses = getExpensesByCompany(companyId);
  const employees = getEmployeesByCompany(companyId);

  // Statistika
  const stats = useMemo(() => {
    const revenue = orders.reduce(
      (sum, o) => sum + o.payment.total,
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const profit = revenue - totalExpenses;
    const completedOrders = orders.filter(
      (o) => o.status === 'DELIVERED',
    ).length;
    const activeEmployees = employees.filter((e) => e.isActive)
      .length;

    return {
      revenue,
      totalExpenses,
      profit,
      completedOrders,
      activeEmployees,
    };
  }, [orders, expenses, employees]);

  // Grafik uchun ma'lumot
  const chartData = useMemo(() => {
    const data: { date: string; revenue: number; expenses: number }[] =
      [];

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');

      const dayOrders = orders.filter(
        (o) =>
          format(new Date(o.createdAt), 'yyyy-MM-dd') === dateKey,
      );
      const dayExpenses = expenses.filter(
        (e) => e.date === dateKey,
      );

      data.push({
        date: format(date, 'MMM dd'),
        revenue: dayOrders.reduce(
          (sum, o) => sum + o.payment.total,
          0,
        ),
        expenses: dayExpenses.reduce(
          (sum, e) => sum + e.amount,
          0,
        ),
      });
    }

    return data;
  }, [orders, expenses]);

  // Xizmatlar bo‘yicha qisqacha hisobot
  const serviceSummary = useMemo(() => {
    const map = new Map<
      string,
      { orders: number; revenue: number }
    >();

    orders.forEach((o) => {
      const type = o.details.serviceType;
      if (!map.has(type)) {
        map.set(type, { orders: 0, revenue: 0 });
      }
      const current = map.get(type)!;
      current.orders += 1;
      current.revenue += o.payment.total;
    });

    const result = Array.from(map.entries()).map(
      ([serviceType, value]) => ({
        serviceType,
        ...value,
      }),
    );

    // Agar serviceTypes massivida bor, lekin bu kompaniyada ishlatilmagan bo‘lsa ham, nol bilan ko‘rsatamiz
    serviceTypes.forEach((type) => {
      if (!result.find((r) => r.serviceType === type)) {
        result.push({
          serviceType: type,
          orders: 0,
          revenue: 0,
        });
      }
    });

    return result.sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('reportsPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('reportsPage.subtitle')}
        </p>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('reportsPage.stats.revenue')}
          value={formatCurrencyUZS(stats.revenue)}
          icon={DollarSign}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title={t('reportsPage.stats.expenses')}
          value={formatCurrencyUZS(stats.totalExpenses)}
          icon={Receipt}
          iconClassName="bg-destructive/10 text-destructive"
        />
        <StatCard
          title={t('reportsPage.stats.profit')}
          value={formatCurrencyUZS(stats.profit)}
          icon={DollarSign}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title={t('reportsPage.stats.completedOrders')}
          value={stats.completedOrders}
          icon={ShoppingBag}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      {/* Daromad / Xarajat grafik */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reportsPage.chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <YAxis
                  className="text-xs"
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                  formatter={(value: any, name: string) => [
                    formatCurrencyUZS(Number(value)),
                    name === 'revenue' ? 'Daromad' : 'Xarajat',
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === 'revenue' ? 'Daromad' : 'Xarajat'
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="expenses"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Xizmatlar va xodimlar bo‘yicha qisqacha ma’lumot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Xizmatlar */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('reportsPage.servicePerformanceTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xizmat turi</TableHead>
                  <TableHead>Buyurtmalar</TableHead>
                  <TableHead>Daromad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceSummary.map((row) => (
                  <TableRow key={row.serviceType}>
                    <TableCell>{row.serviceType}</TableCell>
                    <TableCell>{row.orders}</TableCell>
                    <TableCell>
                      {formatCurrencyUZS(row.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Xodimlar */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('reportsPage.staffOverviewTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('reportsPage.staffActiveLabel')}
                </p>
                <p className="text-2xl font-bold">
                  {stats.activeEmployees}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Bu yerda ayni vaqtda &quot;faol&quot; deb belgilangan xodimlar
              soni ko‘rsatiladi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}