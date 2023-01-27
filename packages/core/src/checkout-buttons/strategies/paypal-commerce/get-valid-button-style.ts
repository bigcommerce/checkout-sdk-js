import { isNil, omitBy } from 'lodash';

import {
    PaypalStyleButtonColor,
    PaypalStyleButtonLabel,
    PaypalStyleButtonLayout,
    PaypalStyleButtonShape,
    PaypalStyleOptions,
} from '../../../payment/strategies/paypal-commerce';

export default function getValidButtonStyle(style: PaypalStyleOptions): PaypalStyleOptions {
    const { label, color, layout, shape, height, tagline } = style;

    const validStyles = {
        color: getValidColor(color),
        height: getValidHeight(height),
        label: getValidLabel(label),
        layout: getValidLayout(layout),
        shape: getValidShape(shape),
        tagline: getValidTagline(tagline, layout),
    };

    return omitBy(validStyles, isNil);
}

function getValidColor(color?: PaypalStyleButtonColor): PaypalStyleButtonColor | undefined {
    return color && PaypalStyleButtonColor[color] ? color : undefined;
}

function getValidLabel(label?: PaypalStyleButtonLabel): PaypalStyleButtonLabel | undefined {
    return label && PaypalStyleButtonLabel[label] ? label : undefined;
}

function getValidLayout(layout?: PaypalStyleButtonLayout): PaypalStyleButtonLayout | undefined {
    return layout && PaypalStyleButtonLayout[layout] ? layout : undefined;
}

function getValidShape(shape?: PaypalStyleButtonShape): PaypalStyleButtonShape | undefined {
    return shape && PaypalStyleButtonShape[shape] ? shape : undefined;
}

function getValidTagline(tagline?: boolean, layout?: string): boolean | undefined {
    if (tagline && typeof tagline === 'boolean' && layout === PaypalStyleButtonLayout.horizontal) {
        return tagline;
    }

    return undefined;
}

function getValidHeight(height?: number): number {
    const defaultHeight = 40;
    const minHeight = 25;
    const maxHeight = 55;

    if (!height || typeof height !== 'number') {
        return defaultHeight;
    }

    if (height > maxHeight) {
        return maxHeight;
    }

    if (height < minHeight) {
        return minHeight;
    }

    return height;
}
