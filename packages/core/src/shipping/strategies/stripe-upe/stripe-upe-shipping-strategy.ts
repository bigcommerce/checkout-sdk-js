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
    StripeElementsCreateOptions,
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

        const {
            form: { getShippingAddressFields },
            shippingAddress: { getShippingAddress },
        } = this._store.getState();

        const shippingFields = getShippingAddressFields([], '');

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

        const shipping = getShippingAddress();
        const shippingPhoneField = shippingFields.find((field) => field.name === 'phone');
        let option: StripeElementsCreateOptions = {
            mode: 'shipping',
            allowedCountries: [availableCountries],
            fields: {
                phone: 'always',
            },
            validation: {
                phone: {
                    required:
                        shippingPhoneField && shippingPhoneField.required ? 'always' : 'never',
                },
            },
        };

        if (shipping) {
            const {
                stateOrProvinceCode,
                countryCode,
                lastName,
                firstName,
                phone,
                address1,
                address2,
                city,
                postalCode,
            } = shipping;
            const stripeState =
                stateOrProvinceCode && countryCode
                    ? getStripeState(countryCode, stateOrProvinceCode)
                    : stateOrProvinceCode;

            option = {
                ...option,
                defaultValues: {
                    name: lastName ? `${firstName} ${lastName}` : firstName,
                    phone,
                    address: {
                        line1: address1,
                        line2: address2,
                        city,
                        state: stripeState,
                        postal_code: postalCode,
                        country: countryCode,
                    },
                },
            };
        }

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
                    onChangeShipping({
                        ...event,
                        phoneFieldRequired: shippingPhoneField
                            ? shippingPhoneField.required
                            : false,
                    });
                }, 1000);
            }
        });

        shippingAddressElement.mount(`#${container}`);

        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        /* The new shipping component by StripeLink has a small bug, when the component is unmounted,
        Stripe does not save the shipping, to solve this, we will leave it mounted,
        and once it is fixed will be unmounted again */

        // this._stripeElements?.getElement(StripeElementType.SHIPPING)?.unmount();

        return Promise.resolve(this._store.getState());
    }
}
