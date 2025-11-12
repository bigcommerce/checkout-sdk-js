import { getDefaultLogger } from '../log';
import { getEnvironment } from '../utility';

import Factory from './factory';
import Registry from './registry';

export default class ResolveIdRegistry<TType, TToken extends { [key: string]: unknown }> {
    private _registry: Registry<TType>;

    constructor(private _useFallback = false) {
        this._registry = new Registry({
            tokenResolver: this._resolveToken.bind(this),
            defaultToken: this._encodeToken({ default: true } as unknown as TToken),
            useFallback: this._useFallback,
        });
    }

    get(resolveId: TToken): TType {
        return this._registry.get(this._encodeToken(resolveId));
    }

    getFactory(resolveId: TToken, exactMatch?: boolean): Factory<TType> | undefined {
        try {
            return this._registry.getFactory(this._encodeToken(resolveId), exactMatch);
        } catch (error) {
            return undefined;
        }
    }

    getUseFallback(): boolean {
        return this._useFallback;
    }

    register(resolveId: TToken, factory: Factory<TType>): void {
        this._registry.register(this._encodeToken(resolveId), factory);
    }

    private _encodeToken(resolveId: TToken): string {
        return btoa(JSON.stringify(resolveId));
    }

    private _decodeToken(token: string): TToken {
        return JSON.parse(atob(token));
    }

    private _resolveToken(
        token: string,
        registeredTokens: string[],
        exactMatch?: boolean,
    ): string | undefined {
        const query = this._decodeToken(token);

        const results: Array<{ token: string; matches: number; default: boolean }> = [];

        registeredTokens.forEach((registeredToken) => {
            const resolverId = this._decodeToken(registeredToken);

            const result = { token: registeredToken, matches: 0, default: false };

            for (const [key, value] of Object.entries(resolverId)) {
                if (key in query && query[key] !== value) {
                    result.matches = 0;
                    break;
                }

                if (key in query && query[key] === value) {
                    result.matches++;
                }

                if (key === 'default' && value === true) {
                    result.default = true;
                }
            }

            results.push(result);
        });

        const matchedResults = results
            .sort((a, b) => b.matches - a.matches)
            .filter((result) => result.matches > 0);

        if (matchedResults.length > 1 && matchedResults[0].matches === matchedResults[1].matches) {
            if (getEnvironment() === 'development') {
                getDefaultLogger().warn(
                    'The provided query matches at least two strategies with the same specificity. This warning can be resolved by making their resolve ID more specific.',
                );
            }
        }

        const matched = matchedResults[0];

        if (exactMatch && matched?.matches !== Object.keys(query).length) {
            throw new Error('Unable to resolve to a registered token with the provided token.');
        }

        if (matched && matched.token) {
            return matched.token;
        }

        if (this._useFallback) {
            const defaultToken = results.find((result) => result.default)?.token;

            if (defaultToken) {
                return defaultToken;
            }
        }

        throw new Error('Unable to resolve to a registered token with the provided token.');
    }
}
