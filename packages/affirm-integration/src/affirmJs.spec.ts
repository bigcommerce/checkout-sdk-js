/* eslint-disable no-underscore-dangle */
import { AffirmHostWindow } from './affirm';
import loadAffirmJS from './affirmJs';

describe('loadAffirmJS()', () => {
    const affirmWindow: AffirmHostWindow = window;

    beforeEach(() => {
        document.head.appendChild(document.createElement('script'));
    });

    afterEach(() => {
        delete affirmWindow.affirm;
        delete affirmWindow._affirm_config;
        document.head.innerHTML = '';
    });

    it('exposes the market locale and country code to affirm.js through the global config', () => {
        loadAffirmJS('public-key', '//cdn1-sandbox.affirm.com/js/v2/affirm.js', 'en_GB', 'GBR');

        expect(affirmWindow._affirm_config).toEqual({
            public_api_key: 'public-key',
            locale: 'en_GB',
            country_code: 'GBR',
        });
    });

    it('inserts the affirm.js script tag and exposes the checkout stub', () => {
        loadAffirmJS('public-key', '//cdn1-sandbox.affirm.com/js/v2/affirm.js', 'en_US', 'USA');

        expect(
            document.querySelector('script[src="//cdn1-sandbox.affirm.com/js/v2/affirm.js"]'),
        ).not.toBeNull();
        expect(typeof affirmWindow.affirm?.checkout).toBe('function');
    });
});
