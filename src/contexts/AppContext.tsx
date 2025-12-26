import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Company, Order, Employee, Expense, User, Settings } from '@/types';
import {
  mockCompanies,
  mockOrders,
  mockEmployees,
  mockExpenses,
} from '@/data/mockData';
import { db } from '@/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

interface AppContextType {
  // Auth
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Companies
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  getOrdersByCompany: (companyId: string) => Order[];

  // Employees
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'attendance'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeesByCompany: (companyId: string) => Employee[];

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByCompany: (companyId: string) => Expense[];

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateOrderId = () =>
  `PC-${Math.floor(1000 + Math.random() * 9000)}`;
const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultSettings: Settings = {
  language: 'uz',
  currency: 'UZS',
  theme: 'light',
  dailyRevenueTarget: 1_000_000,
};

// Firestore uchun undefinedlarni olib tashlaymiz
function cleanUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    // @ts-ignore
    return value.map(cleanUndefined);
  }
  if (value !== null && typeof value === 'object') {
    const result: any = {};
    Object.entries(value as any).forEach(([key, val]) => {
      if (val !== undefined) {
        result[key] = cleanUndefined(val);
      }
    });
    return result;
  }
  return value;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Dastlabki ma'lumotlarni Firestore'dan yuklash
  useEffect(() => {
    const loadData = async () => {
      try {
        // Kompaniyalar
        const companiesSnap = await getDocs(collection(db, 'companies'));
        if (companiesSnap.empty) {
          setCompanies(mockCompanies);
          await Promise.all(
            mockCompanies.map((c) =>
              setDoc(doc(db, 'companies', c.id), cleanUndefined(c)),
            ),
          );
        } else {
          setCompanies(
            companiesSnap.docs.map((d) => d.data() as Company),
          );
        }

        // Buyurtmalar
        const ordersSnap = await getDocs(collection(db, 'orders'));
        if (ordersSnap.empty) {
          setOrders(mockOrders);
          await Promise.all(
            mockOrders.map((o) =>
              setDoc(doc(db, 'orders', o.id), cleanUndefined(o)),
            ),
          );
        } else {
          setOrders(ordersSnap.docs.map((d) => d.data() as Order));
        }

        // Xodimlar
        const employeesSnap = await getDocs(
          collection(db, 'employees'),
        );
        if (employeesSnap.empty) {
          setEmployees(mockEmployees);
          await Promise.all(
            mockEmployees.map((e) =>
              setDoc(doc(db, 'employees', e.id), cleanUndefined(e)),
            ),
          );
        } else {
          setEmployees(
            employeesSnap.docs.map((d) => d.data() as Employee),
          );
        }

        // Xarajatlar
        const expensesSnap = await getDocs(collection(db, 'expenses'));
        if (expensesSnap.empty) {
          setExpenses(mockExpenses);
          await Promise.all(
            mockExpenses.map((e) =>
              setDoc(doc(db, 'expenses', e.id), cleanUndefined(e)),
            ),
          );
        } else {
          setExpenses(
            expensesSnap.docs.map((d) => d.data() as Expense),
          );
        }

        // Sozlamalar
        const settingsRef = doc(db, 'meta', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as Settings);
        } else {
          await setDoc(settingsRef, cleanUndefined(defaultSettings));
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error(
          'Firebase ma’lumotlarini yuklashda xatolik:',
          error,
        );
      }
    };

    loadData();
  }, []);

  // Tema (dark/light) ni butun saytga qo'llash
  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // LOGIN / LOGOUT

  const login = useCallback(
    (username: string, password: string): boolean => {
      if (username === 'superadmin' && password === 'superadmin') {
        setUser({ type: 'superadmin', username: 'superadmin' });
        return true;
      }

      const company = companies.find((c) => {
        if (!c.isEnabled) return false;

        const mainMatch =
          c.login === username && c.password === password;

        const backupMatch =
          c.backupLogin &&
          c.backupPassword &&
          c.backupLogin === username &&
          c.backupPassword === password;

        return mainMatch || backupMatch;
      });

      if (company) {
        setUser({
          type: 'admin',
          companyId: company.id,
          companyName: company.name,
          username,
        });
        return true;
      }

      return false;
    },
    [companies],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // KOMPANIYALAR

  const addCompany = useCallback((company: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      ...company,
      id: `company-${generateId()}`,
    };

    setCompanies((prev) => [...prev, newCompany]);

    setDoc(
      doc(db, 'companies', newCompany.id),
      cleanUndefined(newCompany),
    ).catch(console.error);
  }, []);

  const updateCompany = useCallback(
    (id: string, updates: Partial<Company>) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );

      updateDoc(
        doc(db, 'companies', id),
        cleanUndefined(updates) as any,
      ).catch(console.error);
    },
    [],
  );

  const deleteCompany = useCallback(async (id: string) => {
    // Lokal state
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setOrders((prev) => prev.filter((o) => o.companyId !== id));
    setEmployees((prev) => prev.filter((e) => e.companyId !== id));
    setExpenses((prev) => prev.filter((x) => x.companyId !== id));

    try {
      await deleteDoc(doc(db, 'companies', id));

      const ordersRef = collection(db, 'orders');
      const employeesRef = collection(db, 'employees');
      const expensesRef = collection(db, 'expenses');

      const [ordersSnap, employeesSnap, expensesSnap] = await Promise.all([
        getDocs(query(ordersRef, where('companyId', '==', id))),
        getDocs(query(employeesRef, where('companyId', '==', id))),
        getDocs(query(expensesRef, where('companyId', '==', id))),
      ]);

      await Promise.all([
        ...ordersSnap.docs.map((d) => deleteDoc(d.ref)),
        ...employeesSnap.docs.map((d) => deleteDoc(d.ref)),
        ...expensesSnap.docs.map((d) => deleteDoc(d.ref)),
      ]);
    } catch (error) {
      console.error('Kompaniyani o‘chirishda xatolik:', error);
    }
  }, []);

  // BUYURTMALAR

  const addOrder = useCallback(
    (order: Omit<Order, 'id' | 'createdAt'>): Order => {
      const newOrder: Order = {
        ...order,
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);

      setDoc(
        doc(db, 'orders', newOrder.id),
        cleanUndefined(newOrder),
      ).catch(console.error);

      return newOrder;
    },
    [],
  );

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    );

    updateDoc(
      doc(db, 'orders', id),
      cleanUndefined(updates) as any,
    ).catch(console.error);
  }, []);

  const getOrdersByCompany = useCallback(
    (companyId: string) => orders.filter((o) => o.companyId === companyId),
    [orders],
  );

  // XODIMLAR

  const addEmployee = useCallback(
    (employee: Omit<Employee, 'id' | 'attendance'>) => {
      const newEmployee: Employee = {
        ...employee,
        id: `emp-${generateId()}`,
        attendance: [],
      };

      setEmployees((prev) => [...prev, newEmployee]);

      setDoc(
        doc(db, 'employees', newEmployee.id),
        cleanUndefined(newEmployee),
      ).catch(console.error);
    },
    [],
  );

  const updateEmployee = useCallback(
    (id: string, updates: Partial<Employee>) => {
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );

      updateDoc(
        doc(db, 'employees', id),
        cleanUndefined(updates) as any,
      ).catch(console.error);
    },
    [],
  );

  const deleteEmployee = useCallback(async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (error) {
      console.error('Xodimni o‘chirishda xatolik:', error);
    }
  }, []);

  const getEmployeesByCompany = useCallback(
    (companyId: string) =>
      employees.filter((e) => e.companyId === companyId),
    [employees],
  );

  // XARAJATLAR

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${generateId()}`,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    setDoc(
      doc(db, 'expenses', newExpense.id),
      cleanUndefined(newExpense),
    ).catch(console.error);
  }, []);

  const updateExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );

      updateDoc(
        doc(db, 'expenses', id),
        cleanUndefined(updates) as any,
      ).catch(console.error);
    },
    [],
  );

  const deleteExpense = useCallback(async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      console.error('Xarajatni o‘chirishda xatolik:', error);
    }
  }, []);

  const getExpensesByCompany = useCallback(
    (companyId: string) =>
      expenses.filter((e) => e.companyId === companyId),
    [expenses],
  );

  // SOZLAMALAR

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updates };
      setDoc(
        doc(db, 'meta', 'settings'),
        cleanUndefined(merged),
        { merge: true },
      ).catch(console.error);
      return merged;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        orders,
        addOrder,
        updateOrder,
        getOrdersByCompany,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeesByCompany,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        getExpensesByCompany,
        settings,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp faqat AppProvider ichida ishlatilishi mumkin');
  }
  return context;
}