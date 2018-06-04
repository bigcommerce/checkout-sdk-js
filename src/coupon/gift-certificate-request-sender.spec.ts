import { createTimeout } from '@bigcommerce/request-sender';

import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import GiftCertificateRequestSender from './gift-certificate-request-sender';
import { getGiftCertificateResponseBody } from './internal-gift-certificates.mock';

describe('Gift Certificate Request Sender', () => {
    let giftCertificateRequestSender: GiftCertificateRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            delete: jest.fn(() => Promise.resolve()),
            post: jest.fn(() => Promise.resolve()),
        };

        giftCertificateRequestSender = new GiftCertificateRequestSender(requestSender);
    });

    it('giftCertificateRequestSender is defined', () => {
        expect(giftCertificateRequestSender).toBeDefined();
    });

    const checkoutId = 'checkoutId1234';
    const giftCertificateCode = 'myGiftCertificate1234';

    describe('#applyGiftCertificate()', () => {
        it('applies gift certificate code', async () => {
            const response = getResponse(getGiftCertificateResponseBody());
            requestSender.post.mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.applyGiftCertificate(checkoutId, giftCertificateCode);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates', {
                body: { giftCertificateCode },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });

        it('applies gift certificate with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getGiftCertificateResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.applyGiftCertificate(checkoutId, giftCertificateCode, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates', {
                ...options,
                body: { giftCertificateCode },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes gift certificate code', async () => {
            const response = getResponse(getGiftCertificateResponseBody());
            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.removeGiftCertificate(checkoutId, giftCertificateCode);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates/myGiftCertificate1234', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });

        it('removes gift certificate code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getGiftCertificateResponseBody());
            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const output = await giftCertificateRequestSender.removeGiftCertificate(checkoutId, giftCertificateCode, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/gift-certificates/myGiftCertificate1234', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });
});
