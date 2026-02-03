import { useEffect, useState } from "react";
import { Text } from "react-native";

export function ThinkingDots({
  base = "",
  intervalMs = 350,
  style,
}: {
  base?: string;
  intervalMs?: number;
  style?: any;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % 3), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const dots = ".".repeat(i + 1);
  return <Text style={style}>{base}{dots}</Text>;
}
