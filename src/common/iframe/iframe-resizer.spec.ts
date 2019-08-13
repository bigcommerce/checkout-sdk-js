jest.mock('iframe-resizer', () => {
    window.addEventListener('resize', () => {});

    return {
        iframeResizer: jest.fn(),
    };
});

describe('iframeResizer()', () => {
    const options = { scrolling: false };
    const iframe = document.createElement('iframe');

    it('does not set up resizer listener until it is used', () => {
        jest.spyOn(window, 'addEventListener');

        const { iframeResizer } = require('./iframe-resizer');

        expect(window.addEventListener)
            .not.toHaveBeenCalledWith('resize', expect.any(Function));

        iframeResizer(options, iframe);

        expect(window.addEventListener)
            .toHaveBeenCalledWith('resize', expect.any(Function));

        (window.addEventListener as jest.Mock).mockReset();
    });

    it('passes parameter to original iframe resizer', () => {
        const { iframeResizer: originalIframeResizer } = require('iframe-resizer');
        const { iframeResizer } = require('./iframe-resizer');

        iframeResizer(options, iframe);

        expect(originalIframeResizer)
            .toHaveBeenCalledWith(options, iframe);
    });
});
