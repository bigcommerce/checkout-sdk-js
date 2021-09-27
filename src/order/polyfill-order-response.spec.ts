import { Response } from '@bigcommerce/request-sender';

import { getOrder } from './orders.mock';
import { polyfillOrderResponse } from './polyfill-order-response';
import RawOrder from './raw-order';

it('transforms orders with payment method IDs in the `providerName.method` format', async () => {
    const orderPayment = {
        providerId: 'some-provider.some-method',
        description: 'string',
        amount: 99,
        detail: {
            code: '',
            remaining: 99,
        },
    };

    const orderWithPayments: Response<RawOrder> = {
        headers: [],
        status: 200,
        statusText: '',
        body: {
            ...getOrder(),
            payments: [orderPayment],
        },
    };

    await expect(polyfillOrderResponse(orderWithPayments)).resolves.toStrictEqual({
        headers: [],
        status: 200,
        statusText: '',
        body: {
            ...getOrder(),
            payments: [{
                providerId: 'some-provider',
                method: 'some-method',
                description: 'string',
                amount: 99,
                detail: {
                    code: '',
                    remaining: 99,
                },
            }],
        },
    });
});

it('returns orders without payments unaltered', async () => {
    const orderWithoutPayments: Response<RawOrder> = {
        headers: [],
        status: 200,
        statusText: '',
        body: {
            ...getOrder(),
            payments: undefined,
        },
    };

    await expect(polyfillOrderResponse(orderWithoutPayments)).resolves.toStrictEqual(orderWithoutPayments);
});

it('returns orders with payment method IDs not in the `providerName.method` format unaltered', async () => {
    const orderPayment = {
        providerId: 'some-provider',
        description: 'string',
        amount: 99,
        detail: {
            code: '',
            remaining: 99,
        },
    };

    const orderWithPayments: Response<RawOrder> = {
        headers: [],
        status: 200,
        statusText: '',
        body: {
            ...getOrder(),
            payments: [orderPayment],
        },
    };

    await expect(polyfillOrderResponse(orderWithPayments)).resolves.toStrictEqual(orderWithPayments);
});
