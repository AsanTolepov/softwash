import { Company, Order, Employee, Expense } from '@/types';
import { subDays, format, addDays } from 'date-fns';

// Random ID
const generateId = () => Math.random().toString(36).substring(2, 9).toUpperCase();

// Order ID PC-XXXX
const generateOrderId = () => `PC-${Math.floor(1000 + Math.random() * 9000)}`;

// O'zbek raqami: +998XXXXXXXXX
const generateUzPhone = () =>
  `+998${Math.floor(100000000 + Math.random() * 900000000)}`;

// Kompaniyalar
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'CleanWave Kirxona',
    login: 'cleanwave',
    password: 'clean123',
    isEnabled: true,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
  },
  {
    id: 'company-2',
    name: 'Fresh & Clean Express',
    login: 'freshclean',
    password: 'fresh123',
    isEnabled: true,
    validFrom: '2024-03-15',
    validTo: '2025-03-14',
  },
  {
    id: 'company-3',
    name: 'Premium Dry Cleaners',
    login: 'premium',
    password: 'premium123',
    isEnabled: false,
    validFrom: '2023-06-01',
    validTo: '2024-05-31',
  },
];

// Xizmat turlari
export const serviceTypes = [
  'Yuvish va dazmollash',
  'Kimyoviy tozalash',
  'Faqat dazmollash',
  'Tezkor yuvish',
  'Nozik kiyimlar',
  'Ko‘rpa-yostiq va choyshablar',
];

// Buyurtmalar
const generateOrders = (companyId: string, count: number): Order[] => {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['NEW', 'WASHING', 'READY', 'DELIVERED'];
  const firstNames = ['Ali', 'Vali', 'Anvar', 'Madina', 'Aziza', 'Dilshod', 'Javlon', 'Laylo', 'Sardor', 'Gulbahor'];
  const lastNames = ['Karimov', 'Sodiqova', 'Qodirov', 'Olimova', 'Rustamov', 'Sharipov', 'Abdullaev', 'Tursunova', 'Xolmatov', 'Usmonova'];

  for (let i = 0; i < count; i++) {
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 30));
    const total = Math.floor(20000 + Math.random() * 180000); // so'mda
    const advance = Math.random() > 0.5 ? Math.floor(total * (0.3 + Math.random() * 0.4)) : 0;

    orders.push({
      id: generateOrderId(),
      companyId,
      customer: {
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        phone: generateUzPhone(),
      },
      details: {
        itemCount: Math.floor(1 + Math.random() * 15),
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        notes: Math.random() > 0.7 ? 'Ehtiyotkorlik bilan ishlang' : undefined,
        pickupDate: format(addDays(createdAt, Math.floor(2 + Math.random() * 5)), 'yyyy-MM-dd'),
        dateIn: format(createdAt, 'yyyy-MM-dd'),
      },
      payment: {
        total,
        advance,
        remaining: total - advance,
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: createdAt.toISOString(),
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Xodimlar
const generateEmployees = (companyId: string): Employee[] => {
  const shifts = ['Ertalab', 'Tushlikdan keyin', 'Kechki'];
  const employeeData = [
    { firstName: 'Sherzod', lastName: 'Anderson', role: 'Menejer' },
    { firstName: 'Dilnoza', lastName: 'Martinez', role: 'Yuvuvchi' },
    { firstName: 'Javohir', lastName: 'Thompson', role: 'Dazmolchi' },
    { firstName: 'Nodira', lastName: 'White', role: 'Kuryer' },
    { firstName: 'Bekzod', lastName: 'Harris', role: 'Qabulchi' },
  ];

  return employeeData.map((emp, index) => {
    const attendance: string[] = [];
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    for (let d = new Date(startOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && Math.random() > 0.15) {
        attendance.push(format(new Date(d), 'yyyy-MM-dd'));
      }
    }

    return {
      id: `emp-${companyId}-${index + 1}`,
      companyId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      role: emp.role,
      phone: generateUzPhone(),
      shift: shifts[Math.floor(Math.random() * shifts.length)],
      isActive: index < 4,
      hiredAt: format(subDays(new Date(), Math.floor(100 + Math.random() * 500)), 'yyyy-MM-dd'),
      dailyRate: Math.floor(50000 + Math.random() * 100000), // so'm
      attendance,
    };
  });
};

// Xarajatlar
const generateExpenses = (companyId: string): Expense[] => {
  const products = [
    { product: 'Kir yuvish kukuni', unit: 'kg' },
    { product: 'Konditsioner', unit: 'litr' },
    { product: 'Dog‘ ketkazuvchi', unit: 'dona' },
    { product: 'Ilgichlar', unit: 'dastasi' },
    { product: 'Paketlar', unit: 'rulon' },
    { product: 'Elektr energiyasi', unit: 'oy' },
    { product: 'Suv', unit: 'oy' },
    { product: 'Uskunalarni ta’mirlash', unit: 'xizmat' },
  ];

  const expenses: Expense[] = [];

  for (let i = 0; i < 15; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    expenses.push({
      id: `exp-${generateId()}`,
      companyId,
      date: format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
      product: product.product,
      quantity: Math.floor(1 + Math.random() * 10),
      unit: product.unit,
      amount: Math.floor(20000 + Math.random() * 200000),
      notes: Math.random() > 0.8 ? 'Oylik xarid' : undefined,
    });
  }

  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockOrders: Order[] = [
  ...generateOrders('company-1', 20),
  ...generateOrders('company-2', 15),
  ...generateOrders('company-3', 10),
];

export const mockEmployees: Employee[] = [
  ...generateEmployees('company-1'),
  ...generateEmployees('company-2'),
  ...generateEmployees('company-3'),
];

export const mockExpenses: Expense[] = [
  ...generateExpenses('company-1'),
  ...generateExpenses('company-2'),
  ...generateExpenses('company-3'),
];