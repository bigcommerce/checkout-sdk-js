import { RequestSender, Response } from '@bigcommerce/request-sender';

import ContentType from '../common/http-request/content-type';
import HostedFormManualOrderData from '../hosted-form-manual-order-data';
import { HostedInputValues } from '../iframe-content';

import {
    InstrumentType,
    invoicePaymentMethod,
    manualPaymentMethod,
    OfflinePaymentMethods,
    OfflinePaymentMethodTypes,
} from './Instrument';
import { ManualOrderPaymentRequestSender } from './manual-order-payment-request-sender';

describe('ManualOrderPaymentRequestSender', () => {
    let requestSender: RequestSender;
    let paymentOrigin: string;
    let manualOrderPaymentRequestSender: ManualOrderPaymentRequestSender;
    let requestInitializationData: HostedFormManualOrderData;
    let instrumentFormData: HostedInputValues;
    let response: Response<unknown>;

    const pstToken = 'PST token';
    const testingManualPaymentNote = 'payment note';

    beforeEach(() => {
        requestSender = { post: jest.fn() } as unknown as RequestSender;
        paymentOrigin = 'https://example.com';
        manualOrderPaymentRequestSender = new ManualOrderPaymentRequestSender(
            requestSender,
            paymentOrigin,
        );
        requestInitializationData = {
            paymentMethodId: manualPaymentMethod,
            paymentSessionToken: pstToken,
        };
        response = { body: {} } as Response<unknown>;
    });

    it('submits manual payment', async () => {
        (requestSender.post as jest.Mock).mockResolvedValue(response);

        instrumentFormData = {
            note: testingManualPaymentNote,
        };

        const result = await manualOrderPaymentRequestSender.submitPayment(
            requestInitializationData,
            instrumentFormData,
        );

        expect(result).toBe(response);
        expect(requestSender.post).toHaveBeenCalledWith(
            `${paymentOrigin}/payments`,
            expect.objectContaining({
                headers: {
                    Accept: ContentType.Json,
                    'Content-Type': ContentType.Json,
                    'X-Payment-Session-Token': pstToken,
                },
                body: {
                    instrument: {
                        type: InstrumentType.ManualPayment,
                        note: testingManualPaymentNote,
                    },
                    payment_method_id: manualPaymentMethod,
                    form_nonce: undefined,
                },
            }),
        );
    });

    it('submits invoice payment with a manual invoice instrument', async () => {
        (requestSender.post as jest.Mock).mockResolvedValue(response);

        requestInitializationData.paymentMethodId = invoicePaymentMethod;
        instrumentFormData = {};

        const result = await manualOrderPaymentRequestSender.submitPayment(
            requestInitializationData,
            instrumentFormData,
        );

        expect(result).toBe(response);
        expect(requestSender.post).toHaveBeenCalledWith(
            `${paymentOrigin}/payments`,
            expect.objectContaining({
                body: expect.objectContaining({
                    instrument: { type: InstrumentType.ManualInvoice },
                    payment_method_id: invoicePaymentMethod,
                }),
            }),
        );
    });

    it('submits invoice options inside the manual invoice instrument', async () => {
        (requestSender.post as jest.Mock).mockResolvedValue(response);

        requestInitializationData.paymentMethodId = invoicePaymentMethod;
        requestInitializationData.options = { net_terms: 'NET_30', reference: 'PO-1' };
        instrumentFormData = {};

        await manualOrderPaymentRequestSender.submitPayment(
            requestInitializationData,
            instrumentFormData,
        );

        const { body } = (requestSender.post as jest.Mock).mock.calls[0][1];

        expect(body.instrument).toEqual({
            type: InstrumentType.ManualInvoice,
            net_terms: 'NET_30',
            reference: 'PO-1',
        });
        expect(body).not.toHaveProperty('options');
    });

    it('submits card payment', async () => {
        (requestSender.post as jest.Mock).mockResolvedValue(response);

        requestInitializationData.paymentMethodId = 'card';
        instrumentFormData = {
            cardName: 'John Doe',
            cardNumber: '4111 1111 1111 1111',
            cardExpiry: '12/23',
            cardCode: '123',
        };

        const result = await manualOrderPaymentRequestSender.submitPayment(
            requestInitializationData,
            instrumentFormData,
        );

        expect(result).toBe(response);
        expect(requestSender.post).toHaveBeenCalledWith(
            `${paymentOrigin}/payments`,
            expect.objectContaining({
                headers: {
                    Accept: ContentType.Json,
                    'Content-Type': ContentType.Json,
                    'X-Payment-Session-Token': pstToken,
                },
                body: {
                    instrument: {
                        type: InstrumentType.Card,
                        name: 'John Doe',
                        number: '4111111111111111',
                        expires: {
                            month: 12,
                            year: 2023,
                        },
                        verification_value: '123',
                    },
                    payment_method_id: 'card',
                    form_nonce: undefined,
                },
            }),
        );
    });

    it('submits offline payment', async () => {
        response = {
            type: 'continue',
            code: 'complete_offline',
            parameters: {},
        } as unknown as Response<unknown>;

        requestInitializationData.paymentMethodId = OfflinePaymentMethods.BankDeposit;
        (requestSender.post as jest.Mock).mockResolvedValue(response);

        const result = await manualOrderPaymentRequestSender.submitPayment(
            requestInitializationData,
            instrumentFormData,
        );

        expect(result).toBe(response);
        expect(requestSender.post).toHaveBeenCalledWith(
            `${paymentOrigin}/payments`,
            expect.objectContaining({
                headers: {
                    Accept: ContentType.Json,
                    'Content-Type': ContentType.Json,
                    'X-Payment-Session-Token': pstToken,
                },
                body: {
                    instrument: {
                        type: OfflinePaymentMethodTypes.BankDeposit,
                    },
                    payment_method_id: OfflinePaymentMethods.BankDeposit,
                    form_nonce: undefined,
                },
            }),
        );
    });

    it('submits tokenized card payment', async () => {
        (requestSender.post as jest.Mock).mockResolvedValue(response);

        requestInitializationData.paymentMethodId = 'squarev2.credit_card';
        requestInitializationData.token = 'cnon:test-token';
        instrumentFormData = {};

        const result = await manualOrderPaymentRequestSender.submitPayment(
            requestInitializationData,
            instrumentFormData,
        );

        expect(result).toBe(response);
        expect(requestSender.post).toHaveBeenCalledWith(
            `${paymentOrigin}/payments`,
            expect.objectContaining({
                headers: {
                    Accept: ContentType.Json,
                    'Content-Type': ContentType.Json,
                    'X-Payment-Session-Token': pstToken,
                },
                body: {
                    instrument: {
                        type: InstrumentType.TokenizedCard,
                        token: 'cnon:test-token',
                    },
                    payment_method_id: 'squarev2.credit_card',
                    form_nonce: undefined,
                },
            }),
        );
    });
});
