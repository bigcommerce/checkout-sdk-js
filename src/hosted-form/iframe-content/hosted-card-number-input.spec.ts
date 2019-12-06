import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { HostedFieldEventMap } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import CardNumberFormatter from './card-number-formatter';
import HostedAutocompleteFieldset from './hosted-autocomplete-fieldset';
import HostedCardNumberInput from './hosted-card-number-input';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';

describe('HostedCardNumberInput', () => {
    let autocompleteFieldset: HostedAutocompleteFieldset;
    let container: HTMLDivElement;
    let eventListener: Pick<IframeEventListener<HostedFieldEventMap>, 'addListener' | 'listen' | 'stopListen'>;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'setTarget' | 'post'>;
    let input: HostedInput;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let numberFormatter: Pick<CardNumberFormatter, 'format'>;
    let paymentHandler: Pick<HostedInputPaymentHandler, 'handle'>;
    let styles: HostedInputStylesMap;

    beforeEach(() => {
        autocompleteFieldset = new HostedAutocompleteFieldset(
            'input-container',
            [HostedFieldType.CardCode, HostedFieldType.CardExpiry, HostedFieldType.CardName],
            new HostedInputAggregator(window.parent)
        );
        eventListener = {
            addListener: jest.fn(),
            listen: jest.fn(),
            stopListen: jest.fn(),
        };
        eventPoster = {
            post: jest.fn(),
            setTarget: jest.fn(),
        };
        inputAggregator = { getInputValues: jest.fn() };
        inputValidator = {
            validate: jest.fn(() => Promise.resolve({
                isValid: true,
                errors: {},
            })),
        };
        numberFormatter = { format: jest.fn() };
        paymentHandler = { handle: jest.fn() };
        styles = { default: { color: 'rgb(255, 255, 255)' } };

        input = new HostedCardNumberInput(
            'input-container',
            'Full name',
            'Cardholder name',
            'cc-name',
            styles,
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            paymentHandler as HostedInputPaymentHandler,
            autocompleteFieldset,
            numberFormatter as CardNumberFormatter
        );

        container = document.createElement('div');
        container.id = 'input-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it('returns input type', () => {
        expect(input.getType())
            .toEqual(HostedFieldType.CardNumber);
    });

    it('notifies input change', () => {
        jest.spyOn(numberFormatter, 'format')
            .mockReturnValue('4111');

        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '4111';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.CardTypeChanged,
                payload: {
                    cardType: 'visa',
                },
            });
    });

    it('formats input on change', () => {
        jest.spyOn(numberFormatter, 'format')
            .mockReturnValue('4111 1111 1111 1111');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '4111111111111111';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(numberFormatter.format)
            .toHaveBeenCalledWith('4111111111111111');
        expect(element.value)
            .toEqual('4111 1111 1111 1111');
    });

    it('attaches autocomplete fieldset', () => {
        jest.spyOn(autocompleteFieldset, 'attach');

        input.attach();

        expect(autocompleteFieldset.attach)
            .toHaveBeenCalled();
    });
});
