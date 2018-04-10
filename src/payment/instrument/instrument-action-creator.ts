import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { addMinutes, isFuture } from '../../common/date-time';

import * as actionTypes from './instrument-action-types';
import InstrumentRequestSender from './instrument-request-sender';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class InstrumentActionCreator {
    constructor(
        private _instrumentRequestSender: InstrumentRequestSender
    ) {}

    /**
     * @param {string} storeId
     * @param {number} shopperId
     * @param {?VaultAccessToken} accessToken
     * @return {Observable<Action>}
     */
    loadInstruments(storeId: string, shopperId: number, accessToken: any): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));

            this._getValidAccessToken(accessToken)
                .then((currentToken) =>
                    this._instrumentRequestSender.getInstruments(storeId, shopperId, currentToken.vaultAccessToken)
                        .then(({ body }) => {
                            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, body, currentToken));
                            observer.complete();
                        })
                )
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.LOAD_INSTRUMENTS_FAILED, response));
                });
        });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {?VaultAccessToken} accessToken
     * @param {InstrumentRequestBody} instrument
     * @return {Observable<Action>}
     */
    vaultInstrument(storeId: string, shopperId: number, accessToken: any, instrument: any): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.VAULT_INSTRUMENT_REQUESTED));

            this._getValidAccessToken(accessToken)
                .then((currentToken) =>
                    this._instrumentRequestSender.vaultInstrument(storeId, shopperId, currentToken.vaultAccessToken, instrument)
                        .then(({ body }) => {
                            observer.next(createAction(actionTypes.VAULT_INSTRUMENT_SUCCEEDED, body, currentToken));
                            observer.complete();
                        })
                )
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.VAULT_INSTRUMENT_FAILED, response));
                });
        });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {?VaultAccessToken} accessToken
     * @param {string} instrumentId
     * @return {Observable<Action>}
     */
    deleteInstrument(storeId: string, shopperId: number, accessToken: any, instrumentId: string): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId }));

            this._getValidAccessToken(accessToken)
                .then((currentToken) =>
                    this._instrumentRequestSender.deleteInstrument(storeId, shopperId, currentToken.vaultAccessToken, instrumentId)
                        .then(() => {
                            observer.next(createAction(actionTypes.DELETE_INSTRUMENT_SUCCEEDED, undefined, {
                                instrumentId,
                                ...currentToken,
                            }));
                            observer.complete();
                        })
                )
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.DELETE_INSTRUMENT_FAILED, response, { instrumentId }));
                });
        });
    }

    /**
     * @private
     * @param {VaultAccessToken} accessToken
     * @return {boolean}
     */
    private _isValidVaultAccessToken(accessToken: any): boolean {
        if (!accessToken || !accessToken.vaultAccessToken) {
            return false;
        }

        const expiryBuffer = 2;
        const expiry = addMinutes(new Date(accessToken.vaultAccessExpiry), expiryBuffer);

        return isFuture(expiry);
    }

    /**
     * Requests a new vault access token if one is not supplied
     * @private
     * @param {VaultAccessToken} [accessToken]
     * @return {Promise<VaultAccessToken>}
     */
    private _getValidAccessToken(accessToken: any): Promise<any> {
        return this._isValidVaultAccessToken(accessToken)
            ? Promise.resolve(accessToken)
            : this._instrumentRequestSender.getVaultAccessToken()
                .then(({ body = {} }: any) => ({
                    vaultAccessToken: body.data.token,
                    vaultAccessExpiry: body.data.expires_at,
                }));
    }
}
