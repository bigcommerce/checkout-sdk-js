import CreateEnumConfig from './create-enum-config';

export default function isExtendInterfaceConfig(config: unknown): config is CreateEnumConfig {
    if (!(config instanceof Object)) {
        return false;
    }

    if (!hasKey(config, 'entries') || !isArray(config.entries)) {
        return false;
    }

    return config.entries.every((entry) => {
        if (!(entry instanceof Object)) {
            return false;
        }

        if (!hasKey(entry, 'inputPaths') || !Array.isArray(entry.inputPaths)) {
            return false;
        }

        if (!hasKey(entry, 'inputMemberPattern') || typeof entry.inputMemberPattern !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'outputPath') || typeof entry.outputPath !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'outputMemberName') || typeof entry.outputMemberName !== 'string') {
            return false;
        }

        return true;
    });
}

function isArray(array: unknown): array is unknown[] {
    return Array.isArray(array);
}

function hasKey<T extends object, K extends string | number | symbol>(
    object: T,
    key: K,
): object is T & Record<K, unknown> {
    return key in object;
}
