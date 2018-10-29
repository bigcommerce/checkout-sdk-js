import IframeEvent from './iframe-event';
import IframeEventPoster from './iframe-event-poster';

describe('IframeEventPoster', () => {
    let origin: string;

    beforeEach(() => {
        origin = 'https://mybigcommerce.com';
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
});
