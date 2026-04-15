// src/locales/en.ts
export const en = {
    app: {
      name: 'PureClean Laundry',
    },
    sidebar: {
      dashboard: 'Dashboard',
      orders: 'Orders',
      employees: 'Employees',
      expenses: 'Expenses',
      reports: 'Reports',
      settings: 'Settings',
      companies: 'Companies',
    },
    header: {
      superadminTitle: 'Superadmin Panel',
      superadminSubtitle: 'Manage all laundries',
      adminSubtitle: 'Company dashboard',
      superadminName: 'Superadmin',
      adminName: 'Admin',
    },
  
    settingsPage: {
      title: 'Settings',
      subtitle:
        'Configure language, currency, and appearance',
      generalTitle: 'General',
      generalDescription:
        'Select the main language and currency',
      languageLabel: 'Language',
      currencyLabel: 'Currency',
  
      appearanceTitle: 'Appearance & Themes',
      appearanceDescription:
        'Choose light/dark mode and dashboard layout',
      themeLabel: 'Theme',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      selectedLabel: 'Selected',
  
      dashboardThemeLabel: 'Dashboard theme',
      dashboardThemeClassic: 'Classic',
      dashboardThemeCompact: 'Compact',
      dashboardThemeCards: 'Cards',
      dashboardThemeHint:
        'This option only affects the layout of the admin dashboard.',
  
      saveButton: 'Save changes',
      toasts: {
        savedTitle: 'Settings saved',
        savedDescription:
          'Your preferences have been updated successfully.',
      },

      permissions: {
        title: 'Employee Permissions',
        description:
          'Configure which sections each employee can view and who can manage orders.',
        descriptionBold: 'manage orders',
        notAdmin: 'Only a company admin can manage employee permissions.',
        noEmployees:
          'No employees yet. First add staff in the "Employees" section.',
        colEmployee: 'Employee',
        colSections: 'Sections (view)',
        colActions: 'Order Actions',
        labelDashboard: 'Dashboard',
        labelOrders: 'Orders',
        labelEmployees: 'Employees',
        labelExpenses: 'Expenses',
        labelReports: 'Reports',
        labelSettings: 'Settings',
        labelManageOrders: 'Manage orders (status, payment, delete)',
      },
    },
  
    dashboardPage: {
      title: 'Dashboard',
      subtitle: 'Overview of your laundry business',
      stats: {
        newOrders: 'New Orders',
        washing: 'In Washing',
        ready: 'Ready',
        revenue30d: 'Revenue (30d)',
      },
      chartTitle: 'Daily Revenue (Last 30 Days)',
    },
  
    ordersPage: {
      title: 'Orders',
      subtitle: 'Manage customer orders',
      searchPlaceholder: 'Search by ID, name, or phone...',
      tabs: {
        all: 'All',
        new: 'New',
        washing: 'Washing',
        ready: 'Ready',
        delivered: 'Delivered',
      },
      table: {
        id: 'Order ID',
        customer: 'Customer',
        service: 'Service',
        items: 'Items',
        total: 'Total',
        status: 'Status',
        date: 'Date',
        actions: '',
      },
    },
  
    employeesPage: {
      title: 'Employees',
      subtitle: 'Manage your staff and their status',
      searchPlaceholder: 'Search by name or phone...',
      tabs: {
        all: 'All',
        active: 'Active',
        inactive: 'Inactive',
      },
      table: {
        employee: 'Employee',
        role: 'Role',
        phone: 'Phone',
        shift: 'Shift',
        dailyRate: 'Daily rate',
        active: 'Active',
        actions: 'Actions',
      },
      addButton: 'Add employee',
      dialog: {
        addTitle: 'Add new employee',
        editTitle: 'Edit employee details',
        save: 'Save',
        saveChanges: 'Save changes',
      },
      form: {
        firstName: 'First name',
        lastName: 'Last name',
        role: 'Role',
        rolePlaceholder: 'Washer, courier, manager...',
        phone: 'Phone',
        shift: 'Shift',
        shiftMorning: 'Morning',
        shiftAfternoon: 'Afternoon',
        shiftEvening: 'Part-time',
        dailyRate: 'Daily rate (UZS)',
        dailyRatePlaceholder: '50000',
      },
      defaultRole: 'Employee',
      hiredAtLabel: 'Hired on',
      badge: {
        active: 'Active',
        inactive: 'Inactive',
      },
      toasts: {
        createdTitle: 'Employee added',
        createdDescription:
          'New employee has been saved successfully.',
        updatedTitle: 'Employee updated',
        updatedDescription:
          'Employee information has been updated successfully.',
        deletedTitle: 'Employee deleted',
        deletedDescription:
          'Employee has been deleted successfully.',
        mustBeCompanyAdminTitle: 'Error',
        mustBeCompanyAdminDescription:
          'Please log in as a company admin first.',
      },
      confirmDelete: 'Do you want to delete "{name}"?',
      empty: 'No employees found',
    },
  
    expensesPage: {
      title: 'Expenses',
      subtitle:
        'Track all consumables and operational costs',
      searchPlaceholder:
        'Search by product or notes...',
      statTotal: 'Total Expenses',
      statMonth: 'This Month',
      newExpenseButton: 'Add Expense',
      form: {
        date: 'Date',
        product: 'Product / Expense Type',
        category: 'Category',
        quantity: 'Quantity',
        unit: 'Unit',
        amount: 'Amount (UZS)',
        notes: 'Notes',
        save: 'Save',
      },
      categories: {
        ijara: 'Rent',
        kommunal: 'Utilities',
        jihozlar: 'Equipment / Supplies',
        oylik: 'Staff Wages',
        boshqa: 'Other Expenses',
      },
      table: {
        date: 'Date',
        product: 'Product / Expense',
        category: 'Category',
        quantity: 'Quantity',
        amount: 'Amount',
        notes: 'Notes',
        actions: 'Actions',
      },
    },

    reportsPage: {
      title: 'Reports',
      subtitle: 'Financial and operational overview',
      stats: {
        revenue: 'Total Revenue',
        expenses: 'Total Expenses',
        profit: 'Net Profit',
        completedOrders: 'Completed Orders',
      },
      chartTitle: 'Revenue vs Expenses (Last 30 Days)',
      servicePerformanceTitle: 'Service Performance',
      staffOverviewTitle: 'Staff Overview',
      staffActiveLabel: 'Active Employees',
      expenseBreakdownTitle: 'Expense Breakdown',
      expenseBreakdownCategory: 'Category',
      expenseBreakdownAmount: 'Amount',
      expenseBreakdownNoData: 'No expense data yet',
      netProfitLabel: 'Net Profit',
      netProfitFormula: 'Revenue − Expenses',
    },
    settingsOrderSection: {
      title: 'Order Settings',
      processingDaysLabel: 'Processing Days (Delay)',
      processingDaysHint: 'How many working days after order receipt before washing begins (default: 3)',
      dailyOrderLimitLabel: 'Daily Order Limit',
      dailyOrderLimitHint: 'Maximum number of orders accepted per day (default: 100)',
    },
  };