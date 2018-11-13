import { EmbeddedCheckoutEventType } from '../embedded-checkout-events';

import handleFrameLoadedEvent from './handle-frame-loaded-event';

describe('handleFrameLoadedEvent()', () => {
    let content: HTMLElement;

    beforeEach(() => {
        content = document.createElement('div');
        content.id = 'foobar';
        document.body.appendChild(content);
    });

    afterEach(() => {
        document.body.removeChild(content);
    });

    it('adds special marker to body element', () => {
        handleFrameLoadedEvent({
            type: EmbeddedCheckoutEventType.FrameLoaded,
            payload: { contentId: content.id },
        });

        expect(content.hasAttribute('data-iframe-height'))
            .toEqual(true);
    });

    it('does not throw error if `contentId` is not passed', () => {
        expect(() => handleFrameLoadedEvent({ type: EmbeddedCheckoutEventType.FrameLoaded }))
            .not.toThrow();
    });

    it('does not throw error if element cannot be found', () => {
        expect(() => handleFrameLoadedEvent({ type: EmbeddedCheckoutEventType.FrameLoaded, payload: { contentId: 'abc' } }))
            .not.toThrow();
    });
});
