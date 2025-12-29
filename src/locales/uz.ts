// src/locales/uz.ts
export const uz = {
    app: {
      name: 'PureClean Kirxonasi',
    },
    sidebar: {
      dashboard: 'Boshqaruv paneli',
      orders: 'Buyurtmalar',
      employees: 'Xodimlar',
      expenses: 'Xarajatlar',
      reports: 'Hisobotlar',
      settings: 'Sozlamalar',
      companies: 'Kompaniyalar',
    },
    header: {
      superadminTitle: 'Superadmin paneli',
      superadminSubtitle: 'Barcha kirxonalarni boshqarish',
      adminSubtitle: 'Kompaniya boshqaruv paneli',
      superadminName: 'Superadmin',
      adminName: 'Admin',
    },
  
    settingsPage: {
      title: 'Sozlamalar',
      subtitle:
        'Tizim tilini, valyutani va tashqi ko‘rinishini sozlang',
      generalTitle: 'Umumiy',
      generalDescription:
        'Tizimning asosiy tilini va valyutasini tanlang',
      languageLabel: 'Til',
      currencyLabel: 'Valyuta',
  
      appearanceTitle: 'Ko‘rinish va mavzular',
      appearanceDescription:
        'Tungi/kunlik rejim va boshqaruv paneli dizaynini tanlang',
      themeLabel: 'Mavzu (tema)',
      lightTheme: 'Yorug‘ (light)',
      darkTheme: 'Tungi (dark)',
      selectedLabel: 'Tanlangan',
  
      dashboardThemeLabel: 'Boshqaruv paneli mavzusi',
      dashboardThemeClassic: 'Klassik',
      dashboardThemeCompact: 'Kompakt',
      dashboardThemeCards: 'Kartali',
      dashboardThemeHint:
        'Bu parametr faqat admin panelidagi boshqaruv panelining ko‘rinishini o‘zgartiradi.',
  
      saveButton: 'O‘zgarishlarni saqlash',
      toasts: {
        savedTitle: 'Sozlamalar saqlandi',
        savedDescription:
          'Tanlangan parametrlar muvaffaqiyatli yangilandi.',
      },
    },
  
    dashboardPage: {
      title: 'Boshqaruv paneli',
      subtitle: 'Kir yuvish biznesingiz bo‘yicha qisqacha statistika',
      stats: {
        newOrders: 'Yangi buyurtmalar',
        washing: 'Yuvish jarayonida',
        ready: 'Tayyor',
        revenue30d: 'Daromad (30 kun)',
      },
      chartTitle: 'So‘nggi 30 kunlik kunlik daromad',
    },
  
    ordersPage: {
      title: 'Buyurtmalar',
      subtitle: 'Mijoz buyurtmalarini boshqaring',
      searchPlaceholder: 'ID, ism yoki telefon bo‘yicha qidirish...',
      tabs: {
        all: 'Barchasi',
        new: 'Yangi',
        washing: 'Yuvishda',
        ready: 'Tayyor',
        delivered: 'Yetkazilgan',
      },
      table: {
        id: 'Buyurtma raqami',
        customer: 'Mijoz',
        service: 'Xizmat',
        items: 'Buyumlar soni',
        total: 'Jami',
        status: 'Holat',
        date: 'Sana',
        actions: 'Amallar',
      },
    },
  
    employeesPage: {
      title: 'Xodimlar',
      subtitle: 'Xodimlaringiz va ularning faoliyatini boshqaring',
      searchPlaceholder: 'Ism yoki telefon bo‘yicha qidirish...',
      tabs: {
        all: 'Barchasi',
        active: 'Faol',
        inactive: 'Nofaol',
      },
      table: {
        employee: 'Xodim',
        role: 'Lavozimi',
        phone: 'Telefon',
        shift: 'Smena',
        dailyRate: 'Kundalik ish haqi',
        active: 'Faollik',
        actions: 'Amallar',
      },
      addButton: 'Xodim qo‘shish',
      dialog: {
        addTitle: 'Yangi xodim qo‘shish',
        editTitle: 'Xodim ma’lumotlarini tahrirlash',
        save: 'Saqlash',
        saveChanges: 'O‘zgarishlarni saqlash',
      },
      form: {
        firstName: 'Ismi',
        lastName: 'Familiyasi',
        role: 'Lavozimi',
        rolePlaceholder: 'Yuvuvchi, kuryer, menejer...',
        phone: 'Telefon',
        shift: 'Smena',
        shiftMorning: 'Ertalab',
        shiftAfternoon: 'Tushlikdan keyin',
        shiftEvening: 'Kechki',
        dailyRate: 'Kundalik ish haqi (so‘m)',
        dailyRatePlaceholder: '50000',
      },
      defaultRole: 'Xodim',
      hiredAtLabel: 'Ishga olingan',
      badge: {
        active: 'Faol',
        inactive: 'Nofaol',
      },
      toasts: {
        createdTitle: 'Xodim qo‘shildi',
        createdDescription: 'Yangi xodim muvaffaqiyatli saqlandi.',
        updatedTitle: 'Xodim yangilandi',
        updatedDescription:
          'Xodim ma’lumotlari muvaffaqiyatli yangilandi.',
        deletedTitle: 'Xodim o‘chirildi',
        deletedDescription: 'Xodim muvaffaqiyatli o‘chirildi.',
        mustBeCompanyAdminTitle: 'Xatolik',
        mustBeCompanyAdminDescription:
          'Avval kompaniya admini sifatida tizimga kiring.',
      },
      confirmDelete: '“{name}” xodimini o‘chirmoqchimisiz?',
      empty: 'Xodimlar topilmadi',
    },
  
    expensesPage: {
      title: 'Xarajatlar',
      subtitle: 'Sarflangan mahsulotlar va xizmatlarni kuzatib boring',
      searchPlaceholder: 'Mahsulot yoki izoh bo‘yicha qidirish...',
      statTotal: 'Umumiy xarajat',
      statMonth: 'Bu oy',
      newExpenseButton: 'Xarajat qo‘shish',
      form: {
        date: 'Sana',
        product: 'Mahsulot / xarajat turi',
        quantity: 'Miqdori',
        unit: 'Birligi',
        amount: 'Summasi (so‘m)',
        notes: 'Izoh',
        save: 'Saqlash',
      },
      table: {
        date: 'Sana',
        product: 'Mahsulot / xarajat',
        quantity: 'Miqdor',
        amount: 'Summasi',
        notes: 'Izoh',
        actions: 'Amallar',
      },
    },
  
    reportsPage: {
      title: 'Hisobotlar',
      subtitle: 'Moliyaviy va operatsion ko‘rsatkichlar',
      stats: {
        revenue: 'Umumiy daromad',
        expenses: 'Umumiy xarajat',
        profit: 'Sof foyda',
        completedOrders: 'Yakunlangan buyurtmalar',
      },
      chartTitle: 'Daromad va xarajatlar (so‘nggi 30 kun)',
      servicePerformanceTitle: 'Xizmatlar bo‘yicha natijalar',
      staffOverviewTitle: 'Xodimlar haqida ma’lumot',
      staffActiveLabel: 'Faol xodimlar soni',
    },
  };