export default interface BoltPaymentInitializeOptions {
  /**
   * When true, BigCommerce's checkout will be used
   * otherwise Bolt's full checkout take over will be assumed
   */
  useBigCommerceCheckout?: boolean;
}
