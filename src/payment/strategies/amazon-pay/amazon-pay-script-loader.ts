import { ScriptLoader } from '@bigcommerce/script-loader';

import PaymentMethod from '../../payment-method';

import AmazonPayWindow from './amazon-pay-window';

export default class AmazonPayScriptLoader {
    private _window: AmazonPayWindow;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    loadWidget(method: PaymentMethod, onPaymentReady?: () => void): Promise<Event> {
        const {
            config: { merchantId, testMode },
            initializationData: { region = 'us' } = {},
        } = method;

        const url = 'https://' +
            (region.toLowerCase() !== 'us' ? 'static-eu.' : 'static-na.') +
            'payments-amazon.com/OffAmazonPayments/' +
            `${region.toLowerCase()}/` +
            (testMode ? 'sandbox/' : '') +
            (region.toLowerCase() !== 'us' ? 'lpa/' : '') +
            `js/Widgets.js?sellerId=${merchantId}`;

        this._configureWidget(method, onPaymentReady);

        return this._scriptLoader.loadScript(url);
    }

    private _configureWidget(method: PaymentMethod, onPaymentReady?: () => void): void {
        const onLoginReady = () => {
            if (!this._window.amazon) {
                return;
            }

            this._window.amazon.Login.setClientId(method.initializationData.clientId);
            this._window.amazon.Login.setUseCookie(true);
        };

        if (this._window.amazon && this._window.amazon.Login) {
            onLoginReady();
        } else {
            this._window.onAmazonLoginReady = onLoginReady;
        }

        if (this._window.OffAmazonPayments && onPaymentReady) {
            onPaymentReady();
        } else {
            this._window.onAmazonPaymentsReady = onPaymentReady;
        }
    }
}
