import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Phone, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Confirmation() {
  const { id } = useParams();

  return (
    <Card className="animate-fade-in text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Buyurtma qabul qilindi!</h1>
        <p className="text-muted-foreground">Sizning kir yuvish buyurtmangiz qabul qilindi</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Sizning buyurtma raqamingiz</p>
          <p className="text-3xl font-bold text-primary">{id}</p>
        </div>

        <div className="space-y-3 text-left p-4 bg-card border rounded-lg">
          <h3 className="font-medium text-foreground">Keyingi bosqichlar</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                1
              </span>
              <span>Operatorimiz buyurtmangizni ko‘rib chiqadi va taxminiy narxni hisoblaydi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                2
              </span>
              <span>Siz bilan bog‘lanib, yakuniy narx va tafsilotlarni tasdiqlaymiz.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5">
                3
              </span>
              <span>Buyumlaringiz belgilangan sanada tayyor bo‘ladi.</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span className="text-sm">
            Savollaringiz bormi? Bizga +998 (88) 562-21-06 yoki +998 (93) 489-11-17 raqamiga qo‘ng‘iroq qiling.
          </span>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link to="/new-order">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Yana bir buyurtma berish
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}