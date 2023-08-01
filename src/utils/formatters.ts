import {useRouter} from 'next/router';
import {useMemo} from 'react';

export const usePriceFormatter = () => {
  const {locale = 'en'} = useRouter();
  return useMemo(() => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }), [locale]);
};

export const useLongDateFormatter = () => {
  const {locale = 'en'} = useRouter();
  return useMemo(() => new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }), [locale]);
};

export const useShortDateFormatter = () => {
  const {locale = 'en'} = useRouter();
  return useMemo(() => new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }), [locale]);
};

export const useSignedNumberFormatter = () => {
  const {locale = 'en'} = useRouter();
  return useMemo(() => new Intl.NumberFormat(locale, {
    signDisplay: 'exceptZero',
  }), [locale]);
};
