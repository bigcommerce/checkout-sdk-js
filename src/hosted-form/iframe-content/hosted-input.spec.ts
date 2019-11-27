import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { InvalidHostedFormConfigError } from '../errors';
import { HostedFieldEventMap } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent, HostedInputEventType } from './hosted-input-events';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';

describe('HostedInput', () => {
    let container: HTMLDivElement;
    let eventListener: Pick<IframeEventListener<HostedFieldEventMap>, 'addListener' | 'listen' | 'stopListen'>;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'setTarget' | 'post'>;
    let input: HostedInput;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let styles: HostedInputStylesMap;

    beforeEach(() => {
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
        inputValidator = { validate: jest.fn() };
        styles = {
            default: {
                color: 'rgb(255, 255, 255)',
                fontSize: '15px',
            },
        };

        input = new HostedInput(
            HostedFieldType.CardName,
            'input-container',
            'Full name',
            'Cardholder name',
            'cc-name',
            styles,
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator
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

    it('throws error if container cannot be found', () => {
        container.remove();

        expect(() => input.attach())
            .toThrowError(InvalidHostedFormConfigError);
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

    it('cleans up when it detaches', () => {
        jest.spyOn(eventListener, 'stopListen');

        input.attach();
        input.detach();

        expect(eventListener.stopListen)
            .toHaveBeenCalled();
        expect(container.querySelector('input'))
            .toBeFalsy();
    });
});
