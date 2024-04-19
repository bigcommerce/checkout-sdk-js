import {
    Card,
    CardFieldNamesValues,
    CardInputEvent,
    CardInputEventTypes,
    CardInputEventTypesValues,
    Payments,
    SqEvent,
} from '../types';

export function getSquareV2MockFunctions() {
    const attach = jest.fn<Card['attach']>().mockResolvedValue(undefined);
    const configure = jest.fn<Card['configure']>().mockResolvedValue(undefined);
    const tokenize = jest
        .fn<Card['tokenize']>()
        .mockResolvedValue({ status: 'OK', token: 'cnon:xxx' });
    const destroy = jest.fn<Card['destroy']>().mockResolvedValue(true);
    const listeners: Partial<{
        [key in CardInputEventTypes]: (event: SqEvent<CardInputEvent>) => void;
    }> = {};
    const addEventListener = jest
        .fn<Card['addEventListener']>()
        .mockImplementation(
            (
                eventType: CardInputEventTypes,
                callback: (event: SqEvent<CardInputEvent>) => void,
            ) => {
                listeners[eventType] = callback;
            },
        );
    const simulateEvent = (
        type: CardInputEventTypesValues,
        field: CardFieldNamesValues,
        isCompletelyValid: boolean,
    ) => {
        const callback = listeners[type];

        if (callback) {
            const fakeEvent = {
                detail: {
                    field,
                    currentState: { isCompletelyValid },
                },
            };

            callback(fakeEvent as SqEvent<CardInputEvent>);
        }
    };
    const removeEventListener = jest.fn<Card['removeEventListener']>();
    const card = jest.fn<Card>().mockReturnValue({
        attach,
        configure,
        tokenize,
        destroy,
        addEventListener,
        removeEventListener,
    });
    const verifyBuyer = jest.fn<Payments['verifyBuyer']>().mockReturnValue({ token: 'verf:yyy' });
    const payments = jest.fn<Payments>().mockReturnValue({ card, verifyBuyer });

    return {
        attach,
        configure,
        tokenize,
        destroy,
        addEventListener,
        simulateEvent,
        removeEventListener,
        card,
        verifyBuyer,
        payments,
    };
}
