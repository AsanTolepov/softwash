import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { DollarSign, Receipt, ShoppingBag, Users } from 'lucide-react';
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

import { useApp } from '@/contexts/AppContext';
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
import { formatCurrencyUZS } from '@/lib/utils';

export default function Reports() {
  const {
    user,
    getOrdersByCompany,
    getExpensesByCompany,
    getEmployeesByCompany,
  } = useApp();

  const companyId = user?.companyId || '';

  const orders = getOrdersByCompany(companyId);
  const expenses = getExpensesByCompany(companyId);
  const employees = getEmployeesByCompany(companyId);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, o) => sum + o.payment.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - totalExpenses;
    const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
    const activeEmployees = employees.filter((e) => e.isActive).length;

    return {
      revenue,
      totalExpenses,
      profit,
      completedOrders,
      activeEmployees,
    };
  }, [orders, expenses, employees]);

  const chartData = useMemo(() => {
    const data: { date: string; revenue: number; expenses: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');

      const dayOrders = orders.filter(
        (o) => format(new Date(o.createdAt), 'yyyy-MM-dd') === dateKey
      );
      const dayExpenses = expenses.filter((e) => e.date === dateKey);

      data.push({
        date: format(date, 'MMM dd'),
        revenue: dayOrders.reduce((sum, o) => sum + o.payment.total, 0),
        expenses: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    return data;
  }, [orders, expenses]);

  const serviceSummary = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number }>();

    orders.forEach((o) => {
      const type = o.details.serviceType;
      if (!map.has(type)) {
        map.set(type, { orders: 0, revenue: 0 });
      }
      const current = map.get(type)!;
      current.orders += 1;
      current.revenue += o.payment.total;
    });

    const result = Array.from(map.entries()).map(([serviceType, value]) => ({
      serviceType,
      ...value,
    }));

    serviceTypes.forEach((type) => {
      if (!result.find((r) => r.serviceType === type)) {
        result.push({ serviceType: type, orders: 0, revenue: 0 });
      }
    });

    return result.sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hisobotlar</h1>
        <p className="text-muted-foreground">
          Moliyaviy va operatsion ko‘rsatkichlar
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Umumiy daromad"
          value={formatCurrencyUZS(stats.revenue)}
          icon={DollarSign}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Umumiy xarajat"
          value={formatCurrencyUZS(stats.totalExpenses)}
          icon={Receipt}
          iconClassName="bg-destructive/10 text-destructive"
        />
        <StatCard
          title="Sof foyda"
          value={formatCurrencyUZS(stats.profit)}
          icon={DollarSign}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Yakunlangan buyurtmalar"
          value={stats.completedOrders}
          icon={ShoppingBag}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      {/* Revenue vs Expenses chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daromad va xarajatlar (so‘nggi 30 kun)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
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

      {/* Service type summary & staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Xizmatlar bo‘yicha natijalar</CardTitle>
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
                    <TableCell>{formatCurrencyUZS(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xodimlar haqida ma’lumot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Faol xodimlar soni
                </p>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Bu yerda ayni vaqtda &quot;faol&quot; deb belgilangan xodimlar soni
              ko‘rsatiladi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}