import { View } from "@gluestack-ui/themed";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function ImpactBreakdownChart({
    breakdownData,
    width: chartWidth,
    height: chartHeight = 100,
    theme,
}: {
    breakdownData: { category: string; monthly_amount_kes: number; change_pct: number; direction: string }[];
    width: number;
    height?: number;
    theme: any;
}) {
    const ecs = useMemo(() => create_ecs(theme), [theme]);
    if (!breakdownData || breakdownData.length === 0) return null;

    const barColors: Record<string, { front: string; gradient: string; side: string; top: string }> = {
        'Transport': { front: theme.danger, gradient: theme.danger, side: '#C43B3B', top: '#FF7A7A' },
        'Food & Groceries': { front: theme.warning, gradient: '#F09A56', side: '#C46D2E', top: '#FFB876' },
        'Utilities': { front: theme.warning, gradient: '#F7B94D', side: '#C8871E', top: '#FFCF78' },
        'Other': { front: theme.accent, gradient: '#B18AEF', side: '#7D58C0', top: '#C9ACFF' },
    };

    const barData = breakdownData.map((item) => {
        const colors = barColors[item.category] ?? barColors['Other'];
        return {
            value: item.monthly_amount_kes,
            label: item.category.length > 8 ? item.category.substring(0, 7) + '…' : item.category,
            frontColor: colors.front,
            gradientColor: colors.gradient,
            sideColor: colors.side,
            topColor: colors.top,
            labelTextStyle: { color: theme.textDim, fontSize: 8, textAlign: 'center' as const },
        };
    });

    // Calculate max for scaling
    const maxVal = Math.max(...breakdownData.map(d => d.monthly_amount_kes));
    const gridColor = 'rgba(232, 69, 69, 0.08)';
    const gridRows = 3;
    const gridCols = breakdownData.length;

    return (
        <View style={[ecs.container, { width: chartWidth, height: chartHeight }]}>
            {/* Background grid - matching sparklineChart style */}
            <View style={StyleSheet.absoluteFill}>
                {Array.from({ length: gridRows + 1 }).map((_, i) => (
                    <View
                        key={`h-${i}`}
                        style={[ecs.gridLineH, {
                            top: (i / gridRows) * chartHeight,
                            backgroundColor: gridColor,
                        }]}
                    />
                ))}
                {Array.from({ length: gridCols + 1 }).map((_, i) => (
                    <View
                        key={`v-${i}`}
                        style={[ecs.gridLineV, {
                            left: (i / gridCols) * chartWidth,
                            backgroundColor: gridColor,
                        }]}
                    />
                ))}
            </View>

            {/* Bar chart */}
            <View style={ecs.chartWrap}>
                <BarChart
                    data={barData}
                    width={chartWidth - 10}
                    height={chartHeight - 24}
                    barWidth={Math.min(28, (chartWidth - 40) / breakdownData.length - 12)}
                    spacing={Math.max(8, (chartWidth - 40) / breakdownData.length - 24)}
                    isThreeD
                    sideWidth={6}
                    isAnimated
                    animationDuration={800}
                    noOfSections={3}
                    maxValue={maxVal * 1.15}
                    hideRules
                    hideAxesAndRules
                    hideYAxisText
                    xAxisColor="transparent"
                    yAxisColor="transparent"
                    backgroundColor="transparent"
                    disableScroll
                    initialSpacing={8}
                    endSpacing={4}
                    barBorderTopLeftRadius={4}
                    barBorderTopRightRadius={4}
                    xAxisLabelTextStyle={{ color: theme.textDim, fontSize: 8 }}
                />
            </View>
        </View>
    );
}

const create_ecs = (theme: any) => StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 8,
        position: 'relative',
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
        alignItems: 'center',
    },
});