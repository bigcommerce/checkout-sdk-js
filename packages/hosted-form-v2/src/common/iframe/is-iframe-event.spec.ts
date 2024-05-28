import isIframeEvent from './is-iframe-event';

describe('isIframeEvent()', () => {
    it('returns true if object has matching `type`', () => {
        expect(isIframeEvent({ type: 'FOOBAR' }, 'FOOBAR')).toBe(true);
    });

    it('returns false if object does not have matching `type`', () => {
        expect(isIframeEvent({ type: 'FOOBAR' }, 'FOO')).toBe(false);
    });
});
