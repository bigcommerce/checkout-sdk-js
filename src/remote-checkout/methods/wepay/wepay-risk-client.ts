/// <reference path="./wepay-risk.d.ts" />
import { ScriptLoader } from '@bigcommerce/script-loader';

import { NotInitializedError } from '../../../common/error/errors';

const SCRIPT_SRC = '//static.wepay.com/min/js/risk.1.latest.js';

export default class WepayRiskClient {
    private _riskClient?: WePay.Risk;

    constructor(private _scriptLoader: ScriptLoader) {}

    initialize(): Promise<WepayRiskClient> {
        return this
            ._scriptLoader
            .loadScript(SCRIPT_SRC)
            .then(() => this._riskClient = (window as any).WePay.risk as WePay.Risk)
            .then(() => this);
    }

    getRiskToken(): string {
        if (!this._riskClient) {
            throw new NotInitializedError();
        }

        this._riskClient!.generate_risk_token();
        return this._riskClient!.get_risk_token();
    }
}
