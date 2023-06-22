import { FormPoster } from '@bigcommerce/form-poster';
import { isNil, omitBy } from 'lodash';

import {
    BillingAddressRequestBody,
    BuyNowCartCreationError,
    Cart,
    CartSource,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethodClientUnavailableError,
    RequestError,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from './paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from './paypal-commerce-script-loader';
import {
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
    PayPalCommerceInitializationData,
    PayPalCreateOrderRequestBody,
    PayPalOrderDetails,
    PayPalOrderStatus,
    PayPalSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './paypal-commerce-types';
import { RatePay } from './paypal-commerce-types';

export default class PayPalCommerceIntegrationService {
    private paypalSdk?: PayPalSDK;

    constructor(
        private formPoster: FormPoster,
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {}

    /**
     *
     * PayPalSDK methods
     *
     */
    async loadPayPalSdk(
        methodId: string,
        providedCurrencyCode?: string,
        initializesOnCheckoutPage?: boolean,
    ): Promise<PayPalSDK> {
        const state = this.paymentIntegrationService.getState();
        const currencyCode = providedCurrencyCode || state.getCartOrThrow().currency.code;
        const paymentMethod =
            state.getPaymentMethodOrThrow<PayPalCommerceInitializationData>(methodId);

        this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
            paymentMethod,
            currencyCode,
            initializesOnCheckoutPage,
        );

        return this.paypalSdk;
    }

    getPayPalSdkOrThrow(): PayPalSDK {
        if (!this.paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalSdk;
    }

    /**
     *
     * Buy Now cart creation methods
     *
     */
    async createBuyNowCartOrThrow(
        buyNowInitializeOptions: PayPalBuyNowInitializeOptions,
    ): Promise<Cart> {
        const cartRequestBody = buyNowInitializeOptions.getBuyNowCartRequestBody();

        if (!cartRequestBody) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        try {
            return await this.paymentIntegrationService.createBuyNowCart(cartRequestBody);
        } catch (error) {
            throw new BuyNowCartCreationError();
        }
    }

    /**
     *
     * Order methods
     *
     */
    async createOrder(
        providerId: string,
        requestBody?: Partial<PayPalCreateOrderRequestBody>,
    ): Promise<string> {
        const cartId = this.paymentIntegrationService.getState().getCartOrThrow().id;

        const { orderId } = await this.paypalCommerceRequestSender.createOrder(providerId, {
            cartId,
            ...requestBody,
        });

        return orderId;
    }

    async updateOrder(): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const cart = state.getCartOrThrow();
        const consignment = state.getConsignmentsOrThrow()[0];

        try {
            await this.paypalCommerceRequestSender.updateOrder({
                availableShippingOptions: consignment.availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignment.selectedShippingOption,
            });
        } catch (_error) {
            throw new RequestError();
        }
    }

    async getOrderStatus(): Promise<PayPalOrderStatus> {
        try {
            const { status } = await this.paypalCommerceRequestSender.getOrderStatus();

            return status;
        } catch (_error) {
            throw new RequestError();
        }
    }

    /**
     *
     * Payment submitting and tokenizing methods
     *
     */
    tokenizePayment(methodId: string, orderId?: string): void {
        const cart = this.paymentIntegrationService.getState().getCartOrThrow();

        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        return this.formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: methodId,
            order_id: orderId,
            ...(cart.source === CartSource.BuyNow && { cart_id: cart.id }),
        });
    }

    async submitPayment(methodId: string, orderId: string, ratePay?: RatePay): Promise<void> {
        const paymentData = {
            formattedPayload: {
                vault_payment_instrument: null,
                set_as_default_stored_instrument: null,
                device_info: null,
                method_id: methodId,
            ...(ratePay && {
                rate_pay: {
                    birth_date: '1990-01-01',
                    phone: {
                        national_number: '6912345678',
                        country_code: '49',
                    },
                }
            }
            ),
                paypal_account: {
                    order_id: orderId,
                },
            },
        };

        await this.paymentIntegrationService.submitPayment({ methodId, paymentData });
    }

    /**
     *
     * Shipping options methods
     *
     */
    getShippingOptionOrThrow(selectedShippingOptionId?: string): ShippingOption {
        const state = this.paymentIntegrationService.getState();
        const consignment = state.getConsignmentsOrThrow()[0];

        const availableShippingOptions = consignment.availableShippingOptions || [];

        const recommendedShippingOption = availableShippingOptions.find(
            (option) => option.isRecommended,
        );

        const selectedShippingOption = selectedShippingOptionId
            ? availableShippingOptions.find((option) => option.id === selectedShippingOptionId)
            : availableShippingOptions.find(
                  (option) => option.id === consignment.selectedShippingOption?.id,
              );

        const shippingOptionToSelect =
            selectedShippingOption || recommendedShippingOption || availableShippingOptions[0];

        if (!shippingOptionToSelect) {
            throw new Error("Your order can't be shipped to this address");
        }

        return shippingOptionToSelect;
    }

    /**
     *
     * Address transforming methods
     *
     */
    getAddress(address?: Partial<BillingAddressRequestBody>): BillingAddressRequestBody {
        return {
            firstName: address?.firstName || '',
            lastName: address?.lastName || '',
            email: address?.email || '',
            phone: '',
            company: '',
            address1: address?.address1 || '',
            address2: '',
            city: address?.city || '',
            countryCode: address?.countryCode || '',
            postalCode: address?.postalCode || '',
            stateOrProvince: '',
            stateOrProvinceCode: address?.stateOrProvinceCode || '',
            customFields: [],
        };
    }

    getBillingAddressFromOrderDetails({ payer }: PayPalOrderDetails): BillingAddressRequestBody {
        return this.getAddress({
            firstName: payer.name.given_name,
            lastName: payer.name.surname,
            email: payer.email_address,
            address1: payer.address.address_line_1,
            city: payer.address.admin_area_2,
            countryCode: payer.address.country_code,
            postalCode: payer.address.postal_code,
            stateOrProvinceCode: payer.address.admin_area_1,
        });
    }

    getShippingAddressFromOrderDetails(
        orderDetails: PayPalOrderDetails,
    ): BillingAddressRequestBody {
        const { payer, purchase_units } = orderDetails;
        const shippingAddress = purchase_units[0]?.shipping?.address || {};

        return this.getAddress({
            firstName: payer.name.given_name,
            lastName: payer.name.surname,
            email: payer.email_address,
            address1: shippingAddress.address_line_1,
            city: shippingAddress.admin_area_2,
            countryCode: shippingAddress.country_code,
            postalCode: shippingAddress.postal_code,
            stateOrProvinceCode: shippingAddress.admin_area_1,
        });
    }

    /**
     *
     * Buttons style methods
     *
     */
    getValidButtonStyle(style?: PayPalButtonStyleOptions): PayPalButtonStyleOptions {
        const { color, height, label, shape } = style || {};

        const validStyles = {
            color: color && StyleButtonColor[color] ? color : undefined,
            height: this.getValidHeight(height),
            label: label && StyleButtonLabel[label] ? label : undefined,
            shape: shape && StyleButtonShape[shape] ? shape : undefined,
        };

        return omitBy(validStyles, isNil);
    }

    getValidHeight(height?: number): number {
        const defaultHeight = 40;
        const minHeight = 25;
        const maxHeight = 55;

        if (!height || typeof height !== 'number') {
            return defaultHeight;
        }

        if (height > maxHeight) {
            return maxHeight;
        }

        if (height < minHeight) {
            return minHeight;
        }

        return height;
    }

    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }
}
