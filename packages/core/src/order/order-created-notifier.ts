import { Observable, Subject } from 'rxjs';

export default class OrderCreatedNotifier {
    private _orderCreated$ = new Subject<number>();
    readonly orderCreated$: Observable<number> = this._orderCreated$.asObservable();

    notify(orderId: number): void {
        this._orderCreated$.next(orderId);
    }
}
