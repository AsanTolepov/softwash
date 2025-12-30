// src/components/RequireAuth.tsx
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

type UserType = 'admin' | 'superadmin' | 'staff';

interface RequireAuthProps {
  children: JSX.Element;
  allowedTypes?: UserType[];
}

/**
 * Admin / Superadmin / Staff sahifalarini himoyalash:
 * - Agar user yo'q bo'lsa -> /login ga yuboradi
 * - Agar roli mos kelmasa -> / ga yuboradi
 */
export function RequireAuth({
  children,
  allowedTypes,
}: RequireAuthProps) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/" replace />;
  }

  return children;
}