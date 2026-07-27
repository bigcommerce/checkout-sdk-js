import getBraintreeVenmoButtonStyle, { VenmoButtonImage } from './get-braintree-venmo-button-style';
import { PaypalButtonStyleColorOption } from './paypal';

describe('getBraintreeVenmoButtonStyle()', () => {
    it('returns the shared base styles regardless of color', () => {
        const style = getBraintreeVenmoButtonStyle({});

        expect(style).toEqual(
            expect.objectContaining({
                backgroundPosition: '50% 50%',
                backgroundSize: '80px auto',
                backgroundRepeat: 'no-repeat',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: '0.2s ease',
                minWidth: '150px',
                height: '100%',
            }),
        );
    });

    it('uses the default min height when none is provided', () => {
        expect(getBraintreeVenmoButtonStyle({}).minHeight).toBe('40px');
    });

    it('uses the provided height as the min height', () => {
        expect(getBraintreeVenmoButtonStyle({ height: 45 }).minHeight).toBe('45px');
    });

    describe('when the color is white', () => {
        it('renders a white background with a border', () => {
            const style = getBraintreeVenmoButtonStyle({
                color: PaypalButtonStyleColorOption.WHITE,
            });

            expect(style.backgroundColor).toBe('#FFFFFF');
            expect(style.border).toBe('1px solid black');
        });

        it('renders the blue button image', () => {
            const style = getBraintreeVenmoButtonStyle({
                color: PaypalButtonStyleColorOption.WHITE,
            });

            expect(style.backgroundImage).toBe(
                `url("${VenmoButtonImage[PaypalButtonStyleColorOption.BLUE]}")`,
            );
        });
    });

    describe('when the color is not white', () => {
        it('renders the default background without a border', () => {
            const style = getBraintreeVenmoButtonStyle({
                color: PaypalButtonStyleColorOption.BLUE,
            });

            expect(style.backgroundColor).toBe('#3D95CE');
            expect(style.border).toBe('none');
        });

        it('renders the white button image', () => {
            const style = getBraintreeVenmoButtonStyle({
                color: PaypalButtonStyleColorOption.BLUE,
            });

            expect(style.backgroundImage).toBe(
                `url("${VenmoButtonImage[PaypalButtonStyleColorOption.WHITE]}")`,
            );
        });
    });

    describe('VenmoButtonImage', () => {
        it('provides a data uri for each supported color', () => {
            expect(VenmoButtonImage[PaypalButtonStyleColorOption.WHITE]).toMatch(
                /^data:image\/svg\+xml;base64,/,
            );
            expect(VenmoButtonImage[PaypalButtonStyleColorOption.BLUE]).toMatch(
                /^data:image\/svg\+xml;base64,/,
            );
        });
    });
});
