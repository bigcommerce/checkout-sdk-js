import { JPMC } from './chasepay';

export function getChasePayScriptMock(): JPMC {
    return {
        ChasePay: {
            insertButtons: jest.fn(),
            insertBrandings: jest.fn(),
            isChasePayUp: jest.fn(),
            startCheckout: jest.fn(),
            configure: jest.fn(),
            showLoadingAnimation: jest.fn(),
            on: jest.fn(),
            EventType: {
                START_CHECKOUT: 'START_CHECKOUT',
                COMPLETE_CHECKOUT: 'COMPLETE_CHECKOUT',
                CANCEL_CHECKOUT: 'CANCEL_CHECKOUT',
            },
        },
    };
}
