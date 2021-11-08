import { PENDING_REDIRECT_PARAM, RedirectionState } from './RedirectionState';

describe('RedirectionState', () => {
    let initialUrl: string;
    let redirectionState: RedirectionState;

    beforeAll(() => {
        initialUrl = window.location.href;
    });

    afterAll(() => {
        window.history.replaceState(null, '', initialUrl);
    });

    describe('#isRedirecting', () => {
        describe('when the page loads with no "redirecting" url param', () => {
            beforeAll(() => {
                const url = new URL(initialUrl);
                url.searchParams.delete(PENDING_REDIRECT_PARAM);
                window.history.replaceState(null, '', url.href);
                redirectionState = new RedirectionState();
            });

            it('returns false', () => {
                expect(redirectionState.isRedirecting).toBe(false);
            });

            it('sets a "redirecting" url param when set to true', () => {
                redirectionState.isRedirecting = true;

                expect(new URL(window.location.href).searchParams.has(PENDING_REDIRECT_PARAM)).toBe(true);
            });
        });

        describe('when the page loads with the "redirecting" url param', () => {
            beforeAll(() => {
                const url = new URL(initialUrl);
                url.searchParams.set(PENDING_REDIRECT_PARAM, 'true');
                window.history.replaceState(null, '', url.href);
                redirectionState = new RedirectionState();
            });

            it('returns true', () => {
                expect(redirectionState.isRedirecting).toBe(true);
            });

            it('removes the "redirecting" url param when set to false', () => {
                redirectionState.isRedirecting = false;

                expect(new URL(window.location.href).searchParams.has(PENDING_REDIRECT_PARAM)).toBe(false);
            });
        });
    });
});
