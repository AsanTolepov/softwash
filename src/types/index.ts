// src/types/index.ts

export type OrderStatus = 'NEW' | 'WASHING' | 'READY' | 'DELIVERED';

// Ko'p tilli matn tipi
export interface LocalizedString {
  uz?: string;
  ru?: string;
  en?: string;
}

export interface Company {
  id: string;
  name: string;

  // Asosiy login/parol – bu karxona egasiga beriladi
  login: string;
  password: string;

  // Zaxira login/parol – faqat siz (superadmin) bilasiz
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
  serviceType: string; // hozircha oddiy string, keyin enum + i18n qilsa bo'ladi
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

// Employee roli endi LocalizedString bo'ladi
export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  role: LocalizedString; // oldingi string edi
  phone: string;
  shift: string;
  isActive: boolean;
  hiredAt: string;
  dailyRate: number;
  attendance: string[];
}

// Expense mahsulot nomi va izohi ko'p tilli
export interface Expense {
  id: string;
  companyId: string;
  date: string;
  product: LocalizedString; // oldingi: string
  quantity: number;
  unit: string;
  amount: number;
  notes?: LocalizedString; // oldingi: string | undefined
}

export interface User {
  type: 'superadmin' | 'admin';
  companyId?: string;
  companyName?: string;
  username?: string; // login
}

export interface Settings {
  language: string; // 'uz' | 'ru' | 'en'
  currency: string;
  theme: 'light' | 'dark';
  dailyRevenueTarget: number;
}