import isIframeEvent from './is-iframe-event';

describe('isIframeEvent()', () => {
    it('returns true if object has matching `type`', () => {
        expect(isIframeEvent({ type: 'FOOBAR' }, 'FOOBAR'))
            .toEqual(true);
    });

    it('returns false if object does not have matching `type`', () => {
        expect(isIframeEvent({ type: 'FOOBAR' }, 'FOO'))
            .toEqual(false);
    });
});
