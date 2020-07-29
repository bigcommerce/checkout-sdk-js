import { BoltCallbacks, BoltCheckout, BoltClient, BoltTransaction } from './bolt';

export function getBoltScriptMock(shouldSucced: boolean = false): BoltCheckout {
    return {
        configure: jest.fn((_cart: object, _hints: {}, callbacks?: BoltCallbacks) => {
            return getConfiguredBoltMock(shouldSucced, callbacks || { success: () => {}, close: () => {}});
        }),
        setClientCustomCallbacks: jest.fn(),
    };
}

export function getConfiguredBoltMock(shouldSucced: boolean, callbacks: BoltCallbacks): BoltClient {
    const mockTransaction: BoltTransaction = {
        reference: 'transactionReference',
        id: 'id',
        status: 'complete',
        type: 'authorization',
        processor: 'vantiv',
        date : 1234567890,
        authorization: {
            status: 'approved',
            reason: 'reason',
        },
    };

    return {
        open: jest.fn(() => {
            if (shouldSucced) {
                callbacks.success(mockTransaction, jest.fn());
            } else {
                if (callbacks.close) {
                    callbacks.close();
                }
            }
        }),
    };
}
