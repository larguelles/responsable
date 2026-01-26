import { View, ViewProps } from 'react-native';
import { theme } from './theme';

export const Card = (props: ViewProps) => {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: theme.radius,
          padding: theme.pad,
          borderWidth: 1,
          borderColor: theme.hairline,
        },
        props.style,
      ]}
    />
  );
};
