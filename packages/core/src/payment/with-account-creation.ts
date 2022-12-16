import { WithAccountCreation } from './payment';

export default function withAccountCreation(
    paymentData: unknown,
): paymentData is WithAccountCreation {
    return (
        typeof paymentData === 'object' &&
        paymentData !== null &&
        'shouldCreateAccount' in paymentData
    );
}
