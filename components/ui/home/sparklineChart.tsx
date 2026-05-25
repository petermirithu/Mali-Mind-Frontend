import { useTheme } from '@/contexts/theme-context';
import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function SparklineChart({
  data,
  positive,
}: {
  data: number[];
  positive: boolean;
}) {
  const { theme } = useTheme();

  const W = Dimensions.get('window').width - 80; // card padding

  if (!data || data.length < 2) return null;

  const color = positive ? theme.primary : theme.danger;
  const startFillColor = positive
    ? theme.greenStartFillColor
    : theme.redStartFillColor;
  const endFillColor = positive
    ? theme.greenEndFillColor
    : theme.redEndFillColor;

  // gifted-charts expects { value: number }[]
  const chartData = data.map((v) => ({ value: v }));

  return (
    <LineChart
      data={chartData}
      width={W}
      height={72}
      // Line style
      color={color}
      thickness={2.5}
      curved
      // Gradient fill under the line
      areaChart
      startFillColor={startFillColor}
      endFillColor={endFillColor}
      startOpacity={1}
      endOpacity={0}
      // Hide all decorations so it looks like a clean sparkline
      hideDataPoints
      hideAxesAndRules
      hideYAxisText
      xAxisColor="transparent"
      yAxisColor="transparent"
      // No padding / extra space
      initialSpacing={0}
      endSpacing={0}
      spacing={(W - 4) / (data.length - 1)}
      // Background transparent so card colour shows through
      backgroundColor="transparent"
    />
  );
}