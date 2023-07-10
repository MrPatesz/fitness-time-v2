import {useRouter} from "next/router";
import {useState} from "react";

export const usePriceFormatter = () => {
  const {locale = "en"} = useRouter();
  const [priceFormatter] = useState(() => new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }));

  return priceFormatter;
};

export const useLongDateFormatter = () => {
  const {locale = "en"} = useRouter();
  const [longDateFormatter] = useState(() => new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }));

  return longDateFormatter;
};

export const useShortDateFormatter = () => {
  const {locale = "en"} = useRouter();
  const [shortDateFormatter] = useState(() => new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }));

  return shortDateFormatter;
};

export const useSignedNumberFormatter = () => {
  const {locale = "en"} = useRouter();
  const [signedNumberFormatter] = useState(() => new Intl.NumberFormat(locale, {
    signDisplay: "exceptZero",
  }));

  return signedNumberFormatter;
};
