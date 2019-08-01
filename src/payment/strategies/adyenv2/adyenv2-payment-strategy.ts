
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    AdyenCardState,
    AdyenClient,
    AdyenComponent,
    AdyenConfiguration
} from './adyenv2';
import AdyenV2ScriptLoader from './adyenv2-script-loader';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenClient?: AdyenClient;
    private _adyenComponent?: AdyenComponent;
    private _stateContainer: string = '';
    private _containerId?: string;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _adyenV2ScriptLoader: AdyenV2ScriptLoader
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

        this._containerId = adyenv2.containerId;

        const configuration: AdyenConfiguration = {
            environment:  paymentMethod.initializationData.environment,
            locale: this._getLocale(),
            originKey: paymentMethod.initializationData.originKey,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        };

        return this._adyenV2ScriptLoader.load(configuration)
            .then(adyenClient => {
                this._adyenClient = adyenClient;

                const adyenComponent = this._adyenClient.adyenCheckout()
                    .create(paymentMethod.method, {
                        ...adyenv2.options,
                        onChange: (state, component) => {
                            this._updateStateContainer(state);
                        },
                    });

                adyenComponent.mount(`#${this._containerId}`);

                this._adyenComponent = adyenComponent;

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

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
        if (newState.isValid) {
            this._stateContainer = JSON.stringify(newState.data.paymentMethod, null, 2);
        }
    }
}
