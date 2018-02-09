import { PaymentMethod } from '../../../payment';
import ScriptLoader from '../../../../script-loader/script-loader';

export default class AmazonPayScriptLoader {
    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    loadWidget(method: PaymentMethod): Promise<Event> {
        const {
            config: { merchantId, testMode },
            initializationData: { region = 'us' } = {},
        } = method;

        const url = 'https://static-na.payments-amazon.com/OffAmazonPayments/' +
            `${region.toLowerCase()}/` +
            `${testMode ? 'sandbox/' : ''}` +
            `Widgets.js?sellerId=${merchantId}`;

        return this._scriptLoader.loadScript(url);
    }
}
