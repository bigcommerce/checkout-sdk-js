import { NotInitializedError } from '../../../common/error/errors';

import * as Braintree from './braintree';
import BraintreeScriptLoader from './braintree-script-loader';

export default class BraintreeSDKCreator {
    private _client?: Promise<Braintree.Client>;
    private _3ds?: Promise<Braintree.ThreeDSecure>;
    private _dataCollector?: Promise<Braintree.DataCollector>;
    private _paypal?: Promise<Braintree.Paypal>;
    private _clientToken?: string;

    constructor(
        private _braintreeScriptLoader: BraintreeScriptLoader
    ) {}

    initialize(clientToken: string) {
        this._clientToken = clientToken;
    }

    getClient(): Promise<Braintree.Client> {
        if (!this._clientToken) {
            throw new NotInitializedError();
        }

        if (!this._client) {
            this._client = this._braintreeScriptLoader.loadClient()
                .then(client => client.create({ authorization: this._clientToken }));
        }

        return this._client;
    }

    getPaypal(): Promise<Braintree.Paypal> {
        if (!this._paypal) {
            this._paypal = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadPaypal(),
            ])
            .then(([client, paypal]) => paypal.create({ client }));
        }

        return this._paypal;
    }

    get3DS(): Promise<Braintree.ThreeDSecure> {
        if (!this._3ds) {
            this._3ds = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.load3DS(),
            ])
            .then(([client, threeDSecure]) => threeDSecure.create({ client }));
        }

        return this._3ds;
    }

    getDataCollector(): Promise<Braintree.DataCollector> {
        if (!this._dataCollector) {
            this._dataCollector = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadDataCollector(),
            ])
            .then(([client, dataCollector]) => dataCollector.create({ client, kount: true }))
            .catch(error => {
                if (error && error.code === 'DATA_COLLECTOR_KOUNT_NOT_ENABLED') {
                    return { deviceData: undefined, teardown: () => Promise.resolve() };
                }

                throw error;
            });
        }

        return this._dataCollector;
    }

    teardown(): Promise<void> {
        return Promise.all([
            this._teardown(this._3ds),
            this._teardown(this._dataCollector),
        ]).then(() => {
            this._3ds = undefined;
            this._dataCollector = undefined;
        });
    }

    private _teardown(module?: Promise<Braintree.Module>) {
        return module ?
            module.then(mod => mod.teardown()) :
            Promise.resolve();
    }
}
