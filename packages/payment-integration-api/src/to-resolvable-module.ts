import ResolvableModule from './resolvable-module';

export default function toResolvableModule<TModule, TIdentifier>(
    module: TModule,
    resolveIds: TIdentifier[],
): ResolvableModule<TModule, TIdentifier> {
    console.log('resolveIds', resolveIds);

    return Object.assign(module, { resolveIds });
}
