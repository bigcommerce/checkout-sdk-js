export interface Features {
    [featureName: string]: boolean | undefined;
}

export default function isExperimentEnabled(features: Features, experimentName: string): boolean {
    return features[experimentName] ?? true;
}
