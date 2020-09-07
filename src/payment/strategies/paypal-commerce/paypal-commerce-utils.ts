import { PaypalButtonStyleOptions, StyleButtonColor, StyleButtonLabel, StyleButtonLayout, StyleButtonShape } from './paypal-commerce-sdk';

export const validateStyleParams = (style: PaypalButtonStyleOptions): PaypalButtonStyleOptions  => {
    const updatedStyle: PaypalButtonStyleOptions = { ...style };
    const { label, color, layout, shape, height, tagline } = style;

    if (label && !StyleButtonLabel[label]) {
        delete updatedStyle.label;
    }

    if (layout && !StyleButtonLayout[layout]) {
        delete updatedStyle.layout;
    }

    if (color && !StyleButtonColor[color]) {
        delete updatedStyle.color;
    }

    if (shape && !StyleButtonShape[shape]) {
        delete updatedStyle.shape;
    }

    if (typeof height === 'number') {
        updatedStyle.height = height < 25
            ? 25
            : (height > 55 ? 55 : height);
    } else {
        delete updatedStyle.height;
    }

    if (typeof tagline !== 'boolean' || (tagline && updatedStyle.layout !== StyleButtonLayout[StyleButtonLayout.horizontal])) {
        delete updatedStyle.tagline;
    }

    return updatedStyle;
};
