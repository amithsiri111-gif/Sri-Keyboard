import React from "react";
import {
  TextInput,
  type TextInputProps,
  type TextStyle,
  type StyleProp,
} from "react-native";
import { useColors } from "../../hooks/use-colors";

export type TextareaProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ style, ...props }, ref) => {
    const colors = useColors();
    return (
      <TextInput
        ref={ref}
        multiline
        placeholderTextColor={colors.mutedForeground}
        selectionColor={colors.primary}
        textAlignVertical="top"
        style={[
          {
            color: colors.foreground,
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: colors.radius,
            padding: 12,
            fontFamily: "NotoSansSinhala_400Regular",
            fontSize: 16,
            lineHeight: 25,
          },
          style,
        ]}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
