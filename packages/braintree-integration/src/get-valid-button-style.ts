import { isNil, omitBy } from 'lodash';

import { PaypalStyleOptions } from '@bigcommerce/checkout-sdk/braintree-utils';

export default function getValidButtonStyle(style?: PaypalStyleOptions): PaypalStyleOptions {
    const { color, fundingicons, height = 40, layout, shape, size, tagline } = style || {};

    const validStyles = {
        color,
        fundingicons,
        height: getValidHeight(height),
        layout,
        shape: shape || 'rect',
        size,
        tagline,
    };

    return omitBy(validStyles, isNil);
}

function getValidHeight(height: number | string): number {
    const minHeight = 25;
    const defaultHeight = 40;
    const maxHeight = 55;

    const currentHeight = typeof height === 'string' ? +height : height;

    if (Number.isNaN(currentHeight)) {
        return defaultHeight;
    }

    if (currentHeight > maxHeight) {
        return maxHeight;
    }

    if (currentHeight < minHeight) {
        return minHeight;
    }

    return currentHeight;
}
