import { StripeFormMode, StripeUPEAppearanceOptions } from './stripe-upe';

interface Styles {
    [key: string]: string;
}

export const getStripeCustomStyles = (
    styles: Styles | undefined | boolean,
    experiment: boolean | undefined = false,
    step: string | undefined = '',
) => {
    let appearance: StripeUPEAppearanceOptions | undefined;

    if (step === StripeFormMode.SHIPPING) {
        appearance = {
            variables: {
                spacingUnit: '4px',
                borderRadius: '4px',
            },
        };
    }

    if (styles && typeof styles !== 'boolean') {
        appearance = {
            ...appearance,
            variables: {
                ...appearance?.variables,
                colorPrimary: styles.fieldInnerShadow,
                colorBackground: styles.fieldBackground,
                colorText: styles.labelText,
                colorDanger: styles.fieldErrorText,
                colorTextSecondary: styles.labelText,
                colorTextPlaceholder: styles.fieldPlaceholderText,
                colorIcon: styles.fieldPlaceholderText,
            },
            rules: {
                '.Input': {
                    borderColor: styles.fieldBorder,
                    color: styles.fieldText,
                    boxShadow: styles.fieldInnerShadow,
                },
            },
        };
    }

    if (experiment) {
        appearance = {
            ...appearance,
            labels: 'floating',
            variables: {
                ...appearance?.variables,
                fontSizeBase: '14px',
            },
            rules: {
                ...appearance?.rules,
                '.Input': {
                    ...appearance?.rules?.['.Input'],
                    padding: '7px 13px 5px 13px',
                },
            },
        };
    }

    return appearance;
};
