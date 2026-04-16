// src/pages/customer/NewOrder.tsx
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Phone, User, FileText, Send, Clock, Zap, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ClothingType, ClothingColor, LaundryService } from '@/types';
import { estimateReadyTime, formatReadyTime } from '@/lib/estimateReadyTime';

// ─── Konstantlar ─────────────────────────────────────────────────────────────

const CLOTHING_TYPES: { value: ClothingType; label: string; emoji: string }[] = [
  { value: 'REGULAR', label: 'Oddiy kiyim', emoji: '👕' },
  { value: 'JACKET_COAT', label: 'Kurtka / Palto', emoji: '🧥' },
  { value: 'BLANKET', label: 'Odealo / Adyol', emoji: '🛏️' },
  { value: 'CURTAIN', label: 'Parda', emoji: '🪟' },
  { value: 'SUIT', label: 'Kostyum / Shim', emoji: '👔' },
];

const COLORS: {
  value: ClothingColor;
  label: string;
  emoji: string;
  hint: string;
}[] = [
    { value: 'BRIGHT', label: 'Yorqin rang', emoji: '🌈', hint: 'Qizil, sariq, oq, yashil...' },
    { value: 'DARK', label: "To'q rang", emoji: '🖤', hint: "Qora, jigarrang, to'q ko'k..." },
    { value: 'NEUTRAL', label: 'Aralash', emoji: '🎨', hint: 'Kulrang, bej va boshqalar' },
  ];

const SERVICES: { value: LaundryService; label: string; emoji: string }[] = [
  { value: 'WASHING', label: 'Yuvish', emoji: '🫧' },
  { value: 'DRYING', label: 'Quritish', emoji: '💨' },
  { value: 'CHEMICAL', label: 'Kimyoviy ishlov', emoji: '🧪' },
  { value: 'IRONING', label: 'Dazmollash', emoji: '♨️' },
];

const DIRTY_LEVELS = [
  { value: 1, label: 'Ozgina' },
  { value: 2, label: 'Biroz' },
  { value: 3, label: "O'rtacha" },
  { value: 4, label: 'Kir' },
  { value: 5, label: 'Juda kir' },
];

// Rang palitralari — har bir kategoriya uchun aniq ranglar
const COLOR_SWATCHES: Record<ClothingColor, { hex: string; name: string }[]> = {
  BRIGHT: [
    { hex: '#ef4444', name: 'Qizil' },
    { hex: '#facc15', name: 'Sariq' },
    { hex: '#f1f5f9', name: 'Oq' },
    { hex: '#22c55e', name: 'Yashil' },
    { hex: '#f97316', name: "To'q sariq" },
    { hex: '#ec4899', name: 'Pushti' },
    { hex: '#38bdf8', name: 'Moviy' },
  ],
  DARK: [
    { hex: '#1e293b', name: 'Qora' },
    { hex: '#78350f', name: 'Jigarrang' },
    { hex: '#1e3a5f', name: "To'q ko'k" },
    { hex: '#1e2756', name: 'Donaber' },
    { hex: '#14532d', name: "To'q yashil" },
    { hex: '#7f1d1d', name: "To'q qizil" },
  ],
  NEUTRAL: [
    { hex: '#9ca3af', name: 'Kulrang' },
    { hex: '#d4a373', name: 'Bej' },
    { hex: '#e5e7eb', name: 'Och kulrang' },
    { hex: '#b5a286', name: 'Xaki' },
  ],
};

// ─── Komponent ───────────────────────────────────────────────────────────────

