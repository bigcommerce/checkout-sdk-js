import { createTimeout } from '@bigcommerce/request-sender';
import { getResponse } from '../common/http-request/responses.mock';
import { getGiftCertificateResponseBody } from './internal-gift-certificates.mock';
import GiftCertificateRequestSender from './gift-certificate-request-sender';

describe('Gift Certificate Request Sender', () => {
    let giftCertificateRequestSender;
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

    describe('#applyGiftCertificate()', () => {
        it('applies gift certificate code', async () => {
            const response = getResponse(getGiftCertificateResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myGiftCertificateCode1234';
            const output = await giftCertificateRequestSender.applyGiftCertificate(couponCode);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', {
                body: { couponCode },
            });
        });

        it('applies gift certificate with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getGiftCertificateResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myGiftCertificateCode1234';
            const output = await giftCertificateRequestSender.applyGiftCertificate(couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', {
                ...options,
                body: { couponCode },
            });
        });
    });

    describe('#removeGiftCertificate()', () => {
        it('removes gift certificate code', async () => {
            const response = getResponse(getGiftCertificateResponseBody());

            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myGiftCertificate1234';
            const output = await giftCertificateRequestSender.removeGiftCertificate(couponCode);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myGiftCertificate1234', {});
        });

        it('removes gift certificate code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getGiftCertificateResponseBody());

            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myGiftCertificate1234';
            const output = await giftCertificateRequestSender.removeGiftCertificate(couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myGiftCertificate1234', {
                ...options,
            });
        });
    });
});
