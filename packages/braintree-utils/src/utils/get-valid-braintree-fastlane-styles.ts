import { BraintreeFastlaneStylesOption } from '../braintree';

export default function getValidBraintreeFastlaneStyles(
    styles?: BraintreeFastlaneStylesOption,
): BraintreeFastlaneStylesOption | undefined {
    return {
        root: {
            backgroundColorPrimary:
                isValidStyleOption(styles?.root?.backgroundColorPrimary) || 'transparent',
            errorColor: isValidStyleOption(styles?.root?.errorColor) || '#C40B0B',
            fontFamily:
                isValidStyleOption(styles?.root?.fontFamily) ||
                'Montserrat, Helvetica, Arial, sans-serif',
        },
        input: {
            borderRadius: isValidStyleOption(styles?.input?.borderRadius) || '0.25rem',
            borderColor: isValidStyleOption(styles?.input?.borderColor) || '#9E9E9E',
            focusBorderColor: isValidStyleOption(styles?.input?.focusBorderColor) || '#4496F6',
        },
        toggle: {
            colorPrimary: isValidStyleOption(styles?.toggle?.colorPrimary) || '#0F005E',
            colorSecondary: isValidStyleOption(styles?.toggle?.colorSecondary) || '#ffffff',
        },
        text: {
            body: {
                color: isValidStyleOption(styles?.text?.body?.color) || '#222222',
                fontSize: isValidStyleOption(styles?.text?.body?.fontSize) || '1rem',
            },
            caption: {
                color: isValidStyleOption(styles?.text?.caption?.color) || '#515151',
                fontSize: isValidStyleOption(styles?.text?.caption?.fontSize) || '1rem',
            },
        },
        branding: isValidStyleOption(styles?.branding) || 'light',
    };
}

function isValidStyleOption(styleOption: unknown) {
    return styleOption && typeof styleOption === 'string' ? styleOption : null;
}
