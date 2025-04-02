import { round } from 'lodash';

import {
    AddressRequestBody,
    BillingAddressRequestBody,
    createCurrencyService,
    CurrencyService,
    guard,
    InvalidArgumentError,
    itemsRequireShipping,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    ShippingOption,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isGooglePayCardNetworkKey from '../guards/is-google-pay-card-network-key';
import {
    CallbackIntentsType,
    CallbackTriggerType,
    ErrorReasonType,
    ExtraPaymentData,
    GooglePayCardDataResponse,
    GooglePayCardNetwork,
    GooglePayCardParameters,
    GooglePayError,
    GooglePayFullBillingAddress,
    GooglePayGatewayParameters,
    GooglePayInitializationData,
    GooglePayMerchantInfo,
    GooglePayPaymentDataRequest,
    GooglePayRequiredPaymentData,
    GooglePaySetExternalCheckoutData,
    GooglePayTransactionInfo,
    HandleCouponsOut,
    IntermediatePaymentData,
    ShippingOptionParameters,
    TotalPriceStatusType,
} from '../types';

export default class GooglePayGateway {
    private _getPaymentMethodFn?: () => PaymentMethod<GooglePayInitializationData>;
    private _isBuyNowFlow = false;
    private _currencyCode?: string;
    private _currencyService?: CurrencyService;

    constructor(
        private _gatewayIdentifier: string,
        private _paymentIntegrationService: PaymentIntegrationService,
    ) {}

    mapToShippingAddressRequestBody({
        shippingAddress,
    }: GooglePayCardDataResponse): AddressRequestBody | undefined {
        if (!shippingAddress) {
            return;
        }

        const { company = '', phone = '' } =
            this._paymentIntegrationService.getState().getShippingAddress() || {};

        return this._mapToAddressRequestBody(shippingAddress, company, phone);
    }

    mapToBillingAddressRequestBody(
        response: GooglePayCardDataResponse,
    ): BillingAddressRequestBody | undefined {
        const { billingAddress } = response.paymentMethodData.info;

        if (!billingAddress) {
            return;
        }

        const {
            company = '',
            phone = '',
            email,
        } = this._paymentIntegrationService.getState().getBillingAddress() || {};

        return {
            ...this._mapToAddressRequestBody(billingAddress, company, phone),
            email: email || response.email,
        };
    }

    mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const {
            paymentMethodData: {
                tokenizationData: { token: nonce },
                info: { cardNetwork: type, cardDetails: number },
            },
        } = response;

        if (!nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        return Promise.resolve({
            nonce,
            card_information: { type, number },
            ...(this._isBuyNowFlow && {
                cart_id: this._paymentIntegrationService.getState().getCart()?.id,
            }),
        });
    }

    async getRequiredData(): Promise<GooglePayRequiredPaymentData> {
        const data: GooglePayRequiredPaymentData = { emailRequired: true };

        if (!this._isShippingAddressRequired()) {
            return data;
        }

        const state = await this._paymentIntegrationService.loadShippingCountries();
        const allowedCountryCodes = state.getShippingCountries()?.map((country) => country.code);

        return {
            ...data,
            shippingAddressRequired: true,
            shippingAddressParameters: {
                phoneNumberRequired: true,
                ...(allowedCountryCodes && { allowedCountryCodes }),
            },
            shippingOptionRequired: true,
        };
    }

    getCallbackIntents(): CallbackIntentsType[] {
        if (this._isShippingAddressRequired()) {
            return [
                CallbackIntentsType.OFFER,
                CallbackIntentsType.SHIPPING_ADDRESS,
                CallbackIntentsType.SHIPPING_OPTION,
            ];
        }

        return [CallbackIntentsType.OFFER];
    }

    getCallbackTriggers(): { [key: string]: CallbackTriggerType[] } {
        const state = this._paymentIntegrationService.getState();
        // TODO remove this experiment usage after we make sure that coupons handling works fine
        const isGooglePayCouponsExperimentOn =
            state.getStoreConfigOrThrow().checkoutSettings.features[
                'PI-2875.googlepay_coupons_handling'
            ] || false;

        const availableTriggers = [
            CallbackTriggerType.INITIALIZE,
            CallbackTriggerType.SHIPPING_ADDRESS,
            CallbackTriggerType.SHIPPING_OPTION,
            ...(isGooglePayCouponsExperimentOn ? [CallbackTriggerType.OFFER] : []),
        ];

        const initializationTrigger = [CallbackTriggerType.INITIALIZE];
        const addressChangeTriggers = [
            CallbackTriggerType.INITIALIZE,
            CallbackTriggerType.SHIPPING_ADDRESS,
        ];
        const shippingOptionsChangeTriggers = [CallbackTriggerType.SHIPPING_OPTION];
        const offerChangeTriggers = isGooglePayCouponsExperimentOn
            ? [CallbackTriggerType.OFFER]
            : [];

        return {
            availableTriggers,
            initializationTrigger,
            addressChangeTriggers,
            shippingOptionsChangeTriggers,
            offerChangeTriggers,
        };
    }

    getNonce(methodId: string) {
        const nonce = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<GooglePayInitializationData>(methodId)
            .initializationData?.nonce;

        if (!nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        return Promise.resolve(nonce);
    }

    extraPaymentData(): Promise<undefined | ExtraPaymentData> {
        return Promise.resolve(undefined);
    }

    getMerchantInfo(): GooglePayMerchantInfo {
        const {
            googleMerchantName: merchantName,
            googleMerchantId: merchantId,
            platformToken: authJwt,
        } = this.getGooglePayInitializationData();

        return { merchantName, merchantId, authJwt };
    }

    getTransactionInfo(): GooglePayTransactionInfo {
        let currencyCode: string;

        if (this._isBuyNowFlow) {
            currencyCode = this._getCurrencyCodeOrThrow();
        } else {
            const { getCartOrThrow } = this._paymentIntegrationService.getState();

            currencyCode = getCartOrThrow().currency.code;
        }

        const countryCode = this.getGooglePayInitializationData().storeCountry;

        return {
            ...(countryCode && { countryCode }),
            currencyCode,
            totalPriceStatus: TotalPriceStatusType.ESTIMATED,
            totalPrice: '0',
        };
    }

    getPaymentGatewayParameters():
        | Promise<GooglePayGatewayParameters>
        | GooglePayGatewayParameters {
        const gatewayMerchantId = this.getGooglePayInitializationData().gatewayMerchantId;

        if (!gatewayMerchantId) {
            throw new InvalidArgumentError('Unable to proceed, gatewayMerchantId is missing.');
        }

        return {
            gateway: this._gatewayIdentifier,
            gatewayMerchantId,
        };
    }

    getCardParameters(): GooglePayCardParameters {
        const allowedCardNetworks = this.getPaymentMethod()
            .supportedCards.filter(isGooglePayCardNetworkKey)
            .map((key) => GooglePayCardNetwork[key]);

        return {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks,
            billingAddressRequired: true,
            billingAddressParameters: {
                format: 'FULL',
                phoneNumberRequired: true,
            },
        };
    }

    initialize(
        getPaymentMethod: () => PaymentMethod<GooglePayInitializationData>,
        isBuyNowFlow?: boolean,
        currencyCode?: string,
    ): Promise<void> {
        this._getPaymentMethodFn = getPaymentMethod;
        this._isBuyNowFlow = Boolean(isBuyNowFlow);
        this._currencyCode = currencyCode;

        if (this._isBuyNowFlow) {
            this._getCurrencyCodeOrThrow();
        }

        return Promise.resolve();
    }

    async handleShippingAddressChange(
        shippingAddress?: GooglePayFullBillingAddress,
    ): Promise<ShippingOptionParameters | undefined> {
        if (shippingAddress) {
            shippingAddress.name = shippingAddress.name || '';
            shippingAddress.address1 = shippingAddress.address1 || '';
        }

        const mappedShippingAddress = this.mapToShippingAddressRequestBody({
            shippingAddress,
        } as GooglePayCardDataResponse);

        if (mappedShippingAddress) {
            await this._paymentIntegrationService.updateShippingAddress(mappedShippingAddress);
        }

        const state = this._paymentIntegrationService.getState();
        const consignments = state.getConsignments();

        if (!consignments?.[0]) {
            // Info: we can not return an empty data because shippingOptions should contain at least one element, it caused a developer exception
            return;
        }

        const consignment = consignments[0];
        const storeConfig = state.getStoreConfigOrThrow();

        if (!this._currencyService) {
            this._currencyService = createCurrencyService(storeConfig);
        }

        const availableShippingOptions = (consignment.availableShippingOptions || []).map(
            this._getGooglePayShippingOption.bind(this),
        );

        const recommendedShippingOption = consignment.availableShippingOptions?.find(
            (shippingOption) => shippingOption.isRecommended,
        );

        if (availableShippingOptions.length) {
            const selectedShippingOptionId =
                consignment.selectedShippingOption?.id ||
                recommendedShippingOption?.id ||
                availableShippingOptions[0]?.id;

            if (!consignment.selectedShippingOption?.id && availableShippingOptions[0]) {
                await this.handleShippingOptionChange(
                    recommendedShippingOption?.id || availableShippingOptions[0].id,
                );
            }

            return {
                defaultSelectedOptionId: selectedShippingOptionId,
                shippingOptions: availableShippingOptions,
            };
        }
    }

    async handleShippingOptionChange(optionId: string) {
        if (optionId === 'shipping_option_unselected') {
            return;
        }

        return this._paymentIntegrationService.selectShippingOption(optionId);
    }

    getTotalPrice(): string {
        const { getCheckoutOrThrow, getCartOrThrow } = this._paymentIntegrationService.getState();
        const { decimalPlaces } = getCartOrThrow().currency;
        const totalPrice = round(getCheckoutOrThrow().outstandingBalance, decimalPlaces).toFixed(
            decimalPlaces,
        );

        return totalPrice;
    }

    async handleCoupons(
        offerData: IntermediatePaymentData['offerData'],
    ): Promise<HandleCouponsOut> {
        const { redemptionCodes = [] } = offerData;
        const appliedCoupons = this.getAppliedCoupons();

        let error;

        if (!redemptionCodes.length) {
            await this.removeAllCoupons(appliedCoupons);

            return {
                newOfferInfo: this.getAppliedCoupons(),
            };
        }

        // Validate for applied coupons to make sure we have only one applied
        if (appliedCoupons.offers.length) {
            error = {
                reason: ErrorReasonType.OFFER_INVALID,
                message: 'You can only apply one promo code per order.',
                intent: CallbackTriggerType.OFFER,
            };

            return {
                newOfferInfo: appliedCoupons,
                error,
            };
        }

        const code = redemptionCodes[redemptionCodes.length - 1];
        const appliedCouponError = await this.applyCoupon(code);

        if (appliedCouponError) {
            error = appliedCouponError;
        }

        return {
            newOfferInfo: this.getAppliedCoupons(),
            error,
        };
    }

    getAppliedCoupons(): GooglePayPaymentDataRequest['offerInfo'] {
        const state = this._paymentIntegrationService.getState();
        const { coupons } = state.getCheckout() || {};

        const offers = (coupons || []).map((coupon) => {
            const { displayName, code } = coupon;

            return {
                redemptionCode: code,
                description: displayName,
            };
        });

        return {
            offers,
        };
    }

    async applyCoupon(code: string): Promise<GooglePayError | void> {
        let error: GooglePayError | undefined;

        try {
            await this._paymentIntegrationService.applyCoupon(code);
        } catch (e) {
            if (e instanceof Error) {
                error = {
                    reason: ErrorReasonType.OFFER_INVALID,
                    message: e.message,
                    intent: CallbackTriggerType.OFFER,
                };
            }

            return error;
        }

        const couponCodeInput = document.getElementById('couponcode');

        if (couponCodeInput) {
            (couponCodeInput as HTMLInputElement).value = code;

            const form = document.querySelector('.coupon-form');

            if (form) {
                form.dispatchEvent(new CustomEvent('submit', { cancelable: true }));
            }
        }
    }

    async removeAllCoupons(appliedCoupons: GooglePayPaymentDataRequest['offerInfo']) {
        const { offers } = appliedCoupons;

        const couponsPromise = offers.map((couponCode) => {
            return this._paymentIntegrationService.removeCoupon(couponCode.redemptionCode);
        });

        await Promise.all(couponsPromise);

        const removeCouponLink = document.querySelector('a[href*="/cart.php?action=removecoupon"]');

        if (removeCouponLink) {
            (removeCouponLink as HTMLAnchorElement).click();
        }
    }

    protected getGooglePayInitializationData(): GooglePayInitializationData {
        return guard(
            this.getPaymentMethod().initializationData,
            () => new InvalidArgumentError('Missing initialization data.'),
        );
    }

    protected getPaymentMethod(): PaymentMethod<GooglePayInitializationData> {
        return guard(
            this._getPaymentMethodFn,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        )();
    }

    protected getGatewayIdentifier(): string {
        return this._gatewayIdentifier;
    }

    protected setGatewayIdentifier(gateway?: string) {
        this._gatewayIdentifier = gateway || this.getGatewayIdentifier();
    }

    private _isShippingAddressRequired(): boolean {
        const { getCartOrThrow, getStoreConfig, getShippingAddress } =
            this._paymentIntegrationService.getState();

        return (
            getShippingAddress() === undefined &&
            itemsRequireShipping(getCartOrThrow(), getStoreConfig())
        );
    }

    private _mapToAddressRequestBody(
        address: GooglePayFullBillingAddress,
        company: string,
        phone: string,
    ): AddressRequestBody {
        const {
            name,
            address1,
            address2,
            address3,
            locality: city,
            administrativeArea: stateOrProvinceCode,
            countryCode,
            postalCode,
            phoneNumber,
        } = address;
        const [firstName, lastName] = this._getFirstAndLastName(name);

        return {
            firstName,
            lastName,
            company,
            address1,
            address2: `${address2} ${address3}`.trim(),
            city: city || stateOrProvinceCode,
            stateOrProvince: stateOrProvinceCode,
            stateOrProvinceCode,
            countryCode,
            postalCode,
            phone: phoneNumber || phone,
            customFields: [],
        };
    }

    private _getFirstAndLastName(fullName: string): [string, string] {
        const nameParts = fullName.split(' ');

        if (nameParts.length === 1) {
            return [fullName, ''];
        }

        const firstName = nameParts.slice(0, -1).join(' ');
        const lastName = nameParts[nameParts.length - 1];

        return [firstName, lastName];
    }

    private _getCurrencyCodeOrThrow(): string {
        return guard(
            this._currencyCode,
            () =>
                new InvalidArgumentError(
                    'Unable to initialize payment because "options.currencyCode" argument is not provided.',
                ),
        );
    }

    private _getGooglePayShippingOption({ id, cost, description }: ShippingOption) {
        const formattedCost = this._currencyService?.toCustomerCurrency(cost);

        return {
            id,
            label: description,
            description: formattedCost || cost,
        };
    }
}
