import { View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface StatBarProps {
  value: number;
  max: number;
  color: string;
  height?: number;
}

/** Plain horizontal bar scaled to `max`. The only visual primitive the stats screen needs. */
export function StatBar({ value, max, color, height = 8 }: StatBarProps) {
  const { theme } = useTheme();
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: theme.colors.surfaceBorder, overflow: "hidden" }}>
      <View style={{ width: `${pct * 100}%`, height: "100%", borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}
