// src/types.ts

export type OrderStatus = 'NEW' | 'WASHING' | 'READY' | 'DELIVERED';

export interface Company {
  id: string;
  name: string;

  // Asosiy login/parol – bu karxona egasiga beriladi
  login: string;
  password: string;

  // Zaxira login/parol – faqat siz (superadmin) bilasiz
  // Karxona egasi login/parolni unutsa, siz shu orqali kirib,
  // uning login/parolini qayta o'rnatib berasiz.
  backupLogin?: string;
  backupPassword?: string;

  isEnabled: boolean;
  validFrom: string;
  validTo: string;

  // Admin profil ma'lumotlari
  adminFirstName?: string;
  adminLastName?: string;
  adminAvatar?: string; // URL yoki base64
}

export interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface OrderDetails {
  itemCount: number;
  serviceType: string;
  notes?: string;
  pickupDate?: string;
  dateIn: string;
}

export interface OrderPayment {
  total: number;
  advance: number;
  remaining: number;
}

export interface Order {
  id: string;
  companyId: string;
  customer: Customer;
  details: OrderDetails;
  payment: OrderPayment;
  status: OrderStatus;
  createdAt: string;
}

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  shift: string;
  isActive: boolean;
  hiredAt: string;
  dailyRate: number;
  attendance: string[];
}

export interface Expense {
  id: string;
  companyId: string;
  date: string;
  product: string;
  quantity: number;
  unit: string;
  amount: number;
  notes?: string;
}

export interface User {
  type: 'superadmin' | 'admin';
  companyId?: string;
  companyName?: string;
  username?: string; // login
}

export interface Settings {
  language: string;
  currency: string;
  theme: 'light' | 'dark';
  dailyRevenueTarget: number;
}