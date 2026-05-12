import ResolvableModule from './resolvable-module';

export default function isResolvableModule<TModule extends object, TIdentifier>(
    module: TModule,
): module is ResolvableModule<TModule, TIdentifier> {
    return module && 'resolveIds' in module;
}
