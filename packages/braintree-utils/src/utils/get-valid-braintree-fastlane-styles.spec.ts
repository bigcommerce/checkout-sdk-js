import getValidBraintreeFastlaneStyles from './get-valid-braintree-fastlane-styles';

describe('#getValidBraintreeFastlaneStyles()', () => {
    it('returns default styles options if styles not provided', () => {
        expect(getValidBraintreeFastlaneStyles()).toEqual({
            root: {
                backgroundColorPrimary: 'transparent',
                errorColor: '#C40B0B',
                fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
            },
            input: {
                borderRadius: '0.25rem',
                borderColor: '#9E9E9E',
                focusBorderColor: '#4496F6',
            },
            toggle: {
                colorPrimary: '#0F005E',
                colorSecondary: '#ffffff',
            },
            text: {
                body: {
                    color: '#222222',
                    fontSize: '1rem',
                },
                caption: {
                    color: '#515151',
                    fontSize: '1rem',
                },
            },
            branding: 'light',
        });
    });

    it('returns styles options with provided modifications', () => {
        const styles = {
            input: {
                borderColor: 'blue',
                focusBorderColor: 'yellow',
            },
        };

        expect(getValidBraintreeFastlaneStyles(styles)).toEqual({
            root: {
                backgroundColorPrimary: 'transparent',
                errorColor: '#C40B0B',
                fontFamily: 'Montserrat, Helvetica, Arial, sans-serif',
            },
            input: {
                borderRadius: '0.25rem',
                borderColor: 'blue',
                focusBorderColor: 'yellow',
            },
            toggle: {
                colorPrimary: '#0F005E',
                colorSecondary: '#ffffff',
            },
            text: {
                body: {
                    color: '#222222',
                    fontSize: '1rem',
                },
                caption: {
                    color: '#515151',
                    fontSize: '1rem',
                },
            },
            branding: 'light',
        });
    });
});
