import { useMemo } from 'react';
import { ShoppingBag, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrencyUZS } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, getOrdersByCompany } = useApp();
  const orders = getOrdersByCompany(user?.companyId || '');

  const stats = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentOrders = orders.filter((o) => isAfter(new Date(o.createdAt), thirtyDaysAgo));

    return {
      newOrders: recentOrders.filter((o) => o.status === 'NEW').length,
      washing: recentOrders.filter((o) => o.status === 'WASHING').length,
      ready: recentOrders.filter((o) => o.status === 'READY').length,
      revenue: recentOrders.reduce((sum, o) => sum + o.payment.total, 0),
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOrders = orders.filter((o) => format(new Date(o.createdAt), 'yyyy-MM-dd') === dateStr);
      data.push({
        date: format(date, 'MMM dd'),
        revenue: dayOrders.reduce((sum, o) => sum + o.payment.total, 0),
        orders: dayOrders.length,
      });
    }
    return data;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Boshqaruv paneli</h1>
        <p className="text-muted-foreground">Kir yuvish biznesingiz bo‘yicha qisqacha statistika</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Yangi buyurtmalar" value={stats.newOrders} icon={ShoppingBag} iconClassName="bg-info/10 text-info" />
        <StatCard title="Yuvish jarayonida" value={stats.washing} icon={Clock} iconClassName="bg-warning/10 text-warning" />
        <StatCard title="Tayyor" value={stats.ready} icon={CheckCircle} iconClassName="bg-success/10 text-success" />
        <StatCard title="Daromad (30 kun)" value={formatCurrencyUZS(stats.revenue)} icon={DollarSign} iconClassName="bg-primary/10 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>So‘nggi 30 kunlik kunlik daromad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                  }}
                  formatter={(value: any) => [formatCurrencyUZS(Number(value)), 'Daromad']}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}