// src/lib/exportExcel.ts
// Hisobot ma'lumotlarini Excel (.xlsx) formatiga eksport qilish

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Order, Expense } from '@/types';

export interface ExportOptions {
  dateFrom: string;        // yyyy-MM-dd
  dateTo: string;          // yyyy-MM-dd
  includeOrders: boolean;
  includeExpenses: boolean;
  includeSummary: boolean;
  companyName?: string;
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  ijara:    "Ijara to'lovi",
  kommunal: 'Kommunal xizmatlar',
  jihozlar: 'Jihozlar / Kir yuvish vositalari',
  oylik:    'Xodimlar oyligi',
  boshqa:   'Boshqa xarajatlar',
};

const CLOTHING_TYPE_LABELS: Record<string, string> = {
  REGULAR:     'Oddiy kiyim',
  JACKET_COAT: 'Kurtka / Palto',
  BLANKET:     'Odealo / Adyol',
  CURTAIN:     'Parda',
  SUIT:        'Kostyum / Shim',
};

const STATUS_LABELS: Record<string, string> = {
  NEW:       'Yangi',
  WASHING:   'Yuvishda',
  READY:     'Tayyor',
  DELIVERED: "Yetkazilgan",
};

/** Ustun kengligini avtomatik hisoblash */
function autoColWidths(data: any[][]): XLSX.ColInfo[] {
  if (!data.length) return [];
  const cols = data[0].length;
  const widths: number[] = new Array(cols).fill(8);
  data.forEach((row) => {
    row.forEach((cell, ci) => {
      const len = cell != null ? String(cell).length : 0;
      if (len > widths[ci]) widths[ci] = len;
    });
  });
  return widths.map((w) => ({ wch: Math.min(w + 2, 50) }));
}

/** Sarlavha qatoriga stil berish uchun yordamchi */
function addHeaderStyle(ws: XLSX.WorkSheet, headerRowIndex: number, colCount: number) {
  for (let c = 0; c < colCount; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font:      { bold: true, color: { rgb: 'FFFFFF' } },
      fill:      { fgColor: { rgb: '0E7490' } },  // Teal
      alignment: { horizontal: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      },
    };
  }
}

// ─── Umumiy hisobot varag'i ────────────────────────────────────────────────

function buildSummarySheet(
  orders: Order[],
  expenses: Expense[],
  opts: ExportOptions,
): XLSX.WorkSheet {
  const revenue      = orders.reduce((s, o) => s + o.payment.total, 0);
  const totalExp     = expenses.reduce((s, e) => s + e.amount, 0);
  const profit       = revenue - totalExp;
  const completed    = orders.filter((o) => o.status === 'DELIVERED').length;

  const rows: any[][] = [
    ['Softwash — Moliyaviy hisobot'],
    ['Kompaniya:', opts.companyName || '—'],
    ['Hisobot davri:', `${opts.dateFrom} → ${opts.dateTo}`],
    ['Chiqarilgan sana:', format(new Date(), 'dd.MM.yyyy HH:mm')],
    [],
    ['Ko\'rsatkich', 'Qiymat'],
    ['Jami daromad (so\'m)', revenue],
    ['Jami xarajat (so\'m)', totalExp],
    ['Sof foyda (so\'m)', profit],
    ['Jami buyurtmalar', orders.length],
    ['Yakunlangan buyurtmalar', completed],
    [],
    ['Xarajatlar kategoriyalar bo\'yicha', ''],
    ['Kategoriya', 'Summa (so\'m)'],
    ...Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => {
      const sum = expenses
        .filter((e) => (e.category ?? 'boshqa') === key)
        .reduce((s, e) => s + e.amount, 0);
      return [label, sum];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

  // Katta sarlavha
  ws['A1'] = { v: rows[0][0], t: 's', s: { font: { bold: true, sz: 14 } } };

  return ws;
}

// ─── Buyurtmalar varag'i ──────────────────────────────────────────────────

function buildOrdersSheet(orders: Order[]): XLSX.WorkSheet {
  const header = [
    'Buyurtma raqami',
    'Mijoz ismi',
    'Telefon',
    'Kiyim turi',
    'Xizmatlar',
    'Buyumlar soni',
    'Holat',
    'Jami (so\'m)',
    'Oldindan to\'lov (so\'m)',
    'Qoldiq (so\'m)',
    'Berilgan sana',
    'Tayyor bo\'lish vaqti',
  ];

  const dataRows = orders.map((o) => [
    o.id,
    `${o.customer.firstName} ${o.customer.lastName}`.trim(),
    o.customer.phone,
    CLOTHING_TYPE_LABELS[o.details.clothingType] || o.details.clothingType,
    o.details.serviceType,
    o.details.itemCount,
    STATUS_LABELS[o.status] || o.status,
    o.payment.total,
    o.payment.advance,
    o.payment.remaining,
    o.details.dateIn,
    o.details.estimatedReadyAt
      ? format(new Date(o.details.estimatedReadyAt), 'dd.MM.yyyy HH:mm')
      : '—',
  ]);

  const allRows = [header, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = autoColWidths(allRows);
  addHeaderStyle(ws, 0, header.length);
  return ws;
}

// ─── Xarajatlar varag'i ───────────────────────────────────────────────────

function buildExpensesSheet(expenses: Expense[]): XLSX.WorkSheet {
  const header = [
    'Sana',
    'Mahsulot / xarajat',
    'Kategoriya',
    'Miqdori',
    'Birligi',
    'Summa (so\'m)',
  ];

  const dataRows = expenses.map((e) => [
    e.date,
    e.product?.uz || e.product?.ru || e.product?.en || '—',
    EXPENSE_CATEGORY_LABELS[e.category ?? 'boshqa'] || 'Boshqa',
    e.quantity,
    e.unit,
    e.amount,
  ]);

  // Jami qator
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  dataRows.push(['', 'JAMI:', '', '', '', total]);

  const allRows = [header, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = autoColWidths(allRows);
  addHeaderStyle(ws, 0, header.length);
  return ws;
}

// ─── Asosiy eksport funksiyasi ────────────────────────────────────────────

export function exportReportToExcel(
  allOrders: Order[],
  allExpenses: Expense[],
  opts: ExportOptions,
): void {
  // Sanalar bo'yicha filtrlash
  const filteredOrders = allOrders.filter((o) => {
    const d = o.details.dateIn || o.createdAt.slice(0, 10);
    return d >= opts.dateFrom && d <= opts.dateTo;
  });

  const filteredExpenses = allExpenses.filter(
    (e) => e.date >= opts.dateFrom && e.date <= opts.dateTo,
  );

  const wb = XLSX.utils.book_new();

  // 1. Umumiy hisobot
  if (opts.includeSummary) {
    const summaryWs = buildSummarySheet(filteredOrders, filteredExpenses, opts);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Umumiy hisobot');
  }

  // 2. Buyurtmalar
  if (opts.includeOrders && filteredOrders.length > 0) {
    const ordersWs = buildOrdersSheet(filteredOrders);
    XLSX.utils.book_append_sheet(wb, ordersWs, 'Buyurtmalar');
  }

  // 3. Xarajatlar
  if (opts.includeExpenses && filteredExpenses.length > 0) {
    const expensesWs = buildExpensesSheet(filteredExpenses);
    XLSX.utils.book_append_sheet(wb, expensesWs, 'Xarajatlar');
  }

  // Fayl nomini yaratish
  const fileName = `Softwash_Hisobot_${opts.dateFrom}_${opts.dateTo}.xlsx`;

  // Yuklab olish
  XLSX.writeFile(wb, fileName);
}
