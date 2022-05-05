import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { HostedFieldEventMap } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import CardExpiryFormatter from './card-expiry-formatter';
import HostedCardExpiryInput from './hosted-card-expiry-input';
import HostedInputAggregator from './hosted-input-aggregator';
import { HostedInputEvent } from './hosted-input-events';
import HostedInputPaymentHandler from './hosted-input-payment-handler';
import { HostedInputStylesMap } from './hosted-input-styles';
import HostedInputValidator from './hosted-input-validator';

describe('HostedCardExpiryInput', () => {
    let container: HTMLFormElement;
    let eventListener: Pick<IframeEventListener<HostedFieldEventMap>, 'addListener' | 'listen' | 'stopListen'>;
    let eventPoster: Pick<IframeEventPoster<HostedInputEvent>, 'post' | 'setTarget'>;
    let expiryFormatter: Pick<CardExpiryFormatter, 'format'>;
    let input: HostedCardExpiryInput;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputValues'>;
    let inputValidator: Pick<HostedInputValidator, 'validate'>;
    let paymentHandler: Pick<HostedInputPaymentHandler, 'handle'>;
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
        expiryFormatter = { format: jest.fn() };
        inputAggregator = { getInputValues: jest.fn() };
        inputValidator = {
            validate: jest.fn(() => Promise.resolve({
                isValid: true,
                errors: {},
            })),
        };
        paymentHandler = { handle: jest.fn() };
        styles = { default: { color: 'rgb(255, 255, 255)' } };

        container = document.createElement('form');
        document.body.appendChild(container);

        input = new HostedCardExpiryInput(
            container,
            'Expiration',
            'Card expiration',
            'cc-expiry',
            styles,
            [],
            eventListener as IframeEventListener<HostedFieldEventMap>,
            eventPoster as IframeEventPoster<HostedInputEvent>,
            inputAggregator as HostedInputAggregator,
            inputValidator as HostedInputValidator,
            paymentHandler as HostedInputPaymentHandler,
            expiryFormatter as CardExpiryFormatter
        );
    });

    afterEach(() => {
        container.remove();
    });

    it('returns input type', () => {
        expect(input.getType())
            .toEqual(HostedFieldType.CardExpiry);
    });

    it('formats input on change', () => {
        jest.spyOn(expiryFormatter, 'format')
            .mockReturnValue('10 / 20');

        input.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const element = container.querySelector('input')!;

        element.value = '1020';
        element.dispatchEvent(new Event('input', { bubbles: true }));

        expect(expiryFormatter.format)
            .toHaveBeenCalledWith('1020');
        expect(element.value)
            .toEqual('10 / 20');
    });
});
