import { get, isArray } from 'lodash';

import { PaymentHumanVerificationHandler } from '../../../../../../spam-protection';
import PaymentAdditionalAction from '../../../../../payment-additional-action';
import { PaymentsAPIResponse } from '../../../ppsdk-payments-api-response';

interface VerificationMethod {
    id: string;
    parameters: Record<string, string>;
}

interface Parameters {
    available_methods: VerificationMethod[];
}

export interface HumanVerification {
    type: 'continue';
    code: 'resubmit_with_human_verification';
    parameters: Parameters;
}

const isParameters = (x: unknown): x is Parameters => {
    const availableMethods = get(x, 'available_methods');

    return isArray(availableMethods);
};

export const isHumanVerification = (body: PaymentsAPIResponse['body']): body is HumanVerification =>
    get(body, 'type') === 'continue' &&
    get(body, 'code') === 'resubmit_with_human_verification' &&
    isParameters(get(body, 'parameters'));

export const handleHumanVerification = async (
    { available_methods }: Parameters,
    humanVerificationHandler?: PaymentHumanVerificationHandler,
    callback?: (additionalAction: PaymentAdditionalAction) => Promise<void>,
): Promise<void> => {
    if (!callback) {
        throw new Error('PPSDK human verification callback function is missing.');
    }

    if (!humanVerificationHandler) {
        throw new Error('PPSDK human verification handler is missing.');
    }

    if (available_methods.length === 0) {
        throw Error('Human verification method is missing.');
    }

    // Only one method is expected because google recaptcha only is supported
    const { id, parameters } = available_methods[0];

    const additionalAction: PaymentAdditionalAction = await humanVerificationHandler.handle(
        id,
        parameters.key,
    );

    return callback(additionalAction);
};
