export default class AmountTransformer {
    constructor(private _decimalPlaces: number) {}

    toInteger(amount: number): number {
        return Math.round(amount * 10 ** this._decimalPlaces);
    }
}
