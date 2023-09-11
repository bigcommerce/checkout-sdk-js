// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { StripeEventType } from '../../../../../stripe-integration/src/stripe-upe/stripe-upe';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support StripeUpe.
 *
 * When StripeUpe is initialized, an iframe will be inserted into the DOM. The
 * iframe has a list of shipping addresses for the customer to choose from.
 */
export default interface StripeUPEShippingInitializeOptions {
    /**
     * Available countries configured on BC shipping setup.
     */
    availableCountries: string;

    /**
     * The ID of a container which the stripe iframe should be inserted.
     */
    container?: string;

    /**
     * The identifier of the payment method.
     */
    methodId: string;

    /**
     * The identifier of the payment provider providing the payment method. This
     * option is only required if the provider offers multiple payment options.
     * i.e.: Stripeupe and Klarna.
     */
    gatewayId: string;

    /**
     * A callback that gets called whenever the Stripe Link Shipping Element's object is completed.
     */
    onChangeShipping(shipping: StripeEventType): void;

    /**
     * get styles from store theme
     */
    getStyles?(): {
        [key: string]: string;
    };

    /**
     * get the state code needed for shipping stripe element
     *
     * @param country
     * @param state
     */
    getStripeState(country: string, state: string): string;
}
