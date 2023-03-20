import { WithAccountCreation } from './payment';

export default function isWithAccountCreation(
    paymentData: unknown,
): paymentData is WithAccountCreation {
    return (
        typeof paymentData === 'object' &&
        paymentData !== null &&
        'shouldCreateAccount' in paymentData
    );
}
