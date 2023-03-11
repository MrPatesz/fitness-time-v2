export const getPriceFormatter = (locale: string) => new Intl.NumberFormat(locale, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const getLongDateFormatter = (locale: string) => new Intl.DateTimeFormat(locale, {
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const getShortDateFormatter = (locale: string) => new Intl.DateTimeFormat(locale, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});