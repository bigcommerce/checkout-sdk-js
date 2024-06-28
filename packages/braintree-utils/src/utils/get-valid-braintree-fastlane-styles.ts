import {BraintreeFastlaneStylesOption, FastlaneStylesSettings} from '../index';

export default function getValidBraintreeFastlaneStyles(
    styles?: FastlaneStylesSettings,
): BraintreeFastlaneStylesOption | undefined {
    if (!styles) {
        return undefined;
    }

    return  {
        root: {
            ...(isValidStyleOption(styles?.fastlaneRootSettingsBackgroundColor) && {
                backgroundColorPrimary: isValidStyleOption(styles?.fastlaneRootSettingsBackgroundColor),
            }),
            ...(isValidStyleOption(styles?.fastlaneRootSettingsErrorColor) && {
                errorColor: isValidStyleOption(styles?.fastlaneRootSettingsErrorColor),
            }),
            ...(isValidStyleOption(styles?.fastlaneRootSettingsFontFamily) && {
                fontFamily: isValidStyleOption(styles?.fastlaneRootSettingsFontFamily),
            }),
        },
        input: {
            ...(isValidStyleOption(styles?.fastlaneInputSettingsBorderRadius) && {
                borderRadius: isValidStyleOption(styles?.fastlaneInputSettingsBorderRadius),
            }),
            ...(isValidStyleOption(styles?.fastlaneInputSettingsBorderColor) && {
                borderColor: isValidStyleOption(styles?.fastlaneInputSettingsBorderColor),
            }),
            ...(isValidStyleOption(styles?.fastlaneInputSettingsFocusBorderColor) && {
                focusBorderColor: isValidStyleOption(styles?.fastlaneInputSettingsFocusBorderColor),
            }),
        },
        toggle: {
            ...(isValidStyleOption(styles?.fastlaneToggleSettingsColorPrimary) && {
                colorPrimary: isValidStyleOption(styles?.fastlaneToggleSettingsColorPrimary),
            }),
            ...(isValidStyleOption(styles?.fastlaneToggleSettingsColorSecondary) && {
                colorSecondary: isValidStyleOption(styles?.fastlaneToggleSettingsColorSecondary),
            }),
        },
        text: {
            body: {
                ...(isValidStyleOption(styles?.fastlaneTextBodySettingsColor) && {
                    color: isValidStyleOption(styles?.fastlaneTextBodySettingsColor),
                }),
                ...(isValidStyleOption(styles?.fastlaneTextBodySettingsFontSize) && {
                    fontSize: isValidStyleOption(styles?.fastlaneTextBodySettingsFontSize),
                }),
            },
            caption: {
                ...(isValidStyleOption(styles?.fastlaneTextCaptionSettingsColor) && {
                    color: isValidStyleOption(styles?.fastlaneTextCaptionSettingsColor),
                }),
                ...(isValidStyleOption(styles?.fastlaneTextBodySettingsFontSize) && {
                    fontSize: isValidStyleOption(styles?.fastlaneTextCaptionSettingsFontSize),
                }),
            },
        },
        ...(isValidStyleOption(styles?.fastlaneBrandingSettings) && {
            branding: isValidStyleOption(styles?.fastlaneBrandingSettings),
        }),
    };
}

function isValidStyleOption(styleOption: unknown) {
    return styleOption && typeof styleOption === 'string' ? styleOption : undefined;
}

