import { EventEmitter } from 'events';

import IframeEvent from './iframe-event';
import IframeEventPoster from './iframe-event-poster';

describe('IframeEventPoster', () => {
    let eventEmitter: EventEmitter;
    let origin: string;

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        origin = 'https://mybigcommerce.com';

        jest.spyOn(window, 'addEventListener')
            .mockImplementation((type, listener) => {
                eventEmitter.addListener(type, listener);
            });
    });

    it('posts event to target window', () => {
        const message = { type: 'FOOBAR' };
        const targetWindow = Object.create(window);
        const poster = new IframeEventPoster<IframeEvent>(origin, targetWindow);

        jest.spyOn(targetWindow, 'postMessage');

        poster.post(message);

        expect(targetWindow.postMessage)
            .toHaveBeenCalledWith(message, origin);
    });

    it('strips out irrelevant information from origin URL', () => {
        const message = { type: 'FOOBAR' };
        const targetWindow = Object.create(window);
        const poster = new IframeEventPoster<IframeEvent>(`${origin}/url/path`, targetWindow);

        jest.spyOn(targetWindow, 'postMessage');

        poster.post(message);

        expect(targetWindow.postMessage)
            .toHaveBeenCalledWith(message, origin);
    });

    it('does not post event to target window if it is same as current window', () => {
        const message = { type: 'FOOBAR' };
        const targetWindow = window;
        const poster = new IframeEventPoster<IframeEvent>(origin, targetWindow);

        jest.spyOn(window, 'postMessage');

        poster.post(message);

        expect(window.postMessage)
            .not.toHaveBeenCalledWith(message, origin);
    });

    it('returns nothing if success / error event type is not provided', () => {
        const targetWindow = Object.create(window);
        const poster = new IframeEventPoster<IframeEvent>(origin, targetWindow);

        expect(poster.post({ type: 'FOOBAR_REQUEST' }))
            .toBeUndefined();
    });

    it('returns promise if success / error event type is provided', () => {
        const targetWindow = Object.create(window);
        const poster = new IframeEventPoster<IframeEvent>(origin, targetWindow);

        expect(poster.post({ type: 'FOOBAR_REQUEST' }, { errorType: 'FOOBAR_ERROR', successType: 'FOOBAR_SUCCESS' }))
            .toBeInstanceOf(Promise);
    });

    it('resolves promise if success event is received', async () => {
        const targetWindow = Object.create(window);
        const poster = new IframeEventPoster<IframeEvent>(origin, targetWindow);

        jest.spyOn(targetWindow, 'postMessage')
            .mockImplementation(message => {
                if (message.type === 'FOOBAR_REQUEST') {
                    eventEmitter.emit('message', { origin, data: { type: 'FOOBAR_SUCCESS', payload: '123' } });
                }
            });

        expect(await poster.post({ type: 'FOOBAR_REQUEST' }, { errorType: 'FOOBAR_ERROR', successType: 'FOOBAR_SUCCESS' }))
            .toEqual({ type: 'FOOBAR_SUCCESS', payload: '123' });
    });

    it('rejects promise if error event is received', async () => {
        const targetWindow = Object.create(window);
        const poster = new IframeEventPoster<IframeEvent>(origin, targetWindow);

        jest.spyOn(targetWindow, 'postMessage')
            .mockImplementation(message => {
                if (message.type === 'FOOBAR_REQUEST') {
                    eventEmitter.emit('message', { origin, data: { type: 'FOOBAR_ERROR', payload: 'Unexpected error' } });
                }
            });

        try {
            await poster.post({ type: 'FOOBAR_REQUEST' }, { errorType: 'FOOBAR_ERROR', successType: 'FOOBAR_SUCCESS' });
        } catch (event) {
            expect(event)
                .toEqual({ type: 'FOOBAR_ERROR', payload: 'Unexpected error' });
        }
    });
});
