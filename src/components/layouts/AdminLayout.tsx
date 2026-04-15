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
  Building2,
  Droplets,
  PanelLeftClose,
  PanelLeftOpen,
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

const adminMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard',  path: '/admin' },
  { icon: ShoppingBag,     labelKey: 'sidebar.orders',     path: '/admin/orders' },
  { icon: Users,           labelKey: 'sidebar.employees',  path: '/admin/employees' },
  { icon: Receipt,         labelKey: 'sidebar.expenses',   path: '/admin/expenses' },
  { icon: BarChart3,       labelKey: 'sidebar.reports',    path: '/admin/reports' },
  { icon: Settings,        labelKey: 'sidebar.settings',   path: '/admin/settings' },
];

const superadminMenuItems: MenuItem[] = [
  { icon: Building2, labelKey: 'sidebar.companies', path: '/superadmin' },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, companies, employees } = useApp();
  const { t } = useI18n();

  const staffPermissions: EmployeePermissions | undefined =
    user?.type === 'staff' ? user.permissions : undefined;

  const baseMenuItems =
    user?.type === 'superadmin' ? superadminMenuItems : adminMenuItems;

  const menuItems =
    user?.type === 'staff' && staffPermissions
      ? baseMenuItems.filter((item) => {
          switch (item.path) {
            case '/admin':              return staffPermissions.canViewDashboard;
            case '/admin/orders':       return staffPermissions.canViewOrders;
            case '/admin/employees':    return staffPermissions.canViewEmployees;
            case '/admin/expenses':     return staffPermissions.canViewExpenses;
            case '/admin/reports':      return staffPermissions.canViewReports;
            case '/admin/settings':     return staffPermissions.canViewSettings;
            default:                    return true;
          }
        })
      : baseMenuItems;

  const companyForUser =
    (user?.type === 'admin' || user?.type === 'staff') && user.companyId
      ? companies.find((c) => c.id === user.companyId)
      : undefined;

  const employeeForStaff = useMemo(
    () =>
      user?.type === 'staff' && user.employeeId
        ? employees.find((e) => e.id === user.employeeId)
        : undefined,
    [user, employees],
  );

  const avatarUrl    = companyForUser?.adminAvatar ?? undefined;
  const adminInitials =
    companyForUser?.adminFirstName || companyForUser?.adminLastName
      ? `${(companyForUser?.adminFirstName?.[0] || '').toUpperCase()}${(companyForUser?.adminLastName?.[0] || '').toUpperCase()}` || 'AD'
      : 'AD';
  const staffInitials =
    employeeForStaff?.firstName || employeeForStaff?.lastName
      ? `${(employeeForStaff?.firstName?.[0] || '').toUpperCase()}${(employeeForStaff?.lastName?.[0] || '').toUpperCase()}` || 'ST'
      : 'ST';

  const initials = user?.type === 'staff' ? staffInitials : adminInitials;

  const displayName =
    user?.type === 'superadmin'
      ? t('header.superadminName')
      : user?.type === 'admin'
      ? t('header.adminName')
      : `${employeeForStaff?.firstName ?? ''} ${employeeForStaff?.lastName ?? ''}`.trim() || 'Xodim';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* ── SIDEBAR ───────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex flex-col',
          'bg-sidebar border-r border-sidebar-border',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-sidebar-border shrink-0',
            collapsed ? 'justify-center px-0' : 'justify-between px-4',
          )}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-sidebar-primary tracking-tight">
                  Softwash
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-widest">
                  Pro Panel
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow-primary">
              <Droplets className="h-4 w-4 text-white" />
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = (() => {
              if (item.path === '/superadmin')   return location.pathname.startsWith('/superadmin');
              if (item.path === '/admin')         return location.pathname === '/admin';
              if (item.path === '/admin/orders')
                return location.pathname === '/admin/orders' || location.pathname.startsWith('/admin/order/');
              return location.pathname.startsWith(item.path);
            })();

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? t(item.labelKey) : undefined}
                className={cn(
                  'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'transition-all duration-150 relative',
                  isActive
                    ? 'bg-sidebar-primary/20 text-sidebar-primary nav-item-active'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                  collapsed && 'justify-center',
                )}
              >
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive && 'text-sidebar-primary',
                  )}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{t(item.labelKey)}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info at sidebar bottom */}
        {!collapsed && (
          <div className="shrink-0 px-3 py-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-sidebar-accent transition-colors group">
                  <Avatar className="h-8 w-8 ring-2 ring-sidebar-primary/30">
                    {user?.type === 'admin' && avatarUrl && (
                      <AvatarImage src={avatarUrl} alt="Profil" />
                    )}
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                      {user?.type === 'superadmin' ? 'SA' : initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-semibold text-sidebar-foreground truncate">{displayName}</p>
                    <p className="text-[10px] text-sidebar-foreground/40 capitalize">{user?.type}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48 mb-1">
                {user?.type === 'admin' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Collapsed user avatar */}
        {collapsed && (
          <div className="shrink-0 flex justify-center py-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Avatar className="h-8 w-8 ring-2 ring-sidebar-primary/30">
                    {user?.type === 'admin' && avatarUrl && (
                      <AvatarImage src={avatarUrl} alt="Profil" />
                    )}
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                      {user?.type === 'superadmin' ? 'SA' : initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-48">
                {user?.type === 'admin' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          collapsed ? 'ml-16' : 'ml-64',
        )}
      >
        {/* Header */}
        <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground leading-tight">
              {user?.type === 'superadmin' ? t('header.superadminTitle') : user?.companyName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {user?.type === 'superadmin' ? t('header.superadminSubtitle') : t('header.adminSubtitle')}
            </p>
          </div>

          {/* Header right — user chip */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-accent"
              >
                <Avatar className="h-7 w-7">
                  {user?.type === 'admin' && avatarUrl && (
                    <AvatarImage src={avatarUrl} alt="Profil" />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {user?.type === 'superadmin' ? 'SA' : initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline text-foreground">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user?.type === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
