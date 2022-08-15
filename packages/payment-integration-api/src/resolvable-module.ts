type ResolvableModule<TModule, TIdentifier> = TModule & {
    resolveIds: TIdentifier[];
};

export default ResolvableModule;
