import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

type Props = {
  value: number | null;
  onChange?: (value: number) => void;
  size?: number;
  disabled?: boolean;
};

const STARS = [1, 2, 3, 4, 5] as const;

export function StarRating({ value, onChange, size = 28, disabled }: Props) {
  const readOnly = disabled || !onChange;
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {STARS.map((n) => {
        const filled = (value ?? 0) >= n;
        return (
          <Pressable
            key={n}
            onPress={readOnly ? undefined : () => onChange?.(n)}
            disabled={readOnly}
            hitSlop={4}
          >
            <Ionicons
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={disabled ? '#bbb' : '#F5B301'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
