import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { useI18n } from '@/lib/i18n';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderStatus } from '@/types';
import { formatCurrencyUZS } from '@/lib/utils';

export default function Orders() {
  const navigate = useNavigate();
  const { user, getOrdersByCompany } = useApp();
  const { t } = useI18n();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<OrderStatus | 'ALL'>('ALL');

  const orders = getOrdersByCompany(user?.companyId || '');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      search === '' ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      `${order.customer.firstName} ${order.customer.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.customer.phone.includes(search);
    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t('ordersPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ordersPage.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('ordersPage.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as OrderStatus | 'ALL')
              }
            >
              <TabsList>
                <TabsTrigger value="ALL">
                  {t('ordersPage.tabs.all')}
                </TabsTrigger>
                <TabsTrigger value="NEW">
                  {t('ordersPage.tabs.new')}
                </TabsTrigger>
                <TabsTrigger value="WASHING">
                  {t('ordersPage.tabs.washing')}
                </TabsTrigger>
                <TabsTrigger value="READY">
                  {t('ordersPage.tabs.ready')}
                </TabsTrigger>
                <TabsTrigger value="DELIVERED">
                  {t('ordersPage.tabs.delivered')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('ordersPage.table.id')}</TableHead>
                <TableHead>{t('ordersPage.table.customer')}</TableHead>
                <TableHead>{t('ordersPage.table.service')}</TableHead>
                <TableHead>{t('ordersPage.table.items')}</TableHead>
                <TableHead>{t('ordersPage.table.total')}</TableHead>
                <TableHead>{t('ordersPage.table.status')}</TableHead>
                <TableHead>{t('ordersPage.table.date')}</TableHead>
                <TableHead>
                  {t('ordersPage.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    {order.customer.firstName}{' '}
                    {order.customer.lastName}
                  </TableCell>
                  <TableCell>{order.details.serviceType}</TableCell>
                  <TableCell>{order.details.itemCount}</TableCell>
                  <TableCell>
                    {formatCurrencyUZS(order.payment.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(order.createdAt),
                      'MMM dd, yyyy',
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(`/admin/order/${order.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
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