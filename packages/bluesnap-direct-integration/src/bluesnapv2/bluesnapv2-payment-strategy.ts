import { noop } from 'lodash';

import {
    CancellablePromise,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentRequestOptions,
    PaymentStatusTypes,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapV2StyleProps } from './bluesnapv2';
import {
    BlueSnapV2PaymentInitializeOptions,
    WithBlueSnapV2PaymentInitializeOptions,
} from './bluesnapv2-payment-options';

const IFRAME_NAME = 'bluesnapv2_hosted_payment_page';

export default class BlueSnapV2PaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: BlueSnapV2PaymentInitializeOptions;

    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(
        orderRequest: OrderRequestBody,
        options?: PaymentInitializeOptions & WithBlueSnapV2PaymentInitializeOptions,
    ): Promise<void> {
        const { payment } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { onLoad, style } = this._initializeOptions;
        const frame = this._createIframe(IFRAME_NAME, style);
        const promise = new CancellablePromise<undefined>(new Promise(noop));

        onLoad(frame, () => promise.cancel(new PaymentMethodCancelledError()));

        await this._paymentIntegrationService.submitOrder(orderRequest, options);

        await this._paymentIntegrationService.initializeOffsitePayment({
            methodId: payment.methodId,
            gatewayId: payment.gatewayId,
            shouldSaveInstrument: false,
            target: frame.name,
            promise: promise.promise,
        });
    }

    async finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this._paymentIntegrationService.getState();
        const order = state.getOrder();
        const status = state.getPaymentStatus();

        if (
            order &&
            (status === PaymentStatusTypes.ACKNOWLEDGE || status === PaymentStatusTypes.FINALIZE)
        ) {
            await this._paymentIntegrationService.finalizeOrder(options);

            return;
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async initialize(
        options?: PaymentInitializeOptions & WithBlueSnapV2PaymentInitializeOptions,
    ): Promise<void> {
        this._initializeOptions = options && options.bluesnapv2;

        await Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _createIframe(name: string, style?: BlueSnapV2StyleProps): HTMLIFrameElement {
        const iframe = document.createElement('iframe');

        iframe.setAttribute(
            'sandbox',
            'allow-top-navigation allow-scripts allow-forms allow-same-origin',
        );

        iframe.name = name;

        if (style) {
            const { border, height, width } = style;

            iframe.style.border = border ?? '';
            iframe.style.height = height ?? '';
            iframe.style.width = width ?? '';
        }

        return iframe;
    }
}
