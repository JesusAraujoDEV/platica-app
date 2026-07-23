import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { useDisplayCurrency } from "@/lib/CurrencyContext";
import { DISPLAY_CURRENCIES } from "@/lib/displayCurrency";

// Compact USD/EUR/USDT pill wired to the app-wide display-currency choice.
// Reusable: drop it anywhere; width is controlled by the parent container.
const OPTIONS = DISPLAY_CURRENCIES.map((c) => ({ label: c.value, value: c.value }));

export function CurrencySwitch() {
  const [currency, setCurrency] = useDisplayCurrency();
  return <SegmentedToggle options={OPTIONS} value={currency} onChange={setCurrency} />;
}
