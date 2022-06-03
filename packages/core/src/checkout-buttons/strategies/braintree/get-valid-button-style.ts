import { isNil, omitBy } from 'lodash';

import { PaypalButtonStyleOptions } from '../../../payment/strategies/paypal';

export default function getValidButtonStyle(style: PaypalButtonStyleOptions): PaypalButtonStyleOptions {
    const { color, fundingicons, height, layout, shape, size, tagline } = style;

    const validStyles = {
        color,
        fundingicons,
        height: validateHeight(height),
        layout,
        shape: shape || 'rect',
        size,
        tagline,
    };

    return omitBy(validStyles, isNil);
}

function validateHeight(height?: number): number | undefined {
    const minHeight = 25;
    const maxHeight = 55;

    if (typeof height !== 'number') {
        return undefined;
    }

    return (height < minHeight && minHeight)
        || (height > maxHeight && maxHeight)
        || height;
}
