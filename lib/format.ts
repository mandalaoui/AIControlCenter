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
  return `$${roundMoney(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatRoiDisplay(roi: number): string {
  if (roi >= 999) {
    return "999%+";
  }
  return `${roundPercent(roi)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
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
