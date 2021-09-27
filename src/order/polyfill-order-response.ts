import { Response } from '@bigcommerce/request-sender';

import Order, { OrderPayment } from './order';
import RawOrder, { RawOrderPayment } from './raw-order';

const polyfillOrderPayment = (orderPayment: RawOrderPayment): OrderPayment => {
    const [providerId, method] = orderPayment.providerId.split('.');

    if (!method) {
        return orderPayment;
    }

    return {
        ...orderPayment,
        providerId,
        method,
    };
};

export const polyfillOrderResponse = async (response: Response<RawOrder>): Promise<Response<Order>> => {
    const { payments } = response.body;

    if (!payments || payments.length === 0) {
        return Promise.resolve(response);
    }

    return Promise.resolve({
        ...response,
        body: {
            ...response.body,
            payments: payments.map(polyfillOrderPayment),
        },
    });
};
