export const TEXTS = {
  ru: {
    mainStatTitleT: 'Статистика',
    btcStatTitleT: 'Статистика Биткоина',
    backT: 'Назад',
    // DepositStatPage
    depositStatTitleT: 'Статистика портфелей',
    totalInvestedT: 'Всего инвестировано',
    currentPriceT: 'Текущая цена портфелей',
    profitAllT: 'Прибыль по всем портфелям',
  },
  de: {
    mainStatTitleT: 'Statistik',
    btcStatTitleT: 'Bitcoin-Statistik',
    backT: 'Zurück',
    // DepositStatPage
    depositStatTitleT: 'Portfolio-Statistik',
    totalInvestedT: 'Gesamt investiert',
    currentPriceT: 'Aktueller Portfoliowert',
    profitAllT: 'Gewinn aller Portfolios',
  },
};

export const getLocale = (language: 'ru' | 'de'): string => {
  return language === 'ru' ? 'ru-RU' : 'de-DE';
};
