import { ScriptLoader } from '@bigcommerce/script-loader';

import { NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';

import WepayRisk from './wepay-risk';
import WepayWindow from './wepay-window';

const SCRIPT_SRC = '//static.wepay.com/min/js/risk.1.latest.js';

export default class WepayRiskClient {
    private _riskClient?: WepayRisk;

    constructor(
        private _scriptLoader: ScriptLoader
    ) {}

    initialize(): Promise<WepayRiskClient> {
        return this._scriptLoader
            .loadScript(SCRIPT_SRC)
            .then(() => this._riskClient = (window as unknown as WepayWindow).WePay.risk)
            .then(() => this);
    }

    getRiskToken(): string {
        if (!this._riskClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        this._riskClient.generate_risk_token();

        return this._riskClient.get_risk_token();
    }
}
