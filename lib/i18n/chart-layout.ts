/** Recharts margin helpers (LTR). */
export function getChartMargin(options?: { yAxis?: number }) {
  const yAxis = options?.yAxis ?? 0;
  return {
    top: 8,
    right: 8,
    left: yAxis,
    bottom: 0,
  };
}

export function getVerticalBarChartMargin(yAxisWidth = 8) {
  return {
    left: yAxisWidth,
    right: 0,
  };
}
