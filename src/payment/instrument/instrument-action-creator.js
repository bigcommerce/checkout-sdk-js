import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { addMinutes, isFuture } from '../../common/date-time';
import * as actionTypes from './instrument-action-types';

export default class InstrumentActionCreator {
    /**
     * @constructor
     * @param {InstrumentRequestSender} instrumentRequestSender
     */
    constructor(instrumentRequestSender) {
        this._instrumentRequestSender = instrumentRequestSender;
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {?VaultAccessToken} accessToken
     * @param {InternalAddress} shippingAddress
     * @return {Observable<Action>}
     */
    loadInstruments(storeId, shopperId, accessToken, shippingAddress) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));

            this._getValidAccessToken(accessToken)
                .then(currentToken =>
                    this._instrumentRequestSender.getInstruments(storeId, shopperId, currentToken.vaultAccessToken, shippingAddress)
                        .then(({ body } = {}) => {
                            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, body, currentToken));
                            observer.complete();
                        })
                )
                .catch(response => {
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
    vaultInstrument(storeId, shopperId, accessToken, instrument) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.VAULT_INSTRUMENT_REQUESTED));

            this._getValidAccessToken(accessToken)
                .then(currentToken =>
                    this._instrumentRequestSender.vaultInstrument(storeId, shopperId, currentToken.vaultAccessToken, instrument)
                        .then(({ body } = {}) => {
                            observer.next(createAction(actionTypes.VAULT_INSTRUMENT_SUCCEEDED, body, currentToken));
                            observer.complete();
                        })
                )
                .catch(response => {
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
    deleteInstrument(storeId, shopperId, accessToken, instrumentId) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId }));

            this._getValidAccessToken(accessToken)
                .then(currentToken =>
                    this._instrumentRequestSender.deleteInstrument(storeId, shopperId, currentToken.vaultAccessToken, instrumentId)
                        .then(() => {
                            observer.next(createAction(actionTypes.DELETE_INSTRUMENT_SUCCEEDED, undefined, {
                                instrumentId,
                                ...currentToken,
                            }));
                            observer.complete();
                        })
                )
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.DELETE_INSTRUMENT_FAILED, response, { instrumentId }));
                });
        });
    }

    /**
     * @private
     * @param {VaultAccessToken} accessToken
     * @return {boolean}
     */
    _isValidVaultAccessToken(accessToken) {
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
    _getValidAccessToken(accessToken) {
        return this._isValidVaultAccessToken(accessToken)
            ? Promise.resolve(accessToken)
            : this._instrumentRequestSender.getVaultAccessToken()
                .then(({ body: { data } = {} }) => ({
                    vaultAccessToken: data.token,
                    vaultAccessExpiry: data.expires_at,
                }));
    }
}
