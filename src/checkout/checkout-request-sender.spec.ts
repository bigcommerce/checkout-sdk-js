import { createRequestSender, RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import { CheckoutIncludes } from './checkout-params';
import CheckoutRequestSender from './checkout-request-sender';
import { getCheckout } from './checkouts.mock';

describe('CheckoutRequestSender', () => {
    let requestSender: RequestSender;
    let response: Response;
    let checkoutRequestSender: CheckoutRequestSender;

    const defaultIncludes = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'payments',
        'promotions.banners',
    ].join(',');

    beforeEach(() => {
        requestSender = createRequestSender();
        response = getResponse(getCheckout());

        jest.spyOn(requestSender, 'get').mockReturnValue(response);
        jest.spyOn(requestSender, 'put').mockReturnValue(response);
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
    });

    describe('loadCheckout', () => {
        it('returns the response of the requestSender', async () => {
            expect(await checkoutRequestSender.loadCheckout('6cb62bfc-c92d-45f5-869b-d3d9681a58d4')).toEqual(response);
        });

        it('sends expected params to requestSender', async () => {
            await checkoutRequestSender.loadCheckout('6cb62bfc-c92d-45f5-869b-d3d9681a58d4');

            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/checkout/6cb62bfc-c92d-45f5-869b-d3d9681a58d4', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
                timeout: undefined,
            });
        });

        it('appends passed params when loading checkout', async () => {
            await checkoutRequestSender.loadCheckout('6cb62bfc-c92d-45f5-869b-d3d9681a58d4', {
                params: {
                    include: [CheckoutIncludes.AvailableShippingOptions],
                },
            });

            expect(requestSender.get).toHaveBeenCalledWith('/api/storefront/checkout/6cb62bfc-c92d-45f5-869b-d3d9681a58d4', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes.concat(`,${CheckoutIncludes.AvailableShippingOptions}`),
                    timeout: undefined,
                },
            });
        });
    });

    describe('updateCheckout', () => {
        it('returns the response of the requestSender', async () => {
            expect(await checkoutRequestSender.updateCheckout('6cb62bfc-c92d-45f5-869b-d3d9681a58d4', { customerMessage: 'foo' }))
                .toEqual(response);
        });

        it('sends expected params to requestSender', async () => {
            await checkoutRequestSender.updateCheckout(
                '6cb62bfc-c92d-45f5-869b-d3d9681a58d4',
                { customerMessage: 'foo' },
                {
                    params: {
                        include: [CheckoutIncludes.AvailableShippingOptions],
                    },
                }
            );

            expect(requestSender.put).toHaveBeenCalledWith('/api/storefront/checkout/6cb62bfc-c92d-45f5-869b-d3d9681a58d4', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                body: {
                    customerMessage: 'foo',
                },
                params: {
                    include: defaultIncludes.concat(`,${CheckoutIncludes.AvailableShippingOptions}`),
                },
                timeout: undefined,
            });
        });
    });
});
