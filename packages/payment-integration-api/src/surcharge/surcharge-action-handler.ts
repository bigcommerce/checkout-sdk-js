import { Fee, FeeRequestBody } from '../fee';
import PaymentIntegrationService from '../payment-integration-service';

import SurchargeRequestSender, { SurchargeCheckInput } from './surcharge-request-sender';

// Identifies the surcharge fee so we can detect it (avoid duplicates) and recognise
// surcharge-driven checkout changes on the UI side.
export const SURCHARGE_FEE_NAME = 'corporate_card_surcharge';

export default class SurchargeActionHandler {
    // BIN the surcharge was last checked for; used to re-run only when the card changes.
    private _lastCheckedBin?: string;
    // Serializes checks so overlapping card events can't race past _hasSurcharge and
    // apply the fee twice.
    private _isChecking = false;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _surchargeRequestSender: SurchargeRequestSender,
    ) {}

    /**
     * Called in-flight — while the shopper fills / edits the card, BEFORE Place Order.
     * Asks BE whether a surcharge applies for the current card and, if so, applies it as a
     * checkout fee. Re-runs whenever the card (BIN) changes so the surcharge stays in sync.
     */
    async applyInFlight(input: SurchargeCheckInput): Promise<void> {
        const bin = typeof input.cardData.bin === 'string' ? input.cardData.bin : undefined;

        // Only re-run when the card (BIN) changes. Set synchronously before the await so
        // concurrent onChange/onValid calls for the same card are deduped.
        if (bin && bin === this._lastCheckedBin) {
            return;
        }

        // Concurrency guard: allow only one check at a time
        if (this._isChecking) {
            return;
        }

        this._isChecking = true;
        this._lastCheckedBin = bin;

        try {
            const checkout = this._paymentIntegrationService.getState().getCheckoutOrThrow();

            const { body } = await this._surchargeRequestSender.checkSurcharge(checkout.id, input);

            if (!body.eligible || body.amount <= 0) {
                // TODO (surcharging): if a surcharge fee is already applied and the new card is
                // NOT eligible, the stale fee must be removed server-side (needs a BE remove
                // endpoint). The Fees API only adds fees today.
                return;
            }

            // TODO (surcharging): if a surcharge for a PREVIOUS card is already applied, it must
            // be replaced server-side when the card changes (needs a BE remove/prorate endpoint).
            // Until then we avoid stacking duplicate fees by only applying when none exists yet.
            if (this._hasSurcharge()) {
                return;
            }

            const fee: FeeRequestBody = {
                type: 'custom_fee',
                name: body.name,
                display_name: body.displayName,
                cost: body.amount,
                source: body.source,
                tax_class_id: body.taxClassId,
            };

            // applyFees() returns the updated Checkout, merged into state by the checkout reducer
            // (Checkout.fees + grandTotal + outstandingBalance) so the summary re-renders.
            await this._paymentIntegrationService.applyFees([fee]);
        } catch (error) {
            this._lastCheckedBin = undefined; // allow a retry on the next valid change
            throw error;
        } finally {
            this._isChecking = false;
        }
    }

    private _hasSurcharge(): boolean {
        const checkout = this._paymentIntegrationService.getState().getCheckout();

        return Boolean(checkout?.fees?.some((fee: Fee) => fee.name === SURCHARGE_FEE_NAME));
    }
}
