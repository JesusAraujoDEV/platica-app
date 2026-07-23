import { Text, type TextProps } from "react-native";
import { useDisplayCurrency } from "@/lib/CurrencyContext";
import { convertUsdToDisplay, currencySymbol } from "@/lib/displayCurrency";
import { useCurrentRate } from "@/services/rates";

interface MoneyProps extends TextProps {
  /** Amount in the app's internal accounting unit (USD). */
  amountUsd: number;
  /** Show an explicit +/- sign (amount rendered absolute). Default false. */
  sign?: boolean;
}

// ponytail: manual thousands grouping avoids Hermes Intl variance across platforms.
function format(value: number): string {
  const [whole, decimals] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${decimals}`;
}

/** Renders a USD amount in the user's selected display currency via the VES cross-rate. */
export function Money({ amountUsd, sign = false, style, ...props }: MoneyProps) {
  const [currency] = useDisplayCurrency();
  const { rate } = useCurrentRate();
  const converted = convertUsdToDisplay(amountUsd, currency, rate);
  const prefix = sign ? (converted < 0 ? "-" : "+") : converted < 0 ? "-" : "";
  return (
    <Text style={style} {...props}>
      {`${prefix}${currencySymbol(currency)}${format(converted)}`}
    </Text>
  );
}
