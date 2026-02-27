import { isWebView } from './is-web-view';

describe('isWebView', () => {
    const originalUserAgent = navigator.userAgent;
    const originalVendor = navigator.vendor;

    const mockUserAgent = (ua: string) => {
        Object.defineProperty(navigator, 'userAgent', {
            value: ua,
            configurable: true,
        });
    };

    const mockVendor = (vendor: string) => {
        Object.defineProperty(navigator, 'vendor', {
            value: vendor,
            configurable: true,
        });
    };

    beforeEach(() => {
        delete (window as any).ReactNativeWebView;
        delete (window as any).opera;
    });

    afterEach(() => {
        mockUserAgent(originalUserAgent);
        mockVendor(originalVendor);
    });

    describe('React Native WebView Injection', () => {
        it('should return true if window.ReactNativeWebView exists', () => {
            (window as any).ReactNativeWebView = { postMessage: jest.fn() };

            expect(isWebView()).toBe(true);
        });
    });

    describe('Android Environments', () => {
        it('should return true for an Android WebView (contains "wv")', () => {
            mockUserAgent(
                'Mozilla/5.0 (Linux; Android 11; Pixel 5 Build/RQ3A.210805.001.A1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Mobile Safari/537.36',
            );

            expect(isWebView()).toBe(true);
        });

        it('should return false for a standard Android Chrome browser (no "wv")', () => {
            mockUserAgent(
                'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
            );

            expect(isWebView()).toBe(false);
        });
    });

    describe('iOS Environments', () => {
        it('should return true for an iOS WebView (contains iPhone/iPad/iPod, lacks Safari)', () => {
            mockUserAgent(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            );

            expect(isWebView()).toBe(true);
        });

        it('should return false for a standard iOS Safari browser (contains Safari)', () => {
            mockUserAgent(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
            );

            expect(isWebView()).toBe(false);
        });
    });

    describe('Desktop Environments', () => {
        it('should return false for standard desktop browsers', () => {
            mockUserAgent(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            );

            expect(isWebView()).toBe(false);
        });
    });

    describe('Fallback mechanisms', () => {
        it('should fallback to window.opera if userAgent and vendor are empty', () => {
            mockUserAgent('');
            mockVendor('');

            (window as any).opera = 'Mozilla/5.0 (Linux; Android 9; wv)';

            expect(isWebView()).toBe(true);
        });
    });
});
