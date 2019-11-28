import { getResponse } from '../../common/http-request/responses.mock';
import { IframeEventPoster } from '../../common/iframe';
import { PaymentRequestSender, PaymentRequestTransformer } from '../../payment';
import { getErrorPaymentResponseBody, getPaymentRequestBody, getPaymentResponseBody } from '../../payment/payments.mock';
import { HostedFieldEventType } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';
import HostedFormOrderData from '../hosted-form-order-data';
import { getHostedFormOrderData } from '../hosted-form-order-data.mock';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';

describe('HostedInputPaymentHandler', () => {
    let data: HostedFormOrderData;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'post'>;
    let fields: HostedFieldType[];
    let handler: HostedInputPaymentHandler;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let requestSender: Pick<PaymentRequestSender, 'submitPayment'>;
    let requestTransformer: Pick<PaymentRequestTransformer, 'transformWithHostedFormData'>;
    let values: HostedInputValues;

    beforeEach(() => {
        inputAggregator = { getInputValues: jest.fn() };
        inputValidator = { validate: jest.fn(() => []) };
        eventPoster = { post: jest.fn() };
        requestSender = { submitPayment: jest.fn() };
        requestTransformer = { transformWithHostedFormData: jest.fn() };

        handler = new HostedInputPaymentHandler(
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            requestSender as PaymentRequestSender,
            requestTransformer as PaymentRequestTransformer
        );

        data = getHostedFormOrderData();

        fields = [
            HostedFieldType.CardCode,
            HostedFieldType.CardExpiry,
            HostedFieldType.CardName,
            HostedFieldType.CardNumber,
        ];

        values = {
            [HostedFieldType.CardCode]: '123',
            [HostedFieldType.CardExpiry]: '10 / 20',
            [HostedFieldType.CardName]: 'Good Shopper',
            [HostedFieldType.CardNumber]: '4111 1111 1111 1111',
        };

        jest.spyOn(inputAggregator, 'getInputValues')
            .mockReturnValue(values);

        jest.spyOn(requestSender, 'submitPayment')
            .mockResolvedValue(getResponse(getPaymentResponseBody()));
    });

    it('validates user inputs', async () => {
        jest.spyOn(inputValidator, 'validate');

        await handler.handle({
            type: HostedFieldEventType.SubmitRequested,
            payload: { data, fields },
        });

        expect(inputValidator.validate)
            .toHaveBeenCalledWith(values, { isCardCodeRequired: false });
    });

    it('posts event if validation fails', async () => {
        jest.spyOn(inputValidator, 'validate')
            .mockResolvedValue([
                { fieldType: HostedFieldType.CardNumber, message: 'Card number is required' },
            ]);

        jest.spyOn(eventPoster, 'post');

        await handler.handle({
            type: HostedFieldEventType.SubmitRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.ValidateFailed,
                payload: {
                    errors: [
                        { fieldType: HostedFieldType.CardNumber, message: 'Card number is required' },
                    ],
                },
            });
    });

    it('makes payment request with expected payload', async () => {
        jest.spyOn(requestTransformer, 'transformWithHostedFormData')
            .mockReturnValue(getPaymentRequestBody());

        await handler.handle({
            type: HostedFieldEventType.SubmitRequested,
            payload: { data, fields },
        });

        expect(requestTransformer.transformWithHostedFormData)
            .toHaveBeenCalled();
        expect(requestSender.submitPayment)
            .toHaveBeenCalledWith(getPaymentRequestBody());
    });

    it('posts event if payment submission succeeds', async () => {
        jest.spyOn(eventPoster, 'post');

        await handler.handle({
            type: HostedFieldEventType.SubmitRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post)
            .toHaveBeenCalledWith({ type: HostedInputEventType.SubmitSucceeded });
    });

    it('posts event if payment submission fails', async () => {
        jest.spyOn(eventPoster, 'post');

        jest.spyOn(requestSender, 'submitPayment')
            .mockRejectedValue(getResponse(getErrorPaymentResponseBody()));

        await handler.handle({
            type: HostedFieldEventType.SubmitRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.SubmitFailed,
                payload: {
                    error: { code: 'insufficient_funds', message: 'Insufficient funds' },
                },
            });
    });
});
