// import { createAction, Action } from '@bigcommerce/data-store';
// import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
// import { getScriptLoader } from '@bigcommerce/script-loader';
// import { EventEmitter } from "events";
// import { omit } from 'lodash';
// import { of, Observable } from 'rxjs';
//
// import { createCheckoutStore, CheckoutStore } from '../../../checkout';
// import CheckoutButtonMethodType from '../../../checkout-buttons/strategies/checkout-button-method-type';
// import { PaypalCommerceButtonInitializeOptions } from '../../../checkout-buttons/strategies/paypal-commerce';
// import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
// import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
// import { OrderActionCreator, OrderActionType, OrderRequestBody } from '../../../order';
// import { getOrderRequestBody } from '../../../order/internal-orders.mock';
// import { PaymentArgumentInvalidError } from '../../errors';
// import PaymentActionCreator from '../../payment-action-creator';
// import { PaymentActionType } from '../../payment-actions';
// import PaymentMethod from '../../payment-method';
// import PaymentMethodActionCreator from '../../payment-method-action-creator';
// import { PaymentMethodActionType } from '../../payment-method-actions';
// import { getPaypalCommerce } from '../../payment-methods.mock';
// import { PaymentInitializeOptions } from '../../payment-request-options';
// import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
// import PaymentStrategy from '../payment-strategy';
//
// import {
//     ButtonsOptions, PaypalCommercePaymentInitializeOptions,
//     PaypalCommercePaymentStrategy,
//     PaypalCommerceRequestSender,
//     PaypalCommerceScriptLoader,
//     PaypalCommerceSDK, StyleButtonColor, StyleButtonLabel
// } from './index';
// import { getPaypalCommerceMock } from './paypal-commerce.mock';
//
// describe('PaypalCommercePaymentStrategy', () => {
//     let orderActionCreator: OrderActionCreator;
//     let paymentActionCreator: PaymentActionCreator;
//     let paypalCommercePaymentStrategy: PaymentStrategy;
//     let paymentMethod: PaymentMethod;
//     let store: CheckoutStore;
//     let submitOrderAction: Observable<Action>;
//     let submitPaymentAction: Observable<Action>;
//     let options: PaymentInitializeOptions;
//     let requestSender: RequestSender;
//     let paypalCommerceRequestSender: PaypalCommerceRequestSender;
//     let paypalScriptLoader: PaypalCommerceScriptLoader;
//     let paypalOptions: PaypalCommercePaymentInitializeOptions;
//     let paymentMethodActionCreator: PaymentMethodActionCreator;
//     let paymentStrategyActionCreator: PaymentStrategyActionCreator;
//     let credit: boolean = false;
//     let paypal: PaypalCommerceSDK;
//     let render: () => void;
//     let orderID: string;
//     let fundingSource: string;
//     let submitForm: () => {};
//     let eventEmitter: EventEmitter;
//
//     beforeEach(() => {
//         paymentMethod = { ...getPaypalCommerce() };
//         submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
//         submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
//         requestSender = createRequestSender();
//         paypalCommerceRequestSender = new PaypalCommerceRequestSender(requestSender);
//
//         store = createCheckoutStore(getCheckoutStoreState());
//
//         jest.spyOn(store, 'dispatch');
//
//         orderActionCreator = {} as OrderActionCreator;
//         orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
//
//         paymentActionCreator = {} as PaymentActionCreator;
//         paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
//
//         paymentMethodActionCreator = {} as PaymentMethodActionCreator;
//         paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
//
//         paypalCommerceRequestSender.setupPayment = jest.fn(() => ({ orderId: 'orderId', approveUrl: 'approveUrl' }));
//
//         paypalScriptLoader = new PaypalCommerceScriptLoader(getScriptLoader());
//
//
//         options = {
//             methodId: paymentMethod.id,
//             paypalcommerce: paypalOptions,
//         };
//
//         paypalOptions = {
//             container: '#container',
//             style: {
//                 color: StyleButtonColor.white,
//                 label: StyleButtonLabel.buynow,
//                 height: 45,
//             },
//             submitForm,
//         };
//
//         orderID = 'ORDER_ID';
//         fundingSource = 'paypal';
//         eventEmitter = new EventEmitter();
//         paypal = getPaypalCommerceMock();
//
//         render = jest.spyOn(paypal, 'Buttons')
//             .mockImplementation((options: ButtonsOptions) => {
//                 eventEmitter.on('onClick', () => {
//                     if (options.onClick) {
//                         options.onClick({fundingSource});
//                     }
//                 });
//
//                 eventEmitter.on('createOrder', () => {
//                     options.createOrder();
//                 });
//
//                 eventEmitter.on('approve', () => {
//                     options.onApprove( { orderID });
//                 });
//
//                 return {
//                     render: () => {},
//                 };
//             });
//
//         paypalCommercePaymentStrategy = new PaypalCommercePaymentStrategy(
//             store,
//             orderActionCreator,
//             paymentActionCreator,
//             paypalCommerceRequestSender,
//             paymentMethodActionCreator,
//
//         );
//     });
//
//     describe('#initialize()', () => {
//         it('returns checkout state', async () => {
//             const output = await paypalCommercePaymentStrategy.initialize(options);
//
//             expect(output).toEqual(store.getState());
//         });
//     });
//
//     describe('#execute()', () => {
//         let orderRequestBody: OrderRequestBody;
//
//         beforeEach(() => {
//             orderRequestBody = getOrderRequestBody();
//         });
//
//         it('pass the options to submitOrder', async () => {
//             await paypalCommercePaymentStrategy.initialize(options);
//             await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//
//             expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(orderRequestBody, 'payment'), options);
//         });
//
//         it('calls submit order', async () => {
//             await paypalCommercePaymentStrategy.initialize(options);
//             await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//
//             expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
//         });
//
//         it('submitPayment with the right information', async () => {
//             const expected = {
//                 ...orderRequestBody.payment,
//                 paymentData: {
//                     formattedPayload: {
//                         vault_payment_instrument: null,
//                         set_as_default_stored_instrument: null,
//                         device_info: null,
//                         paypal_account: {
//                             order_id: paymentMethod.initializationData.orderId,
//                         },
//                     },
//                 },
//             };
//
//             await paypalCommercePaymentStrategy.initialize(options);
//             await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//
//             expect(paymentActionCreator.submitPayment).toHaveBeenCalledWith(expected);
//         });
//
//         it('calls submit payment', async () => {
//             await paypalCommercePaymentStrategy.initialize(options);
//             await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//
//             expect(store.dispatch).toHaveBeenCalledWith(submitPaymentAction);
//         });
//
//         it('calls setupPayment and paymentPayPal without orderId (paypal) in paymentMethod', async () => {
//             paymentMethod.initializationData.orderId = null;
//
//             await store.dispatch(of(createAction(PaymentMethodActionType.LoadPaymentMethodsSucceeded, [paymentMethod])));
//
//             await paypalCommercePaymentStrategy.initialize(options);
//
//             await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//
//             expect(paypalCommerceRequestSender.setupPayment).toHaveBeenCalled();
//         });
//
//         it('throw error without payment data', async () => {
//             orderRequestBody.payment = undefined;
//
//             await paypalCommercePaymentStrategy.initialize(options);
//
//             try {
//                 await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//             } catch (error) {
//                 expect(error).toEqual(new PaymentArgumentInvalidError(['payment']));
//             }
//         });
//
//         it('throw error with mistake in methodId', async () => {
//             options.methodId = '';
//             await paypalCommercePaymentStrategy.initialize(options);
//
//             try {
//                 await paypalCommercePaymentStrategy.execute(orderRequestBody, options);
//             } catch (error) {
//                 expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
//             }
//         });
//     });
// });
