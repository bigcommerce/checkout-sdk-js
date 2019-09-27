import { ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { PaypalHostWindow, PaypalSDK } from './paypal-sdk';

export default class PaypalScriptLoader {
    private _window: PaypalHostWindow;
    private _scripts: { [key: string]: Promise<Event> } = {};

    constructor(
        private _scriptLoader: ScriptLoader
    ) {
        this._window = window;
    }

    loadPaypal(merchantId: string = ''): Promise<PaypalSDK> {
        if (merchantId.length > 0) {
            return this.loadScriptWithAttribute('//www.paypalobjects.com/api/checkout.min.js', 'data-merchant-id', merchantId)
                .then(() => {
                    if (!this._window.paypal) {
                        throw new PaymentMethodClientUnavailableError();
                    }

                    return this._window.paypal;
                });
        } else {
            return this._scriptLoader
                .loadScript('//www.paypalobjects.com/api/checkout.min.js')
                .then(() => {
                    if (!this._window.paypal) {
                        throw new PaymentMethodClientUnavailableError();
                    }

                    return this._window.paypal;
                });
        }
    }

    loadScriptWithAttribute(src: string, attribute: string, value: string): Promise<Event> {
        if (!this._scripts[src]) {
            this._scripts[src] = new Promise((resolve, reject) => {
                const script = document.createElement('script') as LegacyHTMLScriptElement;

                script.setAttribute(attribute, value);
                script.onload = event => resolve(event);
                script.onreadystatechange = event => resolve(event);
                script.onerror = event => {
                    delete this._scripts[src];
                    reject(event);
                };
                script.async = true;
                script.src = src;

                document.body.appendChild(script);
            });
        }

        return this._scripts[src];
    }
}

interface LegacyHTMLScriptElement extends HTMLScriptElement {
    onreadystatechange(this: HTMLElement, event: Event): any;
}
