import { ChasePayEventType, JPMC } from './chasepay';

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
                START_CHECKOUT: ChasePayEventType.StartCheckout,
                COMPLETE_CHECKOUT: ChasePayEventType.CompleteCheckout,
                CANCEL_CHECKOUT: ChasePayEventType.CancelCheckout,
            },
        },
    };
}
