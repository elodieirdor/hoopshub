import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Circle, Line, Path, Arc } from 'react-native-svg';

const STROKE = '#FF5C00';
const OPACITY = 0.18;
const BG = '#181818';

export function BasketballCourtSVG({ height = 200 }: { height?: number }) {
  const W = 390;
  const H = height;
  // Half-court proportions scaled to view
  const scale = H / 220;
  const cX = W / 2;

  return (
    <View style={{ height, backgroundColor: BG, overflow: 'hidden' }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Court outline */}
        <Rect
          x={20}
          y={10}
          width={W - 40}
          height={H - 20}
          fill="none"
          stroke={STROKE}
          strokeWidth={1.5}
          opacity={OPACITY}
        />
        {/* Half-court line */}
        <Line
          x1={20}
          y1={H / 2}
          x2={W - 20}
          y2={H / 2}
          stroke={STROKE}
          strokeWidth={1}
          opacity={OPACITY}
        />
        {/* Centre circle */}
        <Circle
          cx={cX}
          cy={H / 2}
          r={40 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          opacity={OPACITY}
        />
        {/* Paint / key (top) */}
        <Rect
          x={cX - 60 * scale}
          y={10}
          width={120 * scale}
          height={100 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          opacity={OPACITY}
        />
        {/* Free-throw circle (top) */}
        <Circle
          cx={cX}
          cy={10 + 100 * scale}
          r={40 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          strokeDasharray="6,4"
          opacity={OPACITY}
        />
        {/* Backboard (top) */}
        <Line
          x1={cX - 18 * scale}
          y1={10 + 10 * scale}
          x2={cX + 18 * scale}
          y2={10 + 10 * scale}
          stroke={STROKE}
          strokeWidth={2}
          opacity={OPACITY + 0.1}
        />
        {/* Basket (top) */}
        <Circle
          cx={cX}
          cy={10 + 16 * scale}
          r={6 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1.5}
          opacity={OPACITY + 0.1}
        />
        {/* Three-point arc (top) */}
        <Path
          d={`M ${cX - 80 * scale} ${10} A ${90 * scale} ${90 * scale} 0 0 1 ${cX + 80 * scale} ${10}`}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          opacity={OPACITY}
        />
        {/* Paint / key (bottom) */}
        <Rect
          x={cX - 60 * scale}
          y={H - 10 - 100 * scale}
          width={120 * scale}
          height={100 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          opacity={OPACITY}
        />
        {/* Free-throw circle (bottom) */}
        <Circle
          cx={cX}
          cy={H - 10 - 100 * scale}
          r={40 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          strokeDasharray="6,4"
          opacity={OPACITY}
        />
        {/* Backboard (bottom) */}
        <Line
          x1={cX - 18 * scale}
          y1={H - 10 - 10 * scale}
          x2={cX + 18 * scale}
          y2={H - 10 - 10 * scale}
          stroke={STROKE}
          strokeWidth={2}
          opacity={OPACITY + 0.1}
        />
        {/* Basket (bottom) */}
        <Circle
          cx={cX}
          cy={H - 10 - 16 * scale}
          r={6 * scale}
          fill="none"
          stroke={STROKE}
          strokeWidth={1.5}
          opacity={OPACITY + 0.1}
        />
        {/* Three-point arc (bottom) */}
        <Path
          d={`M ${cX - 80 * scale} ${H - 10} A ${90 * scale} ${90 * scale} 0 0 0 ${cX + 80 * scale} ${H - 10}`}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          opacity={OPACITY}
        />
      </Svg>
    </View>
  );
}
