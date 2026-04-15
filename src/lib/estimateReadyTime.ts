// src/lib/estimateReadyTime.ts
// Kirxona smart vaqt hisoblash algoritmi
// Ish soati: 09:00 – 19:00
// Manba: kirxona bosh ishchisi bilan suhbat (2026-04-06)

import { ClothingType, ClothingColor, LaundryService } from '@/types';

export interface EstimateParams {
  clothingType: ClothingType;
  color: ClothingColor;
  dirtyLevel: number; // 1–5
  services: LaundryService[];
  isUrgent: boolean;
  itemCount: number;
  submittedAt?: Date;
  processingDays?: number;   // Qabul kunidan necha ish kuni keyin yuvish boshlanadi (default: 0)
  todayOrderCount?: number;  // Bugungi buyurtmalar soni
  dailyOrderLimit?: number;  // Kunlik limit — oshsa +1 kun
}

// ─── Konstantalar ────────────────────────────────────────────────────────────
const WORK_START = 9;  // 09:00
const WORK_END   = 19; // 19:00

// Yuvish vaqtlari — bir sikl uchun (daqiqa)
const WASH_MINUTES: Record<ClothingType, number> = {
  REGULAR:     70, // avg 60–80
  JACKET_COAT: 40,
  BLANKET:     70, // avg 60–80
  CURTAIN:     85, // avg 80–90
  SUIT:        70,
};

// Quritgich vaqti — bir kiyim uchun (daqiqa, avg 90–120)
const DRY_MINUTES = 105;

// Dazmollash — har bir kiyim uchun (daqiqa)
const IRON_PER_ITEM = 15;

// Kimyoviy ishlov vaqti (daqiqa)
const CHEMICAL_MINUTES = 120;

/**
 * Kir darajasiga qarab har bir qo'shimcha daraja uchun bonus daqiqalar.
 * Bu — yuvish sikllari o'zgarmasa ham oldindan namlash va ishlov berish vaqtini ifodalaydi.
 * Daraja 1 = 0 bonus, daraja 5 = 4 × qiymat.
 */
const DIRTY_BONUS_PER_LEVEL: Record<ClothingType, number> = {
  REGULAR:     12, // har bir daraja: +12 daqiqa (umumiy maks: +48 daq)
  JACKET_COAT: 10, // nozik mato → +10 daqiqa (umumiy maks: +40 daq)
  BLANKET:     20, // katta hajm → +20 daqiqa (umumiy maks: +80 daq)
  CURTAIN:     18, // ingichka to'qima → +18 daqiqa (umumiy maks: +72 daq)
  SUIT:        10, // nozik mato → +10 daqiqa (umumiy maks: +40 daq)
};

// ─── Yordamchi funksiyalar ────────────────────────────────────────────────────

/** Kir darajasi bo'yicha yuvish sikllari */
function dirtinessCycles(level: number): number {
  if (level <= 2) return 1;
  if (level === 3) return 2;
  return 3; // 4–5
}

/**
 * Kir darajasiga qarab qo'shimcha ishlov vaqti (daqiqa).
 * Yuvish sikllari o'zgarmasa ham (masalan, parda/odealo uchun),
 * bu bonus har doim kir darajasini vaqtga aks ettiradi:
 *   daraja 1 → +0 daq
 *   daraja 2 → +N daq
 *   daraja 3 → +2N daq
 *   daraja 4 → +3N daq
 *   daraja 5 → +4N daq  (N = kiyim turiga qarab)
 */
function dirtyBonusMinutes(clothingType: ClothingType, dirtyLevel: number): number {
  return (dirtyLevel - 1) * DIRTY_BONUS_PER_LEVEL[clothingType];
}

/** Rang bo'yicha yuvish sikllari */
function colorCycles(color: ClothingColor): number {
  if (color === 'BRIGHT') return 3;
  if (color === 'DARK')   return 2;
  return 1;
}

/**
 * Yakuniy yuvish sikllari soni.
 * Palto / Kostyum / Odealo / Parda → har doim 1 marta.
 * Oddiy kiyim → max(kir_darajasi, rang) qoidasi.
 */
