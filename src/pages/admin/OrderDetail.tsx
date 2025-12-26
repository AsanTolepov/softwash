import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, CreditCard, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatus } from '@/types';
import { useState } from 'react';
import { formatCurrencyUZS } from '@/lib/utils';

const statusSteps: OrderStatus[] = ['NEW', 'WASHING', 'READY', 'DELIVERED'];

const statusLabels: Record<OrderStatus, string> = {
  NEW: 'Yangi',
  WASHING: 'Yuvishda',
  READY: 'Tayyor',
  DELIVERED: 'Yetkazilgan',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder } = useApp();
  const order = orders.find((o) => o.id === id);
  const [total, setTotal] = useState(order?.payment.total.toString() || '0');
  const [advance, setAdvance] = useState(order?.payment.advance.toString() || '0');

  if (!order) {
    return <div className="text-center py-12">Buyurtma topilmadi</div>;
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrder(order.id, { status: newStatus });
  };

  const handlePaymentUpdate = () => {
    const totalNum = parseFloat(total) || 0;
    const advanceNum = parseFloat(advance) || 0;
    updateOrder(order.id, {
      payment: {
        total: totalNum,
        advance: advanceNum,
        remaining: totalNum - advanceNum,
      },
    });
  };

  const remaining = (parseFloat(total) || 0) - (parseFloat(advance) || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buyurtma {order.id}</h1>
          <p className="text-muted-foreground">
            Yaratilgan sana: {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
          </p>
        </div>
        <StatusBadge status={order.status} className="ml-auto" />
      </div>

      {/* Status Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Buyurtma holati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => handleStatusChange(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStepIndex ? <Check className="h-5 w-5" /> : index + 1}
                </button>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {statusSteps.map((step) => (
              <span key={step}>{statusLabels[step]}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mijoz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Ism familiya:</span>{' '}
              {order.customer.firstName} {order.customer.lastName}
            </p>
            <p>
              <span className="text-muted-foreground">Telefon:</span> {order.customer.phone}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Xizmat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Xizmat turi:</span>{' '}
              {order.details.serviceType}
            </p>
            <p>
              <span className="text-muted-foreground">Buyumlar soni:</span>{' '}
              {order.details.itemCount}
            </p>
            <p>
              <span className="text-muted-foreground">Olish sanasi:</span>{' '}
              {order.details.pickupDate}
            </p>
            {order.details.notes && (
              <p>
                <span className="text-muted-foreground">Izoh:</span> {order.details.notes}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              To‘lov
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Jami (so‘m)</Label>
              <Input type="number" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Oldindan to‘lov (so‘m)</Label>
              <Input
                type="number"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
              />
            </div>
            <p className="text-sm">
              <span className="text-muted-foreground">Qoldiq:</span>{' '}
              {formatCurrencyUZS(remaining)}
            </p>
            <Button onClick={handlePaymentUpdate} className="w-full">
              To‘lovni yangilash
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}