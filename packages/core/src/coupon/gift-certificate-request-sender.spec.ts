import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { EmptyCartError } from '../cart/errors';
import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import GiftCertificateRequestSender from './gift-certificate-request-sender';

describe('Gift Certificate Request Sender', () => {
    let giftCertificateRequestSender: GiftCertificateRequestSender;
    let requestSender: RequestSender;

    const defaultIncludes = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'customer.customerGroup',
        'payments',
        'promotions.banners',
    ].join(',');

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(getResponse({})));
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(getResponse({})));

        giftCertificateRequestSender = new GiftCertificateRequestSender(requestSender);
    });

    it('giftCertificateRequestSender is defined', () => {
        expect(giftCertificateRequestSender).toBeDefined();
    });

    const checkoutId = 'checkoutId1234';
    const giftCertificateCode = 'myGiftCertificate1234';

    describe('#applyGiftCertificate()', () => {
        it('applies gift certificate code', async () => {
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.applyGiftCertificate(
                checkoutId,
                giftCertificateCode,
            );

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/checkoutId1234/gift-certificates',
                {
                    body: { giftCertificateCode },
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include: defaultIncludes,
                    },
                },
            );
        });

        it('applies gift certificate with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.applyGiftCertificate(
                checkoutId,
                giftCertificateCode,
                options,
            );

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith(
                '/api/storefront/checkouts/checkoutId1234/gift-certificates',
                {
                    ...options,
                    body: { giftCertificateCode },
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include: defaultIncludes,
                    },
                },
            );
        });

        it('throws `EmptyCartError` if error type is `empty_cart`', async () => {
            const error = getErrorResponse(
                {
                    status: 422,
                    title: 'The request could not process',
                    type: 'empty_cart',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.reject(error));

            await expect(
                giftCertificateRequestSender.applyGiftCertificate(checkoutId, giftCertificateCode),
            ).rejects.toThrow(EmptyCartError);
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes gift certificate code', async () => {
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.removeGiftCertificate(
                checkoutId,
                giftCertificateCode,
            );

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith(
                '/api/storefront/checkouts/checkoutId1234/gift-certificates/myGiftCertificate1234',
                {
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include: defaultIncludes,
                    },
                },
            );
        });

        it('removes gift certificate code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.removeGiftCertificate(
                checkoutId,
                giftCertificateCode,
                options,
            );

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith(
                '/api/storefront/checkouts/checkoutId1234/gift-certificates/myGiftCertificate1234',
                {
                    ...options,
                    headers: {
                        Accept: ContentType.JsonV1,
                        ...SDK_VERSION_HEADERS,
                    },
                    params: {
                        include: defaultIncludes,
                    },
                },
            );
        });

        it('throws `EmptyCartError` if error type is `empty_cart`', async () => {
            const error = getErrorResponse(
                {
                    status: 422,
                    title: 'The request could not process',
                    type: 'empty_cart',
                },
                undefined,
                409,
            );

            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.reject(error));

            await expect(
                giftCertificateRequestSender.removeGiftCertificate(checkoutId, giftCertificateCode),
            ).rejects.toThrow(EmptyCartError);
        });
    });
});
