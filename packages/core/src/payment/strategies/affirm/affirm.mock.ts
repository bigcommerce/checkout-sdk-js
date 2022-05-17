export function getAffirmScriptMock(): any {
    return {
        checkout: jest.fn(),
        ui: {
            ready: jest.fn(),
            error: {
                on: jest.fn(),
            },
        },
    };
}
