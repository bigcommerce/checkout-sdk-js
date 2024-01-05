import { getResponse } from '../../common/http-request/responses.mock';
import { IframeEventPoster } from '../../common/iframe';
import { StorefrontVaultingRequestSender } from '../../payment';
import { getErrorPaymentResponseBody, getPaymentResponseBody } from '../../payment/payments.mock';
import { HostedFieldEventType } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';
import {
    HostedFormVaultingData,
    HostedFormVaultingInstrumentFields,
} from '../hosted-form-vaulting-type';
import {
    hostedFormVaultingDataMock,
    hostedFormVaultingInstrumentFieldsMock,
    hostedFormVaultingInstrumentFormMock,
} from '../hosted-form-vaulting.mock';

import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputValidateResults from './hosted-input-validate-results';
import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';
import HostedInputVaultingHandler from './hosted-input-vaulting-handler';

describe('HostedInputVaultingHandler', () => {
    let data: HostedFormVaultingData;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'post'>;
    let fields: HostedFormVaultingInstrumentFields;
    let handler: HostedInputVaultingHandler;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let requestSender: Pick<StorefrontVaultingRequestSender, 'submitPaymentInstrument'>;
    let values: HostedInputValues;
    let validationResults: HostedInputValidateResults;

    beforeEach(() => {
        inputAggregator = { getInputValues: jest.fn() };
        inputValidator = { validate: jest.fn(() => []) };
        eventPoster = { post: jest.fn() };
        requestSender = { submitPaymentInstrument: jest.fn() };

        handler = new HostedInputVaultingHandler(
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            requestSender as StorefrontVaultingRequestSender,
        );

        data = hostedFormVaultingDataMock;
        fields = hostedFormVaultingInstrumentFieldsMock;

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

        jest.spyOn(inputValidator, 'validate').mockReturnValue(validationResults);

        jest.spyOn(requestSender, 'submitPaymentInstrument').mockResolvedValue(
            getResponse(getPaymentResponseBody()),
        );
    });

    it('validates user inputs', async () => {
        jest.spyOn(inputValidator, 'validate');

        await handler.handle({
            type: HostedFieldEventType.VaultingRequested,
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

        jest.spyOn(inputValidator, 'validate').mockResolvedValue(results);

        jest.spyOn(eventPoster, 'post');

        await handler.handle({
            type: HostedFieldEventType.VaultingRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Validated,
            payload: results,
        });
    });

    it('makes vaulting request with expected payload', async () => {
        await handler.handle({
            type: HostedFieldEventType.VaultingRequested,
            payload: { data, fields },
        });

        expect(requestSender.submitPaymentInstrument).toHaveBeenCalledWith(
            hostedFormVaultingDataMock,
            hostedFormVaultingInstrumentFormMock,
        );
    });

    it('posts event with payload if vaulting submission succeeds', async () => {
        jest.spyOn(eventPoster, 'post');

        await handler.handle({
            type: HostedFieldEventType.VaultingRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.VaultingSucceeded,
        });
    });

    it('posts event if vaulting submission fails', async () => {
        const response = getResponse(getErrorPaymentResponseBody());

        jest.spyOn(eventPoster, 'post');

        jest.spyOn(requestSender, 'submitPaymentInstrument').mockRejectedValue(response);

        await handler.handle({
            type: HostedFieldEventType.VaultingRequested,
            payload: { data, fields },
        });

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.VaultingFailed,
        });
    });
});
