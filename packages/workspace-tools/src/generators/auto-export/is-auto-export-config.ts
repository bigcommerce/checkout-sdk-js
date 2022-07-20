import AutoExportConfig from './auto-export-config';

export default function isAutoExportConfig(config: unknown): config is AutoExportConfig {
    if (!(config instanceof Object)) {
        return false;
    }

    if (!hasKey(config, 'entries') || !isArray(config.entries)) {
        return false;
    }

    return config.entries.every(entry => {
        if (!(entry instanceof Object)) {
            return false;
        }

        if (!hasKey(entry, 'inputPath') || typeof entry['inputPath'] !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'outputPath') || typeof entry['outputPath'] !== 'string') {
            return false;
        }

        if (!hasKey(entry, 'memberPattern') || typeof entry['memberPattern'] !== 'string') {
            return false;
        }

        return true;
    });
}

function isArray(array: unknown): array is unknown[] {
    return Array.isArray(array);
}

function hasKey<T extends object, K extends string | number | symbol>(object: T, key: K): object is T & Record<K, unknown> {
    return key in object;
}
