import { EventEmitter } from 'events';

import IframeEventListener from './iframe-event-listener';

enum TestEventType {
    Loaded = 'LOADED',
    Complete = 'COMPLETE',
    Error = 'ERROR',
}

interface TestEventMap {
    [TestEventType.Loaded]: { type: TestEventType.Loaded };
    [TestEventType.Complete]: { type: TestEventType.Complete };
    [TestEventType.Error]: { type: TestEventType.Error };
}

describe('IframeEventListener', () => {
    let origin: string;
    let eventEmitter: EventEmitter;
    let listener: IframeEventListener<TestEventMap>;
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
        listener.addListener(TestEventType.Loaded, handleLoaded);
        listener.addListener(TestEventType.Complete, handleComplete);
    });

    it('triggers relevant listeners after receiving `message` event', () => {
        eventEmitter.emit('message', { origin, data: { type: TestEventType.Loaded } });

        expect(handleLoaded).toHaveBeenCalled();
        expect(handleComplete).not.toHaveBeenCalled();
    });

    it('does not respond to event with unrecognized origin', () => {
        eventEmitter.emit('message', {
            origin: 'https://foobar.com',
            data: {
                type: TestEventType.Loaded,
            },
        });

        expect(handleLoaded).not.toHaveBeenCalled();
    });

    it('triggers relevant listeners when origin URL has trailing slash', () => {
        listener = new IframeEventListener(`${origin}/`);
        listener.listen();
        listener.addListener(TestEventType.Loaded, handleLoaded);

        eventEmitter.emit('message', { origin, data: { type: TestEventType.Loaded } });

        expect(handleLoaded).toHaveBeenCalled();
    });

    it('does not respond to invalid event', () => {
        eventEmitter.emit('message', { origin, data: { type: 'FOOBAR' } });

        expect(handleLoaded).not.toHaveBeenCalled();
        expect(handleComplete).not.toHaveBeenCalled();
    });

    it('stops listening to `message` event', () => {
        listener.stopListen();

        eventEmitter.emit('message', { origin, data: { type: TestEventType.Loaded } });
        eventEmitter.emit('message', { origin, data: { type: TestEventType.Complete } });

        expect(handleLoaded).not.toHaveBeenCalled();
        expect(handleComplete).not.toHaveBeenCalled();
    });

    it('removes specific event listener', () => {
        listener.removeListener(TestEventType.Loaded, handleLoaded);

        eventEmitter.emit('message', { origin, data: { type: TestEventType.Loaded } });
        eventEmitter.emit('message', { origin, data: { type: TestEventType.Complete } });

        expect(handleLoaded).not.toHaveBeenCalled();
        expect(handleComplete).toHaveBeenCalled();
    });

    it('does nothing if trying to remove non-existent listener', () => {
        expect(() => listener.removeListener(TestEventType.Error, () => {}))
            .not.toThrow();
    });
});
