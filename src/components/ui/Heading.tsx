import React from 'react';
import { Text } from 'react-native';

type Props = {
  level?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
  style?: object;
  numberOfLines?: number;
};

const sizes = { 1: 'text-4xl', 2: 'text-2xl', 3: 'text-xl' } as const;

export function Heading({ level = 1, children, className = '', style, numberOfLines }: Props) {
  return (
    <Text
      className={`font-display text-cream ${sizes[level]}${className ? ` ${className}` : ''}`}
      style={style}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
