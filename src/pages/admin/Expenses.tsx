import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import {
  Receipt,
  Search,
  Plus,
  DollarSign,
  Trash2,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

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
import { translateTextClient } from '@/services/translate';

export default function Expenses() {
  const {
    user,
    getExpensesByCompany,
    addExpense,
    deleteExpense,
  } = useApp();
  const { toast } = useToast();
  const { t } = useI18n();

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

  // Xarajat qo'shish + Groq tarjimasi
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    try {
      const productUz = form.product;
      const notesUz = form.notes || '';

      if (!productUz.trim()) {
        toast({
          variant: 'destructive',
          title: 'Ma’lumot yetarli emas',
          description: 'Mahsulot nomini kiriting.',
        });
        return;
      }

      // Groq orqali (kelajak uchun) tarjimalar
      await Promise.all([
        translateTextClient(productUz, 'uz', 'ru'),
        translateTextClient(productUz, 'uz', 'en'),
      ]).catch(() => null);

      if (notesUz) {
        await Promise.all([
          translateTextClient(notesUz, 'uz', 'ru'),
          translateTextClient(notesUz, 'uz', 'en'),
        ]).catch(() => null);
      }

      addExpense({
        companyId,
        date: form.date,
        product: productUz,
        quantity: Number(form.quantity) || 0,
        unit: form.unit || 'birlik',
        amount: Number(form.amount) || 0,
        notes: notesUz || undefined,
      });

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

  const handleDeleteExpense = async (id: string) => {
    const ok = window.confirm(
      'Ushbu xarajatni o‘chirmoqchimisiz?',
    );
    if (!ok) return;

    await deleteExpense(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('expensesPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('expensesPage.subtitle')}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('expensesPage.newExpenseButton')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('expensesPage.newExpenseButton')}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleAddExpense}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>{t('expensesPage.form.date')}</Label>
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
                <Label>{t('expensesPage.form.product')}</Label>
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
                  <Label>{t('expensesPage.form.quantity')}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('expensesPage.form.unit')}</Label>
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
                <Label>{t('expensesPage.form.amount')}</Label>
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
                <Label>{t('expensesPage.form.notes')}</Label>
                <Input
                  placeholder="Ixtiyoriy izoh..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full">
                {t('expensesPage.form.save')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('expensesPage.statTotal')}
          value={formatCurrencyUZS(total)}
          icon={DollarSign}
          iconClassName="bg-destructive/10 text-destructive"
        />
        <StatCard
          title={t('expensesPage.statMonth')}
          value={formatCurrencyUZS(thisMonthTotal)}
          icon={Receipt}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      {/* Jadval */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(
                  'expensesPage.searchPlaceholder',
                )}
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
                <TableHead>{t('expensesPage.table.date')}</TableHead>
                <TableHead>
                  {t('expensesPage.table.product')}
                </TableHead>
                <TableHead>
                  {t('expensesPage.table.quantity')}
                </TableHead>
                <TableHead>
                  {t('expensesPage.table.amount')}
                </TableHead>
                <TableHead>
                  {t('expensesPage.table.notes')}
                </TableHead>
                <TableHead>
                  {t('expensesPage.table.actions')}
                </TableHead>
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
                  <TableCell>
                    {formatCurrencyUZS(e.amount)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {e.notes}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(e.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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