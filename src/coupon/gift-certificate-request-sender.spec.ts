import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getCheckoutWithGiftCertificates } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

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

        jest.spyOn(requestSender, 'delete')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(requestSender, 'post')
            .mockReturnValue(Promise.resolve());

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

            jest.spyOn(requestSender, 'post')
                .mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.applyGiftCertificate(checkoutId, giftCertificateCode);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates', {
                body: { giftCertificateCode },
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });

        it('applies gift certificate with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'post')
                .mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.applyGiftCertificate(checkoutId, giftCertificateCode, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates', {
                ...options,
                body: { giftCertificateCode },
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes gift certificate code', async () => {
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'delete')
                .mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.removeGiftCertificate(checkoutId, giftCertificateCode);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates/myGiftCertificate1234', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });

        it('removes gift certificate code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckoutWithGiftCertificates());

            jest.spyOn(requestSender, 'delete')
                .mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.removeGiftCertificate(checkoutId, giftCertificateCode, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates/myGiftCertificate1234', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });
    });
});
