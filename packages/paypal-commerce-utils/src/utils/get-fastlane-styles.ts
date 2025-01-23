import { omitBy } from 'lodash';

import { FastlaneStylesSettings, PayPalFastlaneStylesOption } from '../index';

function isInvalidStyleOption(styleOption: unknown) {
    return typeof styleOption !== 'string';
}

export default function getFastlaneStyles(
    styleSettings?: FastlaneStylesSettings,
    uiStyles?: PayPalFastlaneStylesOption,
) {
    if (!uiStyles && !styleSettings) {
        return undefined;
    }

    return cleanUpFastlaneStyles(mergeFastlaneStyles(styleSettings, uiStyles));
}

function mergeFastlaneStyles(
    styleSettings?: FastlaneStylesSettings,
    uiStyles?: PayPalFastlaneStylesOption,
): PayPalFastlaneStylesOption {
    return {
        root: {
            backgroundColorPrimary:
                styleSettings?.fastlaneRootSettingsBackgroundColor ||
                uiStyles?.root?.backgroundColorPrimary,
            errorColor: styleSettings?.fastlaneRootSettingsErrorColor || uiStyles?.root?.errorColor,
        },
        input: {
            borderColor:
                styleSettings?.fastlaneInputSettingsBorderColor || uiStyles?.input?.borderColor,
            focusBorderColor:
                styleSettings?.fastlaneInputSettingsFocusBorderBase ||
                uiStyles?.input?.focusBorderColor,
            backgroundColor:
                styleSettings?.fastlaneInputSettingsBackgroundColor ||
                uiStyles?.input?.backgroundColor,
            textColorBase:
                styleSettings?.fastlaneInputSettingsTextColorBase || uiStyles?.input?.textColorBase,
        },
    };
}

function cleanUpFastlaneStyles(styles: PayPalFastlaneStylesOption) {
    const fastlaneStyles: PayPalFastlaneStylesOption = {};

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
