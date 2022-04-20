export default interface StepTracker {
    trackOrderComplete(): void;
    trackCheckoutStarted(): void;
    trackStepViewed(step: string): void;
    trackStepCompleted(step: string): void;
}
