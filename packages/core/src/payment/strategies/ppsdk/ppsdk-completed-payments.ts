import { BrowserStorage } from '../../../common/storage';

type CompletedPayments = string[];

const COMPLETED_PAYMENTS_KEY = 'completed-payments';

export class PPSDKCompletedPayments {
    constructor(private _browserStorage: BrowserStorage) {}

    isCompleted(paymentId: string): boolean {
        return this.getCompletedPayments().indexOf(paymentId) >= 0;
    }

    setCompleted(paymentId: string): void {
        const completedPayments = this.getCompletedPayments();

        completedPayments.push(paymentId);

        this.setCompletedPayments(completedPayments);
    }

    private getCompletedPayments(): CompletedPayments {
        return this._browserStorage.getItem<CompletedPayments>(COMPLETED_PAYMENTS_KEY) || [];
    }

    private setCompletedPayments(completedPayments: CompletedPayments): void {
        this._browserStorage.setItem<CompletedPayments>(COMPLETED_PAYMENTS_KEY, completedPayments);
    }
}
