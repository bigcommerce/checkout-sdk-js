import getFastlaneStyles from './get-fastlane-styles';

describe('#getValidBraintreeFastlaneStyles()', () => {
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

    it('returns toggle styles if provided', () => {
        const styles = {
            fastlaneToggleSettingsColorPrimary: 'red',
            fastlaneToggleSettingsColorSecondary: 'green',
        };

        expect(getFastlaneStyles(styles, undefined)).toEqual({
            toggle: {
                colorPrimary: 'red',
                colorSecondary: 'green',
            },
        });
    });

    it('returns branding styles if provided', () => {
        const styles = {
            fastlaneBrandingSettings: 'red',
        };

        expect(getFastlaneStyles(styles, undefined)).toEqual({
            branding: 'red',
        });
    });

    it('returns undefined when both styleSettings and uiStyles are undefined', () => {
        expect(getFastlaneStyles()).toBeUndefined();
    });

    it('returns uiStyles when styleSettings is undefined', () => {
        const uiStyles = {
            root: { backgroundColorPrimary: 'red' },
        };

        expect(getFastlaneStyles(undefined, uiStyles)).toEqual(uiStyles);
    });

    it('returns styleSettings when uiStyles is undefined', () => {
        const styleSettings = {
            fastlaneRootSettingsBackgroundColor: 'blue',
        };

        expect(getFastlaneStyles(styleSettings)).toEqual({
            root: { backgroundColorPrimary: 'blue' },
        });
    });

    it('merges styleSettings and uiStyles correctly', () => {
        const styleSettings = {
            fastlaneRootSettingsBackgroundColor: 'blue',
        };
        const uiStyles = {
            root: {
                backgroundColorPrimary: 'red',
                errorColor: 'black',
            },
            input: {
                borderColor: 'green',
                borderRadius: '1',
                focusBorderColor: 'green',
                backgroundColor: 'red',
                borderWidth: '1',
                textColorBase: 'green',
            },
            toggle: {
                colorPrimary: 'green',
                colorSecondary: 'green',
            },
            text: {
                body: {
                    color: 'blue',
                    fontSize: '12px',
                },
                caption: {
                    fontSize: '12px',
                    color: 'blue',
                },
            },
        };

        expect(getFastlaneStyles(styleSettings, uiStyles)).toEqual({
            root: {
                backgroundColorPrimary: 'blue',
                errorColor: 'black',
            },
            input: {
                borderColor: 'green',
                borderRadius: '1',
                focusBorderColor: 'green',
                backgroundColor: 'red',
                borderWidth: '1',
                textColorBase: 'green',
            },
            toggle: {
                colorPrimary: 'green',
                colorSecondary: 'green',
            },
            text: {
                body: {
                    color: 'blue',
                    fontSize: '12px',
                },
                caption: {
                    fontSize: '12px',
                    color: 'blue',
                },
            },
        });
    });

    it('merges styleSettings and uiStyles correctly when some objects is empty', () => {
        const styleSettings = {
            fastlaneRootSettingsBackgroundColor: 'blue',
        };
        const uiStyles = {
            root: {
                backgroundColorPrimary: 'red',
                errorColor: 'black',
            },
            input: {
                borderColor: 'green',
                borderRadius: '1',
                focusBorderColor: 'green',
                backgroundColor: 'red',
                borderWidth: '1',
                textColorBase: 'green',
            },
            toggle: {
                colorPrimary: 'green',
                colorSecondary: 'green',
            },
            text: {
                body: undefined,
                caption: undefined,
            },
        };

        expect(getFastlaneStyles(styleSettings, uiStyles)).toEqual({
            root: {
                backgroundColorPrimary: 'blue',
                errorColor: 'black',
            },
            input: {
                borderColor: 'green',
                borderRadius: '1',
                focusBorderColor: 'green',
                backgroundColor: 'red',
                borderWidth: '1',
                textColorBase: 'green',
            },
            toggle: {
                colorPrimary: 'green',
                colorSecondary: 'green',
            },
        });
    });
});
