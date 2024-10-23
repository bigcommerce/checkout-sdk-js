import { isTdOnlineMartAdditionalAction } from './is-google-pay-td-online-mart-additional-action';

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

                    three_ds_result: {},
                },
            }),
        ).toBe(true);
    });
});
