import { EventEmitter } from 'events';

import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { HostedFieldEventMap, HostedFieldEventType, HostedFieldSubmitRequestEvent } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';
import HostedInputValues from './hosted-input-values';

describe('HostedInput', () => {
    let container: HTMLFormElement;
    let eventEmitter: EventEmitter;
    let eventListener: Pick<IframeEventListener<HostedFieldEventMap>, 'addListener' | 'listen' | 'stopListen'>;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'setTarget' | 'post'>;
    let fontUrls: string[];
    let input: HostedInput;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let paymentHandler: Pick<HostedInputPaymentHandler, 'handle'>;
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

        fontUrls = [
            'https://fonts.googleapis.com/css?family=Open+Sans&display=swap',
        ];

        paymentHandler = { handle: jest.fn() };

        inputAggregator = {
            getInputValues: jest.fn(() => values),
        };

        inputValidator = {
            validate: jest.fn(() => Promise.resolve({
                isValid: true,
                errors: {
                    cardExpiry: [],
                    cardName: [],
                    cardNumber: [],
                },
            })),
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
            paymentHandler as HostedInputPaymentHandler
        );
    });

    afterEach(() => {
        input.detach();
        container.remove();
    });

    it('returns input type', () => {
        expect(input.getType())
            .toEqual(HostedFieldType.CardName);
    });

    it('sets and returns input value', () => {
        input.setValue('abc');

        expect(input.getValue())
            .toEqual('abc');
    });

    it('attaches input to container', () => {
        input.attach();

        expect(container.querySelector('input'))
            .toBeDefined();
    });

    it('configures input with expected attributes', () => {
        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        expect(element.id)
            .toEqual('card-name');
        expect(element.placeholder)
            .toEqual('Full name');
        expect(element.autocomplete)
            .toEqual('cc-name');
        expect(element.getAttribute('aria-label'))
            .toEqual('Cardholder name');
    });

    it('sets target for event poster', () => {
        input.attach();

        expect(eventPoster.setTarget)
            .toHaveBeenCalled();
    });

    it('starts listening to events', () => {
        input.attach();

        expect(eventListener.listen)
            .toHaveBeenCalled();
    });

    it('applies default styles to input', () => {
        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        expect(element.style.color)
            .toEqual('rgb(255, 255, 255)');
        expect(element.style.fontSize)
            .toEqual('15px');
    });

    it('notifies when input is attached', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        expect(eventPoster.post)
            .toHaveBeenCalledWith({ type: HostedInputEventType.AttachSucceeded });
    });

    it('loads required fonts when input is attached', () => {
        input.attach();

        const links = Array.from<HTMLLinkElement>(document.querySelectorAll('link[href*="fonts.googleapis.com"][rel="stylesheet"]'));

        expect(links.map(link => link.href))
            .toEqual(fontUrls);
    });

    it('notifies input change', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '123';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.Changed,
                payload: {
                    fieldType: HostedFieldType.CardName,
                },
            });
    });

    it('notifies when input is in focus', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.dispatchEvent(new Event('focus', { bubbles: true }));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.Focused,
                payload: {
                    fieldType: HostedFieldType.CardName,
                },
            });
    });

    it('notifies when input loses focus', () => {
        jest.spyOn(eventPoster, 'post');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.dispatchEvent(new Event('blur', { bubbles: true }));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
                type: HostedInputEventType.Blurred,
                payload: {
                    fieldType: HostedFieldType.CardName,
                },
            });
    });

    it('validates form when input loses focus', () => {
        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.dispatchEvent(new Event('blur', { bubbles: true }));

        expect(inputValidator.validate)
            .toHaveBeenCalledWith(values);
    });

    it('validates form when requested by parent frame', () => {
        input.attach();

        eventEmitter.emit(HostedFieldEventType.ValidateRequested);

        expect(inputValidator.validate)
            .toHaveBeenCalledWith(values);
    });

    it('submits form when requested by parent frame', () => {
        const event = {} as HostedFieldSubmitRequestEvent;

        input.attach();

        eventEmitter.emit(HostedFieldEventType.SubmitRequested, event);

        expect(paymentHandler.handle)
            .toHaveBeenCalledWith(event);
    });

    it('emits event when enter key is pressed', () => {
        input.attach();

        container.dispatchEvent(new Event('submit'));

        expect(eventPoster.post)
            .toHaveBeenCalledWith({
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

        expect(eventListener.stopListen)
            .toHaveBeenCalled();
        expect(container.querySelector('input'))
            .toBeFalsy();
        expect(document.querySelector('link[href*="fonts.googleapis.com"][rel="stylesheet"]'))
            .toBeFalsy();
    });
});
