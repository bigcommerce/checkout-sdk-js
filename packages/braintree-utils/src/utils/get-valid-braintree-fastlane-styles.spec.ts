import getValidBraintreeFastlaneStyles from './get-valid-braintree-fastlane-styles';

describe('#getValidBraintreeFastlaneStyles()', () => {
    it('returns styles options with provided modifications', () => {
        const styles = {
            fastlaneRootSettingsBackgroundColor: 'red',
            fastlaneInputSettingsBorderColor: 'green',
            fastlaneTextBodySettingsFontSize: '12px',
        };

        expect(getValidBraintreeFastlaneStyles(styles)).toEqual({
            root: {
                backgroundColorPrimary: 'red',
            },
            input: {
                borderColor: 'green',
            },
            toggle: {},
            text: {
                body: {
                    fontSize: '12px',
                },
                caption: {},
            },
        });
    });
});
