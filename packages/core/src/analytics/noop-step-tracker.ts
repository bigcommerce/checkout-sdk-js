import StepTracker from './step-tracker';

export default class NoopStepTracker implements StepTracker {
    trackCheckoutStarted(): void {}

    trackOrderComplete(): void {}

    trackStepViewed(): void {}

    trackStepCompleted(): void {}
}
