export default class AmountTransformer {
    constructor(private _decimalPlaces: number) {}

    toInteger(amount: number): number {
        return Math.round(amount * Math.pow(10, this._decimalPlaces));
    }
}