export function getWashCycles(
  type: ClothingType,
  color: ClothingColor,
  dirtyLevel: number,
): number {
  // Palto va kostyum/shim uchun rang qoidasi 1 ta — lekin kir darajasi hali ham ishlaydi
  if (type === 'JACKET_COAT' || type === 'SUIT') {
    return dirtinessCycles(dirtyLevel); // rangga bog'liq emas, kirlikka bog'liq
  }
  // Odealo va parda uchun har doim 1 marta (biznes qoidasi)
  if (type === 'BLANKET' || type === 'CURTAIN') {
    return 1;
  }
  // Oddiy kiyim: max(kir_darajasi, rang) qoidasi
  return Math.max(dirtinessCycles(dirtyLevel), colorCycles(color));
}

/**
 * Ish soatlariga moslashtirish.
 * - Ish vaqtidan oldin bo'lsa → bugungi 09:00
 * - Ish vaqtidan keyin bo'lsa → ertangi 09:00
 */
function adjustToWorkingHours(date: Date): Date {
  const d = new Date(date);
  const h = d.getHours();
  const m = d.getMinutes();

  if (h < WORK_START) {
    d.setHours(WORK_START, 0, 0, 0);
  } else if (h > WORK_END || (h === WORK_END && m > 0)) {
    d.setDate(d.getDate() + 1);
    d.setHours(WORK_START, 0, 0, 0);
  }
  return d;
}

/**
 * N ta ish kunini qo'shadi (Dushanba–Shanba), weekendlarni (Yakshanba) o'tkazib yuboradi.
 * Natija sana soat WORK_START da 09:00 ga o'rnatiladi.
 */
function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setHours(WORK_START, 0, 0, 0);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay(); // 0=Yakshanba, 6=Shanba
    if (dow !== 0) added++; // Yakshanbani o'tkazib yuborish (O'zbekistonda Shanba ish kuni)
  }
  return d;
}

/**
 * Belgilangan daqiqa sonini qo'shish, ish soatlarini hisobga olib.
 * Ish soati ichidagi vaqtni to'g'ridan-to'g'ri qo'shadi;
 * agar soat 19:00 dan oshib ketsa ertangi 09:00 ga o'tadi.
 */
function addWorkMinutes(from: Date, minutes: number): Date {
  let remaining = minutes;
  let d = new Date(from);

  // Avval ish soatlariga moslashtir
  d = adjustToWorkingHours(d);

  while (remaining > 0) {
    const endOfDay = new Date(d);
    endOfDay.setHours(WORK_END, 0, 0, 0);

    const minutesLeftToday = Math.max(
      0,
      (endOfDay.getTime() - d.getTime()) / 60000,
    );

    if (remaining <= minutesLeftToday) {
      d = new Date(d.getTime() + remaining * 60000);
      remaining = 0;
    } else {
      // Bugungi ish vaqti tugadi, ertaga o't
      remaining -= minutesLeftToday;
      d.setDate(d.getDate() + 1);
      d.setHours(WORK_START, 0, 0, 0);
    }
  }

  return d;
}

// ─── Asosiy funksiya ──────────────────────────────────────────────────────────

/**
 * Buyurtma tayyor bo'lish vaqtini hisoblaydi.
 *
 * Jadval qoidalari (isUrgent = false):
 *  - BRIGHT rang, soat ≥ 12:00 → ertasiga 09:00 dan boshlash
 *  - DARK rang, soat < 14:00   → 14:00 ga qadar kechikish
 *
 * Zudlik (isUrgent):
 *  - BLANKET | JACKET_COAT → yuvib, ilib quritish → ertasiga 10:10
 *  - Boshqa → navbat ustuvorligi (queueBuffer 15 daqiqa)
 */
