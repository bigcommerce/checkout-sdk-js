import { ButtonColor, ButtonType } from '../../../payment/strategies/googlepay';

export interface GooglePayButtonInitializeOptions {
    /**
     * The color of the GooglePay button that will be inserted.
     *  black (default): a black button suitable for use on white or light backgrounds.
     *  white: a white button suitable for use on colorful backgrounds.
     */
    buttonColor?: ButtonColor;

    /**
     * The size of the GooglePay button that will be inserted.
     *  long: "Buy with Google Pay" button (default). A translated button label may appear
     *         if a language specified in the viewer's browser matches an available language.
     *  short: Google Pay payment button without the "Buy with" text.
     */
    buttonType?: ButtonType;
}
