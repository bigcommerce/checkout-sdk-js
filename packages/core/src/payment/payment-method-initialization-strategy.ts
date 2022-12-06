interface UnknownObject {
    [key: string]: unknown;
}

export default interface InitializationStrategy extends Partial<UnknownObject> {
    type: string;
}
