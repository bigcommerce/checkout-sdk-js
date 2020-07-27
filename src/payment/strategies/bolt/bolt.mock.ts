import { BoltCallbacks, BoltCheckout, BoltClient } from './bolt';

export function getBoltScriptMock(success: boolean = false): BoltCheckout {
    return {
        configure: jest.fn((_cart: object, _hints: {}, callbacks?: BoltCallbacks) => {
            return getConfiguredBoltMock(success, callbacks || { success: () => {}, close: () => {}});
        }),
        setClientCustomCallbacks: jest.fn(),
    };
}

export function getConfiguredBoltMock(success: boolean, callbacks: BoltCallbacks): BoltClient {
    return {
        open: jest.fn(() => {
            if (success) {
                callbacks.success({ reference: 'transactionReference'}, jest.fn());
            } else {
                if (callbacks.close) {
                    callbacks.close();
                }
            }
        }),
    };
}