export default function NewOrder() {
  const { companyId: companyIdParam } = useParams();
  const navigate = useNavigate();
  const { addOrder, companies, settings, orders } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    itemCount: '1',
    notes: '',
    clothingType: 'REGULAR' as ClothingType,
    color: 'NEUTRAL' as ClothingColor,
    specificColor: '',          // Tanlangan aniq rang hex kodi
    dirtyLevel: 1,
    services: ['WASHING'] as LaundryService[],
    isUrgent: false,
    hasTear: false,
    tearLocation: '',
  });

  const [isAgreed, setIsAgreed] = useState(false);

  const effectiveCompanyId = useMemo(() => {
    if (companyIdParam) return companyIdParam;
    if (companies.length > 0) return companies[0].id;
    return null;
  }, [companyIdParam, companies]);

  const company = useMemo(
    () =>
      effectiveCompanyId
        ? companies.find((c) => c.id === effectiveCompanyId)
        : undefined,
    [effectiveCompanyId, companies],
  );

  // ── Bugungi buyurtmalar sonini hisoblash ──────────────────────────────────
  const todayOrderCount = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return orders.filter(
      (o) => o.companyId === effectiveCompanyId &&
        o.createdAt.startsWith(todayStr)
    ).length;
  }, [orders, effectiveCompanyId]);

  // ── Rang bo'yicha aktiv buyurtmalar soni ──────────────────────────────────
  const colorOrderCounts = useMemo(() => {
    const relevant = orders.filter(
      (o) => o.companyId === effectiveCompanyId &&
        (o.status === 'NEW' || o.status === 'WASHING')
    );
    return {
      BRIGHT: relevant.filter((o) => o.details.color === 'BRIGHT').length,
      DARK: relevant.filter((o) => o.details.color === 'DARK').length,
      NEUTRAL: relevant.filter((o) => o.details.color === 'NEUTRAL').length,
    };
  }, [orders, effectiveCompanyId]);

  // ── Tayyor vaqtni real-time hisoblash ─────────────────────────────────────
  const estimatedReadyAt = useMemo(() => {
    return estimateReadyTime({
      clothingType: formData.clothingType,
      color: formData.color,
      dirtyLevel: formData.dirtyLevel,
      services: formData.services,
      isUrgent: formData.isUrgent,
      itemCount: Math.max(1, parseInt(formData.itemCount) || 1),
      processingDays: settings.processingDays,
      todayOrderCount,
      dailyOrderLimit: settings.dailyOrderLimit,
    });
  }, [
    formData.clothingType,
    formData.color,
    formData.dirtyLevel,
    formData.services,
    formData.isUrgent,
    formData.itemCount,
    settings.processingDays,
    settings.dailyOrderLimit,
    todayOrderCount,
  ]);

  const readyTimeLabel = formatReadyTime(estimatedReadyAt);

  // ── Xizmat toggle ─────────────────────────────────────────────────────────
  const toggleService = (svc: LaundryService) => {
    setFormData((prev) => {
      const has = prev.services.includes(svc);
      if (has && svc === 'WASHING') return prev; // Yuvish olib tashlanmaydi
      return {
        ...prev,
        services: has
          ? prev.services.filter((s) => s !== svc)
          : [...prev.services, svc],
      };
    });
  };

  // ── Forma yuborish ────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveCompanyId) {
      toast({
        variant: 'destructive',
        title: 'Kompaniya topilmadi',
        description: 'Buyurtma berish uchun tizim sozlamalaridan kamida bitta kompaniya yarating.',
      });
      return;
    }

    if (!formData.firstName || !formData.phone || !formData.itemCount) {
      toast({
        variant: 'destructive',
        title: "Ma'lumotlar yetarli emas",
        description: "Iltimos, * bilan belgilangan maydonlarni to'ldiring.",
      });
      return;
    }

    const serviceLabel = formData.services
      .map((s) => SERVICES.find((x) => x.value === s)?.label ?? s)
      .join(', ');

    const order = addOrder({
      companyId: effectiveCompanyId,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      },
      details: {
        itemCount: parseInt(formData.itemCount, 10),
        serviceType: serviceLabel,
        services: formData.services,
        clothingType: formData.clothingType,
        color: formData.color,
        dirtyLevel: formData.dirtyLevel,
        isUrgent: formData.isUrgent,
        estimatedReadyAt: estimatedReadyAt.toISOString(),
        notes: formData.notes || undefined,
        pickupDate: format(estimatedReadyAt, 'yyyy-MM-dd'),
        dateIn: format(new Date(), 'yyyy-MM-dd'),
        hasTear: formData.hasTear || undefined,
        tearLocation: formData.hasTear ? (formData.tearLocation || undefined) : undefined,
        specificColor: formData.specificColor || undefined,
      },
      payment: {
        total: 0,
        advance: 0,
        remaining: 0,
      },
      status: 'NEW',
    });

    navigate(`/confirmation/${order.id}`);
  };


  return (
    <div className="bg-card rounded-2xl border border-border shadow-card-md overflow-hidden animate-fade-in">
      {/* Gradient header strip */}
      <div className="gradient-primary px-6 py-5">
        <h2 className="text-lg font-bold text-white tracking-tight">Yangi kir yuvish buyurtmasi</h2>
        <p className="text-white/70 text-sm mt-0.5">
          {company
            ? `${company.name} xizmatiga xush kelibsiz`
            : "Quyidagi formani to'ldirib buyurtma yuboring"}
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-7">

          {/* ── Mijoz ma'lumotlari ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Mijoz ma'lumotlari
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ism *</Label>
                <Input
                  id="firstName"
                  placeholder="Abbos"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Familiya</Label>
                <Input
                  id="lastName"
                  placeholder="Hamidov"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Telefon raqam *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+998 ** *** ** **"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* ── Kiyim turi ────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Kiyim turi *</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CLOTHING_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      clothingType: ct.value,
                      color: formData.color,
                      dirtyLevel: formData.dirtyLevel,
                    })
                  }
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-150
                    ${formData.clothingType === ct.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/70'
                    }`}
                >
                  <span className="text-lg">{ct.emoji}</span>
                  <span>{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Rang ──────────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Kiyim rangi *</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {COLORS.map((cl) => (
                <button
                  key={cl.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: cl.value, specificColor: '' })
                  }
                  className={`flex flex-col items-start p-3 rounded-xl border text-sm transition-all duration-150
                    ${formData.color === cl.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/70'
                    }`}
                >
                  <span className="text-base mb-1">{cl.emoji} {cl.label}</span>
                  <span className="text-xs text-muted-foreground">{cl.hint}</span>
                </button>
              ))}
            </div>

            {/* Rang palitralari — tanlanuvchi swatch'lar */}
            {formData.color && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                <p className="text-xs font-medium text-foreground">
                  Kiyimning aynan qanday rangi? (ixtiyoriy — bir xil rangli kiyimlar birgalikda yuviladi)
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {COLOR_SWATCHES[formData.color].map((swatch) => {
                    const isSelected = formData.specificColor === swatch.hex;
                    // Oq rang uchun qoʻshimcha chegara
                    const isLight = swatch.hex === '#f1f5f9' || swatch.hex === '#e5e7eb';
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        title={swatch.name}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            specificColor: isSelected ? '' : swatch.hex,
                          })
                        }
                        className={`relative h-9 w-9 rounded-full transition-all duration-150
                          ${isSelected
                            ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-lg'
                            : 'hover:scale-105 hover:shadow-md'
                          }
                          ${isLight ? 'border border-border' : ''}
                        `}
                        style={{ backgroundColor: swatch.hex }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg
                              viewBox="0 0 12 12"
                              className="h-4 w-4 drop-shadow"
                              fill="none"
                              stroke={isLight ? '#374151' : 'white'}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tanlangan rang nomi va buyurtmalar soni */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formData.specificColor
                      ? <>
                        Tanlangan:{' '}
                        <strong className="text-foreground">
                          {COLOR_SWATCHES[formData.color].find(
                            (s) => s.hex === formData.specificColor,
                          )?.name ?? formData.specificColor}
                        </strong>
                      </>
                      : 'Aniq rang tanlanmagan (ixtiyoriy)'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bu kategoriyada:{' '}
                    <strong className="text-foreground">
                      {colorOrderCounts[formData.color]}
                    </strong>{' '}
                    ta aktiv buyurtma
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Kir darajasi ──────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Kir darajasi *</h3>
            <div className="flex gap-2 flex-wrap">
              {DIRTY_LEVELS.map((dl) => (
                <button
                  key={dl.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, dirtyLevel: dl.value })}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150
                    ${formData.dirtyLevel === dl.value
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/70'
                    }`}
                >
                  {'★'.repeat(dl.value)}{'☆'.repeat(5 - dl.value)} {dl.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Kiyimning yirtig'i ───────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              Kiyimning yirtig'i bormi?
            </h3>
            <div className="flex gap-2">
              {[
                { value: false, label: "Yo'q", emoji: '✅' },
                { value: true, label: 'Ha', emoji: '⚠️' },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, hasTear: opt.value, tearLocation: '' })
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150
                    ${formData.hasTear === opt.value
                      ? 'border-primary bg-primary/10 text-primary shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/70'
                    }`}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {formData.hasTear && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="tearLocation">Aynan qanday joyida?</Label>
                <Textarea
                  id="tearLocation"
                  placeholder="Masalan: chap qo'ltiq ostida, tirsakda, yoqasida..."
                  value={formData.tearLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, tearLocation: e.target.value })
                  }
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* ── Xizmatlar ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Xizmatlar *</h3>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((svc) => {
                const isSelected = formData.services.includes(svc.value);
                const isRequired = svc.value === 'WASHING';
                return (
                  <button
                    key={svc.value}
                    type="button"
                    onClick={() => toggleService(svc.value)}
                    disabled={isRequired}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all duration-150
                      ${isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/70'
                      }
                      ${isRequired ? 'opacity-70 cursor-default' : ''}
                    `}
                  >
                    <span className="text-base">{svc.emoji}</span>
                    <span>{svc.label}</span>
                    {isRequired && (
                      <Badge variant="secondary" className="ml-auto text-xs py-0">
                        Asosiy
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Buyumlar soni + Zudlik ────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemCount">Buyumlar soni *</Label>
              <Input
                id="itemCount"
                type="number"
                min="1"
                placeholder="1"
                value={formData.itemCount}
                onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                Zudlik bilan (Срочно)
              </Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={formData.isUrgent}
                  onCheckedChange={(v) => setFormData({ ...formData, isUrgent: v })}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.isUrgent ? (
                    <span className="text-yellow-600 font-medium">+50% narx qo'shiladi</span>
                  ) : (
                    'Oddiy navbat'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ── Izoh ──────────────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Maxsus ko'rsatmalar
            </Label>
            <Textarea
              id="notes"
              placeholder="Masalan: nozik mato, sovuq suvda yuvish..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          {/* ── Tayyor vaqt (dinamik) ─────────────────────────────────────── */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Taxminiy tayyor bo'lish vaqti
              </p>
              <p className="text-lg font-semibold text-primary mt-0.5">
                {readyTimeLabel}
              </p>
              {formData.isUrgent && (
                <p className="text-xs text-muted-foreground mt-1">
                  ⚡ Zudlik buyurtmasi ustuvor navbatda yuviladi
                </p>
              )}
            </div>
          </div>

          {/* ── Oferta (T&C) ──────────────────────────────────────────────── */}
          <div className="flex items-center space-x-3 px-1 py-1">
            <Checkbox
              id="isAgreed"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked === true)}
              className="h-5 w-5 rounded-md border-primary data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="isAgreed"
              className="text-sm font-medium leading-none cursor-pointer select-none"
            >
              Ommaviy <a href="/beliy_parus_oferta.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Oferta</a> shartnamalariga roziman
            </Label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 rounded-xl font-semibold gradient-primary text-white border-0 shadow-glow-primary btn-shimmer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isAgreed}
          >
            <Send className="h-4 w-4 mr-2" />
            Buyurtma yuborish
          </Button>

        </form>
      </div>
    </div>
  );
}
