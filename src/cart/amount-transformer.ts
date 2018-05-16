export default class AmountTransformer {
    constructor(private _dp: number) {}

    toInteger(amount: number): number {
        return amount * Math.pow(10, this._dp);
    }
}
