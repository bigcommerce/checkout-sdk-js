import getFastlaneStyles from './get-fastlane-styles';

describe('#getFastlaneStyles()', () => {
    it('returns styles options with provided modifications', () => {
        const styles = {
            fastlaneRootSettingsBackgroundColor: 'red',
            fastlaneInputSettingsBorderColor: 'green',
            fastlaneTextBodySettingsFontSize: '12px',
            fastlaneTextBodySettingsColor: 'blue',
        };

        const uiStyles = {
            root: {
                backgroundColorPrimary: 'green',
            },
            text: {
                caption: {
                    fontSize: '15px',
                },
            },
        };

        expect(getFastlaneStyles(styles, uiStyles)).toEqual({
            root: {
                backgroundColorPrimary: 'red',
            },
            input: {
                borderColor: 'green',
            },
            text: {
                body: {
                    fontSize: '12px',
                    color: 'blue',
                },
                caption: {
                    fontSize: '15px',
                },
            },
        });
    });
});
