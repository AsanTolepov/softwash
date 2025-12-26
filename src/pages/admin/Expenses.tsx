import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { Receipt, Search, Plus, DollarSign } from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatCard } from '@/components/ui/stat-card';
import { formatCurrencyUZS } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { translateTextClient } from '@/services/translate';

export default function Expenses() {
  const { user, getExpensesByCompany, addExpense } = useApp();
  const { toast } = useToast();

  const companyId = user?.companyId || '';

  const expenses = getExpensesByCompany(companyId);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    product: '',
    quantity: '',
    unit: '',
    amount: '',
    notes: '',
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthTotal = expenses
    .filter((e) =>
      isWithinInterval(new Date(e.date), {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }),
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      search === '' ||
      e.product.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  // === YANGI: Xarajat qo'shish va Groq orqali tarjima ===
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    try {
      const productUz = form.product;
      const notesUz = form.notes || '';

      // Agar mahsulot nomi bo'sh bo'lsa, hech bo'lmaganda shuni tekshirib qo'yamiz
      if (!productUz.trim()) {
        toast({
          variant: 'destructive',
          title: 'Ma’lumot yetarli emas',
          description: 'Mahsulot nomini kiriting.',
        });
        return;
      }

      // Groq orqali tarjimalar (hozircha natijani faqat kelajak uchun olamiz,
      // Firestore'ga esa o'zbekchasini saqlayapmiz)
      const [productRu, productEn] = await Promise.all([
        translateTextClient(productUz, 'uz', 'ru'),
        translateTextClient(productUz, 'uz', 'en'),
      ]);

      const notesRu = notesUz
        ? await translateTextClient(notesUz, 'uz', 'ru')
        : '';
      const notesEn = notesUz
        ? await translateTextClient(notesUz, 'uz', 'en')
        : '';

      // Tizimda hozircha Expense.product va Expense.notes oq string,
      // shuning uchun o'zbekcha variantni saqlaymiz.
      // Istasangiz, keyinchalik typelarni {uz,ru,en} formatga o'zgartiramiz.
      addExpense({
        companyId,
        date: form.date,
        product: productUz,
        quantity: Number(form.quantity) || 0,
        unit: form.unit || 'birlik',
        amount: Number(form.amount) || 0,
        notes: notesUz,
      });

      // Formani tozalash va dialogni yopish
      setForm({
        date: format(new Date(), 'yyyy-MM-dd'),
        product: '',
        quantity: '',
        unit: '',
        amount: '',
        notes: '',
      });
      setOpen(false);

      toast({
        title: 'Xarajat qo‘shildi',
        description: 'Yangi xarajat muvaffaqiyatli saqlandi.',
      });
    } catch (error) {
      console.error('Xarajat qo‘shishda xatolik:', error);
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description:
          'Xarajatni qo‘shishda yoki tarjima qilishda xatolik yuz berdi. Keyinroq yana urinib ko‘ring.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Xarajatlar</h1>
          <p className="text-muted-foreground">
            Sarflangan mahsulotlar va xizmatlarni kuzatib boring
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Xarajat qo‘shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi xarajat qo‘shish</DialogTitle>
            </DialogHeader>
            {/* Shu yerda handleAddExpense ishlatiladi */}
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label>Sana</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Mahsulot / xarajat turi</Label>
                <Input
                  value={form.product}
                  onChange={(e) =>
                    setForm({ ...form, product: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Miqdori</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birligi</Label>
                  <Input
                    placeholder="kg, litr, dona..."
                    value={form.unit}
                    onChange={(e) =>
                      setForm({ ...form, unit: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Summasi (so‘m)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Izoh</Label>
                <Input
                  placeholder="Ixtiyoriy izoh..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full">
                Saqlash
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Umumiy xarajat"
          value={formatCurrencyUZS(total)}
          icon={DollarSign}
          iconClassName="bg-destructive/10 text-destructive"
        />
        <StatCard
          title="Bu oy"
          value={formatCurrencyUZS(thisMonthTotal)}
          icon={Receipt}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      {/* Filter + Jadval */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mahsulot yoki izoh bo‘yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Mahsulot / xarajat</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Summasi</TableHead>
                <TableHead>Izoh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.product}</TableCell>
                  <TableCell>
                    {e.quantity} {e.unit}
                  </TableCell>
                  <TableCell>{formatCurrencyUZS(e.amount)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {e.notes}
                  </TableCell>
                </TableRow>
              ))}

              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Xarajatlar topilmadi
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