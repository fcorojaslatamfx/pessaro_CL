import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind sin conflictos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda.
 * @example formatCurrency(5000) → "USD 5,000"
 * @example formatCurrency(1234.5, 'CLP') → "CLP 1,235"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'es-CL'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número grande en formato compacto.
 * @example formatCompactNumber(1500000) → "1.5M"
 * @example formatCompactNumber(25000) → "25K"
 */
export function formatCompactNumber(
  value: number,
  locale: string = 'es-CL'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
