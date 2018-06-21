import { createAction, createErrorAction, Action, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { Address } from '../../address';
import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../../checkout';
import { addMinutes, isFuture } from '../../common/date-time';
import { MissingDataError, MissingDataErrorType } from '../../common/error/errors';

import { SessionContext, VaultAccessToken } from './instrument';
import * as actionTypes from './instrument-action-types';
import InstrumentRequestSender from './instrument-request-sender';

export default class InstrumentActionCreator {
    constructor(
        private _instrumentRequestSender: InstrumentRequestSender
    ) {}

    loadInstruments(): ThunkAction<Action, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));

            const session = this._getSessionContext(store);
            const token = this._getCurrentAccessToken(store);
            const shippingAddress = this._getShippingAddress(store);

            return this._getValidAccessToken(token)
                .then(currentToken =>
                    this._instrumentRequestSender.loadInstruments({
                            ...session,
                            authToken: currentToken.vaultAccessToken,
                        },
                        shippingAddress
                    )
                        .then(({ body }) => {
                            observer.next(createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, body, currentToken));
                            observer.complete();
                        })
                )
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_INSTRUMENTS_FAILED, response));
                });
        });
    }

    deleteInstrument(instrumentId: string): ThunkAction<Action, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId }));

            const session = this._getSessionContext(store);
            const token = this._getCurrentAccessToken(store);

            return this._getValidAccessToken(token)
                .then(currentToken =>
                    this._instrumentRequestSender.deleteInstrument({ ...session, authToken: currentToken.vaultAccessToken }, instrumentId)
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

    private _isValidVaultAccessToken(token: VaultAccessToken): boolean {
        if (!token || !token.vaultAccessToken) {
            return false;
        }

        const expiryBuffer = 2;
        const expiry = addMinutes(new Date(token.vaultAccessExpiry), expiryBuffer);

        return isFuture(expiry);
    }

    private _getCurrentAccessToken(store: ReadableCheckoutStore): VaultAccessToken | undefined {
        const { instruments } = store.getState();
        const meta = instruments.getInstrumentsMeta();

        if (!meta) {
            return;
        }

        return {
            vaultAccessToken: meta.vaultAccessToken,
            vaultAccessExpiry: meta.vaultAccessExpiry,
        };
    }

    private _getValidAccessToken(token?: VaultAccessToken): Promise<VaultAccessToken> {
        return token && this._isValidVaultAccessToken(token)
            ? Promise.resolve(token)
            : this._instrumentRequestSender.getVaultAccessToken()
                .then(({ body = {} }: any) => ({
                    vaultAccessToken: body.data.token,
                    vaultAccessExpiry: body.data.expires_at,
                }));
    }

    private _getShippingAddress(store: ReadableCheckoutStore): Address | undefined {
        const state = store.getState();

        return state.shippingAddress.getShippingAddress();
    }

    private _getSessionContext(store: ReadableCheckoutStore): SessionContext {
        const state = store.getState();
        const config = state.config.getStoreConfig();
        const cart = state.cart.getCart();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingConfig);
        }

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        const { customerId } = cart;
        const { storeId } = config.storeProfile;

        return {
            customerId,
            storeId,
        };
    }
}
