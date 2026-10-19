import OrderCreatedNotifier from './order-created-notifier';

describe('OrderCreatedNotifier', () => {
    let notifier: OrderCreatedNotifier;

    beforeEach(() => {
        notifier = new OrderCreatedNotifier();
    });

    it('emits order id to subscribers when notified', () => {
        const listener = jest.fn();

        notifier.orderCreated$.subscribe(listener);
        notifier.notify(123);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(123);
    });

    it('emits to every subscriber', () => {
        const firstListener = jest.fn();
        const secondListener = jest.fn();

        notifier.orderCreated$.subscribe(firstListener);
        notifier.orderCreated$.subscribe(secondListener);
        notifier.notify(456);

        expect(firstListener).toHaveBeenCalledWith(456);
        expect(secondListener).toHaveBeenCalledWith(456);
    });

    it('does not replay previous notifications to late subscribers', () => {
        const listener = jest.fn();

        notifier.notify(789);
        notifier.orderCreated$.subscribe(listener);

        expect(listener).not.toHaveBeenCalled();
    });

    it('stops emitting after unsubscribe', () => {
        const listener = jest.fn();

        const subscription = notifier.orderCreated$.subscribe(listener);

        subscription.unsubscribe();
        notifier.notify(1);

        expect(listener).not.toHaveBeenCalled();
    });
});
