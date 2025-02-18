import isExperimentEnabled, { Features } from './is-experiment-enabled';

describe('isExperimentEnabled', () => {
    it('returns true if experiment is not present', () => {
        const features: Features = {
            test: true,
        };

        const experimentStatus = isExperimentEnabled(features, 'someexperiment');

        expect(experimentStatus).toBe(true);
    });

    it('returns false if experiment value is false', () => {
        const features: Features = {
            test: false,
        };

        const experimentStatus = isExperimentEnabled(features, 'test');

        expect(experimentStatus).toBe(false);
    });

    it('returns true if experiment value is true', () => {
        const features: Features = {
            test: true,
        };

        const experimentStatus = isExperimentEnabled(features, 'test');

        expect(experimentStatus).toBe(true);
    });
});
