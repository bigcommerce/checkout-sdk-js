import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { Address } from '../../address';
import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../../checkout';
import { addMinutes, isFuture } from '../../common/date-time';
import { MissingDataError, MissingDataErrorType } from '../../common/error/errors';

import { SessionContext, VaultAccessToken } from './instrument';
import { DeleteInstrumentAction, InstrumentActionType, LoadInstrumentsAction } from './instrument-actions';
import InstrumentRequestSender from './instrument-request-sender';

export default class InstrumentActionCreator {
    constructor(
        private _instrumentRequestSender: InstrumentRequestSender
    ) {}

    loadInstruments(): ThunkAction<LoadInstrumentsAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<LoadInstrumentsAction>) => {
            observer.next(createAction(InstrumentActionType.LoadInstrumentsRequested));

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
                            observer.next(createAction(
                                InstrumentActionType.LoadInstrumentsSucceeded,
                                body,
                                currentToken
                            ));
                            observer.complete();
                        })
                )
                .catch(response => {
                    observer.error(createErrorAction(InstrumentActionType.LoadInstrumentsFailed, response));
                });
        });
    }

    deleteInstrument(instrumentId: string): ThunkAction<DeleteInstrumentAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<DeleteInstrumentAction>) => {
            observer.next(createAction(InstrumentActionType.DeleteInstrumentRequested, undefined, { instrumentId }));

            const session = this._getSessionContext(store);
            const token = this._getCurrentAccessToken(store);

            return this._getValidAccessToken(token)
                .then(currentToken =>
                    this._instrumentRequestSender.deleteInstrument({
                        ...session,
                        authToken: currentToken.vaultAccessToken,
                    }, instrumentId)
                        .then(({ body }) => {
                            observer.next(createAction(InstrumentActionType.DeleteInstrumentSucceeded, body, {
                                instrumentId,
                                ...currentToken,
                            }));
                            observer.complete();
                        })
                )
                .catch(response => {
                    observer.error(createErrorAction(InstrumentActionType.DeleteInstrumentFailed, response, { instrumentId }));
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
        return token && this._isValidVaultAccessToken(token) ?
            Promise.resolve(token) :
            this._instrumentRequestSender.getVaultAccessToken().then(({ body }) => body);
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
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        const { customerId } = cart;
        const { storeId } = config.storeProfile;
        const { code } = config.shopperCurrency.isTransactional ? config.shopperCurrency : config.currency;

        return {
            customerId,
            storeId,
            currencyCode: code,
        };
    }
}
