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

function getValidHeight(height?: number): number {
    const minHeight = 25;
    const maxHeight = 55;

    if (typeof height !== 'number' || height > maxHeight) {
        return maxHeight;
    }

    if (height < minHeight) {
        return minHeight;
    }

    return height;
}
