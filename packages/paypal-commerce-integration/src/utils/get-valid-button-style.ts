import { isNil, omitBy } from 'lodash';

import {
    PayPalButtonStyleOptions,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from '../paypal-commerce-types';

// TODO: move this code to paypal commerce common/utils file in the future
export default function getValidButtonStyle(
    style: PayPalButtonStyleOptions,
): PayPalButtonStyleOptions {
    const { label, color, shape, height } = style;

    const validStyles = {
        color: getValidColor(color),
        height: getValidHeight(height),
        label: getValidLabel(label),
        shape: getValidShape(shape),
    };

    return omitBy(validStyles, isNil);
}

function getValidColor(color?: StyleButtonColor): StyleButtonColor | undefined {
    return color && StyleButtonColor[color] ? color : undefined;
}

function getValidLabel(label?: StyleButtonLabel): StyleButtonLabel | undefined {
    return label && StyleButtonLabel[label] ? label : undefined;
}

function getValidShape(shape?: StyleButtonShape): StyleButtonShape | undefined {
    return shape && StyleButtonShape[shape] ? shape : undefined;
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
