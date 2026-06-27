declare module 'lunar-javascript' {
  interface Solar {
    fromDate(date: Date): { getLunar(): Lunar };
  }

  interface Lunar {
    getMonthInChinese(): string;
    getDayInChinese(): string;
  }

  const Solar: Solar;

  export { Solar };
}