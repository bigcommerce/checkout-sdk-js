import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BraintreeHostWindow,
    BraintreeInitializationData,
    PayPalBNPLConfigurationItem,
} from './braintree';
import { MessagesStyleOptions, MessagingPlacements } from './paypal';

export default class BraintreeMessages {
    private braintreeHostWindow: BraintreeHostWindow = window;

    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    render(methodId: string, containerId: string, placement: MessagingPlacements): void {
        const messagingContainer = containerId && document.getElementById(containerId);

        if (this.braintreeHostWindow.paypal && messagingContainer) {
            const state = this.paymentIntegrationService.getState();
            const cart = state.getCartOrThrow();
            const billingAddress = state.getBillingAddressOrThrow();
            const paymentMethod =
                state.getPaymentMethodOrThrow<BraintreeInitializationData>(methodId);

            if (!paymentMethod.initializationData) {
                return;
            }

            const { paypalBNPLConfiguration, enableCheckoutPaywallBanner } =
                paymentMethod.initializationData;

            // TODO: uncomment when PROJECT-7052.braintree_bnpl_configurator is rolled out to 100% for all tiers
            // const { paypalBNPLConfiguration = [] } = paymentMethod.initializationData || {};

            // TODO: this condition can be removed when PROJECT-7052.braintree_bnpl_configurator is rolled out to 100% for all tiers
            // since banners enablement will be regulated by the paypalBNPLConfiguration via banner status state
            // Explanation:
            // - "enableCheckoutPaywallBanner" is an old approach to enable banner on checkout page
            // - "paypalBNPLConfiguration" could not be provided from BE when PROJECT-7052.braintree_bnpl_configurator is enabled
            // - "placement == 'payment'" means that banner should be rendered on checkout page
            // So, when experiment is disabled we should not render banner on checkout page when enableCheckoutPaywallBanner is false
            // However, when experiment is enabled, then we should ignore enableCheckoutPaywallBanner flag at all
            if (
                placement === MessagingPlacements.PAYMENT &&
                !paypalBNPLConfiguration &&
                !enableCheckoutPaywallBanner
            ) {
                return;
            }

            let style: MessagesStyleOptions = {
                layout: 'text',
                logo: {
                    type: 'inline',
                },
            };

            if (paypalBNPLConfiguration) {
                const bannedId = placement === MessagingPlacements.PAYMENT ? 'checkout' : placement;
                const bannerConfiguration = paypalBNPLConfiguration.find(
                    ({ id }) => id === bannedId,
                );

                if (!bannerConfiguration || !bannerConfiguration.status) {
                    return;
                }

                if (placement === MessagingPlacements.CART) {
                    messagingContainer.removeAttribute('data-pp-style-logo-type');
                    messagingContainer.removeAttribute('data-pp-style-logo-position');
                    messagingContainer.removeAttribute('data-pp-style-text-color');
                    messagingContainer.removeAttribute('data-pp-style-text-size');
                }

                style = this.getPaypalMessagesStylesFromBNPLConfig(bannerConfiguration);
            }

            this.braintreeHostWindow.paypal
                .Messages({
                    amount: cart.cartAmount,
                    buyerCountry: billingAddress.countryCode,
                    placement,
                    style,
                })
                .render(`#${containerId}`);
        }
    }

    private getPaypalMessagesStylesFromBNPLConfig({
        styles,
    }: PayPalBNPLConfigurationItem): MessagesStyleOptions {
        const messagesStyles: MessagesStyleOptions = {};

        if (styles.color) {
            messagesStyles.color = styles.color;
        }

        if (styles.layout) {
            messagesStyles.layout = styles.layout;
        }

        if (styles['logo-type'] || styles['logo-position']) {
            messagesStyles.logo = {};

            if (styles['logo-type']) {
                messagesStyles.logo.type = styles['logo-type'];
            }

            if (styles['logo-position']) {
                messagesStyles.logo.position = styles['logo-position'];
            }
        }

        if (styles.ratio) {
            messagesStyles.ratio = styles.ratio;
        }

        if (styles['text-color'] || styles['text-size']) {
            messagesStyles.text = {};

            if (styles['text-color']) {
                messagesStyles.text.color = styles['text-color'];
            }

            if (styles['text-size']) {
                messagesStyles.text.size = +styles['text-size'];
            }
        }

        return messagesStyles;
    }
}
