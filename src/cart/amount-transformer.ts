export default class AmountTransformer {
    constructor(private _dp: number) {}

    toInteger(amount: number): number {
        return Math.floor(amount * Math.pow(10, this._dp));
    }
}
