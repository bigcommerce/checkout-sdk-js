import { RequestErrorFactory } from './common/error';
import { UnrecoverableError } from './common/error/errors';

/**
 * @return {RequestErrorFactory}
 */
export default function createRequestErrorFactory() {
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

    unrecoverableErrorTypes.forEach((type) => {
        factory.register(type, (...args) => new UnrecoverableError(...args));
    });

    return factory;
}
