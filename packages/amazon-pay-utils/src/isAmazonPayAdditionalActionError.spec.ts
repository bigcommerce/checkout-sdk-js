/* eslint-disable @typescript-eslint/naming-convention */
import { isAmazonPayAdditionalActionErrorBody } from './isAmazonPayAdditionalActionError';

describe('isAmazonPayAdditionalActionErrorBody', () => {
    it('Should return false if error not an object', () => {
        expect(isAmazonPayAdditionalActionErrorBody(undefined)).toBe(false);
    });

    it('Should return false if error is equal null', () => {
        expect(isAmazonPayAdditionalActionErrorBody(null)).toBe(false);
    });

    it('Should return false if no status option in error', () => {
        const errorBody = {
            additional_action_required: {},
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(false);
    });

    it('Should return false if no additional_action_required option in error', () => {
        const errorBody = {
            status: 'additional_action_required',
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(false);
    });

    it('Should return false if error status different from additional_action_required', () => {
        const errorBody = {
            status: 'some other status',
            additional_action_required: {},
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(false);
    });

    it('Should return false if no data object in additional_action_required', () => {
        const errorBody = {
            status: 'additional_action_required',
            additional_action_required: {},
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(false);
    });

    it('Should return false if no redirect_url in error', () => {
        const errorBody = {
            status: 'additional_action_required',
            additional_action_required: {
                data: {},
            },
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(false);
    });

    it('Should return false if no redirect_url not a string', () => {
        const errorBody = {
            status: 'additional_action_required',
            additional_action_required: {
                data: {
                    redirect_url: {},
                },
            },
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(false);
    });

    it('Should return true if error is additional action required', () => {
        const errorBody = {
            status: 'additional_action_required',
            additional_action_required: {
                data: {
                    redirect_url: 'redirect_url',
                },
            },
        };

        expect(isAmazonPayAdditionalActionErrorBody(errorBody)).toBe(true);
    });
});
