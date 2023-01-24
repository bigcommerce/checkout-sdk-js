import { AddressRequestBody } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import {
    StripeElements,
    StripeElementType,
    StripeEventType,
    StripeScriptLoader,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
} from '../../../payment/strategies/stripe-upe';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

export default class StripeUPEShippingStrategy implements ShippingStrategy {
    private _stripeUPEClient?: StripeUPEClient;
    private _stripeElements?: StripeElements;
    private sendData?: ReturnType<typeof setTimeout>;

    constructor(
        private _store: CheckoutStore,
        private _stripeUPEScriptLoader: StripeScriptLoader,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
    ) {}

    updateAddress(
        address: AddressRequestBody,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._consignmentActionCreator.updateAddress(address, options));
    }

    selectOption(
        optionId: string,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId, options),
        );
    }

    async initialize(options: ShippingInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options.stripeupe) {
            throw new InvalidArgumentError(
                `Unable to proceed because "options" argument is not provided.`,
            );
        }

        const {
            container,
            gatewayId,
            methodId,
            onChangeShipping,
            getStyles,
            availableCountries,
            getStripeState,
        } = options.stripeupe;

        Object.entries(options.stripeupe).forEach(([key, value]) => {
            if (!value) {
                throw new InvalidArgumentError(
                    `Unable to proceed because "${key}" argument is not provided.`,
                );
            }
        });

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            }),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId, gatewayId);
        const {
            initializationData: { stripePublishableKey, stripeConnectedAccount },
        } = paymentMethod;

        if (
            !paymentMethod ||
            !paymentMethod.initializationData.stripePublishableKey ||
            !paymentMethod.clientToken
        ) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeUPEClient = await this._stripeUPEScriptLoader.getStripeClient(
            stripePublishableKey,
            stripeConnectedAccount,
        );

        let appearance: StripeUPEAppearanceOptions;
        const styles = getStyles && getStyles();

        if (styles) {
            appearance = {
                variables: {
                    colorPrimary: styles.fieldInnerShadow,
                    colorBackground: styles.fieldBackground,
                    colorText: styles.labelText,
                    colorDanger: styles.fieldErrorText,
                    colorTextSecondary: styles.labelText,
                    colorTextPlaceholder: styles.fieldPlaceholderText,
                    spacingUnit: '4px',
                    borderRadius: '4px',
                },
                rules: {
                    '.Input': {
                        borderColor: styles.fieldBorder,
                        color: styles.fieldText,
                        boxShadow: styles.fieldInnerShadow,
                    },
                },
            };
        } else {
            appearance = {
                variables: {
                    spacingUnit: '4px',
                    borderRadius: '4px',
                },
            };
        }

        this._stripeElements = this._stripeUPEScriptLoader.getElements(this._stripeUPEClient, {
            clientSecret: paymentMethod.clientToken,
            appearance,
        });

        const shipping = this._store.getState().shippingAddress.getShippingAddress();
        const stripeState =
            shipping?.stateOrProvinceCode && shipping.countryCode
                ? getStripeState(shipping.countryCode, shipping.stateOrProvinceCode)
                : shipping?.stateOrProvinceCode;
        const option = {
            allowedCountries: [availableCountries],
            defaultValues: {
                name: shipping?.lastName
                    ? `${shipping.firstName} ${shipping.lastName}`
                    : shipping?.firstName || '',
                address: {
                    line1: shipping?.address1 || '',
                    line2: shipping?.address2 || '',
                    city: shipping?.city || '',
                    state: stripeState || '',
                    postal_code: shipping?.postalCode || '',
                    country: shipping?.countryCode || '',
                },
            },
        };

        let shippingAddressElement = this._stripeElements.getElement(StripeElementType.SHIPPING);

        if (shippingAddressElement) {
            shippingAddressElement.destroy();
        }

        shippingAddressElement = this._stripeElements.create(StripeElementType.SHIPPING, option);

        shippingAddressElement.on('change', (event: StripeEventType) => {
            if (!('isNewAddress' in event)) {
                throw new MissingDataError(MissingDataErrorType.MissingShippingAddress);
            }

            if (event.complete || event.isNewAddress) {
                if (this.sendData) {
                    clearTimeout(this.sendData);
                }

                this.sendData = setTimeout(() => {
                    onChangeShipping(event);
                }, 1000);
            }
        });

        shippingAddressElement.mount(`#${container}`);

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._stripeElements?.getElement(StripeElementType.SHIPPING)?.unmount();

        return Promise.resolve(this._store.getState());
    }
}
