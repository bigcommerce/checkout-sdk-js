import getFastlaneStyles from './get-fastlane-styles';

describe('#getFastlaneStyles()', () => {
    it('returns styles options with provided modifications', () => {
        const styles = {
            fastlaneRootSettingsBackgroundColor: 'red',
            fastlaneInputSettingsBorderColor: 'green',
        };

        const uiStyles = {
            root: {
                backgroundColorPrimary: 'green',
            },
        };

        expect(getFastlaneStyles(styles, uiStyles)).toEqual({
            root: {
                backgroundColorPrimary: 'red',
            },
            input: {
                borderColor: 'green',
            },
        });
    });
});
