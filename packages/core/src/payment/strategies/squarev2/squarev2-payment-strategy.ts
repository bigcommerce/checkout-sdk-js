import PaymentStrategy from '../payment-strategy';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import SquareV2PaymentProcessor from './squarev2-payment-processor';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions } from '../../payment-request-options';
import { InvalidArgumentError } from '../../../common/error/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';

export default class SquareV2PaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _squareV2PaymentProcessor: SquareV2PaymentProcessor,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!options?.squarev2?.containerId) {
            throw new InvalidArgumentError('Unable to proceed because "containerId" argument is not provided.');
        }

        const { methodId, squarev2 } = options;
        const {
            config: { testMode },
            initializationData: { applicationId, locationId },
        } = this._store
            .getState()
            .paymentMethods.getPaymentMethodOrThrow(methodId);

        await this._squareV2PaymentProcessor.initialize({ applicationId, locationId, testMode });
        await this._squareV2PaymentProcessor.initializeCard(squarev2);

        return this._store.getState();
    }

    async execute({ payment }: OrderRequestBody): Promise<InternalCheckoutSelectors> {
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        let nonce = await this._squareV2PaymentProcessor.tokenize();

        if (this._shouldVerify()) {
            nonce = JSON.stringify({ nonce, token: await this._squareV2PaymentProcessor.verifyBuyer(nonce) });
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder());
        await this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData: { nonce } }));

        return this._store.getState();
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        await this._squareV2PaymentProcessor.deinitialize();

        return this._store.getState();
    }

    private _shouldVerify(): boolean {
        const { features } = this._store
            .getState()
            .config.getStoreConfigOrThrow().checkoutSettings;

        return features['PROJECT-3828.add_3ds_support_on_squarev2'];
    }
}
