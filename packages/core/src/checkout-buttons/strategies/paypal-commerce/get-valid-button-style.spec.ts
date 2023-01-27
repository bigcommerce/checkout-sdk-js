import {
    PaypalStyleButtonColor,
    PaypalStyleButtonLabel,
    PaypalStyleButtonLayout,
    PaypalStyleButtonShape,
} from '../../../payment/strategies/paypal-commerce';

import getValidButtonStyle from './get-valid-button-style';

describe('#getValidButtonStyle()', () => {
    it('returns valid button style', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: 55,
            shape: PaypalStyleButtonShape.rect,
        };

        const expects = {
            ...stylesMock,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns button style without shape if shape is not valid', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: 55,
            shape: 'ellipse' as PaypalStyleButtonShape,
        };

        const expects = {
            ...stylesMock,
            shape: undefined,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns button style without color if color is not valid', () => {
        const stylesMock = {
            color: 'red' as PaypalStyleButtonColor,
            height: 55,
        };

        const expects = {
            ...stylesMock,
            color: undefined,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns button style without label if label is not valid', () => {
        const stylesMock = {
            height: 55,
            label: 'label' as PaypalStyleButtonLabel,
        };

        const expects = {
            ...stylesMock,
            label: undefined,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns button style without layout if layout is not valid', () => {
        const stylesMock = {
            height: 55,
            layout: 'layout' as PaypalStyleButtonLayout,
        };

        const expects = {
            ...stylesMock,
            layout: undefined,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles with updated height if height value is bigger than expected', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: 110,
            shape: PaypalStyleButtonShape.rect,
        };

        const expects = {
            ...stylesMock,
            height: 55,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles with updated height if height value is less than expected', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: 10,
            shape: PaypalStyleButtonShape.rect,
        };

        const expects = {
            ...stylesMock,
            height: 25,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles with default height if height value not provided', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: undefined,
            shape: PaypalStyleButtonShape.rect,
        };

        const expects = {
            ...stylesMock,
            height: 40,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles without tagline for vertical layout', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: 55,
            shape: PaypalStyleButtonShape.rect,
            layout: PaypalStyleButtonLayout.vertical,
            tagline: true,
        };

        const expects = {
            ...stylesMock,
            tagline: undefined,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });

    it('returns styles with tagline if the layout is horizontal', () => {
        const stylesMock = {
            color: PaypalStyleButtonColor.silver,
            height: 55,
            shape: PaypalStyleButtonShape.rect,
            layout: PaypalStyleButtonLayout.horizontal,
            tagline: true,
        };

        const expects = {
            ...stylesMock,
        };

        expect(getValidButtonStyle(stylesMock)).toEqual(expects);
    });
});
