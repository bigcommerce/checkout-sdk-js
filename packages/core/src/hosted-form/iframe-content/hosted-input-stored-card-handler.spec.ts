import { getResponse } from '../../common/http-request/responses.mock';
import { IframeEventPoster } from '../../common/iframe';
import { StorefrontStoredCardRequestSender } from '../../payment';
import { getErrorPaymentResponseBody, getPaymentResponseBody } from '../../payment/payments.mock';
import { HostedFieldEventType } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';
import {
    StoredCardHostedFormData,
    StoredCardHostedFormInstrumentFields,
} from '../stored-card-hosted-form-type';
import {
    StoredCardHostedFormDataMock,
    StoredCardHostedFormInstrumentFieldsMock,
    StoredCardHostedFormInstrumentFormMock,
} from '../stored-card-hosted-form.mock';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputStoredCardHandler from './hosted-input-stored-card-handler';
import HostedInputValidateResults from './hosted-input-validate-results';
import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';

describe('HostedInputStoredCardHandler', () => {
    let data: StoredCardHostedFormData;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'post'>;
    let fields: StoredCardHostedFormInstrumentFields;
    let handler: HostedInputStoredCardHandler;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let requestSender: Pick<StorefrontStoredCardRequestSender, 'submitPaymentInstrument'>;
    let values: HostedInputValues;
    let validationResults: HostedInputValidateResults;

    beforeEach(() => {
        inputAggregator = { getInputValues: jest.fn() };
        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        inputValidator = { validate: jest.fn(() => []) };
        eventPoster = { post: jest.fn() };
        requestSender = { submitPaymentInstrument: jest.fn() };

        handler = new HostedInputStoredCardHandler(
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            requestSender as StorefrontStoredCardRequestSender,
        );

        data = StoredCardHostedFormDataMock;
        fields = StoredCardHostedFormInstrumentFieldsMock;

        values = {
            [HostedFieldType.CardCode]: '777',
            [HostedFieldType.CardExpiry]: '03 / 30',
            [HostedFieldType.CardName]: 'John Smith',
            [HostedFieldType.CardNumber]: '4111 1111 1111 1111',
        };

        validationResults = {
            isValid: true,
            errors: {
                cardCode: [],
                cardExpiry: [],
                cardName: [],
                cardNumber: [],
            },
        };

        jest.spyOn(inputAggregator, 'getInputValues').mockReturnValue(values);

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(inputValidator, 'validate').mockReturnValue(validationResults);

        jest.spyOn(requestSender, 'submitPaymentInstrument').mockResolvedValue(
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            getResponse(getPaymentResponseBody()),
        );
    });

    it('validates user inputs', async () => {
        jest.spyOn(inputValidator, 'validate');

        await handler.handle({
            type: HostedFieldEventType.StoredCardRequested,
            payload: { data, fields },
        });

        expect(inputValidator.validate).toHaveBeenCalledWith(values);
    });

    it('posts event when validation happens', async () => {
        const results = {
            isValid: false,
            errors: {
                ...validationResults.errors,
                cardNumber: [
                    { fieldType: HostedFieldType.CardNumber, message: 'Card number is required' },
                ],
            },
        };

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(inputValidator, 'validate').mockResolvedValue(results);

        jest.spyOn(eventPoster, 'post');

        await handler.handle({
            type: HostedFieldEventType.StoredCardRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Validated,
            payload: results,
        });
    });

    it('makes vaulting request with expected payload', async () => {
        await handler.handle({
            type: HostedFieldEventType.StoredCardRequested,
            payload: { data, fields },
        });

        expect(requestSender.submitPaymentInstrument).toHaveBeenCalledWith(
            StoredCardHostedFormDataMock,
            StoredCardHostedFormInstrumentFormMock,
        );
    });

    it('posts event with payload if vaulting submission succeeds', async () => {
        jest.spyOn(eventPoster, 'post');

        await handler.handle({
            type: HostedFieldEventType.StoredCardRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.StoredCardSucceeded,
        });
    });

    it('posts event if vaulting submission fails', async () => {
        const response = getResponse(getErrorPaymentResponseBody());

        jest.spyOn(eventPoster, 'post');

        jest.spyOn(requestSender, 'submitPaymentInstrument').mockRejectedValue(response);

        await handler.handle({
            type: HostedFieldEventType.StoredCardRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.StoredCardFailed,
        });
    });
});
