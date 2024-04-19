import { TDCustomCheckoutSDK, TdOnlineMartElement } from './td-online-mart';

const defaultElementMock = { mount: jest.fn(), unmount: jest.fn() };

export function getTDOnlineMartClient(
    elementMock: TdOnlineMartElement = defaultElementMock,
): TDCustomCheckoutSDK {
    return {
        create: jest.fn(() => elementMock),
        createToken: jest.fn(),
    };
}
