import { EventEmitter } from 'events';

import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import IframeEventListener from './iframe-event-listener';

describe('IframeEventListener', () => {
    let origin: string;
    let eventEmitter: EventEmitter;
    let listener: IframeEventListener<EmbeddedCheckoutEventMap>;
    let handleLoaded: () => void;
    let handleComplete: () => void;

    beforeEach(() => {
        origin = document.location.origin;
        listener = new IframeEventListener(origin);
        eventEmitter = new EventEmitter();
        handleLoaded = jest.fn();
        handleComplete = jest.fn();

        jest.spyOn(window, 'addEventListener')
            .mockImplementation((type, listener) => {
                return eventEmitter.addListener(type, listener);
            });

        jest.spyOn(window, 'removeEventListener')
            .mockImplementation((type, listener) => {
                return eventEmitter.removeListener(type, listener);
            });

        listener.listen();
        listener.addListener(EmbeddedCheckoutEventType.CheckoutLoaded, handleLoaded);
        listener.addListener(EmbeddedCheckoutEventType.CheckoutComplete, handleComplete);
    });

    it('triggers relevant listeners after receiving `message` event', () => {
        eventEmitter.emit('message', { origin, data: { type: EmbeddedCheckoutEventType.CheckoutLoaded } });

        expect(handleLoaded).toHaveBeenCalled();
        expect(handleComplete).not.toHaveBeenCalled();
    });

    it('does not respond to event with unrecognized origin', () => {
        eventEmitter.emit('message', {
            origin: 'https://foobar.com',
            data: {
                type: EmbeddedCheckoutEventType.CheckoutLoaded,
            },
        });

        expect(handleLoaded).not.toHaveBeenCalled();
    });

    it('triggers relevant listeners when origin URL has trailing slash', () => {
        listener = new IframeEventListener(`${origin}/`);
        listener.listen();
        listener.addListener(EmbeddedCheckoutEventType.CheckoutLoaded, handleLoaded);

        eventEmitter.emit('message', { origin, data: { type: EmbeddedCheckoutEventType.CheckoutLoaded } });

        expect(handleLoaded).toHaveBeenCalled();
    });

    it('does not respond to invalid event', () => {
        eventEmitter.emit('message', { origin, data: { type: 'FOOBAR' } });

        expect(handleLoaded).not.toHaveBeenCalled();
        expect(handleComplete).not.toHaveBeenCalled();
    });

    it('stops listening to `message` event', () => {
        listener.stopListen();

        eventEmitter.emit('message', { origin, data: { type: EmbeddedCheckoutEventType.CheckoutLoaded } });
        eventEmitter.emit('message', { origin, data: { type: EmbeddedCheckoutEventType.CheckoutComplete } });

        expect(handleLoaded).not.toHaveBeenCalled();
        expect(handleComplete).not.toHaveBeenCalled();
    });

    it('removes specific event listener', () => {
        listener.removeListener(EmbeddedCheckoutEventType.CheckoutLoaded, handleLoaded);

        eventEmitter.emit('message', { origin, data: { type: EmbeddedCheckoutEventType.CheckoutLoaded } });
        eventEmitter.emit('message', { origin, data: { type: EmbeddedCheckoutEventType.CheckoutComplete } });

        expect(handleLoaded).not.toHaveBeenCalled();
        expect(handleComplete).toHaveBeenCalled();
    });

    it('does nothing if trying to remove non-existent listener', () => {
        expect(() => listener.removeListener(EmbeddedCheckoutEventType.CheckoutError, () => {}))
            .not.toThrow();
    });
});
