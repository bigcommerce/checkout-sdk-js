import { CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaypalCommerceScriptLoader } from '../../../payment/strategies/paypalCommerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {

    constructor(
        private _store: CheckoutStore,
        private _paypalScriptLoader: PaypalCommerceScriptLoader
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);
        const paypalOptions = options.paypalCommerce;

        if (!paypalOptions) {
            throw new InvalidArgumentError();
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._paypalScriptLoader.loadPaypalCommerce(paypalOptions.clientId)
            .then(paypal => {
                if (!paymentMethod || !paymentMethod.config.merchantId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return paypal.Buttons({
                    createOrder: () => {
                        // TODO add handler for create order action
                    },
                    onApprove: () => {
                        // TODO add handler for approve action
                    },
                }).render(`#${options.containerId}`);
            });
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
