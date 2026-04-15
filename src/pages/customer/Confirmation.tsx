// src/pages/customer/Confirmation.tsx
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Phone, ArrowLeft, Clock, MessageSquare, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: MessageSquare,
    title: 'Tekshirish',
    desc:  "Operatorimiz buyurtmangizni ko'rib chiqadi va taxminiy narxni hisoblaydi.",
  },
  {
    icon: Phone,
    title: "Bog'lanish",
    desc:  'Siz bilan bog\'lanib, yakuniy narx va tafsilotlarni tasdiqlaymiz.',
  },
  {
    icon: Package,
    title: 'Tayyor',
    desc:  'Buyumlaringiz belgilangan sanada tayyor bo\'ladi.',
  },
];

export default function Confirmation() {
  const { id } = useParams();

  return (
    <div className="animate-fade-in space-y-5">
      {/* Success hero card */}
      <div className="bg-card rounded-2xl border border-border shadow-card-md overflow-hidden">
        {/* Green gradient strip */}
        <div className="gradient-success px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 shadow-glow-success">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Buyurtma qabul qilindi!</h1>
          <p className="text-white/80 text-sm mt-1">Sizning kir yuvish buyurtmangiz muvaffaqiyatli yuborildi</p>
        </div>

        {/* Order number */}
        <div className="px-6 py-5 text-center border-b border-border">
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-widest font-medium">Buyurtma raqami</p>
          <p className="text-4xl font-bold text-primary tracking-tight">{id}</p>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Keyingi bosqichlar
          </h3>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center',
                    'bg-primary/10 text-primary',
                  )}
                >
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Contact */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center gap-2.5 text-muted-foreground">
          <div className="shrink-0 w-8 h-8 rounded-xl bg-info/10 text-info flex items-center justify-center">
            <Phone className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs leading-relaxed">
            Savollaringiz bormi? Bizga{' '}
            <span className="font-semibold text-foreground">+998 (88) 562-21-06</span> yoki{' '}
            <span className="font-semibold text-foreground">+998 (93) 489-11-17</span> raqamiga qo'ng'iroq qiling.
          </p>
        </div>
      </div>

      {/* CTA */}
      <Button asChild variant="outline" className="w-full h-11 rounded-xl font-medium">
        <Link to="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Yana bir buyurtma berish
        </Link>
      </Button>
    </div>
  );
}
