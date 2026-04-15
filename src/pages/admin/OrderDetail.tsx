// src/pages/admin/OrderDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Package,
  CreditCard,
  Check,
  Clock,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { OrderStatus, ClothingType, ClothingColor, LaundryService } from '@/types';
import { formatCurrencyUZS } from '@/lib/utils';
import { formatReadyTime } from '@/lib/estimateReadyTime';

// ─── Label xaritalari ─────────────────────────────────────────────────────────

const statusSteps: OrderStatus[] = ['NEW', 'WASHING', 'READY', 'DELIVERED'];

const statusLabels: Record<OrderStatus, string> = {
  NEW:       'Yangi',
  WASHING:   'Yuvishda',
  READY:     'Tayyor',
  DELIVERED: 'Yetkazilgan',
};

const clothingTypeLabels: Record<ClothingType, string> = {
  REGULAR:     '👕 Oddiy kiyim',
  JACKET_COAT: '🧥 Kurtka / Palto',
  BLANKET:     '🛏️ Odealo / Adyol',
  CURTAIN:     '🪟 Parda',
  SUIT:        '👔 Kostyum / Shim',
};

const colorLabels: Record<ClothingColor, string> = {
  BRIGHT:  '🌈 Yorqin rang',
  DARK:    '🖤 To\'q rang',
  NEUTRAL: '🎨 Aralash',
};

const serviceLabels: Record<LaundryService, string> = {
  WASHING:  '🫧 Yuvish',
  DRYING:   '💨 Quritish',
  CHEMICAL: '🧪 Kimyoviy ishlov',
  IRONING:  '♨️ Dazmollash',
};

// ─── Komponent ───────────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, orders, updateOrder } = useApp();
  const order = orders.find((o) => o.id === id);
  const [total, setTotal] = useState(order?.payment.total.toString() || '0');
  const [advance, setAdvance] = useState(order?.payment.advance.toString() || '0');

  const isStaff        = user?.type === 'staff';
  const canManageOrders = !isStaff || !!user?.permissions?.canManageOrders;

  if (!order) {
    return <div className="text-center py-12">Buyurtma topilmadi</div>;
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!canManageOrders) return;
    updateOrder(order.id, { status: newStatus });
  };

  const handlePaymentUpdate = () => {
    if (!canManageOrders) return;
    const totalNum   = parseFloat(total) || 0;
    const advanceNum = parseFloat(advance) || 0;
    updateOrder(order.id, {
      payment: { total: totalNum, advance: advanceNum, remaining: totalNum - advanceNum },
    });
  };

  const remaining = (parseFloat(total) || 0) - (parseFloat(advance) || 0);

  // Taxminiy tayyor vaqt
  const estimatedReadyAt = order.details.estimatedReadyAt
    ? new Date(order.details.estimatedReadyAt)
    : null;

  return (
    <div className="space-y-6">

      {/* ── Sarlavha ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Buyurtma {order.id}
            {order.details.isUrgent && (
              <Badge variant="destructive" className="ml-2 text-xs align-middle">
                <Zap className="h-3 w-3 mr-1" />
                Zudlik
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            Yaratilgan: {format(new Date(order.createdAt), 'dd.MM.yyyy HH:mm')}
          </p>
        </div>
        <StatusBadge status={order.status} className="ml-auto" />
      </div>

      {/* ── Tayyor vaqt banneri ─────────────────────────────────────────── */}
      {estimatedReadyAt && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Taxminiy tayyor bo'lish vaqti</p>
            <p className="text-base font-semibold text-primary">
              {formatReadyTime(estimatedReadyAt)}
            </p>
          </div>
        </div>
      )}

      {/* ── Status qadamlari ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Buyurtma holati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex items-center">
                <button
                  type="button"
                  disabled={!canManageOrders}
                  onClick={() => handleStatusChange(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${index <= currentStepIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                    ${!canManageOrders ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
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
          {!canManageOrders && (
            <p className="mt-3 text-xs text-muted-foreground">
              Eslatma: Sizda buyurtma holatini o'zgartirish huquqi yo'q.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Mijoz ───────────────────────────────────────────────────────── */}
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
              <span className="text-muted-foreground">Telefon:</span>{' '}
              {order.customer.phone}
            </p>
          </CardContent>
        </Card>

        {/* ── Xizmat tafsilotlari ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Xizmat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">

            {/* Kiyim turi */}
            {order.details.clothingType && (
              <p>
                <span className="text-muted-foreground">Kiyim turi:</span>{' '}
                {clothingTypeLabels[order.details.clothingType]}
              </p>
            )}

            {/* Rang */}
            {order.details.color && order.details.clothingType === 'REGULAR' && (
              <p>
                <span className="text-muted-foreground">Rang:</span>{' '}
                {colorLabels[order.details.color]}
              </p>
            )}

            {/* Kir darajasi */}
            {order.details.dirtyLevel && order.details.clothingType === 'REGULAR' && (
              <p>
                <span className="text-muted-foreground">Kir darajasi:</span>{' '}
                {'★'.repeat(order.details.dirtyLevel)}
                {'☆'.repeat(5 - order.details.dirtyLevel)}{' '}
                ({order.details.dirtyLevel}/5)
              </p>
            )}

            {/* Xizmatlar */}
            {order.details.services && order.details.services.length > 0 ? (
              <div>
                <span className="text-muted-foreground">Xizmatlar:</span>{' '}
                <div className="flex flex-wrap gap-1 mt-1">
                  {order.details.services.map((svc) => (
                    <Badge key={svc} variant="secondary" className="text-xs">
                      {serviceLabels[svc] ?? svc}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p>
                <span className="text-muted-foreground">Xizmat turi:</span>{' '}
                {order.details.serviceType}
              </p>
            )}

            {/* Buyumlar soni */}
            <p>
              <span className="text-muted-foreground">Buyumlar soni:</span>{' '}
              {order.details.itemCount} ta
            </p>

            {/* Zudlik */}
            {order.details.isUrgent && (
              <p className="flex items-center gap-1 text-yellow-600 font-medium">
                <Zap className="h-3 w-3" />
                Zudlik bilan (+50%)
              </p>
            )}

            {/* Izoh */}
            {order.details.notes && (
              <p>
                <span className="text-muted-foreground">Izoh:</span>{' '}
                {order.details.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── To'lov ──────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              To'lov
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Jami (so'm)</Label>
              <Input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                disabled={!canManageOrders}
              />
            </div>
            <div className="space-y-2">
              <Label>Oldindan to'lov (so'm)</Label>
              <Input
                type="number"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                disabled={!canManageOrders}
              />
            </div>
            <p className="text-sm">
              <span className="text-muted-foreground">Qoldiq:</span>{' '}
              {formatCurrencyUZS(remaining)}
            </p>
            <Button
              onClick={handlePaymentUpdate}
              className="w-full"
              disabled={!canManageOrders}
            >
              To'lovni yangilash
            </Button>
            {!canManageOrders && (
              <p className="text-xs text-muted-foreground">
                Sizda to'lov summasini o'zgartirish huquqi yo'q.
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
