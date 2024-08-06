import { isTdOnlineMartAdditionalAction } from './isTdOnlineMartAdditionalAction';

describe('isTdOnlineMartAdditionalAction', () => {
    it('receive not request error', () => {
        expect(isTdOnlineMartAdditionalAction({})).toBe(false);
    });

    it('error does not contain 3DS error code', () => {
        expect(
            isTdOnlineMartAdditionalAction({
                body: {
                    errors: [
                        {
                            code: 'any_code',
                        },
                    ],
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    three_ds_result: {},
                },
            }),
        ).toBe(false);
    });

    it('error does not contain 3DS results', () => {
        expect(
            isTdOnlineMartAdditionalAction({
                body: {
                    errors: [
                        {
                            code: 'three_d_secure_required',
                        },
                    ],
                },
            }),
        ).toBe(false);
    });

    it('error is a TD bank additional action error', () => {
        expect(
            isTdOnlineMartAdditionalAction({
                body: {
                    errors: [
                        {
                            code: 'any_code',
                        },
                        {
                            code: 'three_d_secure_required',
                        },
                    ],
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    three_ds_result: {},
                },
            }),
        ).toBe(true);
    });
});
