import { parseUrl } from '../../../../../../common/url';

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
                window.history.replaceState(null, '', initialUrl);
                redirectionState = new RedirectionState();
            });

            it('returns false', () => {
                expect(redirectionState.isRedirecting()).toBe(false);
            });

            it('sets a "redirecting" url param when set to true', () => {
                redirectionState.setRedirecting(true);

                expect(parseUrl(window.location.href).search).toContain(PENDING_REDIRECT_PARAM);
            });
        });

        describe('when the page loads with the "redirecting" url param', () => {
            beforeAll(() => {
                window.history.replaceState(null, '', `${initialUrl}?${PENDING_REDIRECT_PARAM}`);
                redirectionState = new RedirectionState();
            });

            it('returns true', () => {
                expect(redirectionState.isRedirecting()).toBe(true);
            });

            it('removes the "redirecting" url param when set to false', () => {
                redirectionState.setRedirecting(false);

                expect(parseUrl(window.location.href).search).not.toContain(PENDING_REDIRECT_PARAM);
            });
        });
    });
});
