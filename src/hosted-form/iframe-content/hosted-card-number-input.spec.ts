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
    let container: HTMLFormElement;
    let eventListener: Pick<IframeEventListener<HostedFieldEventMap>, 'addListener' | 'listen' | 'stopListen'>;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'setTarget' | 'post'>;
    let input: HostedInput;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let numberFormatter: Pick<CardNumberFormatter, 'format'>;
    let paymentHandler: Pick<HostedInputPaymentHandler, 'handle'>;
    let styles: HostedInputStylesMap;

    beforeEach(() => {
        container = document.createElement('form');
        document.body.appendChild(container);

        autocompleteFieldset = new HostedAutocompleteFieldset(
            container,
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
            container,
            'Full name',
            'Cardholder name',
            'cc-name',
            styles,
            [],
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            paymentHandler as HostedInputPaymentHandler,
            autocompleteFieldset,
            numberFormatter as CardNumberFormatter
        );
    });

    afterEach(() => {
        container.remove();
    });

    it('returns input type', () => {
        expect(input.getType())
            .toEqual(HostedFieldType.CardNumber);
    });

    it('notifies card type change', () => {
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

    it('notifies bin number change', () => {
        jest.spyOn(numberFormatter, 'format')
            .mockReturnValue('4111 1111 1111 1111');

        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '4111111111111111';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.BinChanged,
                payload: {
                    bin: '411111',
                },
            });
    });

    it('notifies when bin number can no longer be detected', () => {
        jest.spyOn(numberFormatter, 'format')
            .mockImplementation(value => value === '4111111111111111' ? '4111 1111 1111 1111' : value);

        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '4111111111111111';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        element.value = '41';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.BinChanged,
                payload: {
                    bin: '',
                },
            });
    });

    it('does not notify if bin number is invalid', () => {
        jest.spyOn(numberFormatter, 'format')
            .mockReturnValue('0000 0000 0000 0000');

        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '0000000000000000';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(eventPoster.post)
            .not.toHaveBeenCalledWith(expect.objectContaining({
                type: HostedInputEventType.BinChanged,
            }));
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
