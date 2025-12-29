// src/locales/ru.ts
export const ru = {
    app: {
      name: 'Прачечная PureClean',
    },
    sidebar: {
      dashboard: 'Панель управления',
      orders: 'Заказы',
      employees: 'Сотрудники',
      expenses: 'Расходы',
      reports: 'Отчёты',
      settings: 'Настройки',
      companies: 'Компании',
    },
    header: {
      superadminTitle: 'Панель супер-админа',
      superadminSubtitle: 'Управление всеми прачечными',
      adminSubtitle: 'Панель управления компанией',
      superadminName: 'Суперадмин',
      adminName: 'Админ',
    },
  
    settingsPage: {
      title: 'Настройки',
      subtitle:
        'Выберите язык системы, валюту и внешний вид',
      generalTitle: 'Общие',
      generalDescription:
        'Основной язык и валюту системы',
      languageLabel: 'Язык',
      currencyLabel: 'Валюта',
  
      appearanceTitle: 'Внешний вид и темы',
      appearanceDescription:
        'Режим дня/ночи и оформление панели управления',
      themeLabel: 'Тема',
      lightTheme: 'Светлая',
      darkTheme: 'Тёмная',
      selectedLabel: 'Выбрано',
  
      dashboardThemeLabel: 'Тема панели управления',
      dashboardThemeClassic: 'Классическая',
      dashboardThemeCompact: 'Компактная',
      dashboardThemeCards: 'Карточная',
      dashboardThemeHint:
        'Этот параметр влияет только на внешний вид панели управления (Dashboard).',
  
      saveButton: 'Сохранить изменения',
      toasts: {
        savedTitle: 'Настройки сохранены',
        savedDescription:
          'Выбранные параметры успешно обновлены.',
      },
    },
  
    dashboardPage: {
      title: 'Панель управления',
      subtitle: 'Краткая статистика по вашему бизнесу',
      stats: {
        newOrders: 'Новые заказы',
        washing: 'В стирке',
        ready: 'Готово',
        revenue30d: 'Выручка (30 дней)',
      },
      chartTitle: 'Дневная выручка за последние 30 дней',
    },
  
    ordersPage: {
      title: 'Заказы',
      subtitle: 'Управляйте заказами клиентов',
      searchPlaceholder: 'Поиск по ID, имени или телефону...',
      tabs: {
        all: 'Все',
        new: 'Новые',
        washing: 'В стирке',
        ready: 'Готово',
        delivered: 'Выдано',
      },
      table: {
        id: '№ заказа',
        customer: 'Клиент',
        service: 'Услуга',
        items: 'Кол-во вещей',
        total: 'Сумма',
        status: 'Статус',
        date: 'Дата',
        actions: '',
      },
    },
  
    employeesPage: {
      title: 'Сотрудники',
      subtitle: 'Управляйте сотрудниками и их статусом',
      searchPlaceholder: 'Поиск по имени или телефону...',
      tabs: {
        all: 'Все',
        active: 'Активные',
        inactive: 'Неактивные',
      },
      table: {
        employee: 'Сотрудник',
        role: 'Должность',
        phone: 'Телефон',
        shift: 'Смена',
        dailyRate: 'Дневная ставка',
        active: 'Активность',
        actions: 'Действия',
      },
      addButton: 'Добавить сотрудника',
      dialog: {
        addTitle: 'Добавить сотрудника',
        editTitle: 'Редактировать данные сотрудника',
        save: 'Сохранить',
        saveChanges: 'Сохранить изменения',
      },
      form: {
        firstName: 'Имя',
        lastName: 'Фамилия',
        role: 'Должность',
        rolePlaceholder: 'Мойщик, курьер, менеджер...',
        phone: 'Телефон',
        shift: 'Смена',
        shiftMorning: 'Утро',
        shiftAfternoon: 'После обеда',
        shiftEvening: 'Вечер',
        dailyRate: 'Дневная ставка (сум)',
        dailyRatePlaceholder: '50000',
      },
      defaultRole: 'Сотрудник',
      hiredAtLabel: 'Принят на работу',
      badge: {
        active: 'Активен',
        inactive: 'Неактивен',
      },
      toasts: {
        createdTitle: 'Сотрудник добавлен',
        createdDescription: 'Новый сотрудник успешно сохранён.',
        updatedTitle: 'Сотрудник обновлён',
        updatedDescription:
          'Данные сотрудника успешно обновлены.',
        deletedTitle: 'Сотрудник удалён',
        deletedDescription: 'Сотрудник успешно удалён.',
        mustBeCompanyAdminTitle: 'Ошибка',
        mustBeCompanyAdminDescription:
          'Сначала войдите в систему как администратор компании.',
      },
      confirmDelete: 'Удалить сотрудника «{name}»?',
      empty: 'Сотрудники не найдены',
    },
  
    expensesPage: {
      title: 'Расходы',
      subtitle: 'Отслеживайте затраты и закупки',
      searchPlaceholder: 'Поиск по товару или примечанию...',
      statTotal: 'Общие расходы',
      statMonth: 'В этом месяце',
      newExpenseButton: 'Добавить расход',
      form: {
        date: 'Дата',
        product: 'Товар / вид расхода',
        quantity: 'Количество',
        unit: 'Ед. изм.',
        amount: 'Сумма (сум)',
        notes: 'Примечание',
        save: 'Сохранить',
      },
      table: {
        date: 'Дата',
        product: 'Товар / расход',
        quantity: 'Кол-во',
        amount: 'Сумма',
        notes: 'Примечание',
        actions: 'Действия',
      },
    },
  
    reportsPage: {
      title: 'Отчёты',
      subtitle: 'Финансовые и операционные показатели',
      stats: {
        revenue: 'Общая выручка',
        expenses: 'Общие расходы',
        profit: 'Чистая прибыль',
        completedOrders: 'Завершённые заказы',
      },
      chartTitle: 'Выручка и расходы (последние 30 дней)',
      servicePerformanceTitle: 'Эффективность услуг',
      staffOverviewTitle: 'Информация о персонале',
      staffActiveLabel: 'Кол-во активных сотрудников',
    },
  };