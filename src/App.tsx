// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { RequireAuth } from "@/components/RequireAuth";

import Login from "@/pages/Login";
import NewOrder from "@/pages/customer/NewOrder";
import Confirmation from "@/pages/customer/Confirmation";
import AdminDashboard from "@/pages/admin/Dashboard";
import Orders from "@/pages/admin/Orders";
import OrderDetail from "@/pages/admin/OrderDetail";
import Employees from "@/pages/admin/Employees";
import Expenses from "@/pages/admin/Expenses";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/admin/Profile";
import SuperadminDashboard from "@/pages/superadmin/Dashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* 1) Mijozlar uchun forma – ROOT */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<NewOrder />} />
              <Route path="c/:companyId/new-order" element={<NewOrder />} />
              <Route path="confirmation/:id" element={<Confirmation />} />
            </Route>

            {/* 2) Login sahifasi – faqat admin/superadmin uchun */}
            <Route path="/login" element={<Login />} />

            {/* 3) Admin panel – faqat ADMIN */}
            <Route
              path="/admin"
              element={
                <RequireAuth allowedTypes={['admin']}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="order/:id" element={<OrderDetail />} />
              <Route path="employees" element={<Employees />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 4) Superadmin panel – faqat SUPERADMIN */}
            <Route
              path="/superadmin"
              element={
                <RequireAuth allowedTypes={['superadmin']}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<SuperadminDashboard />} />
            </Route>

            {/* 5) 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;