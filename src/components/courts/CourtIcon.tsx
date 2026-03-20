import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, Circle, Path } from 'react-native-svg';
import { Court } from '@/types';

interface Props {
  court: Court;
}

export default function CourtIcon({ court }: Props) {
  const isIndoor = court.court_type === 'indoor';
  const isFullCourt = court.full_court !== false; // true or null → show full court

  const color = isIndoor ? '#3B82F6' : '#FF5C00';
  const bg = isIndoor ? 'rgba(59,130,246,0.12)' : 'rgba(255,92,0,0.12)';

  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {isFullCourt ? (
        <Svg width={34} height={26} viewBox="0 0 34 26">
          {/* Outer boundary */}
          <Rect x="1" y="1" width="32" height="24" rx="2"
            stroke={color} strokeWidth="1.5" fill="none" />
          {/* Centre line */}
          <Line x1="17" y1="1" x2="17" y2="25"
            stroke={color} strokeWidth="1" />
          {/* Centre circle */}
          <Circle cx="17" cy="13" r="4"
            stroke={color} strokeWidth="1" fill="none" />
          {/* Left key */}
          <Rect x="1" y="8" width="8" height="10"
            stroke={color} strokeWidth="1" fill="none" />
          {/* Right key */}
          <Rect x="25" y="8" width="8" height="10"
            stroke={color} strokeWidth="1" fill="none" />
          {/* Left arc */}
          <Path d="M 9 8 Q 14 13 9 18"
            stroke={color} strokeWidth="1" fill="none" />
          {/* Right arc */}
          <Path d="M 25 8 Q 20 13 25 18"
            stroke={color} strokeWidth="1" fill="none" />
        </Svg>
      ) : (
        <Svg width={34} height={26} viewBox="0 0 34 26">
          {/* Outer boundary */}
          <Rect x="1" y="1" width="32" height="24" rx="2"
            stroke={color} strokeWidth="1.5" fill="none" />
          {/* Half court line — dashed */}
          <Line x1="17" y1="1" x2="17" y2="25"
            stroke={color} strokeWidth="1" strokeDasharray="2 2" />
          {/* Key — left side only */}
          <Rect x="1" y="8" width="8" height="10"
            stroke={color} strokeWidth="1" fill="none" />
          {/* Arc */}
          <Path d="M 9 8 Q 14 13 9 18"
            stroke={color} strokeWidth="1" fill="none" />
          {/* Centre half-circle */}
          <Path d="M 17 9 Q 22 13 17 17"
            stroke={color} strokeWidth="1" fill="none" />
        </Svg>
      )}
    </View>
  );
}
