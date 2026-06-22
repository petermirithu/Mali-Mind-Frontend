import { Dimensions, StyleSheet } from "react-native";
import { View } from '@gluestack-ui/themed';
import { LineChart } from "react-native-gifted-charts";

const { width: SW } = Dimensions.get('window');

export default function HeroChart({ color, currentSpending, pastSpending, startFillColor, endFillColor }: { color: string; currentSpending: number; pastSpending: { month: string, total_spending: number }[], startFillColor: string, endFillColor: string }) {

    // Build chart data from actual backend data
    const dataPoints = [...pastSpending.map(s => s.total_spending), currentSpending];

    // Need at least 2 points for a line chart
    if (dataPoints.length < 2) {
        dataPoints.unshift(currentSpending * 0.95);
    }

    const chartData = dataPoints.map(v => ({ value: v }));


    const w = 190;
    const h = 100;

    const gridRows = 3;
    const gridCols = Math.max(1, dataPoints.length - 1);
    const gridColor = `${color}20`; // 20% opacity of the line color

    return (
        <View style={{
            width: w, height: h,
            overflow: 'hidden',
            borderRadius: 8,
            position: 'absolute',
            right: 0,
            bottom: 60,
            opacity: 0.8,
        }}>
            {/* Background grid */}
            <View style={StyleSheet.absoluteFill}>
                {Array.from({ length: gridRows + 1 }).map((_, i) => (
                    <View
                        key={`h-${i}`}
                        style={{ position: 'absolute', left: 0, right: 0, height: 1, top: (i / gridRows) * h, backgroundColor: gridColor }}
                    />
                ))}
                {Array.from({ length: gridCols + 1 }).map((_, i) => (
                    <View
                        key={`v-${i}`}
                        style={{ position: 'absolute', top: 0, bottom: 0, width: 1, left: (i / gridCols) * w, backgroundColor: gridColor }}
                    />
                ))}
            </View>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' }}>
                <LineChart
                    data={chartData}
                    width={w - 50}
                    height={h - 50}
                    color={color}
                    thickness={2.5}
                    curved
                    curvature={0.2}
                    areaChart
                    startFillColor={startFillColor}
                    endFillColor={endFillColor}
                    startOpacity={0.3}
                    endOpacity={0}
                    hideDataPoints
                    hideAxesAndRules
                    hideYAxisText
                    xAxisColor="transparent"
                    yAxisColor="transparent"
                    initialSpacing={0}
                    endSpacing={0}
                    spacing={w / (dataPoints.length - 1)}
                    backgroundColor="transparent"
                    disableScroll
                />
            </View>
        </View>
    );
}