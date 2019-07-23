import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentRequestSender from '../../payment-request-sender';
import PaymentStrategy from '../payment-strategy';

import { AdyenCardState, AdyenCheckout, AdyenComponent } from './adyenv2';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenCheckout?: AdyenCheckout;
    private _adyenComponent?: AdyenComponent;
    private _stateContainer?: any;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _adyenScriptLoader: AdyenV2ScriptLoader,
        private _paymentRequestSender: PaymentRequestSender
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const adyenv2 = options.adyenv2;

        if (!adyenv2) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.adyen" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const configuration = {
            environment:  paymentMethod.initializationData.environment,
            locale: this._getLocale(),
            originKey: paymentMethod.initializationData.originKey,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        };

        return this._adyenScriptLoader.load(configuration)
            .then(adyenCheckout => {
                this._adyenCheckout = adyenCheckout;

                const adyenComponent = this._adyenCheckout
                    .create(paymentMethod.method, {
                        ...adyenv2.options,
                        onChange: (state, component) => {
                            this._updateStateContainer(state);
                        },
                    });

                adyenComponent.mount(`#${adyenv2.containerId}`);

                this._adyenComponent = adyenComponent;

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                const paymentPayload = {
                    methodId: payment.methodId,
                    paymentData: {
                        nonce: this._stateContainer,
                    },
                };

                return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._adyenComponent) {
            this._adyenComponent.unmount();
        }

        return Promise.resolve(this._store.getState());
    }

    private _getLocale(): string {
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfig();

        if (!storeConfig) {
            return 'en_US';
        }

        return storeConfig.storeProfile.storeLanguage;
    }

    private _updateStateContainer(newState: AdyenCardState) {
        this._stateContainer = JSON.stringify(newState.data.paymentMethod, null, 2);
    }

    private _mount(resultObject: any): AdyenComponent {
        if (!this._adyenCheckout) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const threeDS2IdentifyShopper = this._adyenCheckout
            .create('threeDS2DeviceFingerprint', {
                fingerprintToken: resultObject.authentication['threeds2.fingerprintToken'],
                onComplete: () => {},
                onError: () => {},
            });

        threeDS2IdentifyShopper.mount('#threeDS2');

        return threeDS2IdentifyShopper;
    }
}
