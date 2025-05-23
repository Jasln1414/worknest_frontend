export const timeRangeOptions = Array.from({ length: 2025 - 2000 + 1 }, (_, index) => {
  const year = 2025 - index;
  return { value: year, label: year.toString() };
});