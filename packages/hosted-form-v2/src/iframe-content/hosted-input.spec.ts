import { EventEmitter } from 'events';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';
import {
    HostedFieldEventMap,
    HostedFieldEventType,
    HostedFieldSubmitManualOrderRequestEvent,
} from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputManualOrderPaymentHandler from './hosted-input-manual-order-payment-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';

describe('HostedInput', () => {
    let container: HTMLFormElement;
    let eventEmitter: EventEmitter;
    let eventListener: Pick<
        IframeEventListener<HostedFieldEventMap>,
        'addListener' | 'listen' | 'stopListen'
    >;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'setTarget' | 'post'>;
    let fontUrls: string[];
    let input: HostedInput;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let manualOrderPaymentHandler: Pick<HostedInputManualOrderPaymentHandler, 'handle'>;
    let styles: HostedInputStylesMap;
    let values: HostedInputValues;

    beforeEach(() => {
        values = {
            cardCode: '123',
            cardExpiry: '10 / 20',
            cardName: 'Good Shopper',
            cardNumber: '4111 1111 1111 1111',
        };

        styles = {
            default: {
                color: 'rgb(255, 255, 255)',
                fontSize: '15px',
            },
        };

        eventEmitter = new EventEmitter();

        eventListener = {
            addListener: jest.fn((type, listener) => {
                eventEmitter.on(type, listener);
            }),
            listen: jest.fn(),
            stopListen: jest.fn(),
        };

        eventPoster = {
            post: jest.fn(),
            setTarget: jest.fn(),
        };

        fontUrls = ['https://fonts.googleapis.com/css?family=Open+Sans&display=swap'];

        manualOrderPaymentHandler = { handle: jest.fn() };

        inputAggregator = {
            getInputValues: jest.fn(() => values),
        };

        inputValidator = {
            validate: jest.fn(() =>
                Promise.resolve({
                    isValid: true,
                    errors: {
                        cardExpiry: [],
                        cardName: [],
                        cardNumber: [],
                    },
                }),
            ),
        };

        container = document.createElement('form');
        document.body.appendChild(container);

        input = new HostedInput(
            HostedFieldType.CardName,
            container,
            'Full name',
            'Cardholder name',
            'cc-name',
            styles,
            fontUrls,
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            manualOrderPaymentHandler as HostedInputManualOrderPaymentHandler,
        );
    });

    afterEach(() => {
        input.detach();
        container.remove();
    });

    it('returns input type', () => {
        expect(input.getType()).toEqual(HostedFieldType.CardName);
    });

    it('sets and returns input value', () => {
        input.setValue('abc');

        expect(input.getValue()).toBe('abc');
    });

    it('attaches input to container', () => {
        input.attach();

        expect(container.querySelector('input')).toBeDefined();
    });

    it('configures input with expected attributes', () => {
        input.attach();

        const element = container.querySelector('input')!;

        expect(element.id).toBe('card-name');
        expect(element.placeholder).toBe('Full name');
        expect(element.autocomplete).toBe('cc-name');
        expect(element.getAttribute('aria-label')).toBe('Cardholder name');
        expect(element.inputMode).toBe('text');
    });

    it('renders payment note field', () => {
        input = new HostedInput(
            HostedFieldType.Note,
            container,
            '',
            'Payment note',
            '',
            styles,
            fontUrls,
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            manualOrderPaymentHandler as HostedInputManualOrderPaymentHandler,
        );

        input.attach();

        const element = container.querySelector('input')!;

        expect(element.id).toBe('note');
        expect(element.placeholder).toBe('');
        expect(element.getAttribute('aria-label')).toBe('Payment note');
        expect(element.inputMode).toBe('text');
    });

    it('configures card number input with numeric inputmode', () => {
        const cardNumberInput = new HostedInput(
            HostedFieldType.CardNumber,
            container,
            'Full name',
            'Cardholder name',
            'cc-name',
            styles,
            fontUrls,
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            manualOrderPaymentHandler as HostedInputManualOrderPaymentHandler,
        );

        cardNumberInput.attach();

        expect(container.querySelector('input')!.inputMode).toBe('numeric');

        cardNumberInput.detach();
    });

    it('sets target for event poster', () => {
        input.attach();

        expect(eventPoster.setTarget).toHaveBeenCalled();
    });

    it('starts listening to events', () => {
        input.attach();

        expect(eventListener.listen).toHaveBeenCalled();
    });

    it('applies default styles to input', () => {
        input.attach();

        const element = container.querySelector('input')!;

        expect(element.style.color).toBe('rgb(255, 255, 255)');
        expect(element.style.fontSize).toBe('15px');
    });

    it('notifies when input is attached', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.AttachSucceeded,
        });
    });

    it('loads required fonts when input is attached', () => {
        input.attach();

        const links = Array.from<HTMLLinkElement>(
            document.querySelectorAll('link[href*="fonts.googleapis.com"][rel="stylesheet"]'),
        );

        expect(links.map((link) => link.href)).toEqual(fontUrls);
    });

    it('notifies input change', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        const element = container.querySelector('input')!;

        element.value = '123';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Changed,
            payload: {
                fieldType: HostedFieldType.CardName,
            },
        });
    });

    it('notifies when input is in focus', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        const element = container.querySelector('input')!;

        element.dispatchEvent(new Event('focus', { bubbles: true }));

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Focused,
            payload: {
                fieldType: HostedFieldType.CardName,
            },
        });
    });

    it('notifies when input loses focus', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        const element = container.querySelector('input')!;

        element.dispatchEvent(new Event('blur', { bubbles: true }));

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Blurred,
            payload: {
                fieldType: HostedFieldType.CardName,
            },
        });
    });

    it('validates form when input loses focus', () => {
        input.attach();

        const element = container.querySelector('input')!;

        element.dispatchEvent(new Event('blur', { bubbles: true }));

        expect(inputValidator.validate).toHaveBeenCalledWith(values);
    });

    it('validates form when requested by parent frame', () => {
        input.attach();

        eventEmitter.emit(HostedFieldEventType.ValidateRequested);

        expect(inputValidator.validate).toHaveBeenCalledWith(values);
    });

    it('submits manual order form when requested by parent frame', () => {
        const event = {} as HostedFieldSubmitManualOrderRequestEvent;

        input.attach();

        eventEmitter.emit(HostedFieldEventType.SubmitManualOrderRequested, event);

        expect(manualOrderPaymentHandler.handle).toHaveBeenCalledWith(event);
    });

    it('emits event when enter key is pressed', () => {
        input.attach();

        container.dispatchEvent(new Event('submit'));

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: HostedInputEventType.Entered,
            payload: {
                fieldType: HostedFieldType.CardName,
            },
        });
    });

    it('cleans up when it detaches', () => {
        jest.spyOn(eventListener, 'stopListen');

        input.attach();
        input.detach();

        expect(eventListener.stopListen).toHaveBeenCalled();
        expect(container.querySelector('input')).toBeFalsy();
        expect(
            document.querySelector('link[href*="fonts.googleapis.com"][rel="stylesheet"]'),
        ).toBeFalsy();
    });

    it('applies bugfix of forcing focus on input field', () => {
        input.attach();

        expect(document.activeElement).toEqual(document.body);

        window.dispatchEvent(new Event('focus'));

        expect(document.activeElement).toEqual(container.querySelector('input'));
    });
});
