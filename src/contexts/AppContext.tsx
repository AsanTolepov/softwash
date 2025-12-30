// src/contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Company,
  Order,
  Employee,
  Expense,
  User,
  Settings,
  LocalizedString,
} from '@/types';
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
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => Promise<void>;

  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => Promise<void>;
  getOrdersByCompany: (companyId: string) => Order[];

  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'attendance'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeesByCompany: (companyId: string) => Employee[];

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByCompany: (companyId: string) => Expense[];

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
  dashboardTheme: 'classic',
};

// LocalStorage uchun kalit
const USER_STORAGE_KEY = 'softwash_user';

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

// Eski string ma'lumotlarni LocalizedString ko'rinishiga o'tkazish
function normalizeLocalized(value: any): LocalizedString | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    return { uz: value };
  }
  return value as LocalizedString;
}

function normalizeEmployee(raw: any): Employee {
  return {
    ...raw,
    role: normalizeLocalized(raw.role) || {},
  } as Employee;
}

function normalizeExpense(raw: any): Expense {
  return {
    ...raw,
    product: normalizeLocalized(raw.product) || {},
    notes: normalizeLocalized(raw.notes),
  } as Expense;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // USER – localStorage'dan o'qib boshlaymiz
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch (error) {
      console.error('Saqlangan user ma’lumotlarini o‘qishda xatolik:', error);
      return null;
    }
  });

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
          setCompanies(companiesSnap.docs.map((d) => d.data() as Company));
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
        const employeesSnap = await getDocs(collection(db, 'employees'));
        if (employeesSnap.empty) {
          setEmployees(mockEmployees.map(normalizeEmployee));
          await Promise.all(
            mockEmployees.map((e) =>
              setDoc(doc(db, 'employees', e.id), cleanUndefined(e)),
            ),
          );
        } else {
          setEmployees(
            employeesSnap.docs.map((d) => normalizeEmployee(d.data())),
          );
        }

        // Xarajatlar
        const expensesSnap = await getDocs(collection(db, 'expenses'));
        if (expensesSnap.empty) {
          setExpenses(mockExpenses.map(normalizeExpense));
          await Promise.all(
            mockExpenses.map((e) =>
              setDoc(doc(db, 'expenses', e.id), cleanUndefined(e)),
            ),
          );
        } else {
          setExpenses(
            expensesSnap.docs.map((d) => normalizeExpense(d.data())),
          );
        }

        // Sozlamalar
        const settingsRef = doc(db, 'meta', 'settings');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const remote = settingsSnap.data() as Partial<Settings>;
          // Eski hujjatlar bilan mos bo‘lishi uchun default + remote
          setSettings({ ...defaultSettings, ...remote });
        } else {
          await setDoc(settingsRef, cleanUndefined(defaultSettings));
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Firebase ma’lumotlarini yuklashda xatolik:', error);
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

  // LOGIN / LOGOUT – localStorage bilan

  const login = useCallback(
    (username: string, password: string): boolean => {
      // 1) SUPERADMIN
      if (username === 'superadmin' && password === 'superadmin') {
        const newUser: User = {
          type: 'superadmin',
          username: 'superadmin',
        };
        setUser(newUser);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        }
        return true;
      }

      // 2) KOMPANIYA ADMINI
      const company = companies.find((c) => {
        if (!c.isEnabled) return false;

        const mainMatch = c.login === username && c.password === password;

        const backupMatch =
          c.backupLogin &&
          c.backupPassword &&
          c.backupLogin === username &&
          c.backupPassword === password;

        return mainMatch || backupMatch;
      });

      if (company) {
        const newUser: User = {
          type: 'admin',
          companyId: company.id,
          companyName: company.name,
          username,
        };
        setUser(newUser);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        }
        return true;
      }

      // 3) XODIM (STAFF) LOGINI
      const employee = employees.find(
        (e) => e.login === username && e.password === password,
      );

      if (employee) {
        const companyForEmployee = companies.find(
          (c) => c.id === employee.companyId,
        );

        const newUser: User = {
          type: 'staff',
          companyId: employee.companyId,
          companyName: companyForEmployee?.name,
          username,
          employeeId: employee.id,
          permissions: employee.permissions,
        };

        setUser(newUser);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        }

        return true;
      }

      // 4) HECH NIMA TOPILMADI
      return false;
    },
    [companies, employees],
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  // KOMPANIYALAR

  const addCompany = useCallback((company: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      ...company,
      id: `company-${generateId()}`,
    };

    setCompanies((prev) => [...prev, newCompany]);

    setDoc(doc(db, 'companies', newCompany.id), cleanUndefined(newCompany)).catch(
      console.error,
    );
  }, []);

  const updateCompany = useCallback(
    (id: string, updates: Partial<Company>) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );

      updateDoc(doc(db, 'companies', id), cleanUndefined(updates) as any).catch(
        console.error,
      );

      // Agar user shu kompaniya admini bo'lsa va nomi o'zgarsa – localStorage'ni ham yangilaymiz
      setUser((prev) => {
        if (prev?.type === 'admin' && prev.companyId === id) {
          const updatedUser: User = {
            ...prev,
            companyName:
              updates.name !== undefined ? updates.name : prev.companyName,
          };
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              USER_STORAGE_KEY,
              JSON.stringify(updatedUser),
            );
          }
          return updatedUser;
        }
        return prev;
      });
    },
    [],
  );

  const deleteCompany = useCallback(async (id: string) => {
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

      // Agar shu kompaniya admini login bo'lgan bo'lsa, logout qilamiz
      setUser((prev) => {
        if (prev?.type === 'admin' && prev.companyId === id) {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(USER_STORAGE_KEY);
          }
          return null;
        }
        return prev;
      });
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

      setDoc(doc(db, 'orders', newOrder.id), cleanUndefined(newOrder)).catch(
        console.error,
      );

      return newOrder;
    },
    [],
  );

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    );

    updateDoc(doc(db, 'orders', id), cleanUndefined(updates) as any).catch(
      console.error,
    );
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      console.error('Buyurtmani o‘chirishda xatolik:', error);
    }
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

      updateDoc(doc(db, 'employees', id), cleanUndefined(updates) as any).catch(
        console.error,
      );
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
    (companyId: string) => employees.filter((e) => e.companyId === companyId),
    [employees],
  );

  // XARAJATLAR

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${generateId()}`,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    setDoc(doc(db, 'expenses', newExpense.id), cleanUndefined(newExpense)).catch(
      console.error,
    );
  }, []);

  const updateExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      );

      updateDoc(doc(db, 'expenses', id), cleanUndefined(updates) as any).catch(
        console.error,
      );
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
    (companyId: string) => expenses.filter((e) => e.companyId === companyId),
    [expenses],
  );

  // SOZLAMALAR

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...updates };
      setDoc(doc(db, 'meta', 'settings'), cleanUndefined(merged), {
        merge: true,
      }).catch(console.error);
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
        deleteOrder,
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