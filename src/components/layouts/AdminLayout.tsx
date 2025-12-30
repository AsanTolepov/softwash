// src/components/layouts/AdminLayout.tsx
import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Receipt,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  ChevronLeft,
  Building2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EmployeePermissions } from '@/types';

type MenuItem = {
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  path: string;
};

// ADMIN menyusi – labelKey lar i18n uchun
const adminMenuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: 'sidebar.dashboard',
    path: '/admin',
  },
  {
    icon: ShoppingBag,
    labelKey: 'sidebar.orders',
    path: '/admin/orders',
  },
  {
    icon: Users,
    labelKey: 'sidebar.employees',
    path: '/admin/employees',
  },
  {
    icon: Receipt,
    labelKey: 'sidebar.expenses',
    path: '/admin/expenses',
  },
  {
    icon: BarChart3,
    labelKey: 'sidebar.reports',
    path: '/admin/reports',
  },
  {
    icon: Settings,
    labelKey: 'sidebar.settings',
    path: '/admin/settings',
  },
];

// SUPERADMIN menyusi – faqat Kompaniyalar
const superadminMenuItems: MenuItem[] = [
  {
    icon: Building2,
    labelKey: 'sidebar.companies',
    path: '/superadmin',
  },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, companies, employees } = useApp();
  const { t } = useI18n();

  const staffPermissions: EmployeePermissions | undefined =
    user?.type === 'staff' ? user.permissions : undefined;

  // Qaysi menyu: admin/superadmin/staff
  const baseMenuItems =
    user?.type === 'superadmin'
      ? superadminMenuItems
      : adminMenuItems;

  // STAFF uchun bo‘limlarni ruxsat bo‘yicha filterlash
  const menuItems =
    user?.type === 'staff' && staffPermissions
      ? baseMenuItems.filter((item) => {
          switch (item.path) {
            case '/admin':
              return staffPermissions.canViewDashboard;
            case '/admin/orders':
              return staffPermissions.canViewOrders;
            case '/admin/employees':
              return staffPermissions.canViewEmployees;
            case '/admin/expenses':
              return staffPermissions.canViewExpenses;
            case '/admin/reports':
              return staffPermissions.canViewReports;
            case '/admin/settings':
              return staffPermissions.canViewSettings;
            default:
              return true;
          }
        })
      : baseMenuItems;

  // Admin yoki staff uchun kompaniya ma'lumotlari
  const companyForUser =
    (user?.type === 'admin' || user?.type === 'staff') &&
    user.companyId
      ? companies.find((c) => c.id === user.companyId)
      : undefined;

  // Staff uchun xodim ma'lumotlari
  const employeeForStaff = useMemo(
    () =>
      user?.type === 'staff' && user.employeeId
        ? employees.find((e) => e.id === user.employeeId)
        : undefined,
    [user, employees],
  );

  const avatarUrl =
    companyForUser?.adminAvatar ?? undefined;

  const adminInitials =
    companyForUser?.adminFirstName ||
    companyForUser?.adminLastName
      ? `${(companyForUser?.adminFirstName?.[0] ||
          ''
        ).toUpperCase()}${(
          companyForUser?.adminLastName?.[0] || ''
        ).toUpperCase() || ''}` || 'AD'
      : 'AD';

  const staffInitials =
    employeeForStaff?.firstName ||
    employeeForStaff?.lastName
      ? `${(employeeForStaff?.firstName?.[0] ||
          ''
        ).toUpperCase()}${(
          employeeForStaff?.lastName?.[0] || ''
        ).toUpperCase() || ''}` || 'ST'
      : 'ST';

  const initials =
    user?.type === 'staff' ? staffInitials : adminInitials;

  const handleLogout = () => {
    logout();
    navigate('/'); // chiqishda mijoz formasi (root) ga qaytadi
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">
                  PC
                </span>
              </div>
              <span className="font-semibold text-sidebar-foreground">
                PureClean
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = (() => {
              if (item.path === '/superadmin') {
                return location.pathname.startsWith(
                  '/superadmin',
                );
              }
              if (item.path === '/admin') {
                return location.pathname === '/admin';
              }
              if (item.path === '/admin/orders') {
                return (
                  location.pathname === '/admin/orders' ||
                  location.pathname.startsWith(
                    '/admin/order/',
                  )
                );
              }
              return location.pathname.startsWith(
                item.path,
              );
            })();

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent',
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium">
                    {t(item.labelKey)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ASOSIY QISM */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        {/* HEADER */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h2 className="font-semibold text-foreground">
              {user?.type === 'superadmin'
                ? t('header.superadminTitle')
                : user?.companyName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user?.type === 'superadmin'
                ? t('header.superadminSubtitle')
                : t('header.adminSubtitle')}
            </p>
          </div>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Avatar className="h-8 w-8">
                  {/* Admin profili uchun rasm bo'lsa – shu ko‘rsatiladi */}
                  {user?.type === 'admin' &&
                    avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt="Profil rasmi"
                      />
                    )}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.type === 'superadmin'
                      ? 'SA'
                      : initials}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium hidden sm:inline">
                  {user?.type === 'superadmin'
                    ? t('header.superadminName')
                    : user?.type === 'admin'
                    ? t('header.adminName')
                    : `${employeeForStaff?.firstName ?? ''} ${
                        employeeForStaff?.lastName ?? ''
                      }`.trim() || 'Xodim'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
            >
              {/* PROFIL faqat ADMIN uchun */}
              {user?.type === 'admin' && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate('/admin/profile')
                    }
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* SAHIFA KONTENTI */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}