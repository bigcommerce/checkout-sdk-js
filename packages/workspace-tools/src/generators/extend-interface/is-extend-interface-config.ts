import ExtendInterfaceConfig from './extend-interface-config';

export default function isExtendInterfaceConfig(config: unknown): config is ExtendInterfaceConfig {
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

        if (!hasKey(entry, 'inputPath') || typeof entry.inputPath !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'outputPath') || typeof entry.outputPath !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'outputMemberName') || typeof entry.outputMemberName !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'memberPattern') || typeof entry.memberPattern !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'targetPath') || typeof entry.targetPath !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'targetMemberName') || typeof entry.targetMemberName !== 'string') {
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
