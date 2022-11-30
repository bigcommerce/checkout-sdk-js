import Factory from './factory';
import Registry from './registry';

export default class ResolveIdRegistry<TType, TToken extends { [key: string]: unknown }> {
    private _registry: Registry<TType>;

    constructor() {
        this._registry = new Registry({
            tokenResolver: this._resolveToken.bind(this),
            useFallback: false,
        });
    }

    get(resolveId: TToken): TType {
        return this._registry.get(this._encodeToken(resolveId));
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

    private _resolveToken(token: string, registeredTokens: string[]): string | undefined {
        const query = this._decodeToken(token);
        const results: Array<{ token: string; matches: number }> = [];

        registeredTokens.forEach((registeredToken) => {
            const resolverId = this._decodeToken(registeredToken);
            const result = { token: registeredToken, matches: 0 };

            for (const [key, value] of Object.entries(resolverId)) {
                if (key in query && query[key] === value) {
                    result.matches++;
                }
            }

            results.push(result);
        });

        const matched = results
            .sort((a, b) => b.matches - a.matches)
            .filter((result) => result.matches > 0)[0];

        if (matched.token) {
            return matched.token;
        }

        throw new Error('Unable to resolve to a registered token with the provided token.');
    }
}
