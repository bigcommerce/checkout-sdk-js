export interface Features {
    [featureName: string]: boolean | undefined;
}

export default function isExperimentEnabled(
    features: Features,
    experimentName: string,
    fallbackValue = true,
): boolean {
    return features[experimentName] ?? fallbackValue;
}
