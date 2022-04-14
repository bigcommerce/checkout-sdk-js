import { RequestSender } from '@bigcommerce/request-sender';
import { supportsPopups } from '@braintree/browser-detection';

import { Address } from '../../../address';
import { CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { Overlay } from '../../../common/overlay';
import { CancellablePromise } from '../../../common/utility';
import { OrderPaymentRequestBody } from '../../../order';
import { PaymentMethodCancelledError } from '../../errors';
import { CreditCardInstrument, NonceInstrument, VaultedInstrument } from '../../payment';

import { BraintreePaypal, BraintreeRequestData, BraintreeShippingAddressOverride, BraintreeThreeDSecure, BraintreeTokenizePayload, BraintreeVerifyPayload } from './braintree';
import BraintreeHostedForm from './braintree-hosted-form';
import { BraintreeFormOptions, BraintreePaymentInitializeOptions, BraintreeThreeDSecureOptions } from './braintree-payment-options';
import BraintreeSDKCreator from './braintree-sdk-creator';

export interface PaypalConfig {
    amount: number;
    currency: string;
    locale: string;
    offerCredit?: boolean;
    shippingAddressOverride?: BraintreeShippingAddressOverride;
    shouldSaveInstrument?: boolean;
}

export default class BraintreePaymentProcessor {
    private _threeDSecureOptions?: BraintreeThreeDSecureOptions;

    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _braintreeHostedForm: BraintreeHostedForm,
        private _overlay: Overlay,
        private _store: CheckoutStore,
        private _requestSender: RequestSender
    ) {}

    initialize(clientToken: string, options?: BraintreePaymentInitializeOptions): void {
        this._braintreeSDKCreator.initialize(clientToken);
        this._threeDSecureOptions = options && options.threeDSecure;
    }

    preloadPaypal(): Promise<BraintreePaypal> {
        return this._braintreeSDKCreator.getPaypal();
    }

    async tokenizeCard(payment: OrderPaymentRequestBody, billingAddress: Address): Promise<NonceInstrument> {
        const requestData = this._mapToCreditCard(payment.paymentData as CreditCardInstrument, billingAddress);
        const client = await this._braintreeSDKCreator.getClient();
        const { creditCards } = await client.request(requestData);

        return { nonce: creditCards[0].nonce };
    }

    async verifyCard(payment: OrderPaymentRequestBody, billingAddress: Address, amount: number): Promise<BraintreeVerifyPayload> {
        const [{ nonce }, threeDSecure] = await Promise.all([
            this.tokenizeCard(payment, billingAddress),
            this._braintreeSDKCreator.get3DS(),
        ]);

        return this._present3DSChallenge(threeDSecure, amount, nonce);
    }

    paypal({ shouldSaveInstrument, ...config }: PaypalConfig): Promise<BraintreeTokenizePayload> {
        const newWindowFlow = supportsPopups();

        return this._braintreeSDKCreator.getPaypal()
            .then(paypal => {
                if (newWindowFlow) {
                    this._overlay.show({
                        onClick: () => paypal.focusWindow(),
                    });
                }

                return paypal.tokenize({
                    enableShippingAddress: true,
                    flow: shouldSaveInstrument ? 'vault' : 'checkout',
                    useraction: 'commit',
                    ...config,
                });
            })
            .then(response => {
                this._overlay.remove();

                return response;
            })
            .catch(error => {
                this._overlay.remove();

                throw error;
            });
    }

    getSessionId(): Promise<string | undefined> {
        return this._braintreeSDKCreator.getDataCollector()
            .then(({ deviceData }) => deviceData);
    }

    /**
     * @deprecated Use getSessionId() and combine them in the consumer.
     */
    appendSessionId(processedPayment: Promise<NonceInstrument>): Promise<NonceInstrument> {
        return processedPayment
            .then(paymentData => Promise.all([paymentData, this._braintreeSDKCreator.getDataCollector()]))
            .then(([paymentData, { deviceData }]) => ({ ...paymentData, deviceSessionId: deviceData }));
    }

    deinitialize(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    async initializeHostedForm(options: BraintreeFormOptions): Promise<boolean> {
        return await this._braintreeHostedForm.initialize(options);
    }

    async deinitializeHostedForm(): Promise<void> {
        await this._braintreeHostedForm.deinitialize();
    }

    tokenizeHostedForm(billingAddress: Address): Promise<NonceInstrument> {
        return this._braintreeHostedForm.tokenize(billingAddress);
    }

    tokenizeHostedFormForStoredCardVerification(): Promise<NonceInstrument> {
        return this._braintreeHostedForm.tokenizeForStoredCardVerification();
    }

    async verifyStoredCreditCard(payment: OrderPaymentRequestBody, amount: number): Promise<NonceInstrument> {
        const { nonce } = await this.getStoredCreditCardNonce(payment);
        const threeDSecure = await this._braintreeSDKCreator.get3DS();

        return this._present3DSChallenge(threeDSecure, amount, nonce);
    }

    async verifyCardWithHostedForm(billingAddress: Address, amount: number): Promise<NonceInstrument> {
        const [{ nonce }, threeDSecure] = await Promise.all([
            this._braintreeHostedForm.tokenize(billingAddress),
            this._braintreeSDKCreator.get3DS(),
        ]);

        return this._present3DSChallenge(threeDSecure, amount, nonce);
    }

    private async _getToken(orderId: number): Promise<string> {
        const url = `/api/storefront/payments/auth-token`;
        const options = {
            params: {
                order_id: orderId,
            },
        };

        return this._requestSender
            .get<{ auth_token: string }>(url, options)
            .then(({ body }) => body.auth_token);
    }

    async getStoredCreditCardNonce(payment: OrderPaymentRequestBody): Promise<NonceInstrument> {
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfigOrThrow();
        const cart = state.cart.getCartOrThrow();
        const order = state.order.getOrderOrThrow();
        const token = await this._getToken(order.orderId);

        console.log({
            state,
            storeConfig,
            cart,
        });

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        const { customerId } = cart;
        const { currency, paymentSettings, storeProfile, shopperCurrency } = storeConfig;
        const { code } = shopperCurrency.isTransactional ? shopperCurrency : currency;
        const { bigpayBaseUrl } = paymentSettings || {};
        const { storeId } = storeProfile || {};

        if (!bigpayBaseUrl || !storeId || !customerId) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        const { paymentData } = payment;
        const { instrumentId } = paymentData as VaultedInstrument;

        console.log('instrumentId', instrumentId);

        // TODO: update the variable with bigpay-client method when the url will be ready
        const url = `${bigpayBaseUrl}/api/v3/stores/${storeId}/shoppers/${customerId}/instruments/${instrumentId}/create_nonce`;

        return this._requestSender.post<NonceInstrument>(url, {
            credentials: false,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-XSRF-TOKEN': null,
                authorization: token,
            },
            body: {
                currency: code,
            },
        })
            .then(({ body }) => body)
            .catch(error => {
                throw error;
            });
    }

    private _present3DSChallenge(
        threeDSecure: BraintreeThreeDSecure,
        amount: number,
        nonce: string
    ): Promise<BraintreeVerifyPayload> {
        if (!this._threeDSecureOptions || !nonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { addFrame, removeFrame } = this._threeDSecureOptions;
        const cancelVerifyCard = async () => {
            const response = await threeDSecure.cancelVerifyCard();

            verification.cancel(new PaymentMethodCancelledError());

            return response;
        };

        const roundedAmount = amount.toFixed(2);

        const verification = new CancellablePromise(
            threeDSecure.verifyCard({
                addFrame: (error, iframe) => {
                    addFrame(error, iframe, cancelVerifyCard);
                },
                amount: Number(roundedAmount),
                challengeRequested: true,
                nonce,
                removeFrame,
                onLookupComplete: (_data, next) => {
                    next();
                },
            })
        );

        return verification.promise;
    }

    private _mapToCreditCard(creditCard: CreditCardInstrument, billingAddress?: Address): BraintreeRequestData {
        return {
            data: {
                creditCard: {
                    cardholderName: creditCard.ccName,
                    number: creditCard.ccNumber,
                    cvv: creditCard.ccCvv,
                    expirationDate: `${creditCard.ccExpiry.month}/${creditCard.ccExpiry.year}`,
                    options: {
                        validate: false,
                    },
                    billingAddress: billingAddress && {
                        countryCodeAlpha2: billingAddress.countryCode,
                        locality: billingAddress.city,
                        countryName: billingAddress.country,
                        postalCode: billingAddress.postalCode,
                        streetAddress: billingAddress.address2 ?
                            `${billingAddress.address1} ${billingAddress.address2}` :
                            billingAddress.address1,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    }
}
