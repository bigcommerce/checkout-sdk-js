import { RequestSender, Response } from '@bigcommerce/request-sender';

import { IframeEventPoster } from '../common/iframe';
import {
    HostedFieldEventType,
    HostedFieldSubmitManualOrderRequestEvent,
} from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';
import { ManualOrderPaymentRequestSender, OfflinePaymentMethodId } from '../payment';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputManualOrderPaymentHandler from './hosted-input-manual-order-payment-handler';
import HostedInputStorage from './hosted-input-storage';
import HostedInputValidator from './hosted-input-validator';

describe('HostedInputManualOrderPaymentHandler', () => {
    let inputAggregator: HostedInputAggregator;
    let inputValidator: HostedInputValidator;
    let inputStorage: HostedInputStorage;
    let eventPoster: IframeEventPoster<HostedInputEvent>;
    let manualOrderPaymentRequestSender: ManualOrderPaymentRequestSender;
    let handler: HostedInputManualOrderPaymentHandler;

    const parentOrigin = 'https://bigcommerce.com';
    const pstToken = 'PST token';

    beforeEach(() => {
        inputAggregator = new HostedInputAggregator(window.parent);
        inputValidator = new HostedInputValidator();
        inputStorage = new HostedInputStorage();
        eventPoster = new IframeEventPoster(parentOrigin, window.parent);
        manualOrderPaymentRequestSender = manualOrderPaymentRequestSender =
            new ManualOrderPaymentRequestSender(
                { post: jest.fn() } as unknown as RequestSender,
                parentOrigin,
            );
        handler = new HostedInputManualOrderPaymentHandler(
            inputAggregator,
            inputValidator,
            inputStorage,
            eventPoster,
            manualOrderPaymentRequestSender,
        );
    });

    it('should post validation results', async () => {
        const event: HostedFieldSubmitManualOrderRequestEvent = {
            type: HostedFieldEventType.SubmitManualOrderRequested,
            payload: {
                data: {
                    paymentMethodId: 'card',
                    paymentSessionToken: pstToken,
                },
            },
        };
        const validationResult = { isValid: true, errors: {} };

        jest.spyOn(inputAggregator, 'getInputValues').mockReturnValue({});
        jest.spyOn(inputValidator, 'validate').mockResolvedValue(validationResult);
        jest.spyOn(eventPoster, 'post');

        await handler.handle(event);

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Validated,
            payload: validationResult,
        });
    });

    it('should post submit failed event if validation fails', async () => {
        const event: HostedFieldSubmitManualOrderRequestEvent = {
            type: HostedFieldEventType.SubmitManualOrderRequested,
            payload: {
                data: {
                    paymentMethodId: 'card',
                    paymentSessionToken: pstToken,
                },
            },
        };

        jest.spyOn(inputAggregator, 'getInputValues').mockReturnValue({});
        jest.spyOn(inputValidator, 'validate').mockResolvedValue({
            isValid: false,
            errors: {
                cardCode: [
                    {
                        fieldType: HostedFieldType.CardCode,
                        type: 'required',
                        message: 'Missing required data',
                    },
                ],
                cardExpiry: [],
                cardName: [],
                cardNumber: [],
            },
        });
        jest.spyOn(eventPoster, 'post');

        await handler.handle(event);

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.SubmitManualOrderFailed,
            payload: {
                error: {
                    code: 'invalid_hosted_form_value_error',
                    message:
                        'Unable to proceed due to invalid user input values. Missing required data',
                },
            },
        });
    });

    it('should post submit succeeded event if card payment is successful', async () => {
        const event: HostedFieldSubmitManualOrderRequestEvent = {
            type: HostedFieldEventType.SubmitManualOrderRequested,
            payload: {
                data: {
                    paymentMethodId: 'card',
                    paymentSessionToken: pstToken,
                },
            },
        };

        jest.spyOn(inputAggregator, 'getInputValues').mockReturnValue({});
        jest.spyOn(inputValidator, 'validate').mockResolvedValue({ isValid: true, errors: {} });
        jest.spyOn(manualOrderPaymentRequestSender, 'submitPayment').mockResolvedValue({
            body: { type: 'success' },
        } as Response<unknown>);
        jest.spyOn(eventPoster, 'post');

        await handler.handle(event);

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.SubmitManualOrderSucceeded,
        });
    });

    it('should skip validation and post submit succeeded event if offline payment is successful', async () => {
        const event: HostedFieldSubmitManualOrderRequestEvent = {
            type: HostedFieldEventType.SubmitManualOrderRequested,
            payload: {
                data: {
                    paymentMethodId: OfflinePaymentMethodId.Cod,
                    paymentSessionToken: pstToken,
                },
            },
        };

        jest.spyOn(inputAggregator, 'getInputValues').mockReturnValue({});
        jest.spyOn(inputValidator, 'validate').mockResolvedValue({ isValid: true, errors: {} });
        jest.spyOn(manualOrderPaymentRequestSender, 'submitPayment').mockResolvedValue({
            body: {
                type: 'continue',
                code: 'await_confirmation',
                parameters: {},
            },
        } as Response<unknown>);
        jest.spyOn(eventPoster, 'post');

        await handler.handle(event);

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.SubmitManualOrderSucceeded,
        });
    });
});
