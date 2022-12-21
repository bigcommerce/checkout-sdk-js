import { noop } from 'lodash';

import { BoltCallbacks, BoltCheckout, BoltClient, BoltEmbedded, BoltTransaction } from './bolt';

export function getBoltClientScriptMock(
    shouldSucceed = false,
    isValidTransactionReference = true,
): BoltCheckout {
    return {
        configure: jest.fn((_cart: object, _hints: {}, callbacks?: BoltCallbacks) => {
            /* eslint-enable */
            return getConfiguredBoltMock(
                shouldSucceed,
                isValidTransactionReference,
                callbacks || { success: noop, close: noop },
            );
        }),
        getTransactionReference: jest.fn(),
        hasBoltAccount: jest.fn(),
        openCheckout: jest.fn(),
        setClientCustomCallbacks: jest.fn(),
        setOrderId: jest.fn(),
    };
}

export function getBoltEmbeddedScriptMock(): BoltEmbedded {
    return {
        create: jest.fn((_formName: string) => {
            return {
                mount: jest.fn(),
                unmount: jest.fn(),
                tokenize: jest.fn(),
            };
        }),
    };
}

export function getConfiguredBoltMock(
    shouldSucceed: boolean,
    isValidTransactionReference: boolean,
    callbacks: BoltCallbacks,
): BoltClient {
    const mockTransaction: BoltTransaction = {
        reference: isValidTransactionReference ? 'transactionReference' : '',
        id: 'id',
        status: 'complete',
        type: 'authorization',
        processor: 'vantiv',
        date: 1234567890,
        authorization: {
            status: 'approved',
            reason: 'reason',
        },
    };

    return {
        open: jest.fn(() => {
            if (shouldSucceed) {
                callbacks.success(mockTransaction, jest.fn());
            } else if (callbacks.close) {
                callbacks.close();
            }
        }),
    };
}
