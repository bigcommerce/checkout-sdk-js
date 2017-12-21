import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../../data-store';
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
     * @return {Observable<Action>}
     */
    loadInstruments(storeId, shopperId) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));

            this._instrumentRequestSender.getShopperToken(storeId, shopperId)
                .then(({ body: { data } = {} }) =>
                    this._instrumentRequestSender.getInstruments(storeId, shopperId, data.token)
                )
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_INSTRUMENTS_FAILED, response));
                });
        });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {InstrumentRequestBody} instrument
     * @return {Observable<Action>}
     */
    vaultInstrument(storeId, shopperId, instrument) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.VAULT_INSTRUMENT_REQUESTED));

            this._instrumentRequestSender.getShopperToken(storeId, shopperId)
                .then(({ body: { data } = {} }) =>
                    this._instrumentRequestSender.vaultInstrument(storeId, shopperId, data.token, instrument)
                )
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.VAULT_INSTRUMENT_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.VAULT_INSTRUMENT_FAILED, response));
                });
        });
    }

    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @param {string} instrumentId
     * @return {Observable<Action>}
     */
    deleteInstrument(storeId, shopperId, instrumentId) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId }));

            this._instrumentRequestSender.getShopperToken(storeId, shopperId)
                .then(({ body: { data } = {} }) =>
                    this._instrumentRequestSender.deleteInstrument(storeId, shopperId, instrumentId, data.token)
                )
                .then(() => {
                    observer.next(createAction(actionTypes.DELETE_INSTRUMENT_SUCCEEDED, undefined, { instrumentId }));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.DELETE_INSTRUMENT_FAILED, response, { instrumentId }));
                });
        });
    }
}
