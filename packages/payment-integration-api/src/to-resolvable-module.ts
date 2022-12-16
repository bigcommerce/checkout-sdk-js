import ResolvableModule from './resolvable-module';

export default function toResolvableModule<TModule, TIdentifier>(
    module: TModule,
    resolveIds: TIdentifier[],
): ResolvableModule<TModule, TIdentifier> {
    return Object.assign(module, { resolveIds });
}
