import { useTheme } from '@/contexts/theme-context';
import React from 'react';
import { View } from '@gluestack-ui/themed';
import { StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export default function SparklineChart({
  data,
  positive,
  width = 190,
  height = 100,
}: {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}) {
  const { theme } = useTheme();

  if (!data || data.length < 2) return null;

  const color = positive ? theme.primary : theme.danger;
  const startFill = positive ? theme.greenStartFillColor : theme.redStartFillColor;
  const endFill = positive ? theme.greenEndFillColor : theme.redEndFillColor;

  // Shift data so the minimum sits at 0
  const minVal = Math.min(...data);
  const chartData = data.map((v) => ({
    value: v - minVal + 0.5,
  }));

  const gridColor = positive
    ? theme.pulsePositiveSurface
    : theme.pulseNegativeSurface;

  // Build horizontal grid lines
  const gridRows = 4;
  const gridCols = 5;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background grid */}
      <View style={StyleSheet.absoluteFill}>
        {Array.from({ length: gridRows + 1 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[styles.gridLineH, {
              top: (i / gridRows) * height,
              backgroundColor: gridColor,
            }]}
          />
        ))}
        {Array.from({ length: gridCols + 1 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[styles.gridLineV, {
              left: (i / gridCols) * width,
              backgroundColor: gridColor,
            }]}
          />
        ))}
      </View>

      {/* Line chart */}
      <View style={styles.chartWrap}>
        <LineChart
          data={chartData}
          width={width - 6}
          height={height - 10}
          color={color}
          thickness={2}
          curved
          curvature={0.15}
          areaChart
          startFillColor={startFill}
          endFillColor={endFill}
          startOpacity={0.5}
          endOpacity={0}
          hideDataPoints
          hideAxesAndRules
          hideYAxisText
          xAxisColor="transparent"
          yAxisColor="transparent"
          initialSpacing={0}
          endSpacing={0}
          spacing={(width - 6) / (data.length - 1)}
          backgroundColor="transparent"
          disableScroll
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 8,
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0.8, // Slight opacity to blend with background if text overlaps
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  chartWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});