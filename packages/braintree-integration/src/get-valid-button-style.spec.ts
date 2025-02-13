import {
    PaypalButtonStyleColorOption,
    PaypalButtonStyleLayoutOption,
    PaypalButtonStyleShapeOption,
    PaypalButtonStyleSizeOption,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import getValidButtonStyle from './get-valid-button-style';

describe('#getValidButtonStyle()', () => {
    it('returns valid button style', () => {
        const stylesMock = {
            color: PaypalButtonStyleColorOption.SIlVER,
            fundingicons: true,
            height: 55,
            layout: PaypalButtonStyleLayoutOption.HORIZONTAL,
            shape: PaypalButtonStyleShapeOption.RECT,
            size: PaypalButtonStyleSizeOption.SMALL,
            tagline: true,
        };

        const expects = {
            ...stylesMock,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns button style with rect shape if shape is not provided', () => {
        const stylesMock = {
            color: PaypalButtonStyleColorOption.SIlVER,
            fundingicons: true,
            height: 55,
            layout: PaypalButtonStyleLayoutOption.HORIZONTAL,
            shape: undefined,
            size: PaypalButtonStyleSizeOption.SMALL,
            tagline: true,
        };

        const expects = {
            ...stylesMock,
            shape: PaypalButtonStyleShapeOption.RECT,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles with updated height if height value is bigger than expected', () => {
        const stylesMock = {
            color: PaypalButtonStyleColorOption.SIlVER,
            fundingicons: true,
            height: 110,
            layout: PaypalButtonStyleLayoutOption.HORIZONTAL,
            shape: PaypalButtonStyleShapeOption.RECT,
            size: PaypalButtonStyleSizeOption.SMALL,
            tagline: true,
        };

        const expects = {
            ...stylesMock,
            height: 55,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles with updated height if height value is less than expected', () => {
        const stylesMock = {
            color: PaypalButtonStyleColorOption.SIlVER,
            fundingicons: true,
            height: 10,
            layout: PaypalButtonStyleLayoutOption.HORIZONTAL,
            shape: PaypalButtonStyleShapeOption.RECT,
            size: PaypalButtonStyleSizeOption.SMALL,
            tagline: true,
        };

        const expects = {
            ...stylesMock,
            height: 25,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });
});
