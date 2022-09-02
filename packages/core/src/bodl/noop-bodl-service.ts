import BodlService from "./bodl-service";

export default class NoopBodlService implements BodlService {
    checkoutBegin(): void {
        return;
    }

    orderPurchased(): void {
        return;
    }
}
