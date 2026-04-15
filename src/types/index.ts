// src/types/index.ts

export type OrderStatus = 'NEW' | 'WASHING' | 'READY' | 'DELIVERED';

// Kiyim turlari
export type ClothingType =
  | 'REGULAR'      // Oddiy kiyim
  | 'JACKET_COAT'  // Kurtka / Palto / Plash
  | 'BLANKET'      // Odealo / Adyol
  | 'CURTAIN'      // Parda
  | 'SUIT';        // Kostyum / Shim

// Kiyim rangi
export type ClothingColor =
  | 'BRIGHT'    // Yorqin rang (qizil, sariq, oq, ...)
  | 'DARK'      // To'q rang (qora, jigarrang, dark blue, ...)
  | 'NEUTRAL';  // Aralash / Boshqa

// Xizmat turlari
export type LaundryService =
  | 'WASHING'   // Yuvish
  | 'DRYING'    // Quritish
  | 'CHEMICAL'  // Kimyoviy ishlov
  | 'IRONING';  // Dazmollash

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
  serviceType: string;              // Backward compat uchun saqlanadi
  services: LaundryService[];       // Tanlangan xizmatlar
  clothingType: ClothingType;       // Kiyim turi
  color: ClothingColor;             // Rang
  dirtyLevel: number;               // Kir darajasi: 1-5
  isUrgent: boolean;                // Zudlik bilan (+50%)
  estimatedReadyAt?: string;        // Hisoblangan tayyor vaqt (ISO)
  notes?: string;
  pickupDate?: string;
  dateIn: string;
  hasTear?: boolean;                // Kiyimda yirtiq bormi?
  tearLocation?: string;            // Yirtiq joyi (hasTear=true bo'lganda)
  specificColor?: string;           // Tanlangan aniq rang (hex, masalan '#ef4444')
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

// Xodim ruxsatlari
export interface EmployeePermissions {
  canViewDashboard: boolean;

  canViewOrders: boolean;
  canManageOrders: boolean;

  canViewEmployees: boolean;
  canManageEmployees: boolean;

  canViewExpenses: boolean;
  canManageExpenses: boolean;

  canViewReports: boolean;

  canViewSettings: boolean;
}

// Employee roli endi LocalizedString bo'ladi
export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  role: LocalizedString;
  phone: string;
  shift: string;
  isActive: boolean;
  hiredAt: string;
  dailyRate: number;
  attendance: string[];

  // Login / parol va ruxsatlar (ixtiyoriy)
  login?: string;
  password?: string;
  permissions?: EmployeePermissions;
}

// Expense mahsulot nomi va izohi ko'p tilli
export interface Expense {
  id: string;
  companyId: string;
  date: string;
  product: LocalizedString;
  quantity: number;
  unit: string;
  amount: number;
  category?: string;    // 'ijara' | 'kommunal' | 'jihozlar' | 'oylik' | 'boshqa'
  notes?: LocalizedString;
}

export interface User {
  type: 'superadmin' | 'admin' | 'staff';
  companyId?: string;
  companyName?: string;
  username?: string; // login

  // Faqat xodim (staff) uchun
  employeeId?: string;
  permissions?: EmployeePermissions;
}

export type DashboardTheme = 'classic' | 'compact' | 'cards';

export interface Settings {
  language: string; // 'uz' | 'ru' | 'en'
  currency: string;
  theme: 'light' | 'dark';
  dashboardTheme: DashboardTheme;
  processingDays: number;   // Buyurtma qabul bo'lganidan necha ish kuni keyin yuvish boshlanadi (default: 3)
  dailyOrderLimit: number;  // Kunlik maksimal buyurtmalar soni (default: 100)
}