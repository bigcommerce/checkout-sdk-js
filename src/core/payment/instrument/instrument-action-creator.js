import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../../data-store';
import * as actionTypes from './instrument-action-types';

export default class InstrumentActionCreator {
    /**
     * @contructor
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
}
