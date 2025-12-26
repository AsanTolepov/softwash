import { useState } from 'react';
import {
  Plus,
  Building2,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { Company } from '@/types';

export default function SuperadminDashboard() {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    getOrdersByCompany,
    getEmployeesByCompany,
  } = useApp();

  // Yangi kompaniya dialogi
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    login: '',
    password: '',
    backupLogin: '',
    backupPassword: '',
    validFrom: '',
    validTo: '',
    isEnabled: true,
  });

  // Tahrirlash dialogi
  const [editOpen, setEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    name: '',
    login: '',
    password: '',
    backupLogin: '',
    backupPassword: '',
    validFrom: '',
    validTo: '',
    isEnabled: true,
  });

  const baseUrl = window.location.origin;

  // Yangi kompaniya yaratish
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalForm = {
      ...createForm,
      backupLogin:
        createForm.backupLogin.trim() !== ''
          ? createForm.backupLogin
          : `${createForm.login}_support`,
      backupPassword:
        createForm.backupPassword.trim() !== ''
          ? createForm.backupPassword
          : `${createForm.password}_1`,
    };

    addCompany(finalForm);

    setCreateForm({
      name: '',
      login: '',
      password: '',
      backupLogin: '',
      backupPassword: '',
      validFrom: '',
      validTo: '',
      isEnabled: true,
    });
    setCreateOpen(false);
  };

  // Tahrirlash uchun dialogni ochish
  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setEditForm({
      name: company.name,
      login: company.login,
      password: company.password,
      backupLogin: company.backupLogin || '',
      backupPassword: company.backupPassword || '',
      validFrom: company.validFrom,
      validTo: company.validTo,
      isEnabled: company.isEnabled,
    });
    setEditOpen(true);
  };

  // Tahrirlashni saqlash
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    updateCompany(editingCompany.id, editForm);
    setEditOpen(false);
  };

  // Kompaniyani o‘chirish
  const handleDeleteCompany = async (company: Company) => {
    const ok = window.confirm(
      `"${company.name}" kompaniyasini va unga tegishli barcha buyurtmalar/xodimlar/xarajatlarni o‘chirmoqchimisiz?`,
    );
    if (!ok) return;

    await deleteCompany(company.id);
  };

  // QR kodni yuklab olish
  const handleDownloadQr = (companyId: string, companyName: string) => {
    const container = document.querySelector(
      `#qr-${companyId}`,
    ) as HTMLElement | null;
    if (!container) return;

    const svg = container.querySelector('svg') as SVGElement | null;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const blob = new Blob([source], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    const safeName = companyName.replace(/\s+/g, '_');
    link.download = `${safeName}_qrcode.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Yuqori panel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kompaniyalar</h1>
          <p className="text-muted-foreground">
            Barcha kirxonalarni va ularning statistikalarini boshqaring
          </p>
        </div>

        {/* Yangi kompaniya dialogi */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Kompaniya qo‘shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yangi kompaniya qo‘shish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Kompaniya nomi</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Login / parol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Login</Label>
                  <Input
                    value={createForm.login}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        login: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Masalan: <span className="font-mono">cleanwave</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Parol</Label>
                  <Input
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Zaxira login / parol */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zaxira login (ixtiyoriy)</Label>
                  <Input
                    placeholder="Masalan: cleanwave_support"
                    value={createForm.backupLogin}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        backupLogin: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zaxira parol (ixtiyoriy)</Label>
                  <Input
                    placeholder="Masalan: support123"
                    value={createForm.backupPassword}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        backupPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Amal qilish muddati */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amal qilish boshlanish sanasi</Label>
                  <Input
                    type="date"
                    value={createForm.validFrom}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        validFrom: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amal qilish tugash sanasi</Label>
                  <Input
                    type="date"
                    value={createForm.validTo}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        validTo: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Kompaniya yaratish
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kompaniyalar ro‘yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => {
          const orders = getOrdersByCompany(company.id);
          const employees = getEmployeesByCompany(company.id);

          const totalOrders = orders.length;
          const newOrders = orders.filter((o) => o.status === 'NEW').length;
          const washingOrders = orders.filter(
            (o) => o.status === 'WASHING',
          ).length;
          const readyOrders = orders.filter(
            (o) => o.status === 'READY',
          ).length;
          const deliveredOrders = orders.filter(
            (o) => o.status === 'DELIVERED',
          ).length;

          const employeesCount = employees.length;

          return (
            <Card key={company.id} className="animate-fade-in">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {company.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Login: {company.login}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={company.isEnabled ? 'default' : 'secondary'}
                  >
                    {company.isEnabled ? 'Faol' : 'O‘chiq'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Login/parollar */}
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Asosiy parol:</span>{' '}
                    {company.password}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Zaxira login:</span>{' '}
                    {company.backupLogin || '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Zaxira parol:
                    </span>{' '}
                    {company.backupPassword || '—'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Amal qilish muddati:
                    </span>{' '}
                    {company.validFrom} → {company.validTo}
                  </p>
                </div>

                {/* Statistika */}
                <div className="border rounded-lg p-3 space-y-2 bg-muted/40">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        Barcha buyurtmalar:
                      </span>
                    </div>
                    <span className="font-semibold">{totalOrders}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <ShoppingBag className="h-3 w-3 text-info" />
                        Yangi
                      </span>
                      <span className="font-semibold">{newOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3 text-warning" />
                        Yuvishda
                      </span>
                      <span className="font-semibold">{washingOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Tayyor
                      </span>
                      <span className="font-semibold">{readyOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Truck className="h-3 w-3 text-primary" />
                        Yetkazilgan
                      </span>
                      <span className="font-semibold">
                        {deliveredOrders}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1 border-t mt-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        Xodimlar soni:
                      </span>
                    </div>
                    <span className="font-semibold">{employeesCount}</span>
                  </div>
                </div>

                {/* Tahrirlash / O‘chirish tugmalari */}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(company)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Tahrirlash
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteCompany(company)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    O‘chirish
                  </Button>
                </div>

                {/* Faollik switch */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Faol holat
                  </span>
                  <Switch
                    checked={company.isEnabled}
                    onCheckedChange={(checked) =>
                      updateCompany(company.id, { isEnabled: checked })
                    }
                  />
                </div>

                {/* QR-kod + Yuklab olish */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Mijozlar uchun buyurtma QR-kodi
                  </p>
                  <div
                    id={`qr-${company.id}`}
                    className="bg-white p-3 rounded-lg inline-block"
                  >
                    <QRCodeSVG
                      value={`${baseUrl}/c/${company.id}/new-order`}
                      size={100}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs text-muted-foreground break-all flex-1">
                      {baseUrl}/c/{company.id}/new-order
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownloadQr(company.id, company.name)
                      }
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Yuklab olish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tahrirlash dialogi */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kampaniyani tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Kompaniya nomi</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Login</Label>
                <Input
                  value={editForm.login}
                  onChange={(e) =>
                    setEditForm({ ...editForm, login: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Parol</Label>
                <Input
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm({ ...editForm, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zaxira login</Label>
                <Input
                  value={editForm.backupLogin}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      backupLogin: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Zaxira parol</Label>
                <Input
                  value={editForm.backupPassword}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      backupPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amal qilish boshlanish sanasi</Label>
                <Input
                  type="date"
                  value={editForm.validFrom}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      validFrom: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Amal qilish tugash sanasi</Label>
                <Input
                  type="date"
                  value={editForm.validTo}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      validTo: e.target.value,
                    })
                  }
                  required
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