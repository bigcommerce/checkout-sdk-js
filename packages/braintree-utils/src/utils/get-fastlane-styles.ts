import { omitBy } from 'lodash';

import { BraintreeFastlaneStylesOption, FastlaneStylesSettings } from '../index';

function isInvalidStyleOption(styleOption: unknown) {
    return typeof styleOption !== 'string';
}

export default function getFastlaneStyles(
    styleSettings?: FastlaneStylesSettings,
    uiStyles?: BraintreeFastlaneStylesOption,
): BraintreeFastlaneStylesOption | undefined {
    if (!uiStyles && !styleSettings) {
        return undefined;
    }

    return cleanUpFastlaneStyles(mergeFastlaneStyles(styleSettings, uiStyles));
}

function mergeFastlaneStyles(
    styleSettings?: FastlaneStylesSettings,
    uiStyles?: BraintreeFastlaneStylesOption,
): BraintreeFastlaneStylesOption {
    return {
        root: {
            backgroundColorPrimary:
                styleSettings?.fastlaneRootSettingsBackgroundColor ||
                uiStyles?.root?.backgroundColorPrimary,
            errorColor: styleSettings?.fastlaneRootSettingsErrorColor || uiStyles?.root?.errorColor,
            fontFamily: styleSettings?.fastlaneRootSettingsFontFamily || uiStyles?.root?.fontFamily,
            fontSizeBase:
                styleSettings?.fastlaneRootSettingsFontSize || uiStyles?.root?.fontSizeBase,
            padding: styleSettings?.fastlaneRootSettingsPadding || uiStyles?.root?.padding,
            primaryColor:
                styleSettings?.fastlaneRootSettingsPrimaryColor || uiStyles?.root?.primaryColor,
        },
        input: {
            borderRadius:
                styleSettings?.fastlaneInputSettingsBorderRadius || uiStyles?.input?.borderRadius,
            borderColor:
                styleSettings?.fastlaneInputSettingsBorderColor || uiStyles?.input?.borderColor,
            focusBorderColor:
                styleSettings?.fastlaneInputSettingsFocusBorderBase ||
                uiStyles?.input?.focusBorderColor,
            backgroundColor:
                styleSettings?.fastlaneInputSettingsBackgroundColor ||
                uiStyles?.input?.backgroundColor,
            borderWidth:
                styleSettings?.fastlaneInputSettingsBorderWidth || uiStyles?.input?.borderWidth,
            textColorBase:
                styleSettings?.fastlaneInputSettingsTextColorBase || uiStyles?.input?.textColorBase,
        },
        toggle: {
            colorPrimary:
                styleSettings?.fastlaneToggleSettingsColorPrimary || uiStyles?.toggle?.colorPrimary,
            colorSecondary:
                styleSettings?.fastlaneToggleSettingsColorSecondary ||
                uiStyles?.toggle?.colorSecondary,
        },
        text: {
            body: {
                color: styleSettings?.fastlaneTextBodySettingsColor || uiStyles?.text?.body?.color,
                fontSize:
                    styleSettings?.fastlaneTextBodySettingsFontSize ||
                    uiStyles?.text?.body?.fontSize,
            },
            caption: {
                color:
                    styleSettings?.fastlaneTextCaptionSettingsColor ||
                    uiStyles?.text?.caption?.color,
                fontSize:
                    styleSettings?.fastlaneTextCaptionSettingsFontSize ||
                    uiStyles?.text?.caption?.fontSize,
            },
        },
        branding: styleSettings?.fastlaneBrandingSettings || uiStyles?.branding,
    };
}

function cleanUpFastlaneStyles(styles: BraintreeFastlaneStylesOption) {
    const fastlaneStyles: BraintreeFastlaneStylesOption = {};

    const root = omitBy(styles.root, isInvalidStyleOption);
    const input = omitBy(styles.input, isInvalidStyleOption);
    const toggle = omitBy(styles.toggle, isInvalidStyleOption);
    const textBody = omitBy(styles.text?.body, isInvalidStyleOption);
    const textCaption = omitBy(styles.text?.caption, isInvalidStyleOption);
    const branding = styles.branding;

    if (Object.keys(root).length) {
        fastlaneStyles.root = root;
    }

    if (Object.keys(input).length) {
        fastlaneStyles.input = input;
    }

    if (Object.keys(toggle).length) {
        fastlaneStyles.toggle = toggle;
    }

    if (Object.keys(textBody).length) {
        fastlaneStyles.text = {};
        fastlaneStyles.text.body = textBody;
    }

    if (Object.keys(textCaption).length) {
        fastlaneStyles.text = {
            ...fastlaneStyles.text,
        };
        fastlaneStyles.text.caption = textCaption;
    }

    if (branding) {
        fastlaneStyles.branding = branding;
    }

    return fastlaneStyles;
}
