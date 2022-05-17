import { BrowserStorage } from '../../../common/storage';

import { PPSDKCompletedPayments } from './ppsdk-completed-payments';

it('returns true for a matching paymentId', () => {
    const completedPayments = new PPSDKCompletedPayments(new BrowserStorage('ppsdk'));

    completedPayments.setCompleted('123');

    expect(completedPayments.isCompleted('123')).toBe(true);
});

it('returns false for a non-matching paymentId', () => {
    const completedPayments = new PPSDKCompletedPayments(new BrowserStorage('ppsdk'));

    completedPayments.setCompleted('123');

    expect(completedPayments.isCompleted('456')).toBe(false);
});
