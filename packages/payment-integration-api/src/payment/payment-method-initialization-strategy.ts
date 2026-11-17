type UnknownObject = Record<string, unknown>;

export default interface InitializationStrategy extends Partial<UnknownObject> {
    type: string;
}
