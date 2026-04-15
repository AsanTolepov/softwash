// src/pages/admin/Orders.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
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
  const { user, getOrdersByCompany, deleteOrder } = useApp();
  const { t } = useI18n();
  const { toast } = useToast();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const isStaff          = user?.type === 'staff';
  const staffPermissions = isStaff ? user.permissions : undefined;
  const canViewOrders    = !isStaff || !!staffPermissions?.canViewOrders;
  const canManageOrders  = !isStaff || !!staffPermissions?.canManageOrders;

  if (!canViewOrders) {
    return (
      <div className="text-center text-muted-foreground py-16">
        Sizda buyurtmalar bo'limini ko'rish huquqi yo'q.
      </div>
    );
  }

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

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Ushbu buyurtmani o'chirmoqchimisiz?");
    if (!ok) return;
    await deleteOrder(id);
    toast({ title: "Buyurtma o'chirildi", description: "Buyurtma muvaffaqiyatli o'chirildi." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('ordersPage.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('ordersPage.subtitle')}</p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('ordersPage.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'ALL')}>
                <TabsList className="h-9">
                  <TabsTrigger value="ALL"    className="text-xs px-3">{t('ordersPage.tabs.all')}</TabsTrigger>
                  <TabsTrigger value="NEW"    className="text-xs px-3">{t('ordersPage.tabs.new')}</TabsTrigger>
                  <TabsTrigger value="WASHING" className="text-xs px-3">{t('ordersPage.tabs.washing')}</TabsTrigger>
                  <TabsTrigger value="READY"  className="text-xs px-3">{t('ordersPage.tabs.ready')}</TabsTrigger>
                  <TabsTrigger value="DELIVERED" className="text-xs px-3">{t('ordersPage.tabs.delivered')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs">{t('ordersPage.table.id')}</TableHead>
                <TableHead className="text-xs">{t('ordersPage.table.customer')}</TableHead>
                <TableHead className="text-xs">{t('ordersPage.table.service')}</TableHead>
                <TableHead className="text-xs">{t('ordersPage.table.items')}</TableHead>
                <TableHead className="text-xs">{t('ordersPage.table.total')}</TableHead>
                <TableHead className="text-xs">{t('ordersPage.table.status')}</TableHead>
                <TableHead className="text-xs">{t('ordersPage.table.date')}</TableHead>
                <TableHead className="text-xs pr-4">{t('ordersPage.table.actions') || 'Amallar'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => navigate(`/admin/order/${order.id}`)}
                >
                  <TableCell className="pl-6 font-mono text-xs font-medium text-primary">
                    {order.id}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {order.customer.firstName} {order.customer.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.details.serviceType}
                  </TableCell>
                  <TableCell className="text-sm">
                    {order.details.itemCount}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {formatCurrencyUZS(order.payment.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell className="pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={() => navigate(`/admin/order/${order.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {canManageOrders && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">
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
