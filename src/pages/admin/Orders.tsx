import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderStatus } from '@/types';
import { formatCurrencyUZS } from '@/lib/utils';

export default function Orders() {
  const navigate = useNavigate();
  const { user, getOrdersByCompany } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const orders = getOrdersByCompany(user?.companyId || '');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      search === '' ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.phone.includes(search);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Buyurtmalar</h1>
        <p className="text-muted-foreground">Mijoz buyurtmalarini boshqaring</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ID, ism yoki telefon bo‘yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'ALL')}>
              <TabsList>
                <TabsTrigger value="ALL">Barchasi</TabsTrigger>
                <TabsTrigger value="NEW">Yangi</TabsTrigger>
                <TabsTrigger value="WASHING">Yuvishda</TabsTrigger>
                <TabsTrigger value="READY">Tayyor</TabsTrigger>
                <TabsTrigger value="DELIVERED">Yetkazilgan</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyurtma raqami</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead>Xizmat</TableHead>
                <TableHead>Buyumlar soni</TableHead>
                <TableHead>Jami</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    {order.customer.firstName} {order.customer.lastName}
                  </TableCell>
                  <TableCell>{order.details.serviceType}</TableCell>
                  <TableCell>{order.details.itemCount}</TableCell>
                  <TableCell>{formatCurrencyUZS(order.payment.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/order/${order.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Buyurtmalar topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}