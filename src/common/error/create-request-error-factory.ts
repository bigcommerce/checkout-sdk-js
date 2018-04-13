import { PaymentMethodInvalidError } from '../../payment/errors';

import { UnrecoverableError } from './errors';
import RequestErrorFactory from './request-error-factory';

export default function createRequestErrorFactory(): RequestErrorFactory {
    const factory = new RequestErrorFactory();

    const unrecoverableErrorTypes = [
        'catalog_only',
        'empty_cart',
        'invalid_order_id',
        'invalid_order_token',
        'missing_order_token',
        'missing_provider_token',
        'missing_shipping_method',
        'order_completion_error',
        'order_could_not_be_finalized_error',
        'order_create_failed',
        'provider_fatal_error',
        'provider_setup_error',
        'stock_too_low',
    ];

    unrecoverableErrorTypes.forEach(type => {
        factory.register(type, (response, message) => new UnrecoverableError(response, message));
    });

    factory.register('invalid_payment_provider', response => new PaymentMethodInvalidError(response));
    factory.register('payment_config_not_found', response => new PaymentMethodInvalidError(response));

    return factory;
}
