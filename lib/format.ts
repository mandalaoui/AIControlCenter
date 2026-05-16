import { getIntlLocale } from "@/lib/i18n/format-locale";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatCurrency(value: number): string {
  const rounded = roundMoney(value);
  return `$${rounded.toLocaleString(getIntlLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatRoiDisplay(roi: number): string {
  if (roi >= 10000) {
    return "10,000%+";
  }
  return `${roundPercent(roi).toLocaleString()}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(getIntlLocale(), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatScore(value: number): string {
  return formatNumber(roundScore(value), 1);
}

export function formatPercentChange(value: number): string {
  return `${Math.abs(roundPercent(value))}%`;
}

export function formatCurrencyPrecise(value: number): string {
  const rounded = roundMoney(value);
  return `$${rounded.toLocaleString(getIntlLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}