export function estimateReadyTime(params: EstimateParams): Date {
  const {
    clothingType,
    color,
    dirtyLevel,
    services,
    isUrgent,
    itemCount,
    submittedAt = new Date(),
  } = params;

  const hasWashing  = services.includes('WASHING');
  const hasDrying   = services.includes('DRYING');
  const hasChemical = services.includes('CHEMICAL');
  const hasIroning  = services.includes('IRONING');

  // ── Maxsus holat: Zudlik + Odealo yoki Palto ──────────────────────────────
  // Yuvib, ilib quritiladi → ertasiga ertalab 10 daqiqa quritgich → tayyor
  if (isUrgent && (clothingType === 'BLANKET' || clothingType === 'JACKET_COAT')) {
    const nextDay = new Date(submittedAt);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(WORK_START + 1, 10, 0, 0); // 10:10
    return nextDay;
  }

  // ── 1. Tayyorlash vaqti ───────────────────────────────────────────────────
  const prepTime = hasChemical ? 10 : (hasWashing ? 20 : 0);

  // ── 2. Yuvish vaqti ───────────────────────────────────────────────────────
  // Sikl vaqti + kir darajasiga qarab qo'shimcha ishlov vaqti.
  // Bu bonus kiyim turi yoki rangdan qat'i nazar har doim ishlaydi,
  // shuning uchun daraja 1 va daraja 5 HECH QACHON bir xil bo'lmaydi.
  let washTime = 0;
  if (hasWashing) {
    const cycles     = getWashCycles(clothingType, color, dirtyLevel);
    const dirtyBonus = dirtyBonusMinutes(clothingType, dirtyLevel);
    washTime = cycles * WASH_MINUTES[clothingType] + dirtyBonus;
  }

  // ── 3. Kimyoviy ishlov vaqti ──────────────────────────────────────────────
  const chemTime = hasChemical ? CHEMICAL_MINUTES : 0;

  // ── 4. Quritish vaqti ────────────────────────────────────────────────────
  // 2 ta quritgich mavjud → har safar 2 tani parallel quritish mumkin
  let dryTime = 0;
  if (hasDrying) {
    const dryerRounds = Math.ceil(itemCount / 2);
    dryTime = dryerRounds * DRY_MINUTES;
  }

  // ── 5. Dazmollash vaqti ───────────────────────────────────────────────────
  const ironTime = hasIroning ? itemCount * IRON_PER_ITEM : 0;

  // ── 6. Navbat kutish (queue buffer) ───────────────────────────────────────
  const queueBuffer = isUrgent ? 15 : 45;

  // ── 7. processingDays + dailyOrderLimit + jadval kechikishi ──────────────
  const currentHour = submittedAt.getHours();

  const days = params.processingDays ?? 0;
  const todayCount = params.todayOrderCount ?? 0;
  const limit = params.dailyOrderLimit ?? Infinity;

  // Bugungi limit to'lgan bo'lsa +1 qo'shimcha kun
  const extraDay = (limit !== Infinity && todayCount >= limit) ? 1 : 0;
  const totalDays = days + extraDay;

  let startFrom: Date;

  if (totalDays > 0) {
    // N ish kunidan keyin, soat 09:00 da boshlash
    startFrom = addWorkingDays(submittedAt, totalDays);
  } else {
    // Eski xulq-atvor: rang qoidalari asosida hisoblash
    startFrom = new Date(submittedAt);
    if (!isUrgent) {
      if (color === 'BRIGHT' && currentHour >= 12) {
        // Yorqin ranglar tushdan keyin qabul qilinsa → ertasiga ertalab
        startFrom.setDate(startFrom.getDate() + 1);
        startFrom.setHours(WORK_START, 0, 0, 0);
      } else if (color === 'DARK' && currentHour < 14) {
        // To'q ranglar 14:00 dan keyin boshlanadi
        startFrom.setHours(14, 0, 0, 0);
        if (startFrom < submittedAt) startFrom = new Date(submittedAt);
      }
    }
  }

  // Ish soatlariga moslashtir
  startFrom = adjustToWorkingHours(startFrom);

  // ── 8. Jami vaqt ─────────────────────────────────────────────────────────
  const totalMinutes =
    queueBuffer + prepTime + washTime + chemTime + dryTime + ironTime;

  return addWorkMinutes(startFrom, totalMinutes);
}

// ─── Display formatlash ───────────────────────────────────────────────────────

/**
 * Tayyor vaqtni foydalanuvchiga qulay ko'rinishda chiqaradi.
 * "Bugun 16:30 ga tayyor" | "Ertaga 10:10 ga tayyor" | "12-iyun, 14:00 ga tayyor"
 */
export function formatReadyTime(date: Date, lang: string = 'uz'): string {
  const now      = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday    = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('uz-UZ', {
    hour:   '2-digit',
    minute: '2-digit',
  });

  if (lang === 'ru') {
    if (isToday)    return `Сегодня в ${timeStr}`;
    if (isTomorrow) return `Завтра в ${timeStr}`;
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long',
    }) + ` в ${timeStr}`;
  }

  if (lang === 'en') {
    if (isToday)    return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return date.toLocaleDateString('en-US', {
      day: 'numeric', month: 'long',
    }) + ` at ${timeStr}`;
  }

  // uz (default)
  if (isToday)    return `Bugun soat ${timeStr} ga tayyor`;
  if (isTomorrow) return `Ertaga soat ${timeStr} ga tayyor`;
  return date.toLocaleDateString('uz-UZ', {
    day: 'numeric', month: 'long',
  }) + ` soat ${timeStr} ga tayyor`;
}
