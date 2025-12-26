import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Package, Phone, User, FileText, Send } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function NewOrder() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { addOrder, companies } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    itemCount: '',
    pickupDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    notes: '',
  });

  const targetCompanyId = companyId || 'company-1';
  const company = companies.find((c) => c.id === targetCompanyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Faqat zarur maydonlarni tekshiramiz (xizmat turi endi kerak emas)
    if (!formData.firstName || !formData.phone || !formData.itemCount) {
      toast({
        variant: 'destructive',
        title: 'Ma’lumotlar yetarli emas',
        description: 'Iltimos, * bilan belgilangan maydonlarni to‘ldiring.',
      });
      return;
    }

    const order = addOrder({
      companyId: targetCompanyId,
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      },
      details: {
        itemCount: parseInt(formData.itemCount),
        // Xizmat turi endi formadan emas, bitta umumiy qiymatdan olinadi
        serviceType: 'Kiyim yuvish',
        notes: formData.notes || undefined,
        pickupDate: formData.pickupDate,
        dateIn: format(new Date(), 'yyyy-MM-dd'),
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
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Yangi kir yuvish buyurtmasi</CardTitle>
        <CardDescription>
          {company
            ? `${company.name} xizmatiga xush kelibsiz. Quyidagi formani to‘ldirib buyurtma yuboring.`
            : 'Buyurtma berish uchun quyidagi ma’lumotlarni to‘ldiring.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mijoz ma’lumotlari */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Mijoz ma’lumotlari
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ism *</Label>
                <Input
                  id="firstName"
                  placeholder="Abbos"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Familiya</Label>
                <Input
                  id="lastName"
                  placeholder="Hamidov"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
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
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Xizmat tafsilotlari */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Xizmat tafsilotlari
            </h3>

            {/* Xizmat turi maydoni olib tashlandi */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCount">Buyumlar soni *</Label>
                <Input
                  id="itemCount"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.itemCount}
                  onChange={(e) =>
                    setFormData({ ...formData, itemCount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupDate" className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Kutilayotgan tayyor bo‘lish sanasi
                </Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupDate: e.target.value })
                  }
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Maxsus ko‘rsatmalar
              </Label>
              <Textarea
                id="notes"
                placeholder="Masalan: nozik mato, haroratda yuvmang va joy..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Send className="h-4 w-4 mr-2" />
            Buyurtma yuborish
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}