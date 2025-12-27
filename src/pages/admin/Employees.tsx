// src/pages/admin/Employees.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useI18n, getLocalizedText } from '@/lib/i18n';
import { translateTextClient } from '@/services/translate';

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { formatCurrencyUZS } from '@/lib/utils';
import type { Employee as EmployeeType } from '@/types';

type EmployeeFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export default function Employees() {
  const {
    user,
    getEmployeesByCompany,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useApp();
  const { toast } = useToast();
  const { t, lang } = useI18n();

  const companyId = user?.companyId || '';
  const employees = getEmployeesByCompany(companyId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<EmployeeFilter>('ALL');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeType | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    shift: 'Ertalab',
    dailyRate: '',
  });

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    shift: 'Ertalab',
    dailyRate: '',
  });

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      search === '' ||
      fullName.includes(search.toLowerCase()) ||
      emp.phone.includes(search);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && emp.isActive) ||
      (statusFilter === 'INACTIVE' && !emp.isActive);

    return matchesSearch && matchesStatus;
  });

  // Yangi xodim qo'shish – ro'lni Groq orqali 3 tilda saqlash
  const handleAddEmployee = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!companyId) {
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description:
          'Avval kompaniya admini sifatida tizimga kiring.',
      });
      return;
    }

    const roleUz = form.role.trim() || 'Xodim';

    let roleRu: string | undefined;
    let roleEn: string | undefined;

    try {
      [roleRu, roleEn] = await Promise.all([
        translateTextClient(roleUz, 'uz', 'ru'),
        translateTextClient(roleUz, 'uz', 'en'),
      ]);
    } catch (err) {
      console.error('Groq tarjima xatosi (xodim roli):', err);
      // Agar tarjima bo'lmasa, faqat uzbekcha bilan ishlaymiz
    }

    addEmployee({
      companyId,
      firstName: form.firstName,
      lastName: form.lastName,
      role: {
        uz: roleUz,
        ru: roleRu,
        en: roleEn,
      },
      phone: form.phone,
      shift: form.shift,
      isActive: true,
      hiredAt: format(new Date(), 'yyyy-MM-dd'),
      dailyRate: parseFloat(form.dailyRate) || 0,
    });

    toast({
      title: 'Xodim qo‘shildi',
      description: 'Yangi xodim muvaffaqiyatli saqlandi.',
    });

    setForm({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      shift: 'Ertalab',
      dailyRate: '',
    });
    setOpen(false);
  };

  const openEditDialog = (emp: EmployeeType) => {
    setEditingEmployee(emp);
    setEditForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      role:
        emp.role.uz ||
        emp.role.ru ||
        emp.role.en ||
        '',
      phone: emp.phone,
      shift: emp.shift,
      dailyRate: String(emp.dailyRate),
    });
    setEditOpen(true);
  };

  const handleEditEmployee = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      shift: editForm.shift,
      dailyRate: parseFloat(editForm.dailyRate) || 0,
      // Faqat uz ro'lini yangilaymiz, ru/en eski bo'lib qoladi
      role: {
        ...editingEmployee.role,
        uz: editForm.role,
      },
    });

    toast({
      title: 'Xodim yangilandi',
      description: 'Xodim ma’lumotlari muvaffaqiyatli yangilandi.',
    });

    setEditOpen(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (emp: EmployeeType) => {
    const ok = window.confirm(
      `"${emp.firstName} ${emp.lastName}" xodimini o‘chirmoqchimisiz?`,
    );
    if (!ok) return;

    await deleteEmployee(emp.id);
    toast({
      title: 'Xodim o‘chirildi',
      description: 'Xodim muvaffaqiyatli o‘chirildi.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('employeesPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('employeesPage.subtitle')}
          </p>
        </div>

        {/* Yangi xodim qo'shish */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Xodim qo‘shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi xodim qo‘shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ismi</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Familiyasi</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lavozimi</Label>
                <Input
                  placeholder="Yuvuvchi, kuryer, menejer..."
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  type="tel"
                  placeholder="+998 (90) 123-45-67"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Smena</Label>
                  <select
                    className="border-input bg-background rounded-md px-3 py-2 text-sm"
                    value={form.shift}
                    onChange={(e) =>
                      setForm({ ...form, shift: e.target.value })
                    }
                  >
                    <option value="Ertalab">Ertalab</option>
                    <option value="Tushlikdan keyin">
                      Tushlikdan keyin
                    </option>
                    <option value="Kechki">Kechki</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Kundalik ish haqi (so‘m)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.dailyRate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dailyRate: e.target.value,
                      })
                    }
                    placeholder="50000"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Saqlash
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter + jadval */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(
                  'employeesPage.searchPlaceholder',
                )}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Tabs
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as EmployeeFilter)
              }
            >
              <TabsList>
                <TabsTrigger value="ALL">
                  {t('employeesPage.tabs.all')}
                </TabsTrigger>
                <TabsTrigger value="ACTIVE">
                  {t('employeesPage.tabs.active')}
                </TabsTrigger>
                <TabsTrigger value="INACTIVE">
                  {t('employeesPage.tabs.inactive')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">
                  {t('employeesPage.table.employee')}
                </TableHead>
                <TableHead>
                  {t('employeesPage.table.role')}
                </TableHead>
                <TableHead>
                  {t('employeesPage.table.phone')}
                </TableHead>
                <TableHead>
                  {t('employeesPage.table.shift')}
                </TableHead>
                <TableHead>
                  {t('employeesPage.table.dailyRate')}
                </TableHead>
                <TableHead className="text-center">
                  {t('employeesPage.table.active')}
                </TableHead>
                <TableHead>
                  {t('employeesPage.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ishga olingan: {emp.hiredAt}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLocalizedText(emp.role, lang)}
                  </TableCell>
                  <TableCell>{emp.phone}</TableCell>
                  <TableCell>{emp.shift}</TableCell>
                  <TableCell>
                    {formatCurrencyUZS(emp.dailyRate)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant={
                          emp.isActive ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {emp.isActive ? 'Faol' : 'Nofaol'}
                      </Badge>
                      <Switch
                        checked={emp.isActive}
                        onCheckedChange={(checked) =>
                          updateEmployee(emp.id, {
                            isActive: checked,
                          })
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(emp)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEmployee(emp)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    Xodimlar topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tahrirlash dialogi */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xodim ma’lumotlarini tahrirlash</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleEditEmployee}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ismi</Label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Familiyasi</Label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lavozimi</Label>
              <Input
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    role: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    phone: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Smena</Label>
                <select
                  className="border-input bg-background rounded-md px-3 py-2 text-sm"
                  value={editForm.shift}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      shift: e.target.value,
                    })
                  }
                >
                  <option value="Ertalab">Ertalab</option>
                  <option value="Tushlikdan keyin">
                    Tushlikdan keyin
                  </option>
                  <option value="Kechki">Kechki</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Kundalik ish haqi (so‘m)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.dailyRate}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      dailyRate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              O‘zgarishlarni saqlash
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}