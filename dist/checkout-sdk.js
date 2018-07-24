module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 260);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("tslib");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var invalid_argument_error_1 = __webpack_require__(95);
exports.InvalidArgumentError = invalid_argument_error_1.default;
var missing_data_error_1 = __webpack_require__(105);
exports.MissingDataError = missing_data_error_1.default;
exports.MissingDataErrorType = missing_data_error_1.MissingDataErrorType;
var not_implemented_error_1 = __webpack_require__(106);
exports.NotImplementedError = not_implemented_error_1.default;
var not_initialized_error_1 = __webpack_require__(107);
exports.NotInitializedError = not_initialized_error_1.default;
exports.NotInitializedErrorType = not_initialized_error_1.NotInitializedErrorType;
var request_error_1 = __webpack_require__(32);
exports.RequestError = request_error_1.default;
var standard_error_1 = __webpack_require__(16);
exports.StandardError = standard_error_1.default;
var timeout_error_1 = __webpack_require__(108);
exports.TimeoutError = timeout_error_1.default;
var unrecoverable_error_1 = __webpack_require__(109);
exports.UnrecoverableError = unrecoverable_error_1.default;
var unsupported_browser_error_1 = __webpack_require__(110);
exports.UnsupportedBrowserError = unsupported_browser_error_1.default;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("@bigcommerce/data-store");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var selector_decorator_1 = __webpack_require__(53);
exports.selectorDecorator = selector_decorator_1.default;
var selector_decorator_2 = __webpack_require__(53);
exports.selector = selector_decorator_2.default;
var cache_key_resolver_1 = __webpack_require__(54);
exports.CacheKeyResolver = cache_key_resolver_1.default;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("rxjs/Observable");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __webpack_require__(64);
var PaymentStrategy = /** @class */ (function () {
    function PaymentStrategy(_store) {
        this._store = _store;
        this._isInitialized = false;
    }
    PaymentStrategy.prototype.finalize = function (options) {
        return Promise.reject(new errors_1.OrderFinalizationNotRequiredError());
    };
    PaymentStrategy.prototype.initialize = function (options) {
        this._isInitialized = true;
        return Promise.resolve(this._store.getState());
    };
    PaymentStrategy.prototype.deinitialize = function (options) {
        this._isInitialized = false;
        return Promise.resolve(this._store.getState());
    };
    return PaymentStrategy;
}());
exports.default = PaymentStrategy;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(31), exports);
var checkout_default_includes_1 = __webpack_require__(46);
exports.CheckoutDefaultIncludes = checkout_default_includes_1.default;
var checkout_action_creator_1 = __webpack_require__(47);
exports.CheckoutActionCreator = checkout_action_creator_1.default;
var checkout_client_1 = __webpack_require__(51);
exports.CheckoutClient = checkout_client_1.default;
var checkout_request_sender_1 = __webpack_require__(33);
exports.CheckoutRequestSender = checkout_request_sender_1.default;
var checkout_selector_1 = __webpack_require__(52);
exports.CheckoutSelector = checkout_selector_1.default;
var checkout_service_1 = __webpack_require__(55);
exports.CheckoutService = checkout_service_1.default;
var checkout_store_error_selector_1 = __webpack_require__(120);
exports.CheckoutStoreErrorSelector = checkout_store_error_selector_1.default;
var checkout_store_selector_1 = __webpack_require__(121);
exports.CheckoutStoreSelector = checkout_store_selector_1.default;
var checkout_store_status_selector_1 = __webpack_require__(122);
exports.CheckoutStoreStatusSelector = checkout_store_status_selector_1.default;
var checkout_validator_1 = __webpack_require__(58);
exports.CheckoutValidator = checkout_validator_1.default;
var create_checkout_client_1 = __webpack_require__(88);
exports.createCheckoutClient = create_checkout_client_1.default;
var create_checkout_service_1 = __webpack_require__(242);
exports.createCheckoutService = create_checkout_service_1.default;
var create_checkout_store_1 = __webpack_require__(91);
exports.createCheckoutStore = create_checkout_store_1.default;
var create_internal_checkout_selectors_1 = __webpack_require__(92);
exports.createInternalCheckoutSelectors = create_internal_checkout_selectors_1.default;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var bind_decorator_1 = __webpack_require__(96);
exports.bindDecorator = bind_decorator_1.default;
var create_freeze_proxy_1 = __webpack_require__(97);
exports.createFreezeProxy = create_freeze_proxy_1.default;
exports.createFreezeProxies = create_freeze_proxy_1.createFreezeProxies;
var cancellable_promise_1 = __webpack_require__(98);
exports.CancellablePromise = cancellable_promise_1.default;
var get_environment_1 = __webpack_require__(99);
exports.getEnvironment = get_environment_1.default;
var is_equal_1 = __webpack_require__(100);
exports.isEqual = is_equal_1.default;
var is_private_1 = __webpack_require__(49);
exports.isPrivate = is_private_1.default;
var merge_or_push_1 = __webpack_require__(101);
exports.mergeOrPush = merge_or_push_1.default;
var omit_deep_1 = __webpack_require__(50);
exports.omitDeep = omit_deep_1.default;
var omit_private_1 = __webpack_require__(102);
exports.omitPrivate = omit_private_1.default;
var set_prototype_of_1 = __webpack_require__(103);
exports.setPrototypeOf = set_prototype_of_1.default;
var to_single_line_1 = __webpack_require__(104);
exports.toSingleLine = to_single_line_1.default;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var amount_transformer_1 = __webpack_require__(123);
exports.AmountTransformer = amount_transformer_1.default;
var cart_comparator_1 = __webpack_require__(124);
exports.CartComparator = cart_comparator_1.default;
var cart_reducer_1 = __webpack_require__(125);
exports.cartReducer = cart_reducer_1.default;
var cart_request_sender_1 = __webpack_require__(126);
exports.CartRequestSender = cart_request_sender_1.default;
var cart_selector_1 = __webpack_require__(127);
exports.CartSelector = cart_selector_1.default;
var map_to_internal_cart_1 = __webpack_require__(59);
exports.map = map_to_internal_cart_1.default;
var map_gift_certificate_to_internal_line_item_1 = __webpack_require__(86);
exports.mapGiftCertificateToInternalLineItem = map_gift_certificate_to_internal_line_item_1.default;
var map_to_internal_cart_2 = __webpack_require__(59);
exports.mapToInternalCart = map_to_internal_cart_2.default;
var map_to_internal_line_item_1 = __webpack_require__(87);
exports.mapToInternalLineItem = map_to_internal_line_item_1.default;
var map_to_internal_line_items_1 = __webpack_require__(85);
exports.mapToInternalLineItems = map_to_internal_line_items_1.default;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(34), exports);
var order_action_creator_1 = __webpack_require__(132);
exports.OrderActionCreator = order_action_creator_1.default;
var order_reducer_1 = __webpack_require__(133);
exports.orderReducer = order_reducer_1.default;
var order_request_sender_1 = __webpack_require__(134);
exports.OrderRequestSender = order_request_sender_1.default;
var order_selector_1 = __webpack_require__(135);
exports.OrderSelector = order_selector_1.default;
var map_to_internal_order_1 = __webpack_require__(136);
exports.mapToInternalOrder = map_to_internal_order_1.default;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var content_type_1 = __webpack_require__(111);
exports.ContentType = content_type_1.default;
var to_form_url_encoded_1 = __webpack_require__(112);
exports.toFormUrlEncoded = to_form_url_encoded_1.default;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var payment_argument_invalid_error_1 = __webpack_require__(116);
exports.PaymentArgumentInvalidError = payment_argument_invalid_error_1.default;
var payment_method_invalid_error_1 = __webpack_require__(117);
exports.PaymentMethodInvalidError = payment_method_invalid_error_1.default;
var payment_method_cancelled_error_1 = __webpack_require__(118);
exports.PaymentMethodCancelledError = payment_method_cancelled_error_1.default;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(35), exports);
tslib_1.__exportStar(__webpack_require__(36), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
var create_payment_client_1 = __webpack_require__(137);
exports.createPaymentClient = create_payment_client_1.default;
var create_payment_strategy_registry_1 = __webpack_require__(139);
exports.createPaymentStrategyRegistry = create_payment_strategy_registry_1.default;
var payment_action_creator_1 = __webpack_require__(63);
exports.PaymentActionCreator = payment_action_creator_1.default;
var payment_method_action_creator_1 = __webpack_require__(77);
exports.PaymentMethodActionCreator = payment_method_action_creator_1.default;
var payment_method_reducer_1 = __webpack_require__(219);
exports.paymentMethodReducer = payment_method_reducer_1.default;
var payment_method_request_sender_1 = __webpack_require__(220);
exports.PaymentMethodRequestSender = payment_method_request_sender_1.default;
var payment_method_selector_1 = __webpack_require__(221);
exports.PaymentMethodSelector = payment_method_selector_1.default;
var payment_reducer_1 = __webpack_require__(222);
exports.paymentReducer = payment_reducer_1.default;
var payment_request_sender_1 = __webpack_require__(78);
exports.PaymentRequestSender = payment_request_sender_1.default;
var payment_selector_1 = __webpack_require__(223);
exports.PaymentSelector = payment_selector_1.default;
var payment_strategy_action_creator_1 = __webpack_require__(224);
exports.PaymentStrategyActionCreator = payment_strategy_action_creator_1.default;
var payment_strategy_reducer_1 = __webpack_require__(226);
exports.paymentStrategyReducer = payment_strategy_reducer_1.default;
var payment_strategy_registry_1 = __webpack_require__(79);
exports.PaymentStrategyRegistry = payment_strategy_registry_1.default;
var payment_strategy_selector_1 = __webpack_require__(227);
exports.PaymentStrategySelector = payment_strategy_selector_1.default;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var create_customer_strategy_registry_1 = __webpack_require__(162);
exports.createCustomerStrategyRegistry = create_customer_strategy_registry_1.default;
var customer_actions_1 = __webpack_require__(70);
exports.CustomerActionType = customer_actions_1.CustomerActionType;
var customer_reducer_1 = __webpack_require__(179);
exports.customerReducer = customer_reducer_1.default;
var customer_action_creator_1 = __webpack_require__(69);
exports.CustomerActionCreator = customer_action_creator_1.default;
var customer_request_sender_1 = __webpack_require__(180);
exports.CustomerRequestSender = customer_request_sender_1.default;
var customer_selector_1 = __webpack_require__(181);
exports.CustomerSelector = customer_selector_1.default;
var customer_strategy_action_creator_1 = __webpack_require__(182);
exports.CustomerStrategyActionCreator = customer_strategy_action_creator_1.default;
var customer_strategy_selector_1 = __webpack_require__(183);
exports.CustomerStrategySelector = customer_strategy_selector_1.default;
var customer_strategy_reducer_1 = __webpack_require__(184);
exports.customerStrategyReducer = customer_strategy_reducer_1.default;
var map_to_internal_customer_1 = __webpack_require__(186);
exports.mapToInternalCustomer = map_to_internal_customer_1.default;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(24), exports);
var create_shipping_strategy_registry_1 = __webpack_require__(187);
exports.createShippingStrategyRegistry = create_shipping_strategy_registry_1.default;
var consignment_selector_1 = __webpack_require__(192);
exports.ConsignmentSelector = consignment_selector_1.default;
var consignment_reducer_1 = __webpack_require__(193);
exports.consignmentReducer = consignment_reducer_1.default;
var consignment_action_creator_1 = __webpack_require__(72);
exports.ConsignmentActionCreator = consignment_action_creator_1.default;
var consignment_request_sender_1 = __webpack_require__(194);
exports.ConsignmentRequestSender = consignment_request_sender_1.default;
var shipping_address_selector_1 = __webpack_require__(195);
exports.ShippingAddressSelector = shipping_address_selector_1.default;
var shipping_country_action_creator_1 = __webpack_require__(196);
exports.ShippingCountryActionCreator = shipping_country_action_creator_1.default;
var shipping_country_request_sender_1 = __webpack_require__(197);
exports.ShippingCountryRequestSender = shipping_country_request_sender_1.default;
var shipping_country_selector_1 = __webpack_require__(198);
exports.ShippingCountrySelector = shipping_country_selector_1.default;
var shipping_country_reducer_1 = __webpack_require__(199);
exports.shippingCountryReducer = shipping_country_reducer_1.default;
var shipping_strategy_action_creator_1 = __webpack_require__(200);
exports.ShippingStrategyActionCreator = shipping_strategy_action_creator_1.default;
var shipping_strategy_selector_1 = __webpack_require__(201);
exports.ShippingStrategySelector = shipping_strategy_selector_1.default;
var shipping_strategy_reducer_1 = __webpack_require__(202);
exports.shippingStrategyReducer = shipping_strategy_reducer_1.default;
var map_to_internal_shipping_option_1 = __webpack_require__(75);
exports.mapToInternalShippingOption = map_to_internal_shipping_option_1.default;
var map_to_internal_shipping_options_1 = __webpack_require__(204);
exports.mapToInternalShippingOptions = map_to_internal_shipping_options_1.default;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var utility_1 = __webpack_require__(8);
var StandardError = /** @class */ (function (_super) {
    tslib_1.__extends(StandardError, _super);
    function StandardError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message || 'An unexpected error has occurred.') || this;
        _this.type = 'standard';
        utility_1.setPrototypeOf(_this, _newTarget.prototype);
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(_this, _newTarget);
        }
        else {
            _this.stack = (new Error(_this.message)).stack;
        }
        return _this;
    }
    return StandardError;
}(Error));
exports.default = StandardError;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(28), exports);
var billing_address_selector_1 = __webpack_require__(140);
exports.BillingAddressSelector = billing_address_selector_1.default;
var billing_address_action_creator_1 = __webpack_require__(141);
exports.BillingAddressActionCreator = billing_address_action_creator_1.default;
var billing_address_request_sender_1 = __webpack_require__(142);
exports.BillingAddressRequestSender = billing_address_request_sender_1.default;
var billing_address_reducer_1 = __webpack_require__(143);
exports.billingAddressReducer = billing_address_reducer_1.default;
var is_billing_address_like_1 = __webpack_require__(144);
exports.isBillingAddressLike = is_billing_address_like_1.default;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("@bigcommerce/request-sender");

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(23), exports);
tslib_1.__exportStar(__webpack_require__(29), exports);
var coupon_action_creator_1 = __webpack_require__(128);
exports.CouponActionCreator = coupon_action_creator_1.default;
var coupon_request_sender_1 = __webpack_require__(129);
exports.CouponRequestSender = coupon_request_sender_1.default;
var coupon_selector_1 = __webpack_require__(130);
exports.CouponSelector = coupon_selector_1.default;
var coupon_reducer_1 = __webpack_require__(131);
exports.couponReducer = coupon_reducer_1.default;
var gift_certificate_action_creator_1 = __webpack_require__(228);
exports.GiftCertificateActionCreator = gift_certificate_action_creator_1.default;
var gift_certificate_request_sender_1 = __webpack_require__(229);
exports.GiftCertificateRequestSender = gift_certificate_request_sender_1.default;
var gift_certificate_selector_1 = __webpack_require__(230);
exports.GiftCertificateSelector = gift_certificate_selector_1.default;
var gift_certificate_reducer_1 = __webpack_require__(231);
exports.giftCertificateReducer = gift_certificate_reducer_1.default;
var map_to_internal_coupon_1 = __webpack_require__(232);
exports.mapToInternalCoupon = map_to_internal_coupon_1.default;
var map_to_internal_gift_certificate_1 = __webpack_require__(233);
exports.mapToInternalGiftCertificate = map_to_internal_gift_certificate_1.default;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ACKNOWLEDGE = 'ACKNOWLEDGE';
exports.FINALIZE = 'FINALIZE';
exports.INITIALIZE = 'INITIALIZE';


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var is_address_equal_1 = __webpack_require__(159);
exports.isAddressEqual = is_address_equal_1.default;
var map_from_internal_address_1 = __webpack_require__(160);
exports.mapFromInternalAddress = map_from_internal_address_1.default;
var map_to_internal_address_1 = __webpack_require__(161);
exports.mapToInternalAddress = map_to_internal_address_1.default;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("rxjs/observable/concat");

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CouponActionType;
(function (CouponActionType) {
    CouponActionType["ApplyCouponRequested"] = "APPLY_COUPON_REQUESTED";
    CouponActionType["ApplyCouponSucceeded"] = "APPLY_COUPON_SUCCEEDED";
    CouponActionType["ApplyCouponFailed"] = "APPLY_COUPON_FAILED";
    CouponActionType["RemoveCouponRequested"] = "REMOVE_COUPON_REQUESTED";
    CouponActionType["RemoveCouponSucceeded"] = "REMOVE_COUPON_SUCCEEDED";
    CouponActionType["RemoveCouponFailed"] = "REMOVE_COUPON_FAILED";
})(CouponActionType = exports.CouponActionType || (exports.CouponActionType = {}));


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ConsignmentActionType;
(function (ConsignmentActionType) {
    ConsignmentActionType["CreateConsignmentsRequested"] = "CREATE_CONSIGNMENTS_REQUESTED";
    ConsignmentActionType["CreateConsignmentsSucceeded"] = "CREATE_CONSIGNMENTS_SUCCEEDED";
    ConsignmentActionType["CreateConsignmentsFailed"] = "CREATE_CONSIGNMENTS_FAILED";
    ConsignmentActionType["UpdateConsignmentRequested"] = "UPDATE_CONSIGNMENT_REQUESTED";
    ConsignmentActionType["UpdateConsignmentSucceeded"] = "UPDATE_CONSIGNMENT_SUCCEEDED";
    ConsignmentActionType["UpdateConsignmentFailed"] = "UPDATE_CONSIGNMENT_FAILED";
    ConsignmentActionType["UpdateShippingOptionRequested"] = "UPDATE_SHIPPING_OPTION_REQUESTED";
    ConsignmentActionType["UpdateShippingOptionSucceeded"] = "UPDATE_SHIPPING_OPTION_SUCCEEDED";
    ConsignmentActionType["UpdateShippingOptionFailed"] = "UPDATE_SHIPPING_OPTION_FAILED";
    ConsignmentActionType["LoadShippingOptionsRequested"] = "LOAD_SHIPPING_OPTIONS_REQUESTED";
    ConsignmentActionType["LoadShippingOptionsSucceeded"] = "LOAD_SHIPPING_OPTIONS_SUCCEEDED";
    ConsignmentActionType["LoadShippingOptionsFailed"] = "LOAD_SHIPPING_OPTIONS_FAILED";
})(ConsignmentActionType = exports.ConsignmentActionType || (exports.ConsignmentActionType = {}));


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var config_action_creator_1 = __webpack_require__(61);
exports.ConfigActionCreator = config_action_creator_1.default;
var config_selector_1 = __webpack_require__(145);
exports.ConfigSelector = config_selector_1.default;
var config_reducer_1 = __webpack_require__(146);
exports.configReducer = config_reducer_1.default;
var config_request_sender_1 = __webpack_require__(147);
exports.ConfigRequestSender = config_request_sender_1.default;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
tslib_1.__exportStar(__webpack_require__(38), exports);
var remote_checkout_action_creator_1 = __webpack_require__(148);
exports.RemoteCheckoutActionCreator = remote_checkout_action_creator_1.default;
var remote_checkout_request_sender_1 = __webpack_require__(149);
exports.RemoteCheckoutRequestSender = remote_checkout_request_sender_1.default;
var remote_checkout_selector_1 = __webpack_require__(150);
exports.RemoteCheckoutSelector = remote_checkout_selector_1.default;
var remote_checkout_reducer_1 = __webpack_require__(151);
exports.remoteCheckoutReducer = remote_checkout_reducer_1.default;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CustomerStrategy = /** @class */ (function () {
    function CustomerStrategy(_store) {
        this._store = _store;
        this._isInitialized = false;
    }
    CustomerStrategy.prototype.initialize = function (options) {
        this._isInitialized = true;
        return Promise.resolve(this._store.getState());
    };
    CustomerStrategy.prototype.deinitialize = function (options) {
        this._isInitialized = false;
        return Promise.resolve(this._store.getState());
    };
    return CustomerStrategy;
}());
exports.default = CustomerStrategy;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BillingAddressActionType;
(function (BillingAddressActionType) {
    BillingAddressActionType["UpdateBillingAddressRequested"] = "UPDATE_BILLING_ADDRESS_REQUESTED";
    BillingAddressActionType["UpdateBillingAddressSucceeded"] = "UPDATE_BILLING_ADDRESS_SUCCEEDED";
    BillingAddressActionType["UpdateBillingAddressFailed"] = "UPDATE_BILLING_ADDRESS_FAILED";
})(BillingAddressActionType = exports.BillingAddressActionType || (exports.BillingAddressActionType = {}));


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var GiftCertificateActionType;
(function (GiftCertificateActionType) {
    GiftCertificateActionType["ApplyGiftCertificateRequested"] = "APPLY_GIFT_CERTIFICATE_REQUESTED";
    GiftCertificateActionType["ApplyGiftCertificateSucceeded"] = "APPLY_GIFT_CERTIFICATE_SUCCEEDED";
    GiftCertificateActionType["ApplyGiftCertificateFailed"] = "APPLY_GIFT_CERTIFICATE_FAILED";
    GiftCertificateActionType["RemoveGiftCertificateRequested"] = "REMOVE_GIFT_CERTIFICATE_REQUESTED";
    GiftCertificateActionType["RemoveGiftCertificateSucceeded"] = "REMOVE_GIFT_CERTIFICATE_SUCCEEDED";
    GiftCertificateActionType["RemoveGiftCertificateFailed"] = "REMOVE_GIFT_CERTIFICATE_FAILED";
})(GiftCertificateActionType = exports.GiftCertificateActionType || (exports.GiftCertificateActionType = {}));


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var country_action_creator_1 = __webpack_require__(238);
exports.CountryActionCreator = country_action_creator_1.default;
var country_request_sender_1 = __webpack_require__(239);
exports.CountryRequestSender = country_request_sender_1.default;
var country_selector_1 = __webpack_require__(240);
exports.CountrySelector = country_selector_1.default;
var country_reducer_1 = __webpack_require__(241);
exports.countryReducer = country_reducer_1.default;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutActionType;
(function (CheckoutActionType) {
    CheckoutActionType["LoadCheckoutRequested"] = "LOAD_CHECKOUT_REQUESTED";
    CheckoutActionType["LoadCheckoutSucceeded"] = "LOAD_CHECKOUT_SUCCEEDED";
    CheckoutActionType["LoadCheckoutFailed"] = "LOAD_CHECKOUT_FAILED";
    CheckoutActionType["UpdateCheckoutRequested"] = "UPDATE_CHECKOUT_REQUESTED";
    CheckoutActionType["UpdateCheckoutSucceeded"] = "UPDATE_CHECKOUT_SUCCEEDED";
    CheckoutActionType["UpdateCheckoutFailed"] = "UPDATE_CHECKOUT_FAILED";
})(CheckoutActionType = exports.CheckoutActionType || (exports.CheckoutActionType = {}));


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var standard_error_1 = __webpack_require__(16);
var DEFAULT_RESPONSE = {
    body: {},
    headers: {},
    status: 0,
    statusText: '',
};
var RequestError = /** @class */ (function (_super) {
    tslib_1.__extends(RequestError, _super);
    function RequestError(_a, message) {
        var _b = _a === void 0 ? DEFAULT_RESPONSE : _a, _c = _b.body, body = _c === void 0 ? {} : _c, headers = _b.headers, status = _b.status, statusText = _b.statusText;
        var _this = _super.call(this, joinErrors(body.errors) || body.detail || body.title || message || 'An unexpected error has occurred.') || this;
        _this.type = 'request';
        _this.body = body;
        _this.headers = headers;
        _this.status = status;
        _this.statusText = statusText;
        return _this;
    }
    return RequestError;
}(standard_error_1.default));
exports.default = RequestError;
function joinErrors(errors) {
    if (!Array.isArray(errors)) {
        return;
    }
    return errors.reduce(function (result, error) {
        if (typeof error === 'string') {
            return result.concat([error]);
        }
        if (error && error.message) {
            return result.concat([error.message]);
        }
        return result;
    }, []).join(' ');
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var http_request_1 = __webpack_require__(11);
var checkout_default_includes_1 = __webpack_require__(46);
var CheckoutRequestSender = /** @class */ (function () {
    function CheckoutRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    CheckoutRequestSender.prototype.loadCheckout = function (id, _a) {
        var _b = _a === void 0 ? {} : _a, params = _b.params, timeout = _b.timeout;
        var url = "/api/storefront/checkout/" + id;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.get(url, {
            params: {
                include: checkout_default_includes_1.default.concat(params && params.include || []).join(','),
            },
            headers: headers,
            timeout: timeout,
        });
    };
    CheckoutRequestSender.prototype.updateCheckout = function (id, body, _a) {
        var _b = _a === void 0 ? {} : _a, params = _b.params, timeout = _b.timeout;
        var url = "/api/storefront/checkout/" + id;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.put(url, {
            params: {
                include: checkout_default_includes_1.default.concat(params && params.include || []).join(','),
            },
            body: body,
            headers: headers,
            timeout: timeout,
        });
    };
    return CheckoutRequestSender;
}());
exports.default = CheckoutRequestSender;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var OrderActionType;
(function (OrderActionType) {
    OrderActionType["LoadOrderRequested"] = "LOAD_ORDER_REQUESTED";
    OrderActionType["LoadOrderSucceeded"] = "LOAD_ORDER_SUCCEEDED";
    OrderActionType["LoadOrderFailed"] = "LOAD_ORDER_FAILED";
    OrderActionType["LoadOrderPaymentsRequested"] = "LOAD_ORDER_PAYMENTS_REQUESTED";
    OrderActionType["LoadOrderPaymentsSucceeded"] = "LOAD_ORDER_PAYMENTS_SUCCEEDED";
    OrderActionType["LoadOrderPaymentsFailed"] = "LOAD_ORDER_PAYMENTS_FAILED";
    OrderActionType["SubmitOrderRequested"] = "SUBMIT_ORDER_REQUESTED";
    OrderActionType["SubmitOrderSucceeded"] = "SUBMIT_ORDER_SUCCEEDED";
    OrderActionType["SubmitOrderFailed"] = "SUBMIT_ORDER_FAILED";
    OrderActionType["FinalizeOrderRequested"] = "FINALIZE_ORDER_REQUESTED";
    OrderActionType["FinalizeOrderSucceeded"] = "FINALIZE_ORDER_SUCCEEDED";
    OrderActionType["FinalizeOrderFailed"] = "FINALIZE_ORDER_FAILED";
})(OrderActionType = exports.OrderActionType || (exports.OrderActionType = {}));


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LOAD_PAYMENT_METHODS_REQUESTED = 'LOAD_PAYMENT_METHODS_REQUESTED';
exports.LOAD_PAYMENT_METHODS_SUCCEEDED = 'LOAD_PAYMENT_METHODS_SUCCEEDED';
exports.LOAD_PAYMENT_METHODS_FAILED = 'LOAD_PAYMENT_METHODS_FAILED';
exports.LOAD_PAYMENT_METHOD_REQUESTED = 'LOAD_PAYMENT_METHOD_REQUESTED';
exports.LOAD_PAYMENT_METHOD_SUCCEEDED = 'LOAD_PAYMENT_METHOD_SUCCEEDED';
exports.LOAD_PAYMENT_METHOD_FAILED = 'LOAD_PAYMENT_METHOD_FAILED';
exports.INITIALIZE_PAYMENT_METHOD_REQUESTED = 'INITIALIZE_PAYMENT_METHOD_REQUESTED';
exports.INITIALIZE_PAYMENT_METHOD_SUCCEEDED = 'INITIALIZE_PAYMENT_METHOD_SUCCEEDED';
exports.INITIALIZE_PAYMENT_METHOD_FAILED = 'INITIALIZE_PAYMENT_METHOD_FAILED';


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.HOSTED = 'PAYMENT_TYPE_HOSTED';
exports.OFFLINE = 'PAYMENT_TYPE_OFFLINE';


/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = require("@bigcommerce/script-loader");

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIALIZE_REMOTE_BILLING_REQUESTED = 'INITIALIZE_REMOTE_BILLING_REQUESTED';
exports.INITIALIZE_REMOTE_BILLING_SUCCEEDED = 'INITIALIZE_REMOTE_BILLING_SUCCEEDED';
exports.INITIALIZE_REMOTE_BILLING_FAILED = 'INITIALIZE_REMOTE_BILLING_FAILED';
exports.INITIALIZE_REMOTE_SHIPPING_REQUESTED = 'INITIALIZE_REMOTE_SHIPPING_REQUESTED';
exports.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED = 'INITIALIZE_REMOTE_SHIPPING_SUCCEEDED';
exports.INITIALIZE_REMOTE_SHIPPING_FAILED = 'INITIALIZE_REMOTE_SHIPPING_FAILED';
exports.INITIALIZE_REMOTE_PAYMENT_REQUESTED = 'INITIALIZE_REMOTE_PAYMENT_REQUESTED';
exports.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED = 'INITIALIZE_REMOTE_PAYMENT_SUCCEEDED';
exports.INITIALIZE_REMOTE_PAYMENT_FAILED = 'INITIALIZE_REMOTE_PAYMENT_FAILED';
exports.LOAD_REMOTE_SETTINGS_REQUESTED = 'LOAD_REMOTE_SETTINGS_REQUESTED';
exports.LOAD_REMOTE_SETTINGS_SUCCEEDED = 'LOAD_REMOTE_SETTINGS_SUCCEEDED';
exports.LOAD_REMOTE_SETTINGS_FAILED = 'LOAD_REMOTE_SETTINGS_FAILED';
exports.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED = 'SIGN_OUT_REMOTE_CUSTOMER_REQUESTED';
exports.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED = 'SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED';
exports.SIGN_OUT_REMOTE_CUSTOMER_FAILED = 'SIGN_OUT_REMOTE_CUSTOMER_FAILED';
exports.UPDATE_REMOTE_CHECKOUT = 'UPDATE_REMOTE_CHECKOUT';


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var amazon_pay_script_loader_1 = __webpack_require__(154);
exports.AmazonPayScriptLoader = amazon_pay_script_loader_1.default;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var registry_1 = __webpack_require__(163);
exports.Registry = registry_1.default;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var braintree_credit_card_payment_strategy_1 = __webpack_require__(164);
exports.BraintreeCreditCardPaymentStrategy = braintree_credit_card_payment_strategy_1.default;
var braintree_payment_processor_1 = __webpack_require__(65);
exports.BraintreePaymentProcessor = braintree_payment_processor_1.default;
var braintree_paypal_payment_strategy_1 = __webpack_require__(167);
exports.BraintreePaypalPaymentStrategy = braintree_paypal_payment_strategy_1.default;
var braintree_visacheckout_payment_processor_1 = __webpack_require__(66);
exports.BraintreeVisaCheckoutPaymentProcessor = braintree_visacheckout_payment_processor_1.default;
var create_braintree_payment_processor_1 = __webpack_require__(168);
exports.createBraintreePaymentProcessor = create_braintree_payment_processor_1.default;
var create_braintree_visacheckout_payment_processor_1 = __webpack_require__(169);
exports.createBraintreeVisaCheckoutPaymentProcessor = create_braintree_visacheckout_payment_processor_1.default;
var visacheckout_script_loader_1 = __webpack_require__(170);
exports.VisaCheckoutScriptLoader = visacheckout_script_loader_1.default;
var braintree_visacheckout_payment_strategy_1 = __webpack_require__(171);
exports.BraintreeVisaCheckoutPaymentStrategy = braintree_visacheckout_payment_strategy_1.default;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isVaultedInstrument(instrument) {
    return Boolean(instrument.instrumentId);
}
exports.default = isVaultedInstrument;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ShippingStrategyActionType;
(function (ShippingStrategyActionType) {
    ShippingStrategyActionType["UpdateAddressFailed"] = "SHIPPING_STRATEGY_UPDATE_ADDRESS_FAILED";
    ShippingStrategyActionType["UpdateAddressRequested"] = "SHIPPING_STRATEGY_UPDATE_ADDRESS_REQUESTED";
    ShippingStrategyActionType["UpdateAddressSucceeded"] = "SHIPPING_STRATEGY_UPDATE_ADDRESS_SUCCEEDED";
    ShippingStrategyActionType["SelectOptionFailed"] = "SHIPPING_STRATEGY_SELECT_OPTION_FAILED";
    ShippingStrategyActionType["SelectOptionRequested"] = "SHIPPING_STRATEGY_SELECT_OPTION_REQUESTED";
    ShippingStrategyActionType["SelectOptionSucceeded"] = "SHIPPING_STRATEGY_SELECT_OPTION_SUCCEEDED";
    ShippingStrategyActionType["InitializeFailed"] = "SHIPPING_STRATEGY_INITIALIZE_FAILED";
    ShippingStrategyActionType["InitializeRequested"] = "SHIPPING_STRATEGY_INITIALIZE_REQUESTED";
    ShippingStrategyActionType["InitializeSucceeded"] = "SHIPPING_STRATEGY_INITIALIZE_SUCCEEDED";
    ShippingStrategyActionType["DeinitializeFailed"] = "SHIPPING_STRATEGY_DEINITIALIZE_FAILED";
    ShippingStrategyActionType["DeinitializeRequested"] = "SHIPPING_STRATEGY_DEINITIALIZE_REQUESTED";
    ShippingStrategyActionType["DeinitializeSucceeded"] = "SHIPPING_STRATEGY_DEINITIALIZE_SUCCEEDED";
})(ShippingStrategyActionType = exports.ShippingStrategyActionType || (exports.ShippingStrategyActionType = {}));


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ShippingStrategy = /** @class */ (function () {
    function ShippingStrategy(_store) {
        this._store = _store;
        this._isInitialized = false;
    }
    ShippingStrategy.prototype.initialize = function (options) {
        this._isInitialized = true;
        return Promise.resolve(this._store.getState());
    };
    ShippingStrategy.prototype.deinitialize = function (options) {
        this._isInitialized = false;
        return Promise.resolve(this._store.getState());
    };
    return ShippingStrategy;
}());
exports.default = ShippingStrategy;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var instrument_action_creator_1 = __webpack_require__(245);
exports.InstrumentActionCreator = instrument_action_creator_1.default;
var instrument_request_sender_1 = __webpack_require__(249);
exports.InstrumentRequestSender = instrument_request_sender_1.default;
var instrument_selector_1 = __webpack_require__(251);
exports.InstrumentSelector = instrument_selector_1.default;
var instrument_reducer_1 = __webpack_require__(252);
exports.instrumentReducer = instrument_reducer_1.default;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_INCLUDES = [
    'cart.lineItems.physicalItems.options',
    'cart.lineItems.digitalItems.options',
    'customer',
    'payments',
    'promotions.banners',
];
exports.default = DEFAULT_INCLUDES;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var concat_1 = __webpack_require__(22);
var defer_1 = __webpack_require__(48);
var merge_1 = __webpack_require__(94);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var checkout_actions_1 = __webpack_require__(31);
var CheckoutActionCreator = /** @class */ (function () {
    function CheckoutActionCreator(_checkoutRequestSender, _configActionCreator) {
        this._checkoutRequestSender = _checkoutRequestSender;
        this._configActionCreator = _configActionCreator;
    }
    CheckoutActionCreator.prototype.loadCheckout = function (id, options) {
        var _this = this;
        return function (store) { return merge_1.merge(_this._configActionCreator.loadConfig()(store), _this._loadCheckout(id)); };
    };
    CheckoutActionCreator.prototype.loadDefaultCheckout = function (options) {
        var _this = this;
        return function (store) { return concat_1.concat(_this._configActionCreator.loadConfig()(store), defer_1.defer(function () {
            var state = store.getState();
            var context = state.config.getContextConfig();
            if (!context || !context.checkoutId) {
                throw new errors_1.StandardError('Unable to load checkout: no cart is available');
            }
            return _this._loadCheckout(context.checkoutId, options);
        })); };
    };
    CheckoutActionCreator.prototype.updateCheckout = function (body, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(checkout_actions_1.CheckoutActionType.UpdateCheckoutRequested));
            _this._checkoutRequestSender.updateCheckout(checkout.id, body, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(checkout_actions_1.CheckoutActionType.UpdateCheckoutSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(checkout_actions_1.CheckoutActionType.UpdateCheckoutFailed, response));
            });
        }); };
    };
    CheckoutActionCreator.prototype.loadCurrentCheckout = function (options) {
        var _this = this;
        return function (store) { return defer_1.defer(function () {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            return _this._loadCheckout(checkout.id, options);
        }); };
    };
    CheckoutActionCreator.prototype._loadCheckout = function (id, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(checkout_actions_1.CheckoutActionType.LoadCheckoutRequested));
            _this._checkoutRequestSender.loadCheckout(id, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(checkout_actions_1.CheckoutActionType.LoadCheckoutFailed, response));
            });
        });
    };
    return CheckoutActionCreator;
}());
exports.default = CheckoutActionCreator;


/***/ }),
/* 48 */
/***/ (function(module, exports) {

module.exports = require("rxjs/observable/defer");

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isPrivate(key) {
    return ("" + key).indexOf('$$') === 0 || ("" + key).indexOf('_') === 0;
}
exports.default = isPrivate;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
function omitDeep(object, predicate) {
    if (Array.isArray(object)) {
        return object.map(function (value) { return omitDeep(value, predicate); });
    }
    if (typeof object === 'object') {
        return lodash_1.transform(lodash_1.omitBy(object, predicate), function (result, value, key) {
            result[key] = omitDeep(value, predicate);
        }, {});
    }
    return object;
}
exports.default = omitDeep;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @deprecated Use request senders directly
 */
var CheckoutClient = /** @class */ (function () {
    /**
     * @internal
     */
    function CheckoutClient(_billingAddressRequestSender, _countryRequestSender, _customerRequestSender, _orderRequestSender, _paymentMethodRequestSender, _shippingCountryRequestSender) {
        this._billingAddressRequestSender = _billingAddressRequestSender;
        this._countryRequestSender = _countryRequestSender;
        this._customerRequestSender = _customerRequestSender;
        this._orderRequestSender = _orderRequestSender;
        this._paymentMethodRequestSender = _paymentMethodRequestSender;
        this._shippingCountryRequestSender = _shippingCountryRequestSender;
    }
    CheckoutClient.prototype.loadOrder = function (orderId, options) {
        return this._orderRequestSender.loadOrder(orderId, options);
    };
    CheckoutClient.prototype.submitOrder = function (body, options) {
        return this._orderRequestSender.submitOrder(body, options);
    };
    CheckoutClient.prototype.finalizeOrder = function (orderId, options) {
        return this._orderRequestSender.finalizeOrder(orderId, options);
    };
    CheckoutClient.prototype.loadPaymentMethods = function (options) {
        return this._paymentMethodRequestSender.loadPaymentMethods(options);
    };
    CheckoutClient.prototype.loadPaymentMethod = function (methodId, options) {
        return this._paymentMethodRequestSender.loadPaymentMethod(methodId, options);
    };
    CheckoutClient.prototype.loadCountries = function (options) {
        return this._countryRequestSender.loadCountries(options);
    };
    CheckoutClient.prototype.loadShippingCountries = function (options) {
        return this._shippingCountryRequestSender.loadCountries(options);
    };
    CheckoutClient.prototype.createBillingAddress = function (checkoutId, address, options) {
        return this._billingAddressRequestSender.createAddress(checkoutId, address, options);
    };
    CheckoutClient.prototype.updateBillingAddress = function (checkoutId, address, options) {
        return this._billingAddressRequestSender.updateAddress(checkoutId, address, options);
    };
    CheckoutClient.prototype.signInCustomer = function (credentials, options) {
        return this._customerRequestSender.signInCustomer(credentials, options);
    };
    CheckoutClient.prototype.signOutCustomer = function (options) {
        return this._customerRequestSender.signOutCustomer(options);
    };
    return CheckoutClient;
}());
exports.default = CheckoutClient;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var CheckoutSelector = /** @class */ (function () {
    function CheckoutSelector(_checkout, _billingAddress, _cart, _consignments, _coupons, _customer, _giftCertificates) {
        this._checkout = _checkout;
        this._billingAddress = _billingAddress;
        this._cart = _cart;
        this._consignments = _consignments;
        this._coupons = _coupons;
        this._customer = _customer;
        this._giftCertificates = _giftCertificates;
    }
    CheckoutSelector.prototype.getCheckout = function () {
        var data = this._checkout.data;
        var billingAddress = this._billingAddress.getBillingAddress();
        var cart = this._cart.getCart();
        var customer = this._customer.getCustomer();
        var consignments = this._consignments.getConsignments() || [];
        var coupons = this._coupons.getCoupons() || [];
        var giftCertificates = this._giftCertificates.getGiftCertificates() || [];
        if (!data || !cart || !customer) {
            return;
        }
        return tslib_1.__assign({}, data, { billingAddress: billingAddress,
            cart: cart,
            customer: customer,
            consignments: consignments,
            coupons: coupons,
            giftCertificates: giftCertificates });
    };
    CheckoutSelector.prototype.getLoadError = function () {
        return this._checkout.errors.loadError;
    };
    CheckoutSelector.prototype.isLoading = function () {
        return this._checkout.statuses.isLoading === true;
    };
    CheckoutSelector = tslib_1.__decorate([
        selector_1.selector
    ], CheckoutSelector);
    return CheckoutSelector;
}());
exports.default = CheckoutSelector;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var utility_1 = __webpack_require__(8);
var cache_key_resolver_1 = __webpack_require__(54);
/**
 * Decorates a class by patching all of its methods to cache their return values
 * and return them if they are called again with the same set of parameters. The
 * decorator also binds all the methods to the calling instance so it can be
 * destructed.
 */
function selectorDecorator(target) {
    var decoratedTarget = /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return class_1;
    }(target));
    Object.getOwnPropertyNames(target.prototype)
        .forEach(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
        if (!descriptor || key === 'constructor') {
            return;
        }
        Object.defineProperty(decoratedTarget.prototype, key, selectorMethodDecorator(target.prototype, key, descriptor));
    });
    return decoratedTarget;
}
exports.default = selectorDecorator;
function selectorMethodDecorator(target, key, descriptor) {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }
    var resolver = new cache_key_resolver_1.default();
    var method = descriptor.value;
    var memoizedMethod = lodash_1.memoize(method, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return resolver.getKey.apply(resolver, args);
    });
    return utility_1.bindDecorator(target, key, {
        get: function () {
            var _this = this;
            var value = (function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var cachedValue = memoizedMethod.call.apply(memoizedMethod, [_this].concat(args));
                if (resolver.getUsedCount.apply(resolver, args) === 1) {
                    return cachedValue;
                }
                var newValue = method.call.apply(method, [_this].concat(args));
                if (utility_1.isEqual(newValue, cachedValue, { keyFilter: function (key) { return !utility_1.isPrivate(key); } })) {
                    return cachedValue;
                }
                memoizedMethod.cache.set(resolver.getKey.apply(resolver, args), newValue);
                return newValue;
            });
            Object.defineProperty(this, key, tslib_1.__assign({}, descriptor, { value: value }));
            return value;
        },
        set: function (value) {
            resolver = new cache_key_resolver_1.default();
            method = value;
            memoizedMethod = lodash_1.memoize(method, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return resolver.getKey.apply(resolver, args);
            });
        },
    });
}


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CacheKeyResolver = /** @class */ (function () {
    function CacheKeyResolver() {
        this._lastId = 0;
        this._maps = [];
    }
    CacheKeyResolver.prototype.getKey = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a = this._resolveMap.apply(this, args), index = _a.index, map = _a.map, parentMaps = _a.parentMaps;
        if (map && map.cacheKey) {
            map.usedCount++;
            return map.cacheKey;
        }
        return this._generateKey(parentMaps, args.slice(index));
    };
    CacheKeyResolver.prototype.getUsedCount = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var map = this._resolveMap.apply(this, args).map;
        return map ? map.usedCount : 0;
    };
    CacheKeyResolver.prototype._resolveMap = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var index = 0;
        var parentMaps = this._maps;
        while (parentMaps.length) {
            var isMatched = false;
            for (var _a = 0, parentMaps_1 = parentMaps; _a < parentMaps_1.length; _a++) {
                var map = parentMaps_1[_a];
                if (map.value !== args[index]) {
                    continue;
                }
                if ((args.length === 0 || index === args.length - 1) && map.cacheKey) {
                    return { index: index, map: map, parentMaps: parentMaps };
                }
                isMatched = true;
                parentMaps = map.maps;
                index++;
                break;
            }
            if (!isMatched) {
                break;
            }
        }
        return { index: index, parentMaps: parentMaps };
    };
    CacheKeyResolver.prototype._generateKey = function (maps, args) {
        var index = 0;
        var parentMaps = maps;
        var map;
        do {
            map = {
                usedCount: 1,
                value: args[index],
                maps: [],
            };
            parentMaps.push(map);
            parentMaps = map.maps;
            index++;
        } while (index < args.length);
        map.cacheKey = "" + ++this._lastId;
        return map.cacheKey;
    };
    return CacheKeyResolver;
}());
exports.default = CacheKeyResolver;


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var create_checkout_selectors_1 = __webpack_require__(113);
var create_checkout_service_error_transformer_1 = __webpack_require__(114);
/**
 * Responsible for completing the checkout process for the current customer.
 *
 * This object can be used to collect all information that is required for
 * checkout, such as shipping and billing information. It can also be used to
 * retrieve the current checkout state and subscribe to its changes.
 */
var CheckoutService = /** @class */ (function () {
    /**
     * @internal
     */
    function CheckoutService(_store, _billingAddressActionCreator, _checkoutActionCreator, _configActionCreator, _consignmentActionCreator, _countryActionCreator, _couponActionCreator, _customerStrategyActionCreator, _giftCertificateActionCreator, _instrumentActionCreator, _orderActionCreator, _paymentMethodActionCreator, _paymentStrategyActionCreator, _shippingCountryActionCreator, _shippingStrategyActionCreator) {
        var _this = this;
        this._store = _store;
        this._billingAddressActionCreator = _billingAddressActionCreator;
        this._checkoutActionCreator = _checkoutActionCreator;
        this._configActionCreator = _configActionCreator;
        this._consignmentActionCreator = _consignmentActionCreator;
        this._countryActionCreator = _countryActionCreator;
        this._couponActionCreator = _couponActionCreator;
        this._customerStrategyActionCreator = _customerStrategyActionCreator;
        this._giftCertificateActionCreator = _giftCertificateActionCreator;
        this._instrumentActionCreator = _instrumentActionCreator;
        this._orderActionCreator = _orderActionCreator;
        this._paymentMethodActionCreator = _paymentMethodActionCreator;
        this._paymentStrategyActionCreator = _paymentStrategyActionCreator;
        this._shippingCountryActionCreator = _shippingCountryActionCreator;
        this._shippingStrategyActionCreator = _shippingStrategyActionCreator;
        this._state = create_checkout_selectors_1.default(this._store.getState());
        this._errorTransformer = create_checkout_service_error_transformer_1.default();
        this._store.subscribe(function (state) {
            _this._state = create_checkout_selectors_1.default(state);
        });
    }
    /**
     * Returns a snapshot of the current checkout state.
     *
     * The method returns a new instance every time there is a change in the
     * checkout state. You can query the state by calling any of its getter
     * methods.
     *
     * ```js
     * const state = service.getState();
     *
     * console.log(state.checkout.getOrder());
     * console.log(state.errors.getSubmitOrderError());
     * console.log(state.statuses.isSubmittingOrder());
     * ```
     *
     * @returns The current customer's checkout state
     */
    CheckoutService.prototype.getState = function () {
        return this._state;
    };
    /**
     * Notifies all subscribers with the current state.
     *
     * When this method gets called, the subscribers get called regardless if
     * they have any filters applied.
     */
    CheckoutService.prototype.notifyState = function () {
        this._store.notifyState();
    };
    /**
     * Subscribes to any changes to the current state.
     *
     * The method registers a callback function and executes it every time there
     * is a change in the checkout state.
     *
     * ```js
     * service.subscribe(state => {
     *     console.log(state.checkout.getCart());
     * });
     * ```
     *
     * The method can be configured to notify subscribers only regarding
     * relevant changes, by providing a filter function.
     *
     * ```js
     * const filter = state => state.checkout.getCart();
     *
     * // Only trigger the subscriber when the cart changes.
     * service.subscribe(state => {
     *     console.log(state.checkout.getCart())
     * }, filter);
     * ```
     *
     * @param subscriber - The function to subscribe to state changes.
     * @param filters - One or more functions to filter out irrelevant state
     * changes. If more than one function is provided, the subscriber will only
     * be triggered if all conditions are met.
     * @returns A function, if called, will unsubscribe the subscriber.
     */
    CheckoutService.prototype.subscribe = function (subscriber) {
        var _this = this;
        var filters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filters[_i - 1] = arguments[_i];
        }
        var _a;
        return (_a = this._store).subscribe.apply(_a, [function () { return subscriber(_this.getState()); }].concat(filters.map(function (filter) { return function (state) { return filter(create_checkout_selectors_1.default(state)); }; })));
    };
    /**
     * Loads the current checkout.
     *
     * This method can only be called if there is an active checkout. Also, it
     * can only retrieve data that belongs to the current customer. When it is
     * successfully executed, you can retrieve the data by calling
     * `CheckoutStoreSelector#getCheckout`.
     *
     * ```js
     * const state = await service.loadCheckout('0cfd6c06-57c3-4e29-8d7a-de55cc8a9052');
     *
     * console.log(state.checkout.getCheckout());
     * ```
     *
     * @param id - The identifier of the checkout to load, or the default checkout if not provided.
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadCheckout = function (id, options) {
        return this._dispatch(id ?
            this._checkoutActionCreator.loadCheckout(id, options) :
            this._checkoutActionCreator.loadDefaultCheckout(options));
    };
    /**
     * Updates specific properties of the current checkout.
     *
     * ```js
     * const state = await service.updateCheckout(checkout);
     *
     * console.log(state.checkout.getCheckout());
     * ```
     *
     * @param payload - The checkout properties to be updated.
     * @param options - Options for loading the current checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.updateCheckout = function (payload, options) {
        var action = this._checkoutActionCreator.updateCheckout(payload, options);
        return this._dispatch(action);
    };
    /**
     * Loads an order by an id.
     *
     * The method can only retrieve an order if the order belongs to the current
     * customer. If it is successfully executed, the data can be retrieved by
     * calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.loadOrder(123);
     *
     * console.log(state.checkout.getOrder());
     * ```
     *
     * @param orderId - The identifier of the order to load.
     * @param options - Options for loading the order.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadOrder = function (orderId, options) {
        var _this = this;
        var loadCheckoutAction = this._orderActionCreator.loadOrder(orderId, options);
        var loadConfigAction = this._configActionCreator.loadConfig(options);
        return Promise.all([
            this._dispatch(loadCheckoutAction),
            this._dispatch(loadConfigAction, { queueId: 'config' }),
        ])
            .then(function () { return _this.getState(); });
    };
    /**
     * Submits an order, thereby completing a checkout process.
     *
     * Before you can submit an order, you must initialize the payment method
     * chosen by the customer by calling `CheckoutService#initializePayment`.
     *
     * ```js
     * await service.initializePayment({ methodId: 'braintree' });
     * await service.submitOrder({
     *     methodId: 'braintree',
     *     payment: {
     *         paymentData: {
     *             ccExpiry: { month: 10, year: 20 },
     *             ccName: 'BigCommerce',
     *             ccNumber: '4111111111111111',
     *             ccType: 'visa',
     *             ccCvv: 123,
     *         },
     *     },
     * });
     * ```
     *
     * You are not required to include `paymentData` if the order does not
     * require additional payment details. For example, the customer has already
     * entered their payment details on the cart page using one of the hosted
     * payment methods, such as PayPal. Or the customer has applied a gift
     * certificate that exceeds the grand total amount.
     *
     * If the order is submitted successfully, you can retrieve the newly
     * created order by calling `CheckoutStoreSelector#getOrder`.
     *
     * ```js
     * const state = await service.submitOrder(payload);
     *
     * console.log(state.checkout.getOrder());
     * ```
     *
     * @param payload - The request payload to submit for the current order.
     * @param options - Options for submitting the current order.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.submitOrder = function (payload, options) {
        var action = this._paymentStrategyActionCreator.execute(payload, options);
        return this._dispatch(action, { queueId: 'paymentStrategy' });
    };
    /**
     * Finalizes the submission process for an order.
     *
     * This method is only required for certain hosted payment methods that
     * require a customer to enter their credit card details on their website.
     * You need to call this method once the customer has redirected back to
     * checkout in order to complete the checkout process.
     *
     * If the method is called before order finalization is required or for a
     * payment method that does not require order finalization, an error will be
     * thrown. Conversely, if the method is called successfully, you should
     * immediately redirect the customer to the order confirmation page.
     *
     * ```js
     * try {
     *     await service.finalizeOrderIfNeeded();
     *
     *     window.location.assign('/order-confirmation');
     * } catch (error) {
     *     if (error.type !== 'order_finalization_not_required') {
     *         throw error;
     *     }
     * }
     * ```
     *
     * @param options - Options for finalizing the current order.
     * @returns A promise that resolves to the current state.
     * @throws `OrderFinalizationNotRequiredError` error if order finalization
     * is not required for the current order at the time of execution.
     */
    CheckoutService.prototype.finalizeOrderIfNeeded = function (options) {
        var action = this._paymentStrategyActionCreator.finalize(options);
        return this._dispatch(action, { queueId: 'paymentStrategy' });
    };
    /**
     * Loads a list of payment methods available for checkout.
     *
     * If a customer enters their payment details before navigating to the
     * checkout page (i.e.: using PayPal checkout button on the cart page), only
     * one payment method will be available for the customer - the selected
     * payment method. Otherwise, by default, all payment methods configured by
     * the merchant will be available for the customer.
     *
     * Once the method is executed successfully, you can call
     * `CheckoutStoreSelector#getPaymentMethods` to retrieve the list of payment
     * methods.
     *
     * ```js
     * const state = service.loadPaymentMethods();
     *
     * console.log(state.checkout.getPaymentMethods());
     * ```
     *
     * @param options - Options for loading the payment methods that are
     * available to the current customer.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadPaymentMethods = function (options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethods(options);
        return this._dispatch(action, { queueId: 'paymentMethods' });
    };
    /**
     * Loads a payment method by an id.
     *
     * This method does not work with multi-option payment providers. Due to its
     * limitation, it is deprecated and will be removed in the future.
     *
     * @deprecated
     * @internal
     * @param methodId - The identifier for the payment method to load.
     * @param options - Options for loading the payment method.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadPaymentMethod = function (methodId, options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);
        return this._dispatch(action, { queueId: 'paymentMethods' });
    };
    /**
     * Initializes the payment step of a checkout process.
     *
     * Before a payment method can accept payment details, it must first be
     * initialized. Some payment methods require you to provide additional
     * initialization options. For example, Amazon requires a container ID in
     * order to initialize their payment widget.
     *
     * ```js
     * await service.initializePayment({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'walletWidget',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the payment step of checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.initializePayment = function (options) {
        var action = this._paymentStrategyActionCreator.initialize(options);
        return this._dispatch(action, { queueId: 'paymentStrategy' });
    };
    /**
     * De-initializes the payment step of a checkout process.
     *
     * The method should be called once you no longer require a payment method
     * to be initialized. It can perform any necessary clean-up behind the
     * scene, i.e.: remove DOM nodes or event handlers that are attached as a
     * result of payment initialization.
     *
     * ```js
     * await service.deinitializePayment({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the payment step of checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.deinitializePayment = function (options) {
        var action = this._paymentStrategyActionCreator.deinitialize(options);
        return this._dispatch(action, { queueId: 'paymentStrategy' });
    };
    /**
     * Loads a list of countries available for billing.
     *
     * Once you make a successful request, you will be able to retrieve the list
     * of countries by calling `CheckoutStoreSelector#getBillingCountries`.
     *
     * ```js
     * const state = await service.loadBillingCountries();
     *
     * console.log(state.checkout.getBillingCountries());
     * ```
     *
     * @param options - Options for loading the available billing countries.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadBillingCountries = function (options) {
        var action = this._countryActionCreator.loadCountries(options);
        return this._dispatch(action, { queueId: 'billingCountries' });
    };
    /**
     * Loads a list of countries available for shipping.
     *
     * The list is determined based on the shipping zones configured by a
     * merchant. Once you make a successful call, you will be able to retrieve
     * the list of available shipping countries by calling
     * `CheckoutStoreSelector#getShippingCountries`.
     *
     * ```js
     * const state = await service.loadShippingCountries();
     *
     * console.log(state.checkout.getShippingCountries());
     * ```
     *
     * @param options - Options for loading the available shipping countries.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadShippingCountries = function (options) {
        var action = this._shippingCountryActionCreator.loadCountries(options);
        return this._dispatch(action, { queueId: 'shippingCountries' });
    };
    /**
     * Loads a set of form fields that should be presented to customers in order
     * to capture their billing address.
     *
     * Once the method has been executed successfully, you can call
     * `CheckoutStoreSelector#getBillingAddressFields` to retrieve the set of
     * form fields.
     *
     * ```js
     * const state = service.loadBillingAddressFields();
     *
     * console.log(state.checkout.getBillingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the billing address form fields.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadBillingAddressFields = function (options) {
        return this.loadBillingCountries(options);
    };
    /**
     * Loads a set of form fields that should be presented to customers in order
     * to capture their shipping address.
     *
     * Once the method has been executed successfully, you can call
     * `CheckoutStoreSelector#getShippingAddressFields` to retrieve the set of
     * form fields.
     *
     * ```js
     * const state = service.loadShippingAddressFields();
     *
     * console.log(state.checkout.getShippingAddressFields('US'));
     * ```
     *
     * @param options - Options for loading the shipping address form fields.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadShippingAddressFields = function (options) {
        return this.loadShippingCountries(options);
    };
    /**
     * Initializes the sign-in step of a checkout process.
     *
     * Some payment methods, such as Amazon, have their own sign-in flow. In
     * order to support them, this method must be called.
     *
     * ```js
     * await service.initializeCustomer({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'signInButton',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the customer step of checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.initializeCustomer = function (options) {
        var action = this._customerStrategyActionCreator.initialize(options);
        return this._dispatch(action, { queueId: 'customerStrategy' });
    };
    /**
     * De-initializes the sign-in step of a checkout process.
     *
     * It should be called once you no longer want to prompt customers to sign
     * in. It can perform any necessary clean-up behind the scene, i.e.: remove
     * DOM nodes or event handlers that are attached as a result of customer
     * initialization.
     *
     * ```js
     * await service.deinitializeCustomer({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the customer step of checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.deinitializeCustomer = function (options) {
        var action = this._customerStrategyActionCreator.deinitialize(options);
        return this._dispatch(action, { queueId: 'customerStrategy' });
    };
    /**
     * Continues to check out as a guest.
     *
     * The customer is required to provide their email address in order to
     * continue. Once they provide their email address, it will be stored as a
     * part of their billing address.
     *
     * @param credentials - The guest credentials to use.
     * @param options - Options for continuing as a guest.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.continueAsGuest = function (credentials, options) {
        var action = this._billingAddressActionCreator.updateAddress(credentials, options);
        return this._dispatch(action);
    };
    /**
     * Signs into a customer's registered account.
     *
     * Once the customer is signed in successfully, the checkout state will be
     * populated with information associated with the customer, such as their
     * saved addresses. You can call `CheckoutStoreSelector#getCustomer` to
     * retrieve the data.
     *
     * ```js
     * const state = await service.signInCustomer({
     *     email: 'foo@bar.com',
     *     password: 'password123',
     * });
     *
     * console.log(state.checkout.getCustomer());
     * ```
     *
     * @param credentials - The credentials to be used for signing in the customer.
     * @param options - Options for signing in the customer.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.signInCustomer = function (credentials, options) {
        var action = this._customerStrategyActionCreator.signIn(credentials, options);
        return this._dispatch(action, { queueId: 'customerStrategy' });
    };
    /**
     * Signs out the current customer if they are previously signed in.
     *
     * Once the customer is successfully signed out, the checkout state will be
     * reset automatically.
     *
     * ```js
     * const state = await service.signOutCustomer();
     *
     * // The returned object should not contain information about the previously signed-in customer.
     * console.log(state.checkout.getCustomer());
     * ```
     *
     * @param options - Options for signing out the customer.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.signOutCustomer = function (options) {
        var action = this._customerStrategyActionCreator.signOut(options);
        return this._dispatch(action, { queueId: 'customerStrategy' });
    };
    /**
     * Loads a list of shipping options available for checkout.
     *
     * Available shipping options can only be determined once a customer
     * provides their shipping address. If the method is executed successfully,
     * `CheckoutStoreSelector#getShippingOptions` can be called to retrieve the
     * list of shipping options.
     *
     * ```js
     * const state = await service.loadShippingOptions();
     *
     * console.log(state.checkout.getShippingOptions());
     * ```
     *
     * @param options - Options for loading the available shipping options.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadShippingOptions = function (options) {
        var action = this._consignmentActionCreator.loadShippingOptions(options);
        return this._dispatch(action);
    };
    /**
     * Initializes the shipping step of a checkout process.
     *
     * Some payment methods, such as Amazon, can provide shipping information to
     * be used for checkout. In order to support them, this method must be
     * called.
     *
     * ```js
     * await service.initializeShipping({
     *     methodId: 'amazon',
     *     amazon: {
     *         container: 'addressBook',
     *     },
     * });
     * ```
     *
     * @param options - Options for initializing the shipping step of checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.initializeShipping = function (options) {
        var action = this._shippingStrategyActionCreator.initialize(options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * De-initializes the shipping step of a checkout process.
     *
     * It should be called once you no longer need to collect shipping details.
     * It can perform any necessary clean-up behind the scene, i.e.: remove DOM
     * nodes or event handlers that are attached as a result of shipping
     * initialization.
     *
     * ```js
     * await service.deinitializeShipping({
     *     methodId: 'amazon',
     * });
     * ```
     *
     * @param options - Options for deinitializing the shipping step of checkout.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.deinitializeShipping = function (options) {
        var action = this._shippingStrategyActionCreator.deinitialize(options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * Selects a shipping option for the current address.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectShippingOption('address-id', 'shipping-option-id');
     *
     * console.log(state.checkout.getSelectedShippingOption());
     * ```
     *
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.selectShippingOption = function (shippingOptionId, options) {
        var action = this._shippingStrategyActionCreator.selectOption(shippingOptionId, options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * Updates the shipping address for the current checkout.
     *
     * When a customer updates their shipping address for an order, they will
     * see an updated list of shipping options and the cost for each option,
     * unless no options are available. If the update is successful, you can
     * call `CheckoutStoreSelector#getShippingAddress` to retrieve the address.
     *
     * If the shipping address changes and the selected shipping option becomes
     * unavailable for the updated address, the shipping option will be
     * deselected.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateShippingAddress(address);
     *
     * console.log(state.checkout.getShippingAddress());
     * ```
     *
     * @param address - The address to be used for shipping.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.updateShippingAddress = function (address, options) {
        var action = this._shippingStrategyActionCreator.updateAddress(address, options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * Creates consignments given a list.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#updateShippingAddress`.
     *
     * When consignments are created, an updated list of shipping options will
     * become available for each consignment, unless no options are available.
     * If the update is successful, you can call
     * `CheckoutStoreSelector#getConsignments` to retrieve the updated list of
     * consignments.'
     *
     * Beware that if a consignment includes all line items from another
     * consignment, that consignment will be deleted as a valid consignment must
     * include at least one valid line item.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.createConsignments(consignments, address);
     *
     * console.log(state.checkout.getConsignments());
     * ```
     *
     * @param consignments - The list of consignments to be created.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.createConsignments = function (consignments, options) {
        var action = this._consignmentActionCreator.createConsignments(consignments, options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * Updates a specific consignment.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#selectShippingOption`.
     *
     * When a shipping address for a consignment is updated, an updated list of
     * shipping options will become available for the consignment, unless no
     * options are available. If the update is successful, you can call
     * `CheckoutStoreSelector#getConsignments` to retrieve updated list of
     * consignments.
     *
     * Beware that if the updated consignment includes all line items from another
     * consignment, that consignment will be deleted as a valid consignment must
     * include at least one valid line item.
     *
     * If the shipping address changes and the selected shipping option becomes
     * unavailable for the updated address, the shipping option will be
     * deselected.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateConsignment(consignmentId, address);
     *
     * console.log(state.checkout.getConsignments());
     * ```
     *
     * @param consignment - The consignment data that will be used.
     * @param options - Options for updating the shipping address.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.updateConsignment = function (consignment, options) {
        var action = this._consignmentActionCreator.updateConsignment(consignment, options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * Selects a shipping option for a given consignment.
     *
     * Note: this is used when items need to be shipped to multiple addresses,
     * for single shipping address, use `CheckoutService#updateShippingAddres`.
     *
     * If a shipping option has an additional cost, the quote for the current
     * order will be adjusted once the option is selected.
     *
     * ```js
     * const state = await service.selectConsignmentShippingOption(consignmentId, optionId);
     *
     * console.log(state.checkout.getConsignments());
     * ```
     *
     * @param consignmentId - The identified of the consignment to be updated.
     * @param shippingOptionId - The identifier of the shipping option to
     * select.
     * @param options - Options for selecting the shipping option.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.selectConsignmentShippingOption = function (consignmentId, shippingOptionId, options) {
        var action = this._consignmentActionCreator.updateConsignment({
            id: consignmentId,
            shippingOptionId: shippingOptionId,
        }, options);
        return this._dispatch(action, { queueId: 'shippingStrategy' });
    };
    /**
     * Updates the billing address for the current checkout.
     *
     * A customer must provide their billing address before they can proceed to
     * pay for their order.
     *
     * You can submit an address that is partially complete. The address does
     * not get validated until you submit the order.
     *
     * ```js
     * const state = await service.updateBillingAddress(address);
     *
     * console.log(state.checkout.getBillingAddress());
     * ```
     *
     * @param address - The address to be used for billing.
     * @param options - Options for updating the billing address.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.updateBillingAddress = function (address, options) {
        if (options === void 0) { options = {}; }
        var action = this._billingAddressActionCreator.updateAddress(address, options);
        return this._dispatch(action);
    };
    /**
     * Applies a coupon code to the current checkout.
     *
     * Once the coupon code gets applied, the quote for the current checkout will
     * be adjusted accordingly. The same coupon code cannot be applied more than
     * once.
     *
     * ```js
     * await service.applyCoupon('COUPON');
     * ```
     *
     * @param code - The coupon code to apply to the current checkout.
     * @param options - Options for applying the coupon code.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.applyCoupon = function (code, options) {
        var action = this._couponActionCreator.applyCoupon(code, options);
        return this._dispatch(action);
    };
    /**
     * Removes a coupon code from the current checkout.
     *
     * Once the coupon code gets removed, the quote for the current checkout will
     * be adjusted accordingly.
     *
     * ```js
     * await service.removeCoupon('COUPON');
     * ```
     *
     * @param code - The coupon code to remove from the current checkout.
     * @param options - Options for removing the coupon code.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.removeCoupon = function (code, options) {
        var action = this._couponActionCreator.removeCoupon(code, options);
        return this._dispatch(action);
    };
    /**
     * Applies a gift certificate to the current checkout.
     *
     * Once the gift certificate gets applied, the quote for the current
     * checkout will be adjusted accordingly.
     *
     * ```js
     * await service.applyGiftCertificate('GIFT_CERTIFICATE');
     * ```
     *
     * @param code - The gift certificate to apply to the current checkout.
     * @param options - Options for applying the gift certificate.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.applyGiftCertificate = function (code, options) {
        var action = this._giftCertificateActionCreator.applyGiftCertificate(code, options);
        return this._dispatch(action);
    };
    /**
     * Removes a gift certificate from an order.
     *
     * Once the gift certificate gets removed, the quote for the current
     * checkout will be adjusted accordingly.
     *
     * ```js
     * await service.removeGiftCertificate('GIFT_CERTIFICATE');
     * ```
     *
     * @param code - The gift certificate to remove from the current checkout.
     * @param options - Options for removing the gift certificate.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.removeGiftCertificate = function (code, options) {
        var action = this._giftCertificateActionCreator.removeGiftCertificate(code, options);
        return this._dispatch(action);
    };
    /**
     * Loads a list of payment instruments associated with a customer.
     *
     * Once the method has been called successfully, you can retrieve the list
     * of payment instruments by calling `CheckoutStoreSelector#getInstruments`.
     * If the customer does not have any payment instruments on record, i.e.:
     * credit card, you will get an empty list instead.
     *
     * ```js
     * const state = service.loadInstruments();
     *
     * console.log(state.checkout.getInstruments());
     * ```
     *
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.loadInstruments = function () {
        var action = this._instrumentActionCreator.loadInstruments();
        return this._dispatch(action);
    };
    /**
     * Deletes a payment instrument by an id.
     *
     * Once an instrument gets removed, it can no longer be retrieved using
     * `CheckoutStoreSelector#getInstruments`.
     *
     * ```js
     * const state = service.deleteInstrument('123');
     *
     * console.log(state.checkout.getInstruments());
     * ```
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype.deleteInstrument = function (instrumentId) {
        var action = this._instrumentActionCreator.deleteInstrument(instrumentId);
        return this._dispatch(action);
    };
    /**
     * Dispatches an action through the data store and returns the current state
     * once the action is dispatched.
     *
     * @param action - The action to dispatch.
     * @returns A promise that resolves to the current state.
     */
    CheckoutService.prototype._dispatch = function (action, options) {
        var _this = this;
        return this._store.dispatch(action, options)
            .then(function () { return _this.getState(); })
            .catch(function (error) {
            throw _this._errorTransformer.transform(error);
        });
    };
    return CheckoutService;
}());
exports.default = CheckoutService;


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var create_request_error_factory_1 = __webpack_require__(115);
exports.createRequestErrorFactory = create_request_error_factory_1.default;
var error_message_transformer_1 = __webpack_require__(119);
exports.ErrorMessageTransformer = error_message_transformer_1.default;
var request_error_factory_1 = __webpack_require__(57);
exports.RequestErrorFactory = request_error_factory_1.default;


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
var errors_1 = __webpack_require__(1);
var RequestErrorFactory = /** @class */ (function () {
    function RequestErrorFactory() {
        this._factoryMethods = {};
        this.register('default', function (response, message) { return new errors_1.RequestError(response, message); });
        this.register('timeout', function (response) { return new errors_1.TimeoutError(response); });
    }
    RequestErrorFactory.prototype.register = function (type, factoryMethod) {
        this._factoryMethods[type] = factoryMethod;
    };
    RequestErrorFactory.prototype.createError = function (response, message) {
        var factoryMethod = this._factoryMethods[this._getType(response)] || this._factoryMethods.default;
        return factoryMethod(response, message);
    };
    RequestErrorFactory.prototype._getType = function (response) {
        if (response.status === 0) {
            return 'timeout';
        }
        if (response.body && typeof response.body.type === 'string') {
            return lodash_1.last(response.body.type.split('/')) || 'default';
        }
        var error = lodash_1.last(response.body && response.body.errors);
        return error && error.code ? error.code : 'default';
    };
    return RequestErrorFactory;
}());
exports.default = RequestErrorFactory;


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
var cart_1 = __webpack_require__(9);
var errors_1 = __webpack_require__(236);
var errors_2 = __webpack_require__(1);
var CheckoutValidator = /** @class */ (function () {
    function CheckoutValidator(_checkoutRequestSender) {
        this._checkoutRequestSender = _checkoutRequestSender;
    }
    CheckoutValidator.prototype.validate = function (checkout, options) {
        var _this = this;
        if (!checkout) {
            throw new errors_2.MissingDataError(errors_2.MissingDataErrorType.MissingCheckout);
        }
        return this._checkoutRequestSender.loadCheckout(checkout.id, options)
            .then(function (response) {
            var comparator = new cart_1.CartComparator();
            if (checkout.grandTotal === response.body.grandTotal
                && _this._compareCoupons(checkout.coupons, response.body.coupons)
                && _this._compareGiftCertificates(checkout.giftCertificates, response.body.giftCertificates)
                && comparator.isEqual(checkout.cart, response.body.cart)) {
                return;
            }
            throw new errors_1.CartChangedError();
        });
    };
    CheckoutValidator.prototype._compareCoupons = function (couponsA, couponsB) {
        return lodash_1.isEqual(lodash_1.map(couponsA, 'code'), lodash_1.map(couponsB, 'code'));
    };
    CheckoutValidator.prototype._compareGiftCertificates = function (giftCertificatesA, giftCertificatesB) {
        return lodash_1.isEqual(lodash_1.map(giftCertificatesA, 'code'), lodash_1.map(giftCertificatesB, 'code'));
    };
    return CheckoutValidator;
}());
exports.default = CheckoutValidator;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
var coupon_1 = __webpack_require__(19);
var promotion_1 = __webpack_require__(234);
var _1 = __webpack_require__(9);
var map_to_internal_line_items_1 = __webpack_require__(85);
function mapToInternalCart(checkout) {
    var decimalPlaces = checkout.cart.currency.decimalPlaces;
    var amountTransformer = new _1.AmountTransformer(decimalPlaces);
    return {
        id: checkout.cart.id,
        items: map_to_internal_line_items_1.default(checkout.cart.lineItems, decimalPlaces),
        currency: checkout.cart.currency.code,
        coupon: {
            discountedAmount: lodash_1.reduce(checkout.cart.coupons, function (sum, coupon) {
                return sum + coupon.discountedAmount;
            }, 0),
            coupons: checkout.cart.coupons.map(coupon_1.mapToInternalCoupon),
        },
        discount: {
            amount: checkout.cart.discountAmount,
            integerAmount: amountTransformer.toInteger(checkout.cart.discountAmount),
        },
        discountNotifications: promotion_1.mapToDiscountNotifications(checkout.promotions),
        giftCertificate: {
            totalDiscountedAmount: lodash_1.reduce(checkout.giftCertificates, function (sum, certificate) {
                return sum + certificate.used;
            }, 0),
            appliedGiftCertificates: lodash_1.keyBy(checkout.giftCertificates.map(coupon_1.mapToInternalGiftCertificate), 'code'),
        },
        shipping: {
            amount: checkout.shippingCostTotal,
            integerAmount: amountTransformer.toInteger(checkout.shippingCostTotal),
            amountBeforeDiscount: checkout.shippingCostBeforeDiscount,
            integerAmountBeforeDiscount: amountTransformer.toInteger(checkout.shippingCostBeforeDiscount),
            required: lodash_1.some(checkout.cart.lineItems.physicalItems, function (lineItem) { return lineItem.isShippingRequired; }),
        },
        subtotal: {
            amount: checkout.subtotal,
            integerAmount: amountTransformer.toInteger(checkout.subtotal),
        },
        storeCredit: {
            amount: checkout.customer ? checkout.customer.storeCredit : 0,
        },
        taxSubtotal: {
            amount: checkout.taxTotal,
            integerAmount: amountTransformer.toInteger(checkout.taxTotal),
        },
        taxes: checkout.taxes,
        taxTotal: {
            amount: checkout.taxTotal,
            integerAmount: amountTransformer.toInteger(checkout.taxTotal),
        },
        handling: {
            amount: checkout.handlingCostTotal,
            integerAmount: amountTransformer.toInteger(checkout.handlingCostTotal),
        },
        grandTotal: {
            amount: checkout.grandTotal,
            integerAmount: amountTransformer.toInteger(checkout.grandTotal),
        },
    };
}
exports.default = mapToInternalCart;


/***/ }),
/* 60 */
/***/ (function(module, exports) {

module.exports = require("@bigcommerce/form-poster");

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var config_actions_1 = __webpack_require__(62);
var ConfigActionCreator = /** @class */ (function () {
    function ConfigActionCreator(_configRequestSender) {
        this._configRequestSender = _configRequestSender;
    }
    ConfigActionCreator.prototype.loadConfig = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var config = state.config.getConfig();
            if (config) {
                return observer.complete();
            }
            observer.next(data_store_1.createAction(config_actions_1.ConfigActionType.LoadConfigRequested));
            _this._configRequestSender.loadConfig(options)
                .then(function (response) {
                observer.next(data_store_1.createAction(config_actions_1.ConfigActionType.LoadConfigSucceeded, response.body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(config_actions_1.ConfigActionType.LoadConfigFailed, response));
            });
        }); };
    };
    return ConfigActionCreator;
}());
exports.default = ConfigActionCreator;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ConfigActionType;
(function (ConfigActionType) {
    ConfigActionType["LoadConfigRequested"] = "LOAD_CONFIG_REQUESTED";
    ConfigActionType["LoadConfigSucceeded"] = "LOAD_CONFIG_SUCCEEDED";
    ConfigActionType["LoadConfigFailed"] = "LOAD_CONFIG_FAILED";
})(ConfigActionType = exports.ConfigActionType || (exports.ConfigActionType = {}));


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var lodash_1 = __webpack_require__(3);
var concat_1 = __webpack_require__(22);
var Observable_1 = __webpack_require__(5);
var address_1 = __webpack_require__(21);
var cart_1 = __webpack_require__(9);
var errors_1 = __webpack_require__(1);
var customer_1 = __webpack_require__(14);
var order_1 = __webpack_require__(10);
var shipping_1 = __webpack_require__(15);
var is_vaulted_instrument_1 = __webpack_require__(42);
var payment_actions_1 = __webpack_require__(76);
var PaymentActionCreator = /** @class */ (function () {
    function PaymentActionCreator(_paymentRequestSender, _orderActionCreator) {
        this._paymentRequestSender = _paymentRequestSender;
        this._orderActionCreator = _orderActionCreator;
    }
    PaymentActionCreator.prototype.submitPayment = function (payment) {
        var _this = this;
        return function (store) { return concat_1.concat(Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(payment_actions_1.PaymentActionType.SubmitPaymentRequested));
            return _this._paymentRequestSender.submitPayment(_this._getPaymentRequestBody(payment, store.getState()))
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(payment_actions_1.PaymentActionType.SubmitPaymentSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(payment_actions_1.PaymentActionType.SubmitPaymentFailed, response));
            });
        }), _this._orderActionCreator.loadCurrentOrder()(store)); };
    };
    PaymentActionCreator.prototype.initializeOffsitePayment = function (payment) {
        var _this = this;
        return function (store) {
            return Observable_1.Observable.create(function (observer) {
                observer.next(data_store_1.createAction(payment_actions_1.PaymentActionType.InitializeOffsitePaymentRequested));
                return _this._paymentRequestSender.initializeOffsitePayment(_this._getPaymentRequestBody(payment, store.getState()))
                    .then(function () {
                    observer.next(data_store_1.createAction(payment_actions_1.PaymentActionType.InitializeOffsitePaymentSucceeded));
                    observer.complete();
                })
                    .catch(function () {
                    observer.error(data_store_1.createErrorAction(payment_actions_1.PaymentActionType.InitializeOffsitePaymentFailed));
                });
            });
        };
    };
    PaymentActionCreator.prototype._getPaymentRequestBody = function (payment, state) {
        if (!payment.paymentData) {
            throw new errors_1.InvalidArgumentError('Unable to construct payment request because `payment.paymentData` is not provided.');
        }
        var billingAddress = state.billingAddress.getBillingAddress();
        var checkout = state.checkout.getCheckout();
        var customer = state.customer.getCustomer();
        var order = state.order.getOrder();
        var paymentMethod = this._getPaymentMethod(payment, state.paymentMethods);
        var shippingAddress = state.shippingAddress.getShippingAddress();
        var consignments = state.consignments.getConsignments();
        var shippingOption = state.consignments.getShippingOption();
        var config = state.config.getStoreConfig();
        var instrumentMeta = state.instruments.getInstrumentsMeta();
        var paymentMeta = state.paymentMethods.getPaymentMethodsMeta();
        var orderMeta = state.order.getOrderMeta();
        var internalCustomer = customer && billingAddress && customer_1.mapToInternalCustomer(customer, billingAddress);
        var authToken = instrumentMeta && is_vaulted_instrument_1.default(payment.paymentData) ?
            state.payment.getPaymentToken() + ", " + instrumentMeta.vaultAccessToken :
            state.payment.getPaymentToken();
        if (!authToken) {
            throw new errors_1.StandardError();
        }
        return {
            authToken: authToken,
            paymentMethod: paymentMethod,
            customer: internalCustomer,
            billingAddress: billingAddress && address_1.mapToInternalAddress(billingAddress),
            shippingAddress: shippingAddress && address_1.mapToInternalAddress(shippingAddress, consignments),
            shippingOption: shippingOption && shipping_1.mapToInternalShippingOption(shippingOption, true),
            cart: checkout && cart_1.mapToInternalCart(checkout),
            order: order && order_1.mapToInternalOrder(order, orderMeta),
            orderMeta: orderMeta,
            payment: payment.paymentData,
            quoteMeta: {
                request: paymentMeta && paymentMeta.request,
            },
            source: 'bigcommerce-checkout-js-sdk',
            store: lodash_1.pick(config && config.storeProfile, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    };
    PaymentActionCreator.prototype._getPaymentMethod = function (payment, paymentMethodSelector) {
        var paymentMethod = paymentMethodSelector.getPaymentMethod(payment.methodId, payment.gatewayId);
        return (paymentMethod && paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ? tslib_1.__assign({}, paymentMethod, { gateway: paymentMethod.id }) :
            paymentMethod;
    };
    return PaymentActionCreator;
}());
exports.default = PaymentActionCreator;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var order_finalization_not_required_error_1 = __webpack_require__(166);
exports.OrderFinalizationNotRequiredError = order_finalization_not_required_error_1.default;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var utility_1 = __webpack_require__(8);
var errors_2 = __webpack_require__(12);
var BraintreePaymentProcessor = /** @class */ (function () {
    function BraintreePaymentProcessor(_braintreeSDKCreator) {
        this._braintreeSDKCreator = _braintreeSDKCreator;
    }
    BraintreePaymentProcessor.prototype.initialize = function (clientToken, options) {
        this._braintreeSDKCreator.initialize(clientToken);
        this._threeDSecureOptions = options && options.threeDSecure;
    };
    BraintreePaymentProcessor.prototype.preloadPaypal = function () {
        return this._braintreeSDKCreator.getPaypal();
    };
    BraintreePaymentProcessor.prototype.tokenizeCard = function (payment, billingAddress) {
        var paymentData = payment.paymentData;
        var requestData = this._mapToCreditCard(paymentData, billingAddress);
        return this._braintreeSDKCreator.getClient()
            .then(function (client) { return client.request(requestData); })
            .then(function (_a) {
            var creditCards = _a.creditCards;
            return ({
                nonce: creditCards[0].nonce,
            });
        });
    };
    BraintreePaymentProcessor.prototype.paypal = function (amount, storeLanguage, currency, offerCredit) {
        return this._braintreeSDKCreator.getPaypal()
            .then(function (paypal) { return paypal.tokenize({
            amount: amount,
            currency: currency,
            enableShippingAddress: true,
            flow: 'checkout',
            locale: storeLanguage,
            offerCredit: offerCredit,
            useraction: 'commit',
        }); });
    };
    BraintreePaymentProcessor.prototype.verifyCard = function (payment, billingAddress, amount) {
        if (!this._threeDSecureOptions) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
        }
        var _a = this._threeDSecureOptions, addFrame = _a.addFrame, removeFrame = _a.removeFrame;
        return Promise.all([
            this.tokenizeCard(payment, billingAddress),
            this._braintreeSDKCreator.get3DS(),
        ]).then(function (_a) {
            var paymentData = _a[0], threeDSecure = _a[1];
            var nonce = paymentData.nonce;
            var cancelVerifyCard = function () { return threeDSecure.cancelVerifyCard()
                .then(function (response) {
                verification.cancel(new errors_2.PaymentMethodCancelledError());
                return response;
            }); };
            var verification = new utility_1.CancellablePromise(threeDSecure.verifyCard({
                addFrame: function (error, iframe) {
                    addFrame(error, iframe, cancelVerifyCard);
                },
                amount: amount,
                nonce: nonce,
                removeFrame: removeFrame,
            }));
            return verification.promise;
        });
    };
    BraintreePaymentProcessor.prototype.appendSessionId = function (processedPayment) {
        var _this = this;
        return processedPayment
            .then(function (paymentData) { return Promise.all([paymentData, _this._braintreeSDKCreator.getDataCollector()]); })
            .then(function (_a) {
            var paymentData = _a[0], deviceData = _a[1].deviceData;
            return (tslib_1.__assign({}, paymentData, { deviceSessionId: deviceData }));
        });
    };
    BraintreePaymentProcessor.prototype.deinitialize = function () {
        return this._braintreeSDKCreator.teardown();
    };
    BraintreePaymentProcessor.prototype._mapToCreditCard = function (creditCard, billingAddress) {
        var streetAddress = billingAddress.address1;
        if (billingAddress.address2) {
            streetAddress = " " + billingAddress.address2;
        }
        return {
            data: {
                creditCard: {
                    cardholderName: creditCard.ccName,
                    number: creditCard.ccNumber,
                    cvv: creditCard.ccCvv,
                    expirationDate: creditCard.ccExpiry.month + "/" + creditCard.ccExpiry.year,
                    options: {
                        validate: false,
                    },
                    billingAddress: {
                        countryName: billingAddress.country,
                        postalCode: billingAddress.postalCode,
                        streetAddress: streetAddress,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    };
    return BraintreePaymentProcessor;
}());
exports.default = BraintreePaymentProcessor;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var http_request_1 = __webpack_require__(11);
var BraintreeVisaCheckoutPaymentProcessor = /** @class */ (function () {
    function BraintreeVisaCheckoutPaymentProcessor(_braintreeSDKCreator, _requestSender) {
        this._braintreeSDKCreator = _braintreeSDKCreator;
        this._requestSender = _requestSender;
    }
    BraintreeVisaCheckoutPaymentProcessor.prototype.initialize = function (clientToken, options) {
        this._braintreeSDKCreator.initialize(clientToken);
        return this._braintreeSDKCreator.getVisaCheckout()
            .then(function (visaCheckout) { return visaCheckout.createInitOptions({
            settings: {
                locale: options.locale,
                shipping: {
                    collectShipping: options.collectShipping,
                },
            },
            paymentRequest: {
                currencyCode: options.currencyCode,
                subtotal: String(options.subtotal),
            },
        }); });
    };
    BraintreeVisaCheckoutPaymentProcessor.prototype.deinitialize = function () {
        return this._braintreeSDKCreator.teardown();
    };
    BraintreeVisaCheckoutPaymentProcessor.prototype.handleSuccess = function (payment, shipping, billing) {
        var _this = this;
        return this._braintreeSDKCreator.getVisaCheckout()
            .then(function (braintreeVisaCheckout) { return Promise.all([
            braintreeVisaCheckout.tokenize(payment),
            _this._braintreeSDKCreator.getDataCollector(),
        ])
            .then(function (_a) {
            var tokenizedPayload = _a[0], dataCollector = _a[1];
            var _b = tokenizedPayload.shippingAddress, shippingAddress = _b === void 0 ? _this._toVisaCheckoutAddress(shipping) : _b, _c = tokenizedPayload.billingAddress, billingAddress = _c === void 0 ? _this._toVisaCheckoutAddress(billing) : _c;
            return _this._postForm(tslib_1.__assign({}, tokenizedPayload, { shippingAddress: shippingAddress,
                billingAddress: billingAddress }), dataCollector);
        }); });
    };
    BraintreeVisaCheckoutPaymentProcessor.prototype._postForm = function (paymentData, dataCollector) {
        var userData = paymentData.userData, billingAddress = paymentData.billingAddress, shippingAddress = paymentData.shippingAddress, cardInformation = paymentData.details;
        var userEmail = userData.userEmail;
        var deviceData = dataCollector.deviceData;
        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: http_request_1.toFormUrlEncoded({
                payment_type: paymentData.type,
                nonce: paymentData.nonce,
                provider: 'braintreevisacheckout',
                action: 'set_external_checkout',
                device_data: deviceData,
                card_information: this._getCardInformation(cardInformation),
                billing_address: this._getAddress(userEmail, billingAddress),
                shipping_address: this._getAddress(userEmail, shippingAddress),
            }),
        });
    };
    BraintreeVisaCheckoutPaymentProcessor.prototype._toVisaCheckoutAddress = function (address) {
        if (!address) {
            return {};
        }
        return {
            firstName: address.firstName,
            lastName: address.lastName,
            phoneNumber: address.phone,
            streetAddress: address.address1,
            extendedAddress: address.address2,
            locality: address.city,
            region: address.stateOrProvinceCode,
            countryCode: address.countryCode,
            postalCode: address.postalCode,
        };
    };
    BraintreeVisaCheckoutPaymentProcessor.prototype._getAddress = function (email, address) {
        if (address === void 0) { address = {}; }
        return {
            email: email,
            first_name: address.firstName,
            last_name: address.lastName,
            phone_number: address.phoneNumber,
            address_line_1: address.streetAddress,
            address_line_2: address.extendedAddress,
            city: address.locality,
            state: address.region,
            country_code: address.countryCode,
            postal_code: address.postalCode,
        };
    };
    BraintreeVisaCheckoutPaymentProcessor.prototype._getCardInformation = function (cardInformation) {
        return {
            type: cardInformation.cardType,
            number: cardInformation.lastTwo,
        };
    };
    return BraintreeVisaCheckoutPaymentProcessor;
}());
exports.default = BraintreeVisaCheckoutPaymentProcessor;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __webpack_require__(1);
var BraintreeScriptLoader = /** @class */ (function () {
    function BraintreeScriptLoader(_scriptLoader, _window) {
        if (_window === void 0) { _window = window; }
        this._scriptLoader = _scriptLoader;
        this._window = _window;
    }
    BraintreeScriptLoader.prototype.loadClient = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/client.min.js')
            .then(function () {
            if (!_this._window.braintree || !_this._window.braintree.client) {
                throw new errors_1.StandardError();
            }
            return _this._window.braintree.client;
        });
    };
    BraintreeScriptLoader.prototype.load3DS = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/three-d-secure.min.js')
            .then(function () {
            if (!_this._window.braintree || !_this._window.braintree.threeDSecure) {
                throw new errors_1.StandardError();
            }
            return _this._window.braintree.threeDSecure;
        });
    };
    BraintreeScriptLoader.prototype.loadDataCollector = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/data-collector.min.js')
            .then(function () {
            if (!_this._window.braintree || !_this._window.braintree.dataCollector) {
                throw new errors_1.StandardError();
            }
            return _this._window.braintree.dataCollector;
        });
    };
    BraintreeScriptLoader.prototype.loadPaypal = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/paypal.min.js')
            .then(function () {
            if (!_this._window.braintree || !_this._window.braintree.paypal) {
                throw new errors_1.StandardError();
            }
            return _this._window.braintree.paypal;
        });
    };
    BraintreeScriptLoader.prototype.loadVisaCheckout = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript('//js.braintreegateway.com/web/3.15.0/js/visa-checkout.min.js')
            .then(function () {
            if (!_this._window.braintree || !_this._window.braintree.visaCheckout) {
                throw new errors_1.StandardError();
            }
            return _this._window.braintree.visaCheckout;
        });
    };
    return BraintreeScriptLoader;
}());
exports.default = BraintreeScriptLoader;


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var BraintreeSDKCreator = /** @class */ (function () {
    function BraintreeSDKCreator(_braintreeScriptLoader) {
        this._braintreeScriptLoader = _braintreeScriptLoader;
    }
    BraintreeSDKCreator.prototype.initialize = function (clientToken) {
        this._clientToken = clientToken;
    };
    BraintreeSDKCreator.prototype.getClient = function () {
        var _this = this;
        if (!this._clientToken) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
        }
        if (!this._client) {
            this._client = this._braintreeScriptLoader.loadClient()
                .then(function (client) { return client.create({ authorization: _this._clientToken }); });
        }
        return this._client;
    };
    BraintreeSDKCreator.prototype.getPaypal = function () {
        if (!this._paypal) {
            this._paypal = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadPaypal(),
            ])
                .then(function (_a) {
                var client = _a[0], paypal = _a[1];
                return paypal.create({ client: client });
            });
        }
        return this._paypal;
    };
    BraintreeSDKCreator.prototype.get3DS = function () {
        if (!this._3ds) {
            this._3ds = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.load3DS(),
            ])
                .then(function (_a) {
                var client = _a[0], threeDSecure = _a[1];
                return threeDSecure.create({ client: client });
            });
        }
        return this._3ds;
    };
    BraintreeSDKCreator.prototype.getDataCollector = function () {
        if (!this._dataCollector) {
            this._dataCollector = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadDataCollector(),
            ])
                .then(function (_a) {
                var client = _a[0], dataCollector = _a[1];
                return dataCollector.create({ client: client, kount: true });
            })
                .then(function (dataCollector) {
                var deviceData = dataCollector.deviceData;
                return tslib_1.__assign({}, dataCollector, { deviceData: deviceData ? JSON.parse(deviceData).device_session_id : undefined });
            })
                .catch(function (error) {
                if (error && error.code === 'DATA_COLLECTOR_KOUNT_NOT_ENABLED') {
                    return { deviceData: undefined, teardown: function () { return Promise.resolve(); } };
                }
                throw error;
            });
        }
        return this._dataCollector;
    };
    BraintreeSDKCreator.prototype.getVisaCheckout = function () {
        if (!this._visaCheckout) {
            this._visaCheckout = Promise.all([
                this.getClient(),
                this._braintreeScriptLoader.loadVisaCheckout(),
            ])
                .then(function (_a) {
                var client = _a[0], visaCheckout = _a[1];
                return visaCheckout.create({ client: client });
            });
        }
        return this._visaCheckout;
    };
    BraintreeSDKCreator.prototype.teardown = function () {
        var _this = this;
        return Promise.all([
            this._teardown(this._3ds),
            this._teardown(this._dataCollector),
            this._teardown(this._visaCheckout),
        ]).then(function () {
            _this._3ds = undefined;
            _this._dataCollector = undefined;
            _this._visaCheckout = undefined;
        });
    };
    BraintreeSDKCreator.prototype._teardown = function (module) {
        return module ?
            module.then(function (mod) { return mod.teardown(); }) :
            Promise.resolve();
    };
    return BraintreeSDKCreator;
}());
exports.default = BraintreeSDKCreator;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var concat_1 = __webpack_require__(22);
var Observable_1 = __webpack_require__(5);
var customer_actions_1 = __webpack_require__(70);
var CustomerActionCreator = /** @class */ (function () {
    function CustomerActionCreator(_customerRequestSender, _checkoutActionCreator) {
        this._customerRequestSender = _customerRequestSender;
        this._checkoutActionCreator = _checkoutActionCreator;
    }
    CustomerActionCreator.prototype.signInCustomer = function (credentials, options) {
        var _this = this;
        return function (store) {
            var signInAction = new Observable_1.Observable(function (observer) {
                observer.next(data_store_1.createAction(customer_actions_1.CustomerActionType.SignInCustomerRequested));
                _this._customerRequestSender.signInCustomer(credentials, options)
                    .then(function (_a) {
                    var body = _a.body;
                    observer.next(data_store_1.createAction(customer_actions_1.CustomerActionType.SignInCustomerSucceeded, body.data));
                    observer.complete();
                })
                    .catch(function (response) {
                    observer.error(data_store_1.createErrorAction(customer_actions_1.CustomerActionType.SignInCustomerFailed, response));
                });
            });
            var loadCheckoutAction = _this._checkoutActionCreator.loadCurrentCheckout(options)(store);
            return concat_1.concat(signInAction, loadCheckoutAction);
        };
    };
    CustomerActionCreator.prototype.signOutCustomer = function (options) {
        var _this = this;
        return function (store) {
            var signOutAction = new Observable_1.Observable(function (observer) {
                observer.next(data_store_1.createAction(customer_actions_1.CustomerActionType.SignOutCustomerRequested));
                _this._customerRequestSender.signOutCustomer(options)
                    .then(function (_a) {
                    var body = _a.body;
                    observer.next(data_store_1.createAction(customer_actions_1.CustomerActionType.SignOutCustomerSucceeded, body.data));
                    observer.complete();
                })
                    .catch(function (response) {
                    observer.error(data_store_1.createErrorAction(customer_actions_1.CustomerActionType.SignOutCustomerFailed, response));
                });
            });
            var loadCheckoutAction = _this._checkoutActionCreator.loadCurrentCheckout(options)(store);
            return concat_1.concat(signOutAction, loadCheckoutAction);
        };
    };
    return CustomerActionCreator;
}());
exports.default = CustomerActionCreator;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CustomerActionType;
(function (CustomerActionType) {
    CustomerActionType["SignInCustomerRequested"] = "SIGN_IN_CUSTOMER_REQUESTED";
    CustomerActionType["SignInCustomerSucceeded"] = "SIGN_IN_CUSTOMER_SUCCEEDED";
    CustomerActionType["SignInCustomerFailed"] = "SIGN_IN_CUSTOMER_FAILED";
    CustomerActionType["SignOutCustomerRequested"] = "SIGN_OUT_CUSTOMER_REQUESTED";
    CustomerActionType["SignOutCustomerSucceeded"] = "SIGN_OUT_CUSTOMER_SUCCEEDED";
    CustomerActionType["SignOutCustomerFailed"] = "SIGN_OUT_CUSTOMER_FAILED";
})(CustomerActionType = exports.CustomerActionType || (exports.CustomerActionType = {}));


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CustomerStrategyActionType;
(function (CustomerStrategyActionType) {
    CustomerStrategyActionType["SignInFailed"] = "CUSTOMER_STRATEGY_SIGN_IN_FAILED";
    CustomerStrategyActionType["SignInRequested"] = "CUSTOMER_STRATEGY_SIGN_IN_REQUESTED";
    CustomerStrategyActionType["SignInSucceeded"] = "CUSTOMER_STRATEGY_SIGN_IN_SUCCEEDED";
    CustomerStrategyActionType["SignOutFailed"] = "CUSTOMER_STRATEGY_SIGN_OUT_FAILED";
    CustomerStrategyActionType["SignOutRequested"] = "CUSTOMER_STRATEGY_SIGN_OUT_REQUESTED";
    CustomerStrategyActionType["SignOutSucceeded"] = "CUSTOMER_STRATEGY_SIGN_OUT_SUCCEEDED";
    CustomerStrategyActionType["InitializeFailed"] = "CUSTOMER_STRATEGY_INITIALIZE_FAILED";
    CustomerStrategyActionType["InitializeRequested"] = "CUSTOMER_STRATEGY_INITIALIZE_REQUESTED";
    CustomerStrategyActionType["InitializeSucceeded"] = "CUSTOMER_STRATEGY_INITIALIZE_SUCCEEDED";
    CustomerStrategyActionType["DeinitializeFailed"] = "CUSTOMER_STRATEGY_DEINITIALIZE_FAILED";
    CustomerStrategyActionType["DeinitializeRequested"] = "CUSTOMER_STRATEGY_DEINITIALIZE_REQUESTED";
    CustomerStrategyActionType["DeinitializeSucceeded"] = "CUSTOMER_STRATEGY_DEINITIALIZE_SUCCEEDED";
    CustomerStrategyActionType["WidgetInteractionStarted"] = "CUSTOMER_STRATEGY_WIDGET_INTERACTION_STARTED";
    CustomerStrategyActionType["WidgetInteractionFinished"] = "CUSTOMER_STRATEGY_WIDGET_INTERACTION_FINISHED";
    CustomerStrategyActionType["WidgetInteractionFailed"] = "CUSTOMER_STRATEGY_WIDGET_INTERACTION_FAILED";
})(CustomerStrategyActionType = exports.CustomerStrategyActionType || (exports.CustomerStrategyActionType = {}));


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var consignment_actions_1 = __webpack_require__(24);
var ConsignmentActionCreator = /** @class */ (function () {
    function ConsignmentActionCreator(_consignmentRequestSender, _checkoutRequestSender) {
        this._consignmentRequestSender = _consignmentRequestSender;
        this._checkoutRequestSender = _checkoutRequestSender;
    }
    ConsignmentActionCreator.prototype.selectShippingOption = function (id, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            var consignments = state.consignments.getConsignments();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            if (!consignments || !consignments.length) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingConsignments);
            }
            var consignmentUpdateBody = {
                id: consignments[0].id,
                shippingOptionId: id,
            };
            var consignmentMeta = {
                id: consignments[0].id,
            };
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateShippingOptionRequested, undefined, consignmentMeta));
            _this._consignmentRequestSender.updateConsignment(checkout.id, consignmentUpdateBody, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded, body, consignmentMeta));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.UpdateShippingOptionFailed, response, consignmentMeta));
            });
        }); };
    };
    ConsignmentActionCreator.prototype.loadShippingOptions = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.LoadShippingOptionsRequested));
            _this._checkoutRequestSender.loadCheckout(checkout.id, tslib_1.__assign({}, options, { params: {
                    include: ['consignments.availableShippingOptions'],
                } }))
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.LoadShippingOptionsSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.LoadShippingOptionsFailed, response));
            });
        }); };
    };
    ConsignmentActionCreator.prototype.updateAddress = function (address, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var consignment = _this._getConsignmentRequestBody(address, store);
            var checkout = store.getState().checkout.getCheckout();
            var consignments = store.getState().consignments.getConsignments();
            if (!checkout || !checkout.id) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            if (consignments && consignments.length) {
                consignment.id = consignments[0].id;
            }
            _this._createOrUpdateConsignment(checkout.id, consignment, observer, options);
        }); };
    };
    ConsignmentActionCreator.prototype.createConsignments = function (consignments, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout.getCheckout();
            if (!checkout || !checkout.id) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.CreateConsignmentsRequested));
            _this._consignmentRequestSender.createConsignments(checkout.id, consignments, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.CreateConsignmentsFailed, response));
            });
        }); };
    };
    ConsignmentActionCreator.prototype.updateConsignment = function (consignment, options) {
        var _this = this;
        if (this._isUpdateShippingOptionRequest(consignment)) {
            return this._updateShippingOption(consignment, options);
        }
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout.getCheckout();
            if (!checkout || !checkout.id) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            var consignmentMeta = { id: consignment.id };
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateConsignmentRequested, undefined, consignmentMeta));
            _this._consignmentRequestSender.updateConsignment(checkout.id, consignment, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded, body, consignmentMeta));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.UpdateConsignmentFailed, response, consignmentMeta));
            });
        }); };
    };
    ConsignmentActionCreator.prototype._updateShippingOption = function (consignment, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout.getCheckout();
            if (!checkout || !checkout.id) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            var consignmentMeta = { id: consignment.id };
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateShippingOptionRequested, undefined, consignmentMeta));
            _this._consignmentRequestSender.updateConsignment(checkout.id, consignment, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded, body, consignmentMeta));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.UpdateShippingOptionFailed, response, consignmentMeta));
            });
        }); };
    };
    ConsignmentActionCreator.prototype._createOrUpdateConsignment = function (checkoutId, consignment, observer, options) {
        if (consignment.id) {
            var consignmentMeta_1 = { id: consignment.id };
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateConsignmentRequested, undefined, consignmentMeta_1));
            return this._consignmentRequestSender.updateConsignment(checkoutId, consignment, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded, body, consignmentMeta_1));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.UpdateConsignmentFailed, response, consignmentMeta_1));
            });
        }
        observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.CreateConsignmentsRequested, consignment));
        return this._consignmentRequestSender.createConsignments(checkoutId, [consignment], options)
            .then(function (_a) {
            var body = _a.body;
            observer.next(data_store_1.createAction(consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded, body, consignment));
            observer.complete();
        })
            .catch(function (response) {
            observer.error(data_store_1.createErrorAction(consignment_actions_1.ConsignmentActionType.CreateConsignmentsFailed, response, consignment));
        });
    };
    ConsignmentActionCreator.prototype._getConsignmentRequestBody = function (shippingAddress, store) {
        var state = store.getState();
        var cart = state.cart.getCart();
        if (!cart) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCart);
        }
        return {
            shippingAddress: shippingAddress,
            lineItems: (cart.lineItems && cart.lineItems.physicalItems || [])
                .map(function (item) { return ({
                itemId: item.id,
                quantity: item.quantity,
            }); }),
        };
    };
    ConsignmentActionCreator.prototype._isUpdateShippingOptionRequest = function (request) {
        var shippingOptionRequest = request;
        return typeof shippingOptionRequest.shippingOptionId !== 'undefined';
    };
    return ConsignmentActionCreator;
}());
exports.default = ConsignmentActionCreator;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var remote_checkout_synchronization_error_1 = __webpack_require__(190);
exports.RemoteCheckoutSynchronizationError = remote_checkout_synchronization_error_1.default;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LOAD_SHIPPING_COUNTRIES_REQUESTED = 'LOAD_SHIPPING_COUNTRIES_REQUESTED';
exports.LOAD_SHIPPING_COUNTRIES_SUCCEEDED = 'LOAD_SHIPPING_COUNTRIES_SUCCEEDED';
exports.LOAD_SHIPPING_COUNTRIES_FAILED = 'LOAD_SHIPPING_COUNTRIES_FAILED';


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalShippingOption(option, isSelected) {
    return {
        description: option.description,
        module: option.type,
        price: option.cost,
        id: option.id,
        selected: isSelected,
        isRecommended: option.isRecommended,
        imageUrl: option.imageUrl,
        transitTime: option.transitTime,
    };
}
exports.default = mapToInternalShippingOption;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PaymentActionType;
(function (PaymentActionType) {
    PaymentActionType["SubmitPaymentRequested"] = "SUBMIT_PAYMENT_REQUESTED";
    PaymentActionType["SubmitPaymentSucceeded"] = "SUBMIT_PAYMENT_SUCCEEDED";
    PaymentActionType["SubmitPaymentFailed"] = "SUBMIT_PAYMENT_FAILED";
    PaymentActionType["InitializeOffsitePaymentRequested"] = "INITIALIZE_OFFSITE_PAYMENT_REQUESTED";
    PaymentActionType["InitializeOffsitePaymentSucceeded"] = "INITIALIZE_OFFSITE_PAYMENT_SUCCEEDED";
    PaymentActionType["InitializeOffsitePaymentFailed"] = "INITIALIZE_OFFSITE_PAYMENT_FAILED";
})(PaymentActionType = exports.PaymentActionType || (exports.PaymentActionType = {}));


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var actionTypes = __webpack_require__(35);
/**
 * @todo Convert this file into TypeScript properly
 */
var PaymentMethodActionCreator = /** @class */ (function () {
    function PaymentMethodActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    PaymentMethodActionCreator.prototype.loadPaymentMethods = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHODS_REQUESTED));
            _this._checkoutClient.loadPaymentMethods(options)
                .then(function (response) {
                observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED, response.body.data, response.body.meta));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_PAYMENT_METHODS_FAILED, response));
            });
        });
    };
    PaymentMethodActionCreator.prototype.loadPaymentMethod = function (methodId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHOD_REQUESTED, undefined, { methodId: methodId }));
            _this._checkoutClient.loadPaymentMethod(methodId, options)
                .then(function (response) {
                observer.next(data_store_1.createAction(actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED, response.body.data, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_PAYMENT_METHOD_FAILED, response, { methodId: methodId }));
            });
        });
    };
    return PaymentMethodActionCreator;
}());
exports.default = PaymentMethodActionCreator;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @todo Convert this file into TypeScript properly
 */
var PaymentRequestSender = /** @class */ (function () {
    /**
     * @constructor
     * @param {BigpayClient} client
     */
    function PaymentRequestSender(_client) {
        this._client = _client;
    }
    PaymentRequestSender.prototype.submitPayment = function (payload) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.submitPayment(payload, function (error, response) {
                if (error) {
                    reject(_this._transformResponse(error));
                }
                else {
                    resolve(_this._transformResponse(response));
                }
            });
        });
    };
    PaymentRequestSender.prototype.initializeOffsitePayment = function (payload) {
        var _this = this;
        return new Promise(function () {
            _this._client.initializeOffsitePayment(payload);
        });
    };
    PaymentRequestSender.prototype._transformResponse = function (response) {
        return {
            headers: {},
            body: response.data,
            status: response.status,
            statusText: response.statusText,
        };
    };
    return PaymentRequestSender;
}());
exports.default = PaymentRequestSender;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var errors_1 = __webpack_require__(1);
var registry_1 = __webpack_require__(40);
var paymentMethodTypes = __webpack_require__(36);
var PaymentStrategyRegistry = /** @class */ (function (_super) {
    tslib_1.__extends(PaymentStrategyRegistry, _super);
    function PaymentStrategyRegistry(_store, options) {
        var _this = _super.call(this, options) || this;
        _this._store = _store;
        return _this;
    }
    PaymentStrategyRegistry.prototype.getByMethod = function (paymentMethod) {
        if (!paymentMethod) {
            return this.get();
        }
        var token = this._getToken(paymentMethod);
        var cacheToken = paymentMethod.gateway || paymentMethod.id;
        return this.get(token, cacheToken);
    };
    PaymentStrategyRegistry.prototype._getToken = function (paymentMethod) {
        var methodId = paymentMethod.gateway || paymentMethod.id;
        if (this.hasFactory(methodId)) {
            return methodId;
        }
        if (paymentMethod.type === paymentMethodTypes.OFFLINE) {
            return 'offline';
        }
        if (this._isLegacyMethod(paymentMethod)) {
            return 'legacy';
        }
        if (paymentMethod.type === paymentMethodTypes.HOSTED) {
            return 'offsite';
        }
        return 'creditcard';
    };
    PaymentStrategyRegistry.prototype._isLegacyMethod = function (paymentMethod) {
        var config = this._store.getState().config.getStoreConfig();
        if (!config) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
        }
        var clientSidePaymentProviders = config.paymentSettings.clientSidePaymentProviders;
        if (!clientSidePaymentProviders || paymentMethod.gateway === 'adyen') {
            return false;
        }
        return !lodash_1.some(clientSidePaymentProviders, function (id) {
            return paymentMethod.id === id || paymentMethod.gateway === id;
        });
    };
    return PaymentStrategyRegistry;
}(registry_1.Registry));
exports.default = PaymentStrategyRegistry;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(12);
var payment_strategy_1 = __webpack_require__(6);
var CreditCardPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(CreditCardPaymentStrategy, _super);
    function CreditCardPaymentStrategy(store, _orderActionCreator, _paymentActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        return _this;
    }
    CreditCardPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var payment = payload.payment, order = tslib_1.__rest(payload, ["payment"]);
        var paymentData = payment && payment.paymentData;
        if (!payment || !paymentData) {
            throw new errors_1.PaymentArgumentInvalidError(['payment.paymentData']);
        }
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(function () {
            return _this._store.dispatch(_this._paymentActionCreator.submitPayment(tslib_1.__assign({}, payment, { paymentData: paymentData })));
        });
    };
    return CreditCardPaymentStrategy;
}(payment_strategy_1.default));
exports.default = CreditCardPaymentStrategy;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var square_payment_strategy_1 = __webpack_require__(217);
exports.SquarePaymentStrategy = square_payment_strategy_1.default;
var square_script_loader_1 = __webpack_require__(218);
exports.SquareScriptLoader = square_script_loader_1.default;


/***/ }),
/* 82 */
/***/ (function(module, exports) {

module.exports = require("rxjs/observable/from");

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PaymentStrategyActionType;
(function (PaymentStrategyActionType) {
    PaymentStrategyActionType["ExecuteFailed"] = "PAYMENT_STRATEGY_EXECUTE_FAILED";
    PaymentStrategyActionType["ExecuteRequested"] = "PAYMENT_STRATEGY_EXECUTE_REQUESTED";
    PaymentStrategyActionType["ExecuteSucceeded"] = "PAYMENT_STRATEGY_EXECUTE_SUCCEEDED";
    PaymentStrategyActionType["FinalizeFailed"] = "PAYMENT_STRATEGY_FINALIZE_FAILED";
    PaymentStrategyActionType["FinalizeRequested"] = "PAYMENT_STRATEGY_FINALIZE_REQUESTED";
    PaymentStrategyActionType["FinalizeSucceeded"] = "PAYMENT_STRATEGY_FINALIZE_SUCCEEDED";
    PaymentStrategyActionType["InitializeFailed"] = "PAYMENT_STRATEGY_INITIALIZE_FAILED";
    PaymentStrategyActionType["InitializeRequested"] = "PAYMENT_STRATEGY_INITIALIZE_REQUESTED";
    PaymentStrategyActionType["InitializeSucceeded"] = "PAYMENT_STRATEGY_INITIALIZE_SUCCEEDED";
    PaymentStrategyActionType["DeinitializeFailed"] = "PAYMENT_STRATEGY_DEINITIALIZE_FAILED";
    PaymentStrategyActionType["DeinitializeRequested"] = "PAYMENT_STRATEGY_DEINITIALIZE_REQUESTED";
    PaymentStrategyActionType["DeinitializeSucceeded"] = "PAYMENT_STRATEGY_DEINITIALIZE_SUCCEEDED";
    PaymentStrategyActionType["WidgetInteractionStarted"] = "PAYMENT_STRATEGY_WIDGET_INTERACTION_STARTED";
    PaymentStrategyActionType["WidgetInteractionFinished"] = "PAYMENT_STRATEGY_WIDGET_INTERACTION_FINISHED";
    PaymentStrategyActionType["WidgetInteractionFailed"] = "PAYMENT_STRATEGY_WIDGET_INTERACTION_FAILED";
})(PaymentStrategyActionType = exports.PaymentStrategyActionType || (exports.PaymentStrategyActionType = {}));


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STATE = {
    errors: {},
    statuses: {},
};


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var map_gift_certificate_to_internal_line_item_1 = __webpack_require__(86);
var map_to_internal_line_item_1 = __webpack_require__(87);
function mapToInternalLineItems(itemMap, decimalPlaces, idKey) {
    if (idKey === void 0) { idKey = 'id'; }
    return Object.keys(itemMap)
        .reduce(function (result, key) { return result.concat(itemMap[key].map(function (item) {
        if (key === 'giftCertificates') {
            return map_gift_certificate_to_internal_line_item_1.default(item, decimalPlaces);
        }
        return map_to_internal_line_item_1.default(item, mapToInternalLineItemType(key), decimalPlaces, idKey);
    })); }, []);
}
exports.default = mapToInternalLineItems;
function mapToInternalLineItemType(type) {
    switch (type) {
        case 'physicalItems':
            return 'ItemPhysicalEntity';
        case 'digitalItems':
            return 'ItemDigitalEntity';
        case 'giftCertificates':
            return 'ItemGiftCertificateEntity';
        default:
            return '';
    }
}


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(9);
function mapGiftCertificateToInternalLineItem(item, decimalPlaces) {
    var amountTransformer = new _1.AmountTransformer(decimalPlaces);
    return {
        id: item.id,
        imageUrl: '',
        name: item.name,
        amount: item.amount,
        amountAfterDiscount: item.amount,
        discount: 0,
        integerAmount: amountTransformer.toInteger(item.amount),
        integerAmountAfterDiscount: amountTransformer.toInteger(item.amount),
        integerDiscount: 0,
        quantity: 1,
        sender: item.sender,
        recipient: item.recipient,
        type: 'ItemGiftCertificateEntity',
        attributes: [],
        variantId: null,
    };
}
exports.default = mapGiftCertificateToInternalLineItem;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _1 = __webpack_require__(9);
function mapToInternalLineItem(item, type, decimalPlaces, idKey) {
    if (idKey === void 0) { idKey = 'id'; }
    var amountTransformer = new _1.AmountTransformer(decimalPlaces);
    return {
        id: item[idKey],
        imageUrl: item.imageUrl,
        amount: item.extendedListPrice,
        amountAfterDiscount: item.extendedSalePrice,
        discount: item.discountAmount,
        integerAmount: amountTransformer.toInteger(item.extendedListPrice),
        integerAmountAfterDiscount: amountTransformer.toInteger(item.extendedSalePrice),
        integerDiscount: amountTransformer.toInteger(item.discountAmount),
        downloadsPageUrl: item.downloadPageUrl,
        name: item.name,
        quantity: item.quantity,
        variantId: item.variantId,
        attributes: (item.options || []).map(function (option) { return ({
            name: option.name,
            value: option.value,
        }); }),
        type: type,
    };
}
exports.default = mapToInternalLineItem;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = __webpack_require__(18);
var billing_1 = __webpack_require__(17);
var customer_1 = __webpack_require__(14);
var geography_1 = __webpack_require__(30);
var order_1 = __webpack_require__(10);
var payment_1 = __webpack_require__(13);
var shipping_1 = __webpack_require__(15);
var checkout_client_1 = __webpack_require__(51);
function createCheckoutClient(config) {
    if (config === void 0) { config = {}; }
    var requestSender = request_sender_1.createRequestSender();
    var billingAddressRequestSender = new billing_1.BillingAddressRequestSender(requestSender);
    var countryRequestSender = new geography_1.CountryRequestSender(requestSender, config);
    var customerRequestSender = new customer_1.CustomerRequestSender(requestSender);
    var orderRequestSender = new order_1.OrderRequestSender(requestSender);
    var paymentMethodRequestSender = new payment_1.PaymentMethodRequestSender(requestSender);
    var shippingCountryRequestSender = new shipping_1.ShippingCountryRequestSender(requestSender, config);
    return new checkout_client_1.default(billingAddressRequestSender, countryRequestSender, customerRequestSender, orderRequestSender, paymentMethodRequestSender, shippingCountryRequestSender);
}
exports.default = createCheckoutClient;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LOAD_COUNTRIES_REQUESTED = 'LOAD_COUNTRIES_REQUESTED';
exports.LOAD_COUNTRIES_SUCCEEDED = 'LOAD_COUNTRIES_SUCCEEDED';
exports.LOAD_COUNTRIES_FAILED = 'LOAD_COUNTRIES_FAILED';


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.LOAD_INSTRUMENTS_REQUESTED = 'LOAD_INSTRUMENTS_REQUESTED';
exports.LOAD_INSTRUMENTS_SUCCEEDED = 'LOAD_INSTRUMENTS_SUCCEEDED';
exports.LOAD_INSTRUMENTS_FAILED = 'LOAD_INSTRUMENTS_FAILED';
exports.DELETE_INSTRUMENT_REQUESTED = 'DELETE_INSTRUMENT_REQUESTED';
exports.DELETE_INSTRUMENT_SUCCEEDED = 'DELETE_INSTRUMENT_SUCCEEDED';
exports.DELETE_INSTRUMENT_FAILED = 'DELETE_INSTRUMENT_FAILED';


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var error_1 = __webpack_require__(56);
var create_action_transformer_1 = __webpack_require__(253);
var create_checkout_store_reducer_1 = __webpack_require__(255);
var create_internal_checkout_selectors_1 = __webpack_require__(92);
function createCheckoutStore(initialState, options) {
    if (initialState === void 0) { initialState = {}; }
    var actionTransformer = create_action_transformer_1.default(error_1.createRequestErrorFactory());
    var stateTransformer = function (state) { return create_internal_checkout_selectors_1.default(state); };
    return data_store_1.createDataStore(create_checkout_store_reducer_1.default(), initialState, tslib_1.__assign({ actionTransformer: actionTransformer, stateTransformer: stateTransformer }, options));
}
exports.default = createCheckoutStore;


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var billing_1 = __webpack_require__(17);
var cart_1 = __webpack_require__(9);
var utility_1 = __webpack_require__(8);
var config_1 = __webpack_require__(25);
var coupon_1 = __webpack_require__(19);
var customer_1 = __webpack_require__(14);
var form_1 = __webpack_require__(257);
var geography_1 = __webpack_require__(30);
var order_1 = __webpack_require__(10);
var payment_1 = __webpack_require__(13);
var payment_2 = __webpack_require__(13);
var instrument_1 = __webpack_require__(45);
var remote_checkout_1 = __webpack_require__(26);
var shipping_1 = __webpack_require__(15);
var checkout_selector_1 = __webpack_require__(52);
function createInternalCheckoutSelectors(state, options) {
    if (options === void 0) { options = {}; }
    var billingAddress = new billing_1.BillingAddressSelector(state.billingAddress);
    var cart = new cart_1.CartSelector(state.cart);
    var config = new config_1.ConfigSelector(state.config);
    var consignments = new shipping_1.ConsignmentSelector(state.consignments);
    var countries = new geography_1.CountrySelector(state.countries);
    var coupons = new coupon_1.CouponSelector(state.coupons);
    var customer = new customer_1.CustomerSelector(state.customer);
    var customerStrategies = new customer_1.CustomerStrategySelector(state.customerStrategies);
    var form = new form_1.FormSelector(state.config);
    var giftCertificates = new coupon_1.GiftCertificateSelector(state.giftCertificates);
    var instruments = new instrument_1.InstrumentSelector(state.instruments);
    var paymentMethods = new payment_1.PaymentMethodSelector(state.paymentMethods);
    var paymentStrategies = new payment_1.PaymentStrategySelector(state.paymentStrategies);
    var shippingAddress = new shipping_1.ShippingAddressSelector(state.consignments, state.config);
    var remoteCheckout = new remote_checkout_1.RemoteCheckoutSelector(state.remoteCheckout);
    var shippingCountries = new shipping_1.ShippingCountrySelector(state.shippingCountries);
    var shippingStrategies = new shipping_1.ShippingStrategySelector(state.shippingStrategies);
    // Compose selectors
    var checkout = new checkout_selector_1.default(state.checkout, billingAddress, cart, consignments, coupons, customer, giftCertificates);
    var order = new order_1.OrderSelector(state.order, billingAddress, coupons);
    var payment = new payment_2.PaymentSelector(checkout, order);
    var selectors = {
        billingAddress: billingAddress,
        cart: cart,
        checkout: checkout,
        config: config,
        consignments: consignments,
        countries: countries,
        coupons: coupons,
        customer: customer,
        customerStrategies: customerStrategies,
        form: form,
        giftCertificates: giftCertificates,
        instruments: instruments,
        order: order,
        payment: payment,
        paymentMethods: paymentMethods,
        paymentStrategies: paymentStrategies,
        remoteCheckout: remoteCheckout,
        shippingAddress: shippingAddress,
        shippingCountries: shippingCountries,
        shippingStrategies: shippingStrategies,
    };
    return options.shouldWarnMutation ? utility_1.createFreezeProxies(selectors) : selectors;
}
exports.default = createInternalCheckoutSelectors;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = __webpack_require__(8);
var console_logger_1 = __webpack_require__(243);
var noop_logger_1 = __webpack_require__(244);
var logger = createLogger(utility_1.getEnvironment() !== 'test');
function createLogger(isEnabled) {
    if (isEnabled === void 0) { isEnabled = true; }
    if (!isEnabled) {
        return new noop_logger_1.default();
    }
    return new console_logger_1.default(console);
}
exports.createLogger = createLogger;
function getDefaultLogger() {
    return logger;
}
exports.getDefaultLogger = getDefaultLogger;


/***/ }),
/* 94 */
/***/ (function(module, exports) {

module.exports = require("rxjs/observable/merge");

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var standard_error_1 = __webpack_require__(16);
var InvalidArgumentError = /** @class */ (function (_super) {
    tslib_1.__extends(InvalidArgumentError, _super);
    function InvalidArgumentError(message) {
        var _this = _super.call(this, message || 'Invalid arguments have been provided.') || this;
        _this.type = 'invalid_argument';
        return _this;
    }
    return InvalidArgumentError;
}(standard_error_1.default));
exports.default = InvalidArgumentError;


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
function bindDecorator(target, key, descriptor) {
    if (!key || !descriptor) {
        return bindClassDecorator(target);
    }
    return bindMethodDecorator(target, key, descriptor);
}
exports.default = bindDecorator;
/**
 * Decorates a class by binding all its prototype methods to the calling
 * instance.
 */
function bindClassDecorator(target) {
    var decoratedTarget = /** @class */ (function (_super) {
        tslib_1.__extends(class_1, _super);
        function class_1() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return class_1;
    }(target));
    Object.getOwnPropertyNames(target.prototype)
        .forEach(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
        if (!descriptor || key === 'constructor') {
            return;
        }
        Object.defineProperty(decoratedTarget.prototype, key, bindMethodDecorator(target.prototype, key, descriptor));
    });
    return decoratedTarget;
}
exports.bindClassDecorator = bindClassDecorator;
/**
 * Decorates a method by binding it to the calling instance.
 */
function bindMethodDecorator(target, key, descriptor) {
    if (typeof descriptor.value !== 'function') {
        return descriptor;
    }
    var method = descriptor.value;
    return {
        get: function () {
            var boundMethod = method.bind(this);
            Object.defineProperty(this, key, tslib_1.__assign({}, descriptor, { value: boundMethod }));
            return boundMethod;
        },
        set: function (value) {
            method = value;
        },
    };
}
exports.bindMethodDecorator = bindMethodDecorator;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
function createFreezeProxy(target) {
    return createProxy(target, function (target, name) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _a;
            return data_store_1.deepFreeze((_a = target[name]).call.apply(_a, [target].concat(args)));
        };
    });
}
exports.default = createFreezeProxy;
function createFreezeProxies(map) {
    return Object.keys(map)
        .reduce(function (result, key) {
        result[key] = createFreezeProxy(map[key]);
        return result;
    }, {});
}
exports.createFreezeProxies = createFreezeProxies;
function createProxy(target, trap) {
    var proxy = Object.create(target);
    traversePrototypeOf(target, function (prototype) {
        Object.getOwnPropertyNames(prototype)
            .forEach(function (name) {
            if (name === 'constructor' || typeof proxy[name] !== 'function' || name.charAt(0) === '_') {
                return;
            }
            proxy[name] = trap(target, name, proxy);
        });
    });
    return proxy;
}
function traversePrototypeOf(target, iteratee) {
    var prototype = Object.getPrototypeOf(target);
    while (prototype) {
        iteratee(prototype);
        prototype = Object.getPrototypeOf(prototype);
    }
}


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CancellablePromise = /** @class */ (function () {
    function CancellablePromise(promise) {
        var _this = this;
        var cancellable = new Promise(function (resolve, reject) {
            _this.cancel = reject;
        });
        this.promise = Promise.race([promise, cancellable]);
    }
    return CancellablePromise;
}());
exports.default = CancellablePromise;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getEnvironment() {
    try {
        return process.env.NODE_ENV || 'development';
    }
    catch (e) {
        return 'development';
    }
}
exports.default = getEnvironment;


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isEqual(objectA, objectB, options) {
    if (objectA === objectB) {
        return true;
    }
    if (objectA && objectB && typeof objectA === 'object' && typeof objectB === 'object') {
        if (Array.isArray(objectA) && Array.isArray(objectB)) {
            return isArrayEqual(objectA, objectB, options);
        }
        if (Array.isArray(objectA) || Array.isArray(objectB)) {
            return false;
        }
        if ((objectA instanceof Date) && (objectB instanceof Date)) {
            return isDateEqual(objectA, objectB);
        }
        if ((objectA instanceof Date) || (objectB instanceof Date)) {
            return false;
        }
        if ((objectA instanceof RegExp) && (objectB instanceof RegExp)) {
            return isRegExpEqual(objectA, objectB);
        }
        if ((objectA instanceof RegExp) || (objectB instanceof RegExp)) {
            return false;
        }
        return isObjectEqual(objectA, objectB, options);
    }
    return objectA === objectB;
}
exports.default = isEqual;
function isRegExpEqual(objectA, objectB) {
    return objectA.toString() === objectB.toString();
}
function isDateEqual(objectA, objectB) {
    return objectA.getTime() === objectB.getTime();
}
function isArrayEqual(objectA, objectB, options) {
    if (objectA.length !== objectB.length) {
        return false;
    }
    for (var index = 0, length_1 = objectA.length; index < length_1; index++) {
        if (!isEqual(objectA[index], objectB[index], options)) {
            return false;
        }
    }
    return true;
}
function isObjectEqual(objectA, objectB, options) {
    var filter = options && options.keyFilter;
    var keysA = filter ? Object.keys(objectA).filter(filter) : Object.keys(objectA);
    var keysB = filter ? Object.keys(objectB).filter(filter) : Object.keys(objectB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (var index = 0, length_2 = keysA.length; index < length_2; index++) {
        var key = keysA[index];
        if (!objectB.hasOwnProperty(key)) {
            return false;
        }
        if (!isEqual(objectA[key], objectB[key], options)) {
            return false;
        }
    }
    return true;
}


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
/**
 * Push an item to an array if it doesn't exist in the array. Otherwise, merge
 * with the existing item in the array. This function always returns a new array.
 */
function mergeOrPush(array, item, predicate) {
    var index = lodash_1.findIndex(array, typeof predicate === 'object' ? lodash_1.pickBy(predicate) : predicate);
    var newArray = array.slice();
    if (index === -1) {
        newArray.push(item);
    }
    else {
        newArray[index] = lodash_1.isPlainObject(item) ? lodash_1.assign({}, array[index], item) : item;
    }
    return newArray;
}
exports.default = mergeOrPush;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var is_private_1 = __webpack_require__(49);
var omit_deep_1 = __webpack_require__(50);
function omitPrivate(object) {
    return omit_deep_1.default(object, function (value, key) { return is_private_1.default(key); });
}
exports.default = omitPrivate;


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function setPrototypeOf(object, prototype) {
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(object, prototype);
    }
    else {
        object.__proto__ = prototype;
    }
    return object;
}
exports.default = setPrototypeOf;


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function toSingleLine(input) {
    return input.split(/(?:\r\n|\n|\r)/)
        .map(function (line) { return line.replace(/^\s+/gm, ''); })
        .join(' ')
        .trim();
}
exports.default = toSingleLine;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var standard_error_1 = __webpack_require__(16);
var MissingDataErrorType;
(function (MissingDataErrorType) {
    MissingDataErrorType[MissingDataErrorType["MissingCart"] = 0] = "MissingCart";
    MissingDataErrorType[MissingDataErrorType["MissingCheckout"] = 1] = "MissingCheckout";
    MissingDataErrorType[MissingDataErrorType["MissingConsignments"] = 2] = "MissingConsignments";
    MissingDataErrorType[MissingDataErrorType["MissingCheckoutConfig"] = 3] = "MissingCheckoutConfig";
    MissingDataErrorType[MissingDataErrorType["MissingOrder"] = 4] = "MissingOrder";
    MissingDataErrorType[MissingDataErrorType["MissingOrderConfig"] = 5] = "MissingOrderConfig";
    MissingDataErrorType[MissingDataErrorType["MissingOrderId"] = 6] = "MissingOrderId";
    MissingDataErrorType[MissingDataErrorType["MissingPaymentMethod"] = 7] = "MissingPaymentMethod";
})(MissingDataErrorType = exports.MissingDataErrorType || (exports.MissingDataErrorType = {}));
var MissingDataError = /** @class */ (function (_super) {
    tslib_1.__extends(MissingDataError, _super);
    function MissingDataError(subtype) {
        var _this = _super.call(this, getErrorMessage(subtype)) || this;
        _this.subtype = subtype;
        _this.type = 'missing_data';
        return _this;
    }
    return MissingDataError;
}(standard_error_1.default));
exports.default = MissingDataError;
function getErrorMessage(type) {
    switch (type) {
        case MissingDataErrorType.MissingCart:
            return 'Unable to proceed because cart data is unavailable.';
        case MissingDataErrorType.MissingConsignments:
            return 'Unable to proceed because consignments data is unavailable.';
        case MissingDataErrorType.MissingCheckout:
            return 'Unable to proceed because checkout data is unavailable.';
        case MissingDataErrorType.MissingCheckoutConfig:
        case MissingDataErrorType.MissingOrderConfig:
            return 'Unable to proceed because configuration data is unavailable.';
        case MissingDataErrorType.MissingOrder:
            return 'Unable to proceed because order data is unavailable.';
        case MissingDataErrorType.MissingOrderId:
            return 'Unable to proceed because order ID is unavailable or not generated yet.';
        case MissingDataErrorType.MissingPaymentMethod:
            return 'Unable to proceed because payment method data is unavailable or not properly configured.';
        default:
            return 'Unable to proceed because the required data is unavailable.';
    }
}


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var standard_error_1 = __webpack_require__(16);
var NotImplementedError = /** @class */ (function (_super) {
    tslib_1.__extends(NotImplementedError, _super);
    function NotImplementedError(message) {
        var _this = _super.call(this, message || 'Not implemented.') || this;
        _this.type = 'not_implemented';
        return _this;
    }
    return NotImplementedError;
}(standard_error_1.default));
exports.default = NotImplementedError;


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var standard_error_1 = __webpack_require__(16);
var NotInitializedErrorType;
(function (NotInitializedErrorType) {
    NotInitializedErrorType[NotInitializedErrorType["CustomerNotInitialized"] = 0] = "CustomerNotInitialized";
    NotInitializedErrorType[NotInitializedErrorType["PaymentNotInitialized"] = 1] = "PaymentNotInitialized";
    NotInitializedErrorType[NotInitializedErrorType["ShippingNotInitialized"] = 2] = "ShippingNotInitialized";
})(NotInitializedErrorType = exports.NotInitializedErrorType || (exports.NotInitializedErrorType = {}));
var NotInitializedError = /** @class */ (function (_super) {
    tslib_1.__extends(NotInitializedError, _super);
    function NotInitializedError(subtype) {
        var _this = _super.call(this, getErrorMessage(subtype)) || this;
        _this.subtype = subtype;
        _this.type = 'not_initialized';
        return _this;
    }
    return NotInitializedError;
}(standard_error_1.default));
exports.default = NotInitializedError;
function getErrorMessage(type) {
    switch (type) {
        case NotInitializedErrorType.CustomerNotInitialized:
            return 'Unable to proceed because the customer step of checkout has not been initialized.';
        case NotInitializedErrorType.PaymentNotInitialized:
            return 'Unable to proceed because the payment step of checkout has not been initialized.';
        case NotInitializedErrorType.ShippingNotInitialized:
            return 'Unable to proceed because the shipping step of checkout has not been initialized.';
        default:
            return 'Unable to proceed because the required component has not been initialized.';
    }
}


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var request_error_1 = __webpack_require__(32);
/**
 * @todo Convert this file into TypeScript properly
 */
var TimeoutError = /** @class */ (function (_super) {
    tslib_1.__extends(TimeoutError, _super);
    function TimeoutError(response) {
        var _this = _super.call(this, response, 'The request has timed out or aborted.') || this;
        _this.type = 'timeout';
        return _this;
    }
    return TimeoutError;
}(request_error_1.default));
exports.default = TimeoutError;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var request_error_1 = __webpack_require__(32);
var UnrecoverableError = /** @class */ (function (_super) {
    tslib_1.__extends(UnrecoverableError, _super);
    function UnrecoverableError(response, message) {
        var _this = _super.call(this, response, message || 'An unexpected error has occurred. The checkout process cannot continue as a result.') || this;
        _this.type = 'unrecoverable';
        return _this;
    }
    return UnrecoverableError;
}(request_error_1.default));
exports.default = UnrecoverableError;


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var standard_error_1 = __webpack_require__(16);
var UnsupportedBrowserError = /** @class */ (function (_super) {
    tslib_1.__extends(UnsupportedBrowserError, _super);
    function UnsupportedBrowserError(message) {
        var _this = _super.call(this, message || 'Unsupported browser error') || this;
        _this.type = 'unsupported_browser';
        return _this;
    }
    return UnsupportedBrowserError;
}(standard_error_1.default));
exports.default = UnsupportedBrowserError;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["JsonV1"] = "application/vnd.bc.v1+json";
})(ContentType || (ContentType = {}));
exports.default = ContentType;


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function toFormUrlEncoded(data) {
    return Object.keys(data)
        .filter(function (key) { return data[key] !== undefined; })
        .map(function (key) {
        var value = data[key];
        if (typeof value === 'string') {
            return key + "=" + encodeURIComponent(value);
        }
        return key + "=" + encodeURIComponent(JSON.stringify(value) || '');
    })
        .join('&');
}
exports.default = toFormUrlEncoded;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var checkout_1 = __webpack_require__(7);
function createCheckoutSelectors(selectors) {
    var data = new checkout_1.CheckoutStoreSelector(selectors);
    var errors = new checkout_1.CheckoutStoreErrorSelector(selectors);
    var statuses = new checkout_1.CheckoutStoreStatusSelector(selectors);
    return {
        data: data,
        errors: errors,
        statuses: statuses,
    };
}
exports.default = createCheckoutSelectors;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var error_1 = __webpack_require__(56);
var errors_1 = __webpack_require__(1);
var utility_1 = __webpack_require__(8);
function createCheckoutServiceErrorTransformer(isDevelopment) {
    if (isDevelopment === void 0) { isDevelopment = utility_1.getEnvironment() === 'development'; }
    return new error_1.ErrorMessageTransformer(function (error) {
        if (!isDevelopment || !isCheckoutServiceError(error)) {
            return error.message;
        }
        switch (error.subtype || error.type) {
            case errors_1.MissingDataErrorType.MissingConsignments:
                return "\n                " + error.message + "\n                The data could be unavailable because no shipping address has been provided.\n                To fix this, create a consignment or update the shipping address before performing\n                the same action again.\n            ";
            case errors_1.MissingDataErrorType.MissingCart:
            case errors_1.MissingDataErrorType.MissingCheckout:
                return "\n                " + error.message + "\n                The data could be unavailable because it has not loaded from the server yet.\n                To fix this issue, you can try calling `CheckoutService#loadCheckout`\n                before performing the same action again.\n            ";
            case errors_1.MissingDataErrorType.MissingCheckoutConfig:
                return "\n                " + error.message + "\n                The data could be unavailable because it has not loaded from the server yet.\n                To fix this issue, you need to make sure `CheckoutService` is initialized\n                properly by calling `CheckoutService#loadCheckout` before performing any\n                other actions.\n            ";
            case errors_1.MissingDataErrorType.MissingOrder:
                return "\n                " + error.message + "\n                The data could be unavailable because it has not loaded from the server yet.\n                To fix this issue, you can try calling `CheckoutService#loadOrder`\n                before performing the same action again.\n            ";
            case errors_1.MissingDataErrorType.MissingOrderId:
                return "\n                " + error.message + "\n                The data could be unavailable because no order has been created yet. You have\n                to first create the order before you can perform the action.\n            ";
            case errors_1.MissingDataErrorType.MissingPaymentMethod:
                return "\n                " + error.message + "\n                The data could be unavailable because it has not loaded from the server, or\n                configured by the merchant yet. To fix the former issue, you can try calling\n                `CheckoutService#loadPaymentMethods` before performing the same action again.\n            ";
            case errors_1.NotInitializedErrorType.CustomerNotInitialized:
                return "\n                In order to initialize the customer step of checkout, you need to call\n                `CheckoutService#initializeCustomer`. Afterwards, you should be able to\n                submit customer details.\n            ";
            case errors_1.NotInitializedErrorType.PaymentNotInitialized:
                return "\n                " + error.message + "\n                In order to initialize the payment step of checkout, you need to call\n                `CheckoutService#initializePayment`. Afterwards, you should be able to\n                submit payment details.\n            ";
            case errors_1.NotInitializedErrorType.ShippingNotInitialized:
                return "\n                " + error.message + "\n                In order to initialize the shipping step of checkout, you need to call\n                `CheckoutService#initializeShipping`. Afterwards, you should be able to\n                submit shipping details.\n            ";
            default:
                return error.message;
        }
    });
}
exports.default = createCheckoutServiceErrorTransformer;
function isCheckoutServiceError(error) {
    return !!(error.subtype || error.type);
}


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __webpack_require__(12);
var errors_2 = __webpack_require__(1);
var request_error_factory_1 = __webpack_require__(57);
function createRequestErrorFactory() {
    var factory = new request_error_factory_1.default();
    var unrecoverableErrorTypes = [
        'catalog_only',
        'empty_cart',
        'invalid_order_id',
        'invalid_order_token',
        'missing_order_token',
        'missing_provider_token',
        'missing_shipping_method',
        'order_completion_error',
        'order_could_not_be_finalized_error',
        'order_create_failed',
        'provider_fatal_error',
        'provider_setup_error',
        'stock_too_low',
    ];
    unrecoverableErrorTypes.forEach(function (type) {
        factory.register(type, function (response, message) { return new errors_2.UnrecoverableError(response, message); });
    });
    factory.register('invalid_payment_provider', function (response) { return new errors_1.PaymentMethodInvalidError(response); });
    factory.register('payment_config_not_found', function (response) { return new errors_1.PaymentMethodInvalidError(response); });
    return factory;
}
exports.default = createRequestErrorFactory;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var PaymentArgumentInvalidError = /** @class */ (function (_super) {
    tslib_1.__extends(PaymentArgumentInvalidError, _super);
    function PaymentArgumentInvalidError(invalidFields) {
        var _this = this;
        var message = 'Unable to submit payment for the order because the payload is invalid.';
        if (invalidFields) {
            message = message + " Make sure the following fields are provided correctly: " + invalidFields.join(', ') + ".";
        }
        _this = _super.call(this, message) || this;
        return _this;
    }
    return PaymentArgumentInvalidError;
}(errors_1.InvalidArgumentError));
exports.default = PaymentArgumentInvalidError;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var PaymentMethodInvalidError = /** @class */ (function (_super) {
    tslib_1.__extends(PaymentMethodInvalidError, _super);
    function PaymentMethodInvalidError(response) {
        var _this = _super.call(this, response, 'There is a problem processing your payment. Please try again later.') || this;
        _this.type = 'payment_method_invalid';
        return _this;
    }
    return PaymentMethodInvalidError;
}(errors_1.RequestError));
exports.default = PaymentMethodInvalidError;


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var PaymentMethodCancelledError = /** @class */ (function (_super) {
    tslib_1.__extends(PaymentMethodCancelledError, _super);
    function PaymentMethodCancelledError() {
        var _this = _super.call(this, 'Payment process was cancelled.') || this;
        _this.type = 'payment_cancelled';
        return _this;
    }
    return PaymentMethodCancelledError;
}(errors_1.StandardError));
exports.default = PaymentMethodCancelledError;


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utility_1 = __webpack_require__(8);
var ErrorMessageTransformer = /** @class */ (function () {
    function ErrorMessageTransformer(_messageCustomizer) {
        this._messageCustomizer = _messageCustomizer;
    }
    ErrorMessageTransformer.prototype.transform = function (error) {
        error.message = utility_1.toSingleLine(this._messageCustomizer(error));
        return error;
    };
    return ErrorMessageTransformer;
}());
exports.default = ErrorMessageTransformer;


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
/**
 * Responsible for getting the error of any asynchronous checkout action, if
 * there is any.
 *
 * This object has a set of getters that would return an error if an action is
 * not executed successfully. For example, if you are unable to submit an order,
 * you can use this object to retrieve the reason for the failure.
 */
var CheckoutStoreErrorSelector = /** @class */ (function () {
    /**
     * @internal
     */
    function CheckoutStoreErrorSelector(selectors) {
        this._billingAddress = selectors.billingAddress;
        this._cart = selectors.cart;
        this._checkout = selectors.checkout;
        this._config = selectors.config;
        this._consignments = selectors.consignments;
        this._countries = selectors.countries;
        this._coupons = selectors.coupons;
        this._customerStrategies = selectors.customerStrategies;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._paymentStrategies = selectors.paymentStrategies;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingStrategies = selectors.shippingStrategies;
    }
    /**
     * Gets the error of any checkout action that has failed.
     *
     * @returns The error object if unable to perform any checkout action,
     * otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getError = function () {
        return this.getLoadCheckoutError() ||
            this.getSubmitOrderError() ||
            this.getFinalizeOrderError() ||
            this.getLoadOrderError() ||
            this.getLoadCartError() ||
            this.getLoadBillingCountriesError() ||
            this.getLoadShippingCountriesError() ||
            this.getLoadPaymentMethodsError() ||
            this.getLoadPaymentMethodError() ||
            this.getInitializePaymentError() ||
            this.getLoadShippingOptionsError() ||
            this.getSelectShippingOptionError() ||
            this.getSignInError() ||
            this.getSignOutError() ||
            this.getInitializeCustomerError() ||
            this.getUpdateShippingAddressError() ||
            this.getUpdateBillingAddressError() ||
            this.getUpdateConsignmentError() ||
            this.getCreateConsignmentsError() ||
            this.getInitializeShippingError() ||
            this.getApplyCouponError() ||
            this.getRemoveCouponError() ||
            this.getApplyGiftCertificateError() ||
            this.getRemoveGiftCertificateError() ||
            this.getLoadInstrumentsError() ||
            this.getDeleteInstrumentError() ||
            this.getLoadConfigError();
    };
    /**
     * Returns an error if unable to load the current checkout.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadCheckoutError = function () {
        return this._checkout.getLoadError();
    };
    /**
     * Returns an error if unable to submit the current order.
     *
     * @returns The error object if unable to submit, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getSubmitOrderError = function () {
        return this._paymentStrategies.getExecuteError();
    };
    /**
     * Returns an error if unable to finalize the current order.
     *
     * @returns The error object if unable to finalize, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getFinalizeOrderError = function () {
        return this._paymentStrategies.getFinalizeError();
    };
    /**
     * Returns an error if unable to load the current order.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadOrderError = function () {
        return this._order.getLoadError();
    };
    /**
     * Returns an error if unable to load the current cart.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadCartError = function () {
        return this._cart.getLoadError();
    };
    /**
     * Returns an error if unable to load billing countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadBillingCountriesError = function () {
        return this._countries.getLoadError();
    };
    /**
     * Returns an error if unable to load shipping countries.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadShippingCountriesError = function () {
        return this._shippingCountries.getLoadError();
    };
    /**
     * Returns an error if unable to load payment methods.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadPaymentMethodsError = function () {
        return this._paymentMethods.getLoadError();
    };
    /**
     * Returns an error if unable to load a specific payment method.
     *
     * @param methodId - The identifier of the payment method to load.
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadPaymentMethodError = function (methodId) {
        return this._paymentMethods.getLoadMethodError(methodId);
    };
    /**
     * Returns an error if unable to initialize a specific payment method.
     *
     * @param methodId - The identifier of the payment method to initialize.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getInitializePaymentError = function (methodId) {
        return this._paymentStrategies.getInitializeError(methodId);
    };
    /**
     * Returns an error if unable to sign in.
     *
     * @returns The error object if unable to sign in, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getSignInError = function () {
        return this._customerStrategies.getSignInError();
    };
    /**
     * Returns an error if unable to sign out.
     *
     * @returns The error object if unable to sign out, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getSignOutError = function () {
        return this._customerStrategies.getSignOutError();
    };
    /**
     * Returns an error if unable to initialize the customer step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getInitializeCustomerError = function (methodId) {
        return this._customerStrategies.getInitializeError(methodId);
    };
    /**
     * Returns an error if unable to load shipping options.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadShippingOptionsError = function () {
        return this._consignments.getLoadShippingOptionsError();
    };
    /**
     * Returns an error if unable to select a shipping option.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to select, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getSelectShippingOptionError = function (consignmentId) {
        return this._shippingStrategies.getSelectOptionError() ||
            this._consignments.getUpdateShippingOptionError(consignmentId);
    };
    /**
     * Returns an error if unable to update billing address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getUpdateBillingAddressError = function () {
        return this._billingAddress.getUpdateError();
    };
    /**
     * Returns an error if unable to update shipping address.
     *
     * @returns The error object if unable to update, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getUpdateShippingAddressError = function () {
        return this._shippingStrategies.getUpdateAddressError();
    };
    /**
     * Returns an error if unable to update a consignment.
     *
     * A consignment ID should be provided when checking for an error for a
     * specific consignment, otherwise it will check for all available consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns The error object if unable to update, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getUpdateConsignmentError = function (consignmentId) {
        return this._consignments.getUpdateError(consignmentId);
    };
    /**
     * Returns an error if unable to create consignments.
     *
     * @returns The error object if unable to create, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getCreateConsignmentsError = function () {
        return this._consignments.getCreateError();
    };
    /**
     * Returns an error if unable to initialize the shipping step of a checkout
     * process.
     *
     * @param methodId - The identifer of the initialization method to execute.
     * @returns The error object if unable to initialize, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getInitializeShippingError = function (methodId) {
        return this._shippingStrategies.getInitializeError(methodId);
    };
    /**
     * Returns an error if unable to apply a coupon code.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getApplyCouponError = function () {
        return this._coupons.getApplyError();
    };
    /**
     * Returns an error if unable to remove a coupon code.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getRemoveCouponError = function () {
        return this._coupons.getRemoveError();
    };
    /**
     * Returns an error if unable to apply a gift certificate.
     *
     * @returns The error object if unable to apply, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getApplyGiftCertificateError = function () {
        return this._giftCertificates.getApplyError();
    };
    /**
     * Returns an error if unable to remove a gift certificate.
     *
     * @returns The error object if unable to remove, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getRemoveGiftCertificateError = function () {
        return this._giftCertificates.getRemoveError();
    };
    /**
     * Returns an error if unable to load payment instruments.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadInstrumentsError = function () {
        return this._instruments.getLoadError();
    };
    /**
     * Returns an error if unable to delete a payment instrument.
     *
     * @param instrumentId - The identifier of the payment instrument to delete.
     * @returns The error object if unable to delete, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getDeleteInstrumentError = function (instrumentId) {
        return this._instruments.getDeleteError(instrumentId);
    };
    /**
     * Returns an error if unable to load the checkout configuration of a store.
     *
     * @returns The error object if unable to load, otherwise undefined.
     */
    CheckoutStoreErrorSelector.prototype.getLoadConfigError = function () {
        return this._config.getLoadError();
    };
    CheckoutStoreErrorSelector = tslib_1.__decorate([
        selector_1.selector
    ], CheckoutStoreErrorSelector);
    return CheckoutStoreErrorSelector;
}());
exports.default = CheckoutStoreErrorSelector;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
/**
 * Responsible for getting the state of the current checkout.
 *
 * This object has a set of methods that allow you to get a specific piece of
 * checkout information, such as shipping and billing details.
 */
var CheckoutStoreSelector = /** @class */ (function () {
    /**
     * @internal
     */
    function CheckoutStoreSelector(selectors) {
        this._billingAddress = selectors.billingAddress;
        this._cart = selectors.cart;
        this._checkout = selectors.checkout;
        this._config = selectors.config;
        this._consignments = selectors.consignments;
        this._countries = selectors.countries;
        this._coupons = selectors.coupons;
        this._customer = selectors.customer;
        this._form = selectors.form;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._payment = selectors.payment;
        this._paymentMethods = selectors.paymentMethods;
        this._shippingAddress = selectors.shippingAddress;
        this._shippingCountries = selectors.shippingCountries;
    }
    /**
     * Gets the current checkout.
     *
     * @returns The current checkout if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getCheckout = function () {
        return this._checkout.getCheckout();
    };
    /**
     * Gets the current order.
     *
     * @returns The current order if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getOrder = function () {
        return this._order.getOrder();
    };
    /**
     * Gets the checkout configuration of a store.
     *
     * @returns The configuration object if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getConfig = function () {
        return this._config.getStoreConfig();
    };
    /**
     * Gets the shipping address of the current checkout.
     *
     * If the address is partially complete, it may not have shipping options
     * associated with it.
     *
     * @returns The shipping address object if it is loaded, otherwise
     * undefined.
     */
    CheckoutStoreSelector.prototype.getShippingAddress = function () {
        return this._shippingAddress.getShippingAddress();
    };
    /**
     * Gets a list of shipping options available for the shipping address.
     *
     * If there is no shipping address assigned to the current checkout, the
     * list of shipping options will be empty.
     *
     * @returns The list of shipping options if any, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getShippingOptions = function () {
        var consignments = this._consignments.getConsignments();
        if (consignments && consignments.length) {
            return consignments[0].availableShippingOptions;
        }
        return;
    };
    /**
     * Gets a list of consignments.
     *
     * If there are no consignments created for to the current checkout, the
     * list will be empty.
     *
     * @returns The list of consignments if any, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getConsignments = function () {
        return this._consignments.getConsignments();
    };
    /**
     * Gets the selected shipping option for the current checkout.
     *
     * @returns The shipping option object if there is a selected option,
     * otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getSelectedShippingOption = function () {
        var consignments = this._consignments.getConsignments();
        if (!consignments || !consignments.length) {
            return;
        }
        return consignments[0].selectedShippingOption;
    };
    /**
     * Gets a list of countries available for shipping.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getShippingCountries = function () {
        return this._shippingCountries.getShippingCountries();
    };
    /**
     * Gets the billing address of an order.
     *
     * @returns The billing address object if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getBillingAddress = function () {
        return this._billingAddress.getBillingAddress();
    };
    /**
     * Gets a list of countries available for billing.
     *
     * @returns The list of countries if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getBillingCountries = function () {
        return this._countries.getCountries();
    };
    /**
     * Gets a list of payment methods available for checkout.
     *
     * @returns The list of payment methods if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getPaymentMethods = function () {
        return this._paymentMethods.getPaymentMethods();
    };
    /**
     * Gets a payment method by an id.
     *
     * The method returns undefined if unable to find a payment method with the
     * specified id, either because it is not available for the customer, or it
     * is not loaded.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns The payment method object if loaded and available, otherwise,
     * undefined.
     */
    CheckoutStoreSelector.prototype.getPaymentMethod = function (methodId, gatewayId) {
        return this._paymentMethods.getPaymentMethod(methodId, gatewayId);
    };
    /**
     * Gets the payment method that is selected for checkout.
     *
     * @returns The payment method object if there is a selected method;
     * undefined if otherwise.
     */
    CheckoutStoreSelector.prototype.getSelectedPaymentMethod = function () {
        var payment = this._payment.getPaymentId();
        return payment && this._paymentMethods.getPaymentMethod(payment.providerId, payment.gatewayId);
    };
    /**
     * Gets the current cart.
     *
     * @returns The current cart object if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getCart = function () {
        return this._cart.getCart();
    };
    /**
     * Gets a list of coupons that are applied to the current checkout.
     *
     * @returns The list of applied coupons if there is any, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getCoupons = function () {
        return this._coupons.getCoupons();
    };
    /**
     * Gets a list of gift certificates that are applied to the current checkout.
     *
     * @returns The list of applied gift certificates if there is any, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getGiftCertificates = function () {
        return this._giftCertificates.getGiftCertificates();
    };
    /**
     * Gets the current customer.
     *
     * @returns The current customer object if it is loaded, otherwise
     * undefined.
     */
    CheckoutStoreSelector.prototype.getCustomer = function () {
        return this._customer.getCustomer();
    };
    /**
     * Checks if payment data is required or not.
     *
     * If payment data is required, customers should be prompted to enter their
     * payment details.
     *
     * ```js
     * if (state.checkout.isPaymentDataRequired()) {
     *     // Render payment form
     * } else {
     *     // Render "Payment is not required for this order" message
     * }
     * ```
     *
     * @param useStoreCredit - If true, check whether payment data is required
     * with store credit applied; otherwise, check without store credit.
     * @returns True if payment data is required, otherwise false.
     */
    CheckoutStoreSelector.prototype.isPaymentDataRequired = function (useStoreCredit) {
        return this._payment.isPaymentDataRequired(useStoreCredit);
    };
    /**
     * Checks if payment data is submitted or not.
     *
     * If payment data is already submitted using a payment method, customers
     * should not be prompted to enter their payment details again.
     *
     * @param methodId - The identifier of the payment method.
     * @param gatewayId - The identifier of a payment provider providing the
     * payment method.
     * @returns True if payment data is submitted, otherwise false.
     */
    CheckoutStoreSelector.prototype.isPaymentDataSubmitted = function (methodId, gatewayId) {
        return this._payment.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    };
    /**
     * Gets a list of payment instruments associated with the current customer.
     *
     * @returns The list of payment instruments if it is loaded, otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getInstruments = function () {
        return this._instruments.getInstruments();
    };
    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their billing address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of billing address form fields if it is loaded,
     * otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getBillingAddressFields = function (countryCode) {
        return this._form.getBillingAddressFields(this.getBillingCountries(), countryCode);
    };
    /**
     * Gets a set of form fields that should be presented to customers in order
     * to capture their shipping address for a specific country.
     *
     * @param countryCode - A 2-letter country code (ISO 3166-1 alpha-2).
     * @returns The set of shipping address form fields if it is loaded,
     * otherwise undefined.
     */
    CheckoutStoreSelector.prototype.getShippingAddressFields = function (countryCode) {
        return this._form.getShippingAddressFields(this.getShippingCountries(), countryCode);
    };
    CheckoutStoreSelector = tslib_1.__decorate([
        selector_1.selector
    ], CheckoutStoreSelector);
    return CheckoutStoreSelector;
}());
exports.default = CheckoutStoreSelector;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
/**
 * Responsible for checking the statuses of various asynchronous actions related
 * to checkout.
 *
 * This object has a set of getters that return true if an action is in
 * progress. For example, you can check whether a customer is submitting an
 * order and waiting for the request to complete.
 */
var CheckoutStoreStatusSelector = /** @class */ (function () {
    /**
     * @internal
     */
    function CheckoutStoreStatusSelector(selectors) {
        this._billingAddress = selectors.billingAddress;
        this._cart = selectors.cart;
        this._checkout = selectors.checkout;
        this._config = selectors.config;
        this._consignments = selectors.consignments;
        this._countries = selectors.countries;
        this._coupons = selectors.coupons;
        this._customerStrategies = selectors.customerStrategies;
        this._giftCertificates = selectors.giftCertificates;
        this._instruments = selectors.instruments;
        this._order = selectors.order;
        this._paymentMethods = selectors.paymentMethods;
        this._paymentStrategies = selectors.paymentStrategies;
        this._shippingCountries = selectors.shippingCountries;
        this._shippingStrategies = selectors.shippingStrategies;
    }
    /**
     * Checks whether any checkout action is pending.
     *
     * @returns True if there is a pending action, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isPending = function () {
        return this.isLoadingCheckout() ||
            this.isSubmittingOrder() ||
            this.isFinalizingOrder() ||
            this.isLoadingOrder() ||
            this.isLoadingCart() ||
            this.isLoadingBillingCountries() ||
            this.isLoadingShippingCountries() ||
            this.isLoadingPaymentMethods() ||
            this.isLoadingPaymentMethod() ||
            this.isInitializingPayment() ||
            this.isLoadingShippingOptions() ||
            this.isSelectingShippingOption() ||
            this.isSigningIn() ||
            this.isSigningOut() ||
            this.isInitializingCustomer() ||
            this.isUpdatingBillingAddress() ||
            this.isUpdatingShippingAddress() ||
            this.isUpdatingConsignment() ||
            this.isCreatingConsignments() ||
            this.isInitializingShipping() ||
            this.isApplyingCoupon() ||
            this.isRemovingCoupon() ||
            this.isApplyingGiftCertificate() ||
            this.isRemovingGiftCertificate() ||
            this.isLoadingInstruments() ||
            this.isDeletingInstrument() ||
            this.isLoadingConfig() ||
            this.isCustomerStepPending() ||
            this.isPaymentStepPending();
    };
    /**
     * Checks whether the current checkout is loading.
     *
     * @returns True if the current checkout is loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingCheckout = function () {
        return this._checkout.isLoading();
    };
    /**
     * Checks whether the current order is submitting.
     *
     * @returns True if the current order is submitting, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isSubmittingOrder = function () {
        return this._paymentStrategies.isExecuting();
    };
    /**
     * Checks whether the current order is finalizing.
     *
     * @returns True if the current order is finalizing, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isFinalizingOrder = function () {
        return this._paymentStrategies.isFinalizing();
    };
    /**
     * Checks whether the current order is loading.
     *
     * @returns True if the current order is loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingOrder = function () {
        return this._order.isLoading();
    };
    /**
     * Checks whether the current cart is loading.
     *
     * @returns True if the current cart is loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingCart = function () {
        return this._cart.isLoading();
    };
    /**
     * Checks whether billing countries are loading.
     *
     * @returns True if billing countries are loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingBillingCountries = function () {
        return this._countries.isLoading();
    };
    /**
     * Checks whether shipping countries are loading.
     *
     * @returns True if shipping countries are loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingShippingCountries = function () {
        return this._shippingCountries.isLoading();
    };
    /**
     * Checks whether payment methods are loading.
     *
     * @returns True if payment methods are loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingPaymentMethods = function () {
        return this._paymentMethods.isLoading();
    };
    /**
     * Checks whether a specific or any payment method is loading.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is loading.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingPaymentMethod = function (methodId) {
        return this._paymentMethods.isLoadingMethod(methodId);
    };
    /**
     * Checks whether a specific or any payment method is initializing.
     *
     * The method returns true if no ID is provided and at least one payment
     * method is initializing.
     *
     * @param methodId - The identifier of the payment method to check.
     * @returns True if the payment method is initializing, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isInitializingPayment = function (methodId) {
        return this._paymentStrategies.isInitializing(methodId);
    };
    /**
     * Checks whether the current customer is signing in.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing in using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing in the
     * current customer.
     * @returns True if the customer is signing in, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isSigningIn = function (methodId) {
        return this._customerStrategies.isSigningIn(methodId);
    };
    /**
     * Checks whether the current customer is signing out.
     *
     * If an ID is provided, the method also checks whether the customer is
     * signing out using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for signing out the
     * current customer.
     * @returns True if the customer is signing out, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isSigningOut = function (methodId) {
        return this._customerStrategies.isSigningOut(methodId);
    };
    /**
     * Checks whether the customer step is initializing.
     *
     * If an ID is provided, the method also checks whether the customer step is
     * initializing using a specific customer method with the same ID.
     *
     * @param methodId - The identifier of the method used for initializing the
     * customer step of checkout.
     * @returns True if the customer step is initializing, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isInitializingCustomer = function (methodId) {
        return this._customerStrategies.isInitializing(methodId);
    };
    /**
     * Checks whether shipping options are loading.
     *
     * @returns True if shipping options are loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingShippingOptions = function () {
        return this._consignments.isLoadingShippingOptions();
    };
    /**
     * Checks whether a shipping option is being selected.
     *
     * A consignment ID should be provided when checking if a shipping option
     * is being selected for a specific consignment, otherwise it will check
     * for all consignments.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if selecting a shipping option, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isSelectingShippingOption = function (consignmentId) {
        return this._shippingStrategies.isSelectingOption() ||
            this._consignments.isUpdatingShippingOption(consignmentId);
    };
    /**
     * Checks whether the current customer is updating their billing address.
     *
     * @returns True if updating their billing address, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isUpdatingBillingAddress = function () {
        return this._billingAddress.isUpdating();
    };
    /**
     * Checks whether the current customer is updating their shipping address.
     *
     * @returns True if updating their shipping address, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isUpdatingShippingAddress = function () {
        return this._shippingStrategies.isUpdatingAddress();
    };
    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @param consignmentId - The identifier of the consignment to be checked.
     * @returns True if updating consignment(s), otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isUpdatingConsignment = function (consignmentId) {
        return this._consignments.isUpdating(consignmentId);
    };
    /**
     * Checks whether a given/any consignment is being updated.
     *
     * A consignment ID should be provided when checking for a specific consignment,
     * otherwise it will check for any consignment.
     *
     * @returns True if creating consignments, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isCreatingConsignments = function () {
        return this._consignments.isCreating();
    };
    /**
     * Checks whether the shipping step of a checkout process is initializing.
     *
     * If an identifier is provided, the method also checks whether the shipping
     * step is initializing using a specific shipping method with the same
     * identifier.
     *
     * @param methodId - The identifer of the initialization method to check.
     * @returns True if the shipping step is initializing, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isInitializingShipping = function (methodId) {
        return this._shippingStrategies.isInitializing(methodId);
    };
    /**
     * Checks whether the current customer is applying a coupon code.
     *
     * @returns True if applying a coupon code, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isApplyingCoupon = function () {
        return this._coupons.isApplying();
    };
    /**
     * Checks whether the current customer is removing a coupon code.
     *
     * @returns True if removing a coupon code, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isRemovingCoupon = function () {
        return this._coupons.isRemoving();
    };
    /**
     * Checks whether the current customer is applying a gift certificate.
     *
     * @returns True if applying a gift certificate, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isApplyingGiftCertificate = function () {
        return this._giftCertificates.isApplying();
    };
    /**
     * Checks whether the current customer is removing a gift certificate.
     *
     * @returns True if removing a gift certificate, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isRemovingGiftCertificate = function () {
        return this._giftCertificates.isRemoving();
    };
    /**
     * Checks whether the current customer's payment instruments are loading.
     *
     * @returns True if payment instruments are loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingInstruments = function () {
        return this._instruments.isLoading();
    };
    /**
     * Checks whether the current customer is deleting a payment instrument.
     *
     * @returns True if deleting a payment instrument, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isDeletingInstrument = function (instrumentId) {
        return this._instruments.isDeleting(instrumentId);
    };
    /**
     * Checks whether the checkout configuration of a store is loading.
     *
     * @returns True if the configuration is loading, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isLoadingConfig = function () {
        return this._config.isLoading();
    };
    /**
     * Checks whether the customer step of a checkout is in a pending state.
     *
     * The customer step is considered to be pending if it is in the process of
     * initializing, signing in, signing out, and/or interacting with a customer
     * widget.
     *
     * @returns True if the customer step is pending, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isCustomerStepPending = function () {
        return this._customerStrategies.isInitializing() ||
            this._customerStrategies.isSigningIn() ||
            this._customerStrategies.isSigningOut() ||
            this._customerStrategies.isWidgetInteracting();
    };
    /**
     * Checks whether the payment step of a checkout is in a pending state.
     *
     * The payment step is considered to be pending if it is in the process of
     * initializing, submitting an order, finalizing an order, and/or
     * interacting with a payment widget.
     *
     * @returns True if the payment step is pending, otherwise false.
     */
    CheckoutStoreStatusSelector.prototype.isPaymentStepPending = function () {
        return this._paymentStrategies.isInitializing() ||
            this._paymentStrategies.isExecuting() ||
            this._paymentStrategies.isFinalizing() ||
            this._paymentStrategies.isWidgetInteracting();
    };
    CheckoutStoreStatusSelector = tslib_1.__decorate([
        selector_1.selector
    ], CheckoutStoreStatusSelector);
    return CheckoutStoreStatusSelector;
}());
exports.default = CheckoutStoreStatusSelector;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AmountTransformer = /** @class */ (function () {
    function AmountTransformer(_dp) {
        this._dp = _dp;
    }
    AmountTransformer.prototype.toInteger = function (amount) {
        return Math.floor(amount * Math.pow(10, this._dp));
    };
    return AmountTransformer;
}());
exports.default = AmountTransformer;


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
var CartComparator = /** @class */ (function () {
    function CartComparator() {
    }
    CartComparator.prototype.isEqual = function (cartA, cartB) {
        return lodash_1.isEqual(this._normalize(cartA), this._normalize(cartB));
    };
    CartComparator.prototype._normalize = function (cart) {
        return {
            cartAmount: cart.cartAmount,
            currency: cart.currency,
            id: cart.id,
            lineItems: {
                digitalItems: cart.lineItems.digitalItems.map(function (item) { return ({
                    extendedSalePrice: item.extendedSalePrice,
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variantId,
                }); }),
                giftCertificates: cart.lineItems.giftCertificates.map(function (item) { return ({
                    amount: item.amount,
                    recipient: item.recipient,
                }); }),
                physicalItems: cart.lineItems.physicalItems.map(function (item) { return ({
                    extendedSalePrice: item.extendedSalePrice,
                    productId: item.productId,
                    quantity: item.quantity,
                    variantId: item.variantId,
                    giftWrapping: item.giftWrapping,
                }); }),
            },
        };
    };
    return CartComparator;
}());
exports.default = CartComparator;


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var billing_address_actions_1 = __webpack_require__(28);
var checkout_1 = __webpack_require__(7);
var coupon_actions_1 = __webpack_require__(23);
var gift_certificate_actions_1 = __webpack_require__(29);
var consignment_actions_1 = __webpack_require__(24);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function cartReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = cartReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressSucceeded:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded:
        case coupon_actions_1.CouponActionType.ApplyCouponSucceeded:
        case coupon_actions_1.CouponActionType.RemoveCouponSucceeded:
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateSucceeded:
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateSucceeded:
            return action.payload ? tslib_1.__assign({}, data, action.payload.cart) : data;
        default:
            return data;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @todo Convert this file into TypeScript properly
 */
var CartRequestSender = /** @class */ (function () {
    function CartRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    CartRequestSender.prototype.loadCart = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/cart';
        return this._requestSender.get(url, { timeout: timeout });
    };
    return CartRequestSender;
}());
exports.default = CartRequestSender;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var CartSelector = /** @class */ (function () {
    function CartSelector(_cart) {
        this._cart = _cart;
    }
    CartSelector.prototype.getCart = function () {
        return this._cart.data;
    };
    CartSelector.prototype.getLoadError = function () {
        return this._cart.errors.loadError;
    };
    CartSelector.prototype.isLoading = function () {
        return !!this._cart.statuses.isLoading;
    };
    CartSelector = tslib_1.__decorate([
        selector_1.selector
    ], CartSelector);
    return CartSelector;
}());
exports.default = CartSelector;


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var coupon_actions_1 = __webpack_require__(23);
var CouponActionCreator = /** @class */ (function () {
    function CouponActionCreator(_couponRequestSender) {
        this._couponRequestSender = _couponRequestSender;
    }
    CouponActionCreator.prototype.applyCoupon = function (code, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(coupon_actions_1.CouponActionType.ApplyCouponRequested));
            _this._couponRequestSender.applyCoupon(checkout.id, code, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(coupon_actions_1.CouponActionType.ApplyCouponSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(coupon_actions_1.CouponActionType.ApplyCouponFailed, response));
            });
        }); };
    };
    CouponActionCreator.prototype.removeCoupon = function (code, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(coupon_actions_1.CouponActionType.RemoveCouponRequested));
            _this._couponRequestSender.removeCoupon(checkout.id, code, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(coupon_actions_1.CouponActionType.RemoveCouponSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(coupon_actions_1.CouponActionType.RemoveCouponFailed, response));
            });
        }); };
    };
    return CouponActionCreator;
}());
exports.default = CouponActionCreator;


/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var checkout_1 = __webpack_require__(7);
var http_request_1 = __webpack_require__(11);
var CouponRequestSender = /** @class */ (function () {
    function CouponRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    CouponRequestSender.prototype.applyCoupon = function (checkoutId, couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkouts/" + checkoutId + "/coupons";
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.post(url, {
            headers: headers,
            timeout: timeout,
            params: {
                include: checkout_1.CheckoutDefaultIncludes.join(','),
            },
            body: { couponCode: couponCode },
        });
    };
    CouponRequestSender.prototype.removeCoupon = function (checkoutId, couponCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkouts/" + checkoutId + "/coupons/" + couponCode;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.delete(url, {
            headers: headers,
            timeout: timeout,
            params: {
                include: checkout_1.CheckoutDefaultIncludes.join(','),
            },
        });
    };
    return CouponRequestSender;
}());
exports.default = CouponRequestSender;


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var CouponSelector = /** @class */ (function () {
    function CouponSelector(_coupon) {
        this._coupon = _coupon;
    }
    CouponSelector.prototype.getCoupons = function () {
        return this._coupon.data;
    };
    CouponSelector.prototype.getRemoveError = function () {
        return this._coupon.errors.removeCouponError;
    };
    CouponSelector.prototype.getApplyError = function () {
        return this._coupon.errors.applyCouponError;
    };
    CouponSelector.prototype.isApplying = function () {
        return !!this._coupon.statuses.isApplyingCoupon;
    };
    CouponSelector.prototype.isRemoving = function () {
        return !!this._coupon.statuses.isRemovingCoupon;
    };
    CouponSelector = tslib_1.__decorate([
        selector_1.selector
    ], CouponSelector);
    return CouponSelector;
}());
exports.default = CouponSelector;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var checkout_1 = __webpack_require__(7);
var order_1 = __webpack_require__(10);
var coupon_actions_1 = __webpack_require__(23);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function couponReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = couponReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case coupon_actions_1.CouponActionType.ApplyCouponSucceeded:
        case coupon_actions_1.CouponActionType.RemoveCouponSucceeded:
        case order_1.OrderActionType.LoadOrderSucceeded:
            return action.payload ? action.payload.coupons : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = {}; }
    switch (action.type) {
        case coupon_actions_1.CouponActionType.ApplyCouponRequested:
        case coupon_actions_1.CouponActionType.ApplyCouponSucceeded:
            return tslib_1.__assign({}, errors, { applyCouponError: undefined });
        case coupon_actions_1.CouponActionType.ApplyCouponFailed:
            return tslib_1.__assign({}, errors, { applyCouponError: action.payload });
        case coupon_actions_1.CouponActionType.RemoveCouponRequested:
        case coupon_actions_1.CouponActionType.RemoveCouponSucceeded:
            return tslib_1.__assign({}, errors, { removeCouponError: undefined });
        case coupon_actions_1.CouponActionType.RemoveCouponFailed:
            return tslib_1.__assign({}, errors, { removeCouponError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = {}; }
    switch (action.type) {
        case coupon_actions_1.CouponActionType.ApplyCouponRequested:
            return tslib_1.__assign({}, statuses, { isApplyingCoupon: true });
        case coupon_actions_1.CouponActionType.ApplyCouponSucceeded:
        case coupon_actions_1.CouponActionType.ApplyCouponFailed:
            return tslib_1.__assign({}, statuses, { isApplyingCoupon: false });
        case coupon_actions_1.CouponActionType.RemoveCouponRequested:
            return tslib_1.__assign({}, statuses, { isRemovingCoupon: true });
        case coupon_actions_1.CouponActionType.RemoveCouponSucceeded:
        case coupon_actions_1.CouponActionType.RemoveCouponFailed:
            return tslib_1.__assign({}, statuses, { isRemovingCoupon: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var concat_1 = __webpack_require__(22);
var defer_1 = __webpack_require__(48);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var order_actions_1 = __webpack_require__(34);
var OrderActionCreator = /** @class */ (function () {
    function OrderActionCreator(_checkoutClient, _checkoutValidator) {
        this._checkoutClient = _checkoutClient;
        this._checkoutValidator = _checkoutValidator;
    }
    OrderActionCreator.prototype.loadOrder = function (orderId, options) {
        var _this = this;
        return new Observable_1.Observable(function (observer) {
            observer.next(data_store_1.createAction(order_actions_1.OrderActionType.LoadOrderRequested));
            _this._checkoutClient.loadOrder(orderId, options)
                .then(function (response) {
                observer.next(data_store_1.createAction(order_actions_1.OrderActionType.LoadOrderSucceeded, response.body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(order_actions_1.OrderActionType.LoadOrderFailed, response));
            });
        });
    };
    // TODO: Remove when checkout does not contain unrelated order data.
    OrderActionCreator.prototype.loadCurrentOrderPayments = function (options) {
        var _this = this;
        return function (store) { return defer_1.defer(function () {
            var orderId = _this._getCurrentOrderId(store.getState());
            if (!orderId) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingOrderId);
            }
            return _this._loadOrderPayments(orderId, options);
        }); };
    };
    OrderActionCreator.prototype.loadCurrentOrder = function (options) {
        var _this = this;
        return function (store) { return defer_1.defer(function () {
            var orderId = _this._getCurrentOrderId(store.getState());
            if (!orderId) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingOrderId);
            }
            return _this.loadOrder(orderId, options);
        }); };
    };
    OrderActionCreator.prototype.submitOrder = function (payload, options) {
        var _this = this;
        return function (store) { return concat_1.concat(new Observable_1.Observable(function (observer) {
            observer.next(data_store_1.createAction(order_actions_1.OrderActionType.SubmitOrderRequested));
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            _this._checkoutValidator.validate(checkout, options)
                .then(function () { return _this._checkoutClient.submitOrder(_this._mapToOrderRequestBody(payload, checkout.customerMessage), options); })
                .then(function (response) {
                observer.next(data_store_1.createAction(order_actions_1.OrderActionType.SubmitOrderSucceeded, response.body.data, tslib_1.__assign({}, response.body.meta, { token: response.headers.token })));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(order_actions_1.OrderActionType.SubmitOrderFailed, response));
            });
        }), 
        // TODO: Remove once we can submit orders using storefront API
        _this.loadCurrentOrder(options)(store)); };
    };
    OrderActionCreator.prototype.finalizeOrder = function (orderId, options) {
        var _this = this;
        return concat_1.concat(new Observable_1.Observable(function (observer) {
            observer.next(data_store_1.createAction(order_actions_1.OrderActionType.FinalizeOrderRequested));
            _this._checkoutClient.finalizeOrder(orderId, options)
                .then(function (response) {
                observer.next(data_store_1.createAction(order_actions_1.OrderActionType.FinalizeOrderSucceeded, response.body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(order_actions_1.OrderActionType.FinalizeOrderFailed, response));
            });
        }), 
        // TODO: Remove once we can submit orders using storefront API
        this.loadOrder(orderId, options));
    };
    // TODO: Remove when checkout does not contain unrelated order data.
    OrderActionCreator.prototype._loadOrderPayments = function (orderId, options) {
        var _this = this;
        return new Observable_1.Observable(function (observer) {
            observer.next(data_store_1.createAction(order_actions_1.OrderActionType.LoadOrderPaymentsRequested));
            _this._checkoutClient.loadOrder(orderId, options)
                .then(function (response) {
                observer.next(data_store_1.createAction(order_actions_1.OrderActionType.LoadOrderPaymentsSucceeded, response.body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(order_actions_1.OrderActionType.LoadOrderPaymentsFailed, response));
            });
        });
    };
    OrderActionCreator.prototype._getCurrentOrderId = function (state) {
        var order = state.order.getOrder();
        var checkout = state.checkout.getCheckout();
        return (order && order.orderId) || (checkout && checkout.orderId);
    };
    OrderActionCreator.prototype._mapToOrderRequestBody = function (payload, customerMessage) {
        var payment = payload.payment, order = tslib_1.__rest(payload, ["payment"]);
        if (!payment) {
            return order;
        }
        return tslib_1.__assign({}, payload, { customerMessage: customerMessage, payment: {
                paymentData: payment.paymentData,
                name: payment.methodId,
                gateway: payment.gatewayId,
            } });
    };
    return OrderActionCreator;
}());
exports.default = OrderActionCreator;


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var lodash_1 = __webpack_require__(3);
var order_actions_1 = __webpack_require__(34);
var DEFAULT_STATE = {
    errors: {},
    meta: {},
    statuses: {},
};
function orderReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = orderReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case order_actions_1.OrderActionType.SubmitOrderSucceeded:
            return undefined;
        case order_actions_1.OrderActionType.LoadOrderSucceeded:
        case order_actions_1.OrderActionType.LoadOrderPaymentsSucceeded:
            return action.payload
                ? lodash_1.omit(tslib_1.__assign({}, data, action.payload), ['billingAddress', 'coupons'])
                : data;
        default:
            return data;
    }
}
function metaReducer(meta, action) {
    switch (action.type) {
        case order_actions_1.OrderActionType.FinalizeOrderSucceeded:
        case order_actions_1.OrderActionType.SubmitOrderSucceeded:
            return action.payload ? tslib_1.__assign({}, meta, action.meta, { callbackUrl: action.payload.order.callbackUrl, orderToken: action.payload.order.token, payment: action.payload.order && action.payload.order.payment }) : meta;
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case order_actions_1.OrderActionType.LoadOrderRequested:
        case order_actions_1.OrderActionType.LoadOrderSucceeded:
        case order_actions_1.OrderActionType.LoadOrderPaymentsSucceeded:
        case order_actions_1.OrderActionType.LoadOrderPaymentsRequested:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case order_actions_1.OrderActionType.LoadOrderFailed:
        case order_actions_1.OrderActionType.LoadOrderPaymentsFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case order_actions_1.OrderActionType.LoadOrderRequested:
        case order_actions_1.OrderActionType.LoadOrderPaymentsRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case order_actions_1.OrderActionType.LoadOrderSucceeded:
        case order_actions_1.OrderActionType.LoadOrderFailed:
        case order_actions_1.OrderActionType.LoadOrderPaymentsSucceeded:
        case order_actions_1.OrderActionType.LoadOrderPaymentsFailed:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var http_request_1 = __webpack_require__(11);
var DEFAULT_PARAMS = {
    include: [
        'payments',
        'lineItems.physicalItems.socialMedia',
        'lineItems.digitalItems.socialMedia',
    ].join(','),
};
var OrderRequestSender = /** @class */ (function () {
    function OrderRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    OrderRequestSender.prototype.loadOrder = function (orderId, _a) {
        var _b = _a === void 0 ? {} : _a, timeout = _b.timeout, params = _b.params;
        var url = "/api/storefront/orders/" + orderId;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.get(url, {
            params: DEFAULT_PARAMS,
            headers: headers,
            timeout: timeout,
        });
    };
    OrderRequestSender.prototype.submitOrder = function (body, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/order';
        return this._requestSender.post(url, { body: body, timeout: timeout });
    };
    OrderRequestSender.prototype.finalizeOrder = function (orderId, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/order/" + orderId;
        return this._requestSender.post(url, { timeout: timeout });
    };
    return OrderRequestSender;
}());
exports.default = OrderRequestSender;


/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var OrderSelector = /** @class */ (function () {
    function OrderSelector(_order, _billingAddress, _coupons) {
        this._order = _order;
        this._billingAddress = _billingAddress;
        this._coupons = _coupons;
    }
    OrderSelector.prototype.getOrder = function () {
        var data = this._order.data;
        var billingAddress = this._billingAddress.getBillingAddress();
        var coupons = this._coupons.getCoupons() || [];
        if (!data || !billingAddress) {
            return;
        }
        return tslib_1.__assign({}, data, { billingAddress: billingAddress,
            coupons: coupons });
    };
    OrderSelector.prototype.getOrderMeta = function () {
        return this._order.meta;
    };
    OrderSelector.prototype.getLoadError = function () {
        return this._order.errors.loadError;
    };
    OrderSelector.prototype.isLoading = function () {
        return !!this._order.statuses.isLoading;
    };
    OrderSelector = tslib_1.__decorate([
        selector_1.selector
    ], OrderSelector);
    return OrderSelector;
}());
exports.default = OrderSelector;


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __webpack_require__(3);
var cart_1 = __webpack_require__(9);
var cart_2 = __webpack_require__(9);
var coupon_1 = __webpack_require__(19);
var payment_1 = __webpack_require__(13);
function mapToInternalOrder(order, orderMeta) {
    if (orderMeta === void 0) { orderMeta = {}; }
    var decimalPlaces = order.currency.decimalPlaces;
    var amountTransformer = new cart_1.AmountTransformer(decimalPlaces);
    return {
        id: order.orderId,
        items: cart_2.mapToInternalLineItems(order.lineItems, order.currency.decimalPlaces, 'productId'),
        orderId: order.orderId,
        currency: order.currency.code,
        customerCanBeCreated: order.customerCanBeCreated,
        payment: mapToInteralOrderPayment(order.payments, orderMeta.payment),
        subtotal: {
            amount: order.baseAmount,
            integerAmount: amountTransformer.toInteger(order.baseAmount),
        },
        coupon: {
            discountedAmount: lodash_1.reduce(order.coupons, function (sum, coupon) {
                return sum + coupon.discountedAmount;
            }, 0),
            coupons: order.coupons.map(coupon_1.mapToInternalCoupon),
        },
        discount: {
            amount: order.discountAmount,
            integerAmount: amountTransformer.toInteger(order.discountAmount),
        },
        token: orderMeta.orderToken,
        callbackUrl: orderMeta.callbackUrl,
        discountNotifications: [],
        giftCertificate: mapToGiftCertificates(order.payments),
        socialData: mapToInternalSocialDataList(order),
        status: order.status,
        hasDigitalItems: order.hasDigitalItems,
        isDownloadable: order.isDownloadable,
        isComplete: order.isComplete,
        shipping: {
            amount: order.shippingCostTotal,
            integerAmount: amountTransformer.toInteger(order.shippingCostTotal),
            amountBeforeDiscount: order.shippingCostBeforeDiscount,
            integerAmountBeforeDiscount: amountTransformer.toInteger(order.shippingCostBeforeDiscount),
        },
        storeCredit: {
            amount: mapToStoreCredit(order.payments),
        },
        taxes: order.taxes,
        handling: {
            amount: order.handlingCostTotal,
            integerAmount: amountTransformer.toInteger(order.handlingCostTotal),
        },
        grandTotal: {
            amount: order.orderAmount,
            integerAmount: order.orderAmountAsInteger,
        },
    };
}
exports.default = mapToInternalOrder;
function mapToInternalIncompleteOrder(checkout) {
    var payment = lodash_1.find(checkout.payments, { providerType: payment_1.HOSTED });
    return {
        orderId: null,
        isComplete: false,
        payment: !payment ? {} : {
            id: payment.providerId,
            gateway: payment.gatewayId,
            status: mapToInternalPaymentStatus(payment.detail.step),
        },
    };
}
exports.mapToInternalIncompleteOrder = mapToInternalIncompleteOrder;
function mapToInternalPaymentStatus(status) {
    return "PAYMENT_STATUS_" + status;
}
function mapToStoreCredit(payments) {
    var item = lodash_1.find(payments, { providerId: 'storecredit' });
    return item ? item.amount : 0;
}
function mapToGiftCertificates(payments) {
    var items = lodash_1.filter(payments, { providerId: 'giftcertificate' });
    return {
        totalDiscountedAmount: lodash_1.reduce(items, function (sum, item) { return item.amount + sum; }, 0),
        appliedGiftCertificates: lodash_1.keyBy(items.map(function (item) { return ({
            code: item.detail.code,
            discountedAmount: item.amount,
            remainingBalance: item.detail.remaining,
            giftCertificate: {
                balance: item.amount + item.detail.remaining,
                code: item.detail.code,
                purchaseDate: '',
            },
        }); }), 'code'),
    };
}
function mapToInteralOrderPayment(payments, payment) {
    if (payment === void 0) { payment = {}; }
    var item = lodash_1.find(payments, isDefaultOrderPayment);
    if (!item) {
        return {};
    }
    return {
        id: item.providerId,
        status: mapToInternalPaymentStatus(item.detail.step),
        helpText: item.detail.instructions,
        returnUrl: payment.returnUrl,
    };
}
function isDefaultOrderPayment(payment) {
    return payment.providerId !== 'giftcertificate' && payment.providerId !== 'storecredit';
}
function mapToInternalSocialDataList(order) {
    var socialDataObject = {};
    var items = order.lineItems.physicalItems.concat(order.lineItems.digitalItems);
    items.forEach(function (item) {
        socialDataObject[item.id] = mapToInternalSocialData(item);
    });
    return socialDataObject;
}
function mapToInternalSocialData(lineItem) {
    var codes = ['fb', 'tw', 'gp'];
    return codes.reduce(function (socialData, code) {
        var item = lineItem.socialMedia && lineItem.socialMedia.find(function (item) { return item.code === code; });
        if (!item) {
            return socialData;
        }
        socialData[code] = {
            name: lineItem.name,
            description: lineItem.name,
            image: lineItem.imageUrl,
            url: item.link,
            shareText: item.text,
            sharingLink: item.link,
            channelName: item.channel,
            channelCode: item.code,
        };
        return socialData;
    }, {});
}


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../payment/bigpay-client.d.ts" />
var bigpay_client_1 = __webpack_require__(138);
function createPaymentClient(store) {
    var paymentClient = bigpay_client_1.createClient();
    store.subscribe(function (state) {
        var config = state.config.getStoreConfig();
        if (config) {
            paymentClient.setHost(config.paymentSettings.bigpayBaseUrl);
        }
    }, function (state) { return state.config.getStoreConfig(); });
    return paymentClient;
}
exports.default = createPaymentClient;


/***/ }),
/* 138 */
/***/ (function(module, exports) {

module.exports = require("@bigcommerce/bigpay-client");

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = __webpack_require__(60);
var request_sender_1 = __webpack_require__(18);
var script_loader_1 = __webpack_require__(37);
var billing_1 = __webpack_require__(17);
var checkout_1 = __webpack_require__(7);
var config_1 = __webpack_require__(25);
var order_1 = __webpack_require__(10);
var remote_checkout_1 = __webpack_require__(26);
var afterpay_1 = __webpack_require__(152);
var amazon_pay_1 = __webpack_require__(39);
var klarna_1 = __webpack_require__(155);
var wepay_1 = __webpack_require__(157);
var _1 = __webpack_require__(13);
var payment_action_creator_1 = __webpack_require__(63);
var payment_method_action_creator_1 = __webpack_require__(77);
var payment_request_sender_1 = __webpack_require__(78);
var payment_strategy_registry_1 = __webpack_require__(79);
var strategies_1 = __webpack_require__(205);
var braintree_1 = __webpack_require__(41);
var square_1 = __webpack_require__(81);
function createPaymentStrategyRegistry(store, client, paymentClient) {
    var registry = new payment_strategy_registry_1.default(store, { defaultToken: 'creditcard' });
    var scriptLoader = script_loader_1.getScriptLoader();
    var braintreePaymentProcessor = braintree_1.createBraintreePaymentProcessor(scriptLoader);
    var requestSender = request_sender_1.createRequestSender();
    var checkoutRequestSender = new checkout_1.CheckoutRequestSender(requestSender);
    var checkoutValidator = new checkout_1.CheckoutValidator(checkoutRequestSender);
    var orderActionCreator = new order_1.OrderActionCreator(client, checkoutValidator);
    var paymentActionCreator = new payment_action_creator_1.default(new payment_request_sender_1.default(paymentClient), orderActionCreator);
    var paymentMethodActionCreator = new payment_method_action_creator_1.default(client);
    var remoteCheckoutActionCreator = new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender()));
    var configRequestSender = new config_1.ConfigRequestSender(requestSender);
    var configActionCreator = new config_1.ConfigActionCreator(configRequestSender);
    registry.register('afterpay', function () {
        return new strategies_1.AfterpayPaymentStrategy(store, checkoutValidator, orderActionCreator, paymentActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, new afterpay_1.AfterpayScriptLoader(scriptLoader));
    });
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayPaymentStrategy(store, orderActionCreator, new billing_1.BillingAddressActionCreator(client), remoteCheckoutActionCreator, new amazon_pay_1.AmazonPayScriptLoader(scriptLoader));
    });
    registry.register('creditcard', function () {
        return new strategies_1.CreditCardPaymentStrategy(store, orderActionCreator, paymentActionCreator);
    });
    registry.register('klarna', function () {
        return new strategies_1.KlarnaPaymentStrategy(store, orderActionCreator, paymentMethodActionCreator, remoteCheckoutActionCreator, new klarna_1.KlarnaScriptLoader(scriptLoader));
    });
    registry.register('legacy', function () {
        return new strategies_1.LegacyPaymentStrategy(store, orderActionCreator);
    });
    registry.register('offline', function () {
        return new strategies_1.OfflinePaymentStrategy(store, orderActionCreator);
    });
    registry.register('offsite', function () {
        return new strategies_1.OffsitePaymentStrategy(store, orderActionCreator, paymentActionCreator);
    });
    registry.register('paypal', function () {
        return new strategies_1.PaypalProPaymentStrategy(store, orderActionCreator, paymentActionCreator);
    });
    registry.register('paypalexpress', function () {
        return new strategies_1.PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);
    });
    registry.register('paypalexpresscredit', function () {
        return new strategies_1.PaypalExpressPaymentStrategy(store, orderActionCreator, scriptLoader);
    });
    registry.register('sagepay', function () {
        return new strategies_1.SagePayPaymentStrategy(store, orderActionCreator, paymentActionCreator, form_poster_1.createFormPoster());
    });
    registry.register('squarev2', function () {
        return new strategies_1.SquarePaymentStrategy(store, orderActionCreator, paymentActionCreator, new square_1.SquareScriptLoader(scriptLoader));
    });
    registry.register('nopaymentdatarequired', function () {
        return new strategies_1.NoPaymentDataRequiredPaymentStrategy(store, orderActionCreator);
    });
    registry.register('braintree', function () {
        return new strategies_1.BraintreeCreditCardPaymentStrategy(store, orderActionCreator, paymentActionCreator, paymentMethodActionCreator, braintreePaymentProcessor);
    });
    registry.register('braintreepaypal', function () {
        return new strategies_1.BraintreePaypalPaymentStrategy(store, orderActionCreator, paymentActionCreator, paymentMethodActionCreator, braintreePaymentProcessor);
    });
    registry.register('braintreepaypalcredit', function () {
        return new strategies_1.BraintreePaypalPaymentStrategy(store, orderActionCreator, paymentActionCreator, paymentMethodActionCreator, braintreePaymentProcessor, true);
    });
    registry.register('braintreevisacheckout', function () {
        return new braintree_1.BraintreeVisaCheckoutPaymentStrategy(store, new checkout_1.CheckoutActionCreator(checkoutRequestSender, configActionCreator), paymentMethodActionCreator, new _1.PaymentStrategyActionCreator(registry, orderActionCreator), paymentActionCreator, orderActionCreator, braintree_1.createBraintreeVisaCheckoutPaymentProcessor(scriptLoader), new braintree_1.VisaCheckoutScriptLoader(scriptLoader));
    });
    registry.register('wepay', function () {
        return new strategies_1.WepayPaymentStrategy(store, orderActionCreator, paymentActionCreator, new wepay_1.WepayRiskClient(scriptLoader));
    });
    return registry;
}
exports.default = createPaymentStrategyRegistry;


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var BillingAddressSelector = /** @class */ (function () {
    function BillingAddressSelector(_billingAddress) {
        this._billingAddress = _billingAddress;
    }
    BillingAddressSelector.prototype.getBillingAddress = function () {
        return this._billingAddress.data;
    };
    BillingAddressSelector.prototype.getUpdateError = function () {
        return this._billingAddress.errors.updateError;
    };
    BillingAddressSelector.prototype.getLoadError = function () {
        return this._billingAddress.errors.loadError;
    };
    BillingAddressSelector.prototype.isUpdating = function () {
        return !!this._billingAddress.statuses.isUpdating;
    };
    BillingAddressSelector.prototype.isLoading = function () {
        return !!this._billingAddress.statuses.isLoading;
    };
    BillingAddressSelector = tslib_1.__decorate([
        selector_1.selector
    ], BillingAddressSelector);
    return BillingAddressSelector;
}());
exports.default = BillingAddressSelector;


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var billing_address_actions_1 = __webpack_require__(28);
var BillingAddressActionCreator = /** @class */ (function () {
    function BillingAddressActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    BillingAddressActionCreator.prototype.updateAddress = function (address, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressRequested));
            _this._requestBillingAddressUpdate(store, address, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressFailed, response));
            });
        }); };
    };
    BillingAddressActionCreator.prototype._requestBillingAddressUpdate = function (store, address, options) {
        var state = store.getState();
        var checkout = state.checkout.getCheckout();
        if (!checkout) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
        }
        var billingAddress = state.billingAddress.getBillingAddress();
        // If email is not present in the address provided by the client, then
        // fall back to the stored email as it could have been set separately
        // using a convenience method. We can't rely on billingAddress having
        // an ID to consider that there's a preexisting email, as billingAddress
        // object from Order doesn't have an ID.
        var billingAddressRequestBody = tslib_1.__assign({}, address, { email: typeof address.email === 'undefined' && billingAddress ? billingAddress.email : address.email });
        if (!billingAddress || !billingAddress.id) {
            return this._checkoutClient.createBillingAddress(checkout.id, billingAddressRequestBody, options);
        }
        return this._checkoutClient.updateBillingAddress(checkout.id, tslib_1.__assign({}, billingAddressRequestBody, { id: billingAddress.id }), options);
    };
    return BillingAddressActionCreator;
}());
exports.default = BillingAddressActionCreator;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var http_request_1 = __webpack_require__(11);
var DEFAULT_PARAMS = {
    include: [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(','),
};
var BillingAddressRequestSender = /** @class */ (function () {
    function BillingAddressRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    BillingAddressRequestSender.prototype.createAddress = function (checkoutId, address, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkouts/" + checkoutId + "/billing-address";
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.post(url, { body: address, params: DEFAULT_PARAMS, headers: headers, timeout: timeout });
    };
    BillingAddressRequestSender.prototype.updateAddress = function (checkoutId, address, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var id = address.id, body = tslib_1.__rest(address, ["id"]);
        var url = "/api/storefront/checkouts/" + checkoutId + "/billing-address/" + id;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.put(url, { params: DEFAULT_PARAMS, body: body, headers: headers, timeout: timeout });
    };
    return BillingAddressRequestSender;
}());
exports.default = BillingAddressRequestSender;


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var checkout_1 = __webpack_require__(7);
var order_1 = __webpack_require__(10);
var billing_address_actions_1 = __webpack_require__(28);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function billingAddressReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = billingAddressReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressSucceeded:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case order_1.OrderActionType.LoadOrderSucceeded:
            return action.payload ? action.payload.billingAddress : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressRequested:
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressSucceeded:
            return tslib_1.__assign({}, errors, { updateError: undefined });
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressFailed:
            return tslib_1.__assign({}, errors, { updateError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressRequested:
            return tslib_1.__assign({}, statuses, { isUpdating: true });
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressFailed:
        case billing_address_actions_1.BillingAddressActionType.UpdateBillingAddressSucceeded:
            return tslib_1.__assign({}, statuses, { isUpdating: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isBillingAddressLike(address) {
    var billingAddress = address;
    return typeof billingAddress.id !== 'undefined';
}
exports.default = isBillingAddressLike;


/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var ConfigSelector = /** @class */ (function () {
    function ConfigSelector(_config) {
        this._config = _config;
    }
    ConfigSelector.prototype.getConfig = function () {
        return this._config.data;
    };
    ConfigSelector.prototype.getStoreConfig = function () {
        return this._config.data && this._config.data.storeConfig;
    };
    ConfigSelector.prototype.getContextConfig = function () {
        return this._config.data && this._config.data.context;
    };
    ConfigSelector.prototype.getLoadError = function () {
        return this._config.errors.loadError;
    };
    ConfigSelector.prototype.isLoading = function () {
        return !!this._config.statuses.isLoading;
    };
    ConfigSelector = tslib_1.__decorate([
        selector_1.selector
    ], ConfigSelector);
    return ConfigSelector;
}());
exports.default = ConfigSelector;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var config_actions_1 = __webpack_require__(62);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function configReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = configReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case config_actions_1.ConfigActionType.LoadConfigSucceeded:
            return action.payload ? action.payload : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case config_actions_1.ConfigActionType.LoadConfigSucceeded:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case config_actions_1.ConfigActionType.LoadConfigFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case config_actions_1.ConfigActionType.LoadConfigRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case config_actions_1.ConfigActionType.LoadConfigSucceeded:
        case config_actions_1.ConfigActionType.LoadConfigFailed:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var http_request_1 = __webpack_require__(11);
var ConfigRequestSender = /** @class */ (function () {
    function ConfigRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    ConfigRequestSender.prototype.loadConfig = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/api/storefront/checkout-settings';
        return this._requestSender.get(url, {
            timeout: timeout,
            headers: {
                Accept: http_request_1.ContentType.JsonV1,
                'X-API-INTERNAL': 'This API endpoint is for internal use only and may change in the future',
            },
        });
    };
    return ConfigRequestSender;
}());
exports.default = ConfigRequestSender;


/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var actionTypes = __webpack_require__(38);
/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
var RemoteCheckoutActionCreator = /** @class */ (function () {
    function RemoteCheckoutActionCreator(_remoteCheckoutRequestSender) {
        this._remoteCheckoutRequestSender = _remoteCheckoutRequestSender;
    }
    RemoteCheckoutActionCreator.prototype.initializeBilling = function (methodId, params, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_BILLING_REQUESTED, undefined, { methodId: methodId }));
            _this._remoteCheckoutRequestSender.initializeBilling(methodId, params, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED, body, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_REMOTE_BILLING_FAILED, response, { methodId: methodId }));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.initializeShipping = function (methodId, params, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_REQUESTED, undefined, { methodId: methodId }));
            _this._remoteCheckoutRequestSender.initializeShipping(methodId, params, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED, body, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_REMOTE_SHIPPING_FAILED, response, { methodId: methodId }));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.initializePayment = function (methodId, params, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_REQUESTED, undefined, { methodId: methodId }));
            _this._remoteCheckoutRequestSender.initializePayment(methodId, params, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_SUCCEEDED, body, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_REMOTE_PAYMENT_FAILED, response, { methodId: methodId }));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.loadSettings = function (methodId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_REMOTE_SETTINGS_REQUESTED, undefined, { methodId: methodId }));
            _this._remoteCheckoutRequestSender.loadSettings(methodId, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(actionTypes.LOAD_REMOTE_SETTINGS_SUCCEEDED, body, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_REMOTE_SETTINGS_FAILED, response, { methodId: methodId }));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.signOut = function (methodId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_REQUESTED, undefined, { methodId: methodId }));
            _this._remoteCheckoutRequestSender.signOut(methodId, options)
                .then(function () {
                observer.next(data_store_1.createAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_SUCCEEDED, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SIGN_OUT_REMOTE_CUSTOMER_FAILED, response, { methodId: methodId }));
            });
        });
    };
    RemoteCheckoutActionCreator.prototype.updateCheckout = function (methodId, data) {
        return data_store_1.createAction(actionTypes.UPDATE_REMOTE_CHECKOUT, data, { methodId: methodId });
    };
    return RemoteCheckoutActionCreator;
}());
exports.default = RemoteCheckoutActionCreator;


/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @todo Convert this file into TypeScript properly
 */
var RemoteCheckoutRequestSender = /** @class */ (function () {
    function RemoteCheckoutRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    RemoteCheckoutRequestSender.prototype.initializeBilling = function (methodName, params, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/billing";
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.initializeShipping = function (methodName, params, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/shipping";
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.initializePayment = function (methodName, params, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/payment";
        return this._requestSender.get(url, { params: params, timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.loadSettings = function (methodName, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/settings";
        return this._requestSender.get(url, { timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.signOut = function (methodName, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/remote-checkout/" + methodName + "/signout";
        return this._requestSender.get(url, { timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.generateToken = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/remote-checkout-token';
        return this._requestSender.get(url, { timeout: timeout });
    };
    RemoteCheckoutRequestSender.prototype.trackAuthorizationEvent = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/remote-checkout/events/shopper-checkout-service-provider-authorization-requested';
        return this._requestSender.post(url, { timeout: timeout });
    };
    return RemoteCheckoutRequestSender;
}());
exports.default = RemoteCheckoutRequestSender;


/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var RemoteCheckoutSelector = /** @class */ (function () {
    function RemoteCheckoutSelector(_remoteCheckout) {
        this._remoteCheckout = _remoteCheckout;
    }
    RemoteCheckoutSelector.prototype.getCheckout = function (methodId) {
        return this._remoteCheckout.data[methodId];
    };
    RemoteCheckoutSelector = tslib_1.__decorate([
        selector_1.selector
    ], RemoteCheckoutSelector);
    return RemoteCheckoutSelector;
}());
exports.default = RemoteCheckoutSelector;


/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var actionTypes = __webpack_require__(38);
var DEFAULT_STATE = {
    data: {},
};
function remoteCheckoutReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var _a;
    if (!action.meta || !action.meta.methodId) {
        return state;
    }
    var reducer = data_store_1.combineReducers({
        data: data_store_1.combineReducers((_a = {},
            _a[action.meta.methodId] = dataReducer,
            _a)),
    });
    return reducer(state, action);
}
exports.default = remoteCheckoutReducer;
function dataReducer(data, action) {
    if (data === void 0) { data = {}; }
    switch (action.type) {
        case actionTypes.INITIALIZE_REMOTE_BILLING_SUCCEEDED:
            return tslib_1.__assign({}, data, { billing: action.payload.billing });
        case actionTypes.INITIALIZE_REMOTE_SHIPPING_SUCCEEDED:
            return tslib_1.__assign({}, data, { shipping: action.payload.shipping });
        case actionTypes.LOAD_REMOTE_SETTINGS_SUCCEEDED:
            return tslib_1.__assign({}, data, { settings: action.payload });
        case actionTypes.UPDATE_REMOTE_CHECKOUT:
            return tslib_1.__assign({}, data, action.payload);
        default:
            return data;
    }
}


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var afterpay_script_loader_1 = __webpack_require__(153);
exports.AfterpayScriptLoader = afterpay_script_loader_1.default;


/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SCRIPTS_DEFAULT = {
    PROD: '//portal.afterpay.com/afterpay-async.js',
    SANDBOX: '//portal-sandbox.afterpay.com/afterpay-async.js',
};
var SCRIPTS_US = {
    PROD: '//portal.afterpay.com/afterpay-async.js',
    SANDBOX: '//portal.us-sandbox.afterpay.com/afterpay-async.js',
};
/** Class responsible for loading the Afterpay SDK */
var AfterpayScriptLoader = /** @class */ (function () {
    function AfterpayScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     * @param method the payment method data
     */
    AfterpayScriptLoader.prototype.load = function (method, countryCode) {
        var testMode = method.config.testMode || false;
        var scriptURI = this._getScriptURI(countryCode, testMode);
        return this._scriptLoader.loadScript(scriptURI)
            .then(function () { return window.AfterPay; });
    };
    AfterpayScriptLoader.prototype._getScriptURI = function (countryCode, testMode) {
        if (countryCode === 'US') {
            return testMode ? SCRIPTS_US.SANDBOX : SCRIPTS_US.PROD;
        }
        return testMode ? SCRIPTS_DEFAULT.SANDBOX : SCRIPTS_DEFAULT.PROD;
    };
    return AfterpayScriptLoader;
}());
exports.default = AfterpayScriptLoader;


/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var AmazonPayScriptLoader = /** @class */ (function () {
    function AmazonPayScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
        this._window = window;
    }
    AmazonPayScriptLoader.prototype.loadWidget = function (method, onPaymentReady) {
        var _a = method.config, merchantId = _a.merchantId, testMode = _a.testMode, _b = method.initializationData, _c = (_b === void 0 ? {} : _b).region, region = _c === void 0 ? 'us' : _c;
        var url = 'https://' +
            (region.toLowerCase() !== 'us' ? 'static-eu.' : 'static-na.') +
            'payments-amazon.com/OffAmazonPayments/' +
            (region.toLowerCase() + "/") +
            (testMode ? 'sandbox/' : '') +
            (region.toLowerCase() !== 'us' ? 'lpa/' : '') +
            ("js/Widgets.js?sellerId=" + merchantId);
        this._configureWidget(method, onPaymentReady);
        return this._scriptLoader.loadScript(url);
    };
    AmazonPayScriptLoader.prototype._configureWidget = function (method, onPaymentReady) {
        var _this = this;
        var onLoginReady = function () {
            if (!_this._window.amazon) {
                return;
            }
            _this._window.amazon.Login.setClientId(method.initializationData.clientId);
            _this._window.amazon.Login.setUseCookie(true);
        };
        if (this._window.amazon && this._window.amazon.Login) {
            onLoginReady();
        }
        else {
            this._window.onAmazonLoginReady = onLoginReady;
        }
        if (this._window.OffAmazonPayments && onPaymentReady) {
            onPaymentReady();
        }
        else {
            this._window.onAmazonPaymentsReady = onPaymentReady;
        }
    };
    return AmazonPayScriptLoader;
}());
exports.default = AmazonPayScriptLoader;


/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var klarna_script_loader_1 = __webpack_require__(156);
exports.KlarnaScriptLoader = klarna_script_loader_1.default;


/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SDK_URL = '//credit.klarnacdn.net/lib/v1/api.js';
var KlarnaScriptLoader = /** @class */ (function () {
    function KlarnaScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    KlarnaScriptLoader.prototype.load = function () {
        return this._scriptLoader.loadScript(SDK_URL)
            .then(function () { return window.Klarna.Credit; });
    };
    return KlarnaScriptLoader;
}());
exports.default = KlarnaScriptLoader;


/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var wepay_risk_client_1 = __webpack_require__(158);
exports.WepayRiskClient = wepay_risk_client_1.default;


/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __webpack_require__(1);
var SCRIPT_SRC = '//static.wepay.com/min/js/risk.1.latest.js';
var WepayRiskClient = /** @class */ (function () {
    function WepayRiskClient(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    WepayRiskClient.prototype.initialize = function () {
        var _this = this;
        return this._scriptLoader
            .loadScript(SCRIPT_SRC)
            .then(function () { return _this._riskClient = window.WePay.risk; })
            .then(function () { return _this; });
    };
    WepayRiskClient.prototype.getRiskToken = function () {
        if (!this._riskClient) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
        }
        this._riskClient.generate_risk_token();
        return this._riskClient.get_risk_token();
    };
    return WepayRiskClient;
}());
exports.default = WepayRiskClient;


/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var utility_1 = __webpack_require__(8);
function isAddressEqual(addressA, addressB) {
    return lodash_1.isEqual(normalize(addressA), normalize(addressB));
}
exports.default = isAddressEqual;
function normalize(address) {
    var ignoredKeys = ['id', 'provinceCode'];
    return Object.keys(utility_1.omitPrivate(address) || {})
        .reduce(function (result, key) {
        var _a;
        return ignoredKeys.indexOf(key) === -1 && address[key] ? tslib_1.__assign({}, result, (_a = {}, _a[key] = address[key], _a)) :
            result;
    }, {});
}


/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function mapFromInternalAddress(address) {
    return {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.addressLine1,
        address2: address.addressLine2,
        city: address.city,
        stateOrProvince: address.province,
        stateOrProvinceCode: address.provinceCode,
        postalCode: address.postCode,
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone,
        customFields: address.customFields,
    };
}
exports.default = mapFromInternalAddress;


/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var billing_1 = __webpack_require__(17);
function mapToInternalAddress(address, consignments) {
    var addressId;
    if (billing_1.isBillingAddressLike(address)) {
        addressId = address.id;
    }
    else if (consignments && consignments.length) {
        addressId = consignments[0].id;
    }
    return {
        id: addressId,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        addressLine1: address.address1,
        addressLine2: address.address2,
        city: address.city,
        province: address.stateOrProvince,
        provinceCode: address.stateOrProvinceCode,
        postCode: address.postalCode,
        country: address.country,
        countryCode: address.countryCode,
        phone: address.phone,
        customFields: address.customFields,
    };
}
exports.default = mapToInternalAddress;


/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = __webpack_require__(60);
var request_sender_1 = __webpack_require__(18);
var script_loader_1 = __webpack_require__(37);
var checkout_1 = __webpack_require__(7);
var registry_1 = __webpack_require__(40);
var config_1 = __webpack_require__(25);
var config_action_creator_1 = __webpack_require__(61);
var payment_1 = __webpack_require__(13);
var braintree_1 = __webpack_require__(41);
var chasepay_1 = __webpack_require__(172);
var remote_checkout_1 = __webpack_require__(26);
var amazon_pay_1 = __webpack_require__(39);
var _1 = __webpack_require__(14);
var customer_action_creator_1 = __webpack_require__(69);
var strategies_1 = __webpack_require__(174);
function createCustomerStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    var requestSender = request_sender_1.createRequestSender();
    var remoteCheckoutRequestSender = new remote_checkout_1.RemoteCheckoutRequestSender(requestSender);
    var configRequestSender = new config_1.ConfigRequestSender(requestSender);
    var configActionCreator = new config_action_creator_1.default(configRequestSender);
    var checkoutActionCreator = new checkout_1.CheckoutActionCreator(new checkout_1.CheckoutRequestSender(requestSender), configActionCreator);
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayCustomerStrategy(store, new payment_1.PaymentMethodActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(remoteCheckoutRequestSender), remoteCheckoutRequestSender, new amazon_pay_1.AmazonPayScriptLoader(script_loader_1.getScriptLoader()));
    });
    registry.register('braintreevisacheckout', function () {
        return new strategies_1.BraintreeVisaCheckoutCustomerStrategy(store, checkoutActionCreator, new payment_1.PaymentMethodActionCreator(client), new _1.CustomerStrategyActionCreator(registry), new remote_checkout_1.RemoteCheckoutActionCreator(remoteCheckoutRequestSender), braintree_1.createBraintreeVisaCheckoutPaymentProcessor(script_loader_1.getScriptLoader()), new braintree_1.VisaCheckoutScriptLoader(script_loader_1.getScriptLoader()));
    });
    registry.register('chasepay', function () {
        return new strategies_1.ChasePayCustomerStrategy(store, new payment_1.PaymentMethodActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(remoteCheckoutRequestSender), new chasepay_1.ChasePayScriptLoader(script_loader_1.getScriptLoader()), requestSender, form_poster_1.createFormPoster());
    });
    registry.register('default', function () {
        return new strategies_1.DefaultCustomerStrategy(store, new customer_action_creator_1.default(new _1.CustomerRequestSender(requestSender), checkoutActionCreator));
    });
    return registry;
}
exports.default = createCustomerStrategyRegistry;


/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var Registry = /** @class */ (function () {
    function Registry(options) {
        this._factories = {};
        this._instances = {};
        this._options = tslib_1.__assign({ defaultToken: 'default' }, options);
    }
    Registry.prototype.get = function (token, cacheToken) {
        if (token === void 0) { token = this._options.defaultToken; }
        if (cacheToken === void 0) { cacheToken = token; }
        try {
            return this._getInstance(token, cacheToken);
        }
        catch (error) {
            return this._getInstance(this._options.defaultToken, cacheToken);
        }
    };
    Registry.prototype.register = function (token, factory) {
        if (this.hasFactory(token)) {
            throw new errors_1.InvalidArgumentError("'" + token + "' is already registered.");
        }
        this._factories[token] = factory;
    };
    Registry.prototype.hasFactory = function (token) {
        return !!this._factories[token];
    };
    Registry.prototype.hasInstance = function (token) {
        return !!this._instances[token];
    };
    Registry.prototype._getInstance = function (token, cacheToken) {
        if (!this.hasInstance(cacheToken)) {
            var factory = this._factories[token];
            if (!factory) {
                throw new errors_1.InvalidArgumentError("'" + token + "' is not registered.");
            }
            this._instances[cacheToken] = factory();
        }
        return this._instances[cacheToken];
    };
    return Registry;
}());
exports.default = Registry;


/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(12);
var is_credit_card_like_1 = __webpack_require__(165);
var is_vaulted_instrument_1 = __webpack_require__(42);
var payment_strategy_1 = __webpack_require__(6);
var BraintreeCreditCardPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(BraintreeCreditCardPaymentStrategy, _super);
    function BraintreeCreditCardPaymentStrategy(store, _orderActionCreator, _paymentActionCreator, _paymentMethodActionCreator, _braintreePaymentProcessor) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._braintreePaymentProcessor = _braintreePaymentProcessor;
        return _this;
    }
    BraintreeCreditCardPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(function (state) {
            var paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);
            if (!paymentMethod || !paymentMethod.clientToken) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            _this._braintreePaymentProcessor.initialize(paymentMethod.clientToken, options.braintree);
            _this._is3dsEnabled = paymentMethod.config.is3dsEnabled;
            return _super.prototype.initialize.call(_this, options);
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreeCreditCardPaymentStrategy.prototype.execute = function (orderRequest, options) {
        var _this = this;
        var payment = orderRequest.payment, order = tslib_1.__rest(orderRequest, ["payment"]);
        if (!payment) {
            throw new errors_2.PaymentArgumentInvalidError(['payment']);
        }
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(function (state) {
            return state.payment.isPaymentDataRequired(order.useStoreCredit) && payment ?
                _this._preparePaymentData(payment) :
                Promise.resolve(payment);
        })
            .then(function (payment) {
            return _this._store.dispatch(_this._paymentActionCreator.submitPayment(payment));
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreeCreditCardPaymentStrategy.prototype.deinitialize = function (options) {
        var _this = this;
        return this._braintreePaymentProcessor.deinitialize()
            .then(function () { return _super.prototype.deinitialize.call(_this, options); });
    };
    BraintreeCreditCardPaymentStrategy.prototype._handleError = function (error) {
        if (error.name === 'BraintreeError') {
            throw new errors_1.StandardError(error.message);
        }
        throw error;
    };
    BraintreeCreditCardPaymentStrategy.prototype._isUsingVaulting = function (paymentData) {
        if (is_credit_card_like_1.default(paymentData)) {
            return Boolean(paymentData.shouldSaveInstrument);
        }
        return is_vaulted_instrument_1.default(paymentData);
    };
    BraintreeCreditCardPaymentStrategy.prototype._preparePaymentData = function (payment) {
        var paymentData = payment.paymentData;
        var state = this._store.getState();
        if (paymentData && this._isUsingVaulting(paymentData)) {
            return Promise.resolve(payment);
        }
        var checkout = state.checkout.getCheckout();
        var billingAddress = state.billingAddress.getBillingAddress();
        if (!checkout) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
        }
        if (!billingAddress) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
        }
        var tokenizedCard = this._is3dsEnabled ?
            this._braintreePaymentProcessor.verifyCard(payment, billingAddress, checkout.grandTotal) :
            this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress);
        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(function (paymentData) { return (tslib_1.__assign({}, payment, { paymentData: paymentData })); });
    };
    return BraintreeCreditCardPaymentStrategy;
}(payment_strategy_1.default));
exports.default = BraintreeCreditCardPaymentStrategy;


/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var is_vaulted_instrument_1 = __webpack_require__(42);
function isCreditCardLike(instrument) {
    var card = instrument;
    return !is_vaulted_instrument_1.default(card) &&
        typeof card.ccName === 'string' &&
        typeof card.ccNumber === 'string' &&
        typeof card.ccType === 'string' &&
        typeof card.ccExpiry === 'object' &&
        typeof card.ccExpiry.month === 'string' &&
        typeof card.ccExpiry.year === 'string';
}
exports.default = isCreditCardLike;


/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var OrderFinalizationNotRequiredError = /** @class */ (function (_super) {
    tslib_1.__extends(OrderFinalizationNotRequiredError, _super);
    function OrderFinalizationNotRequiredError() {
        var _this = _super.call(this, 'The current order does not need to be finalized at this stage.') || this;
        _this.type = 'order_finalization_not_required';
        return _this;
    }
    return OrderFinalizationNotRequiredError;
}(errors_1.StandardError));
exports.default = OrderFinalizationNotRequiredError;


/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(12);
var payment_strategy_1 = __webpack_require__(6);
var BraintreePaypalPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(BraintreePaypalPaymentStrategy, _super);
    function BraintreePaypalPaymentStrategy(store, _orderActionCreator, _paymentActionCreator, _paymentMethodActionCreator, _braintreePaymentProcessor, _credit) {
        if (_credit === void 0) { _credit = false; }
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._braintreePaymentProcessor = _braintreePaymentProcessor;
        _this._credit = _credit;
        return _this;
    }
    BraintreePaypalPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        var braintreeOptions = options.braintree, methodId = options.methodId;
        this._paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(methodId);
        if (this._paymentMethod && this._paymentMethod.nonce) {
            return _super.prototype.initialize.call(this, options);
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) {
            _this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            if (!_this._paymentMethod || !_this._paymentMethod.clientToken) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            _this._braintreePaymentProcessor.initialize(_this._paymentMethod.clientToken, braintreeOptions);
            return _this._braintreePaymentProcessor.preloadPaypal();
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreePaypalPaymentStrategy.prototype.execute = function (orderRequest, options) {
        var _this = this;
        var payment = orderRequest.payment, order = tslib_1.__rest(orderRequest, ["payment"]);
        if (!payment) {
            throw new errors_2.PaymentArgumentInvalidError(['payment']);
        }
        return (payment ? this._preparePaymentData(payment) : Promise.resolve(payment))
            .then(function (payment) { return Promise.all([payment, _this._store.dispatch(_this._orderActionCreator.submitOrder(order, options))]); })
            .then(function (_a) {
            var payment = _a[0];
            return _this._store.dispatch(_this._paymentActionCreator.submitPayment(payment));
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreePaypalPaymentStrategy.prototype.deinitialize = function (options) {
        var _this = this;
        return this._braintreePaymentProcessor.deinitialize()
            .then(function () { return _super.prototype.deinitialize.call(_this, options); });
    };
    BraintreePaypalPaymentStrategy.prototype._handleError = function (error) {
        if (error.name === 'BraintreeError') {
            throw new errors_1.StandardError(error.message);
        }
        throw error;
    };
    BraintreePaypalPaymentStrategy.prototype._preparePaymentData = function (payment) {
        var state = this._store.getState();
        var checkout = state.checkout.getCheckout();
        var config = state.config.getStoreConfig();
        if (!checkout) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
        }
        if (!config) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
        }
        if (!this._paymentMethod) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
        }
        var currency = config.currency, storeLanguage = config.storeProfile.storeLanguage;
        var _a = this._paymentMethod, method = _a.method, nonce = _a.nonce;
        if (nonce) {
            return Promise.resolve(tslib_1.__assign({}, payment, { paymentData: { nonce: nonce, method: method } }));
        }
        var tokenizedCard = this._braintreePaymentProcessor
            .paypal(checkout.grandTotal, storeLanguage, currency.code, this._credit);
        return this._braintreePaymentProcessor.appendSessionId(tokenizedCard)
            .then(function (paymentData) { return (tslib_1.__assign({}, payment, { paymentData: tslib_1.__assign({}, paymentData, { method: method }) })); });
    };
    return BraintreePaypalPaymentStrategy;
}(payment_strategy_1.default));
exports.default = BraintreePaypalPaymentStrategy;


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var braintree_payment_processor_1 = __webpack_require__(65);
var braintree_script_loader_1 = __webpack_require__(67);
var braintree_sdk_creator_1 = __webpack_require__(68);
function createBraintreePaymentProcessor(scriptLoader) {
    var braintreeScriptLoader = new braintree_script_loader_1.default(scriptLoader);
    var braintreeSDKCreator = new braintree_sdk_creator_1.default(braintreeScriptLoader);
    return new braintree_payment_processor_1.default(braintreeSDKCreator);
}
exports.default = createBraintreePaymentProcessor;


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = __webpack_require__(18);
var braintree_script_loader_1 = __webpack_require__(67);
var braintree_sdk_creator_1 = __webpack_require__(68);
var braintree_visacheckout_payment_processor_1 = __webpack_require__(66);
function createBraintreeVisaCheckoutPaymentProcessor(scriptLoader) {
    var braintreeScriptLoader = new braintree_script_loader_1.default(scriptLoader);
    var braintreeSDKCreator = new braintree_sdk_creator_1.default(braintreeScriptLoader);
    var requestSender = request_sender_1.createRequestSender();
    return new braintree_visacheckout_payment_processor_1.default(braintreeSDKCreator, requestSender);
}
exports.default = createBraintreeVisaCheckoutPaymentProcessor;


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __webpack_require__(1);
var VisaCheckoutScriptLoader = /** @class */ (function () {
    function VisaCheckoutScriptLoader(_scriptLoader, _window) {
        if (_window === void 0) { _window = window; }
        this._scriptLoader = _scriptLoader;
        this._window = _window;
    }
    VisaCheckoutScriptLoader.prototype.load = function (testMode) {
        var _this = this;
        return this._scriptLoader
            .loadScript("//" + (testMode ? 'sandbox-' : '') + "assets.secure.checkout.visa.com/checkout-widget/resources/js/integration/v1/sdk.js")
            .then(function () {
            if (!_this._window.V) {
                throw new errors_1.StandardError();
            }
            return _this._window.V;
        });
    };
    return VisaCheckoutScriptLoader;
}());
exports.default = VisaCheckoutScriptLoader;


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var payment_strategy_1 = __webpack_require__(6);
var BraintreeVisaCheckoutPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(BraintreeVisaCheckoutPaymentStrategy, _super);
    function BraintreeVisaCheckoutPaymentStrategy(store, _checkoutActionCreator, _paymentMethodActionCreator, _paymentStrategyActionCreator, _paymentActionCreator, _orderActionCreator, _braintreeVisaCheckoutPaymentProcessor, _visaCheckoutScriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._checkoutActionCreator = _checkoutActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._paymentStrategyActionCreator = _paymentStrategyActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        _this._orderActionCreator = _orderActionCreator;
        _this._braintreeVisaCheckoutPaymentProcessor = _braintreeVisaCheckoutPaymentProcessor;
        _this._visaCheckoutScriptLoader = _visaCheckoutScriptLoader;
        return _this;
    }
    BraintreeVisaCheckoutPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        var visaCheckoutOptions = options.braintreevisacheckout, methodId = options.methodId;
        if (!visaCheckoutOptions) {
            throw new errors_1.InvalidArgumentError('Unable to initialize payment because "options.braintreevisacheckout" argument is not provided.');
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) {
            _this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            var checkout = state.checkout.getCheckout();
            var storeConfig = state.config.getStoreConfig();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            if (!storeConfig) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
            }
            if (!_this._paymentMethod || !_this._paymentMethod.clientToken) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            var _a = visaCheckoutOptions.onError, onError = _a === void 0 ? function () { } : _a, _b = visaCheckoutOptions.onPaymentSelect, onPaymentSelect = _b === void 0 ? function () { } : _b;
            var initOptions = {
                locale: storeConfig.storeProfile.storeLanguage,
                collectShipping: false,
                subtotal: checkout.subtotal,
                currencyCode: storeConfig.currency.code,
            };
            return Promise.all([
                _this._visaCheckoutScriptLoader.load(_this._paymentMethod.config.testMode),
                _this._braintreeVisaCheckoutPaymentProcessor.initialize(_this._paymentMethod.clientToken, initOptions),
            ])
                .then(function (_a) {
                var visaCheckout = _a[0], visaInitOptions = _a[1];
                visaCheckout.init(visaInitOptions);
                visaCheckout.on('payment.success', function (paymentSuccessPayload) {
                    return _this._paymentInstrumentSelected(paymentSuccessPayload)
                        .then(function () { return onPaymentSelect(); })
                        .catch(function (error) { return onError(error); });
                });
                visaCheckout.on('payment.error', function (payment, error) { return onError(error); });
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    BraintreeVisaCheckoutPaymentStrategy.prototype.execute = function (orderRequest, options) {
        var _this = this;
        var payment = orderRequest.payment, order = tslib_1.__rest(orderRequest, ["payment"]);
        if (!payment) {
            throw new errors_1.InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }
        if (!this._paymentMethod || !this._paymentMethod.initializationData || !this._paymentMethod.initializationData.nonce) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
        }
        var nonce = this._paymentMethod.initializationData.nonce;
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(function () {
            return _this._store.dispatch(_this._paymentActionCreator.submitPayment(tslib_1.__assign({}, payment, { paymentData: { nonce: nonce } })));
        })
            .catch(function (error) { return _this._handleError(error); });
    };
    BraintreeVisaCheckoutPaymentStrategy.prototype.deinitialize = function (options) {
        var _this = this;
        return this._braintreeVisaCheckoutPaymentProcessor.deinitialize()
            .then(function () { return _super.prototype.deinitialize.call(_this, options); });
    };
    BraintreeVisaCheckoutPaymentStrategy.prototype._paymentInstrumentSelected = function (paymentSuccessPayload) {
        var _this = this;
        var state = this._store.getState();
        if (!this._paymentMethod) {
            throw new Error('Payment method not initialized');
        }
        var methodId = this._paymentMethod.id;
        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(function () {
            return _this._braintreeVisaCheckoutPaymentProcessor.handleSuccess(paymentSuccessPayload, state.shippingAddress.getShippingAddress(), state.billingAddress.getBillingAddress())
                .then(function () { return Promise.all([
                _this._store.dispatch(_this._checkoutActionCreator.loadCurrentCheckout()),
                _this._store.dispatch(_this._paymentMethodActionCreator.loadPaymentMethod(methodId)),
            ]); });
        }, { methodId: methodId }), { queueId: 'widgetInteraction' });
    };
    BraintreeVisaCheckoutPaymentStrategy.prototype._handleError = function (error) {
        if (error.name === 'BraintreeError') {
            throw new errors_1.StandardError(error.message);
        }
        throw error;
    };
    return BraintreeVisaCheckoutPaymentStrategy;
}(payment_strategy_1.default));
exports.default = BraintreeVisaCheckoutPaymentStrategy;


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var chasepay_script_loader_1 = __webpack_require__(173);
exports.ChasePayScriptLoader = chasepay_script_loader_1.default;


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = __webpack_require__(1);
var ChasePayScriptLoader = /** @class */ (function () {
    function ChasePayScriptLoader(_scriptLoader, _window) {
        if (_window === void 0) { _window = window; }
        this._scriptLoader = _scriptLoader;
        this._window = _window;
    }
    ChasePayScriptLoader.prototype.load = function (testMode) {
        var _this = this;
        return this._scriptLoader
            .loadScript("//pwc" + (testMode ? 'psb' : '') + ".chase.com/pwc/checkout/js/v20170521/list.action?type=raw&applId=PWC&channelId=CWC&version=1")
            .then(function () {
            if (!_this._window.JPMC) {
                throw new errors_1.StandardError();
            }
            return _this._window.JPMC;
        });
    };
    return ChasePayScriptLoader;
}());
exports.default = ChasePayScriptLoader;


/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var amazon_pay_customer_strategy_1 = __webpack_require__(175);
exports.AmazonPayCustomerStrategy = amazon_pay_customer_strategy_1.default;
var customer_strategy_1 = __webpack_require__(27);
exports.CustomerStrategy = customer_strategy_1.default;
var default_customer_strategy_1 = __webpack_require__(176);
exports.DefaultCustomerStrategy = default_customer_strategy_1.default;
var braintree_visacheckout_customer_strategy_1 = __webpack_require__(177);
exports.BraintreeVisaCheckoutCustomerStrategy = braintree_visacheckout_customer_strategy_1.default;
var chasepay_customer_strategy_1 = __webpack_require__(178);
exports.ChasePayCustomerStrategy = chasepay_customer_strategy_1.default;


/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var customer_strategy_1 = __webpack_require__(27);
var AmazonPayCustomerStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(AmazonPayCustomerStrategy, _super);
    function AmazonPayCustomerStrategy(store, _paymentMethodActionCreator, _remoteCheckoutActionCreator, _remoteCheckoutRequestSender, _scriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._remoteCheckoutRequestSender = _remoteCheckoutRequestSender;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayCustomerStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        var amazonOptions = options.amazon, methodId = options.methodId;
        if (!amazonOptions || !methodId) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "options.amazon" argument is not provided.');
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) { return new Promise(function (resolve, reject) {
            _this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            if (!_this._paymentMethod) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            var _a = amazonOptions.onError, onError = _a === void 0 ? function () { } : _a;
            var onReady = function () {
                _this._createSignInButton(tslib_1.__assign({}, amazonOptions, { onError: function (error) {
                        reject(error);
                        onError(error);
                    } }));
                resolve();
            };
            _this._scriptLoader.loadWidget(_this._paymentMethod, onReady)
                .catch(reject);
        }); })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AmazonPayCustomerStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._paymentMethod = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayCustomerStrategy.prototype.signIn = function (credentials, options) {
        throw new errors_1.NotImplementedError('In order to sign in via AmazonPay, the shopper must click on "Login with Amazon" button.');
    };
    AmazonPayCustomerStrategy.prototype.signOut = function (options) {
        var state = this._store.getState();
        var payment = state.payment.getPaymentId();
        if (!payment) {
            return Promise.resolve(this._store.getState());
        }
        return this._store.dispatch(this._remoteCheckoutActionCreator.signOut(payment.providerId, options));
    };
    AmazonPayCustomerStrategy.prototype._createSignInButton = function (options) {
        var _this = this;
        if (!this._paymentMethod || !this._window.OffAmazonPayments) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.CustomerNotInitialized);
        }
        if (!this._paymentMethod.config.merchantId) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
        }
        var initializationData = this._paymentMethod.initializationData;
        return new this._window.OffAmazonPayments.Button(options.container, this._paymentMethod.config.merchantId, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            onError: options.onError,
            authorization: function () {
                _this._handleAuthorization(initializationData);
            },
        });
    };
    AmazonPayCustomerStrategy.prototype._handleAuthorization = function (options) {
        var _this = this;
        this._remoteCheckoutRequestSender.generateToken()
            .then(function (_a) {
            var body = _a.body;
            if (!_this._window.amazon) {
                throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.ShippingNotInitialized);
            }
            _this._window.amazon.Login.authorize({
                popup: false,
                scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                state: "" + options.tokenPrefix + body.token,
            }, options.redirectUrl);
            _this._remoteCheckoutRequestSender.trackAuthorizationEvent();
        });
    };
    return AmazonPayCustomerStrategy;
}(customer_strategy_1.default));
exports.default = AmazonPayCustomerStrategy;


/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var customer_strategy_1 = __webpack_require__(27);
var DefaultCustomerStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(DefaultCustomerStrategy, _super);
    function DefaultCustomerStrategy(store, _customerActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._customerActionCreator = _customerActionCreator;
        return _this;
    }
    DefaultCustomerStrategy.prototype.signIn = function (credentials, options) {
        return this._store.dispatch(this._customerActionCreator.signInCustomer(credentials, options));
    };
    DefaultCustomerStrategy.prototype.signOut = function (options) {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    };
    return DefaultCustomerStrategy;
}(customer_strategy_1.default));
exports.default = DefaultCustomerStrategy;


/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var customer_strategy_1 = __webpack_require__(27);
var BraintreeVisaCheckoutCustomerStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(BraintreeVisaCheckoutCustomerStrategy, _super);
    function BraintreeVisaCheckoutCustomerStrategy(store, _checkoutActionCreator, _paymentMethodActionCreator, _customerStrategyActionCreator, _remoteCheckoutActionCreator, _braintreeVisaCheckoutPaymentProcessor, _visaCheckoutScriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._checkoutActionCreator = _checkoutActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._customerStrategyActionCreator = _customerStrategyActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._braintreeVisaCheckoutPaymentProcessor = _braintreeVisaCheckoutPaymentProcessor;
        _this._visaCheckoutScriptLoader = _visaCheckoutScriptLoader;
        _this._buttonClassName = 'visa-checkout-wrapper';
        return _this;
    }
    BraintreeVisaCheckoutCustomerStrategy.prototype.initialize = function (options) {
        var _this = this;
        var visaCheckoutOptions = options.braintreevisacheckout, methodId = options.methodId;
        if (!visaCheckoutOptions || !methodId) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "options.braintreevisacheckout" argument is not provided.');
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) {
            _this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            var checkout = state.checkout.getCheckout();
            var storeConfig = state.config.getStoreConfig();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            if (!storeConfig) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
            }
            if (!_this._paymentMethod || !_this._paymentMethod.clientToken) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            var container = visaCheckoutOptions.container, _a = visaCheckoutOptions.onError, onError = _a === void 0 ? function () { } : _a;
            var initOptions = {
                locale: storeConfig.storeProfile.storeLanguage,
                collectShipping: true,
                subtotal: checkout.subtotal,
                currencyCode: storeConfig.currency.code,
            };
            return Promise.all([
                _this._visaCheckoutScriptLoader.load(_this._paymentMethod.config.testMode),
                _this._braintreeVisaCheckoutPaymentProcessor.initialize(_this._paymentMethod.clientToken, initOptions),
            ])
                .then(function (_a) {
                var visaCheckout = _a[0], initOptions = _a[1];
                var signInButton = _this._createSignInButton(container, _this._buttonClassName);
                visaCheckout.init(initOptions);
                visaCheckout.on('payment.success', function (paymentSuccessPayload) {
                    return _this._paymentInstrumentSelected(paymentSuccessPayload)
                        .catch(function (error) { return onError(error); });
                });
                visaCheckout.on('payment.error', function (payment, error) { return onError(error); });
                return signInButton;
            })
                .then(function (signInButton) { signInButton.style.visibility = 'visible'; });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    BraintreeVisaCheckoutCustomerStrategy.prototype.signIn = function (credentials, options) {
        throw new errors_1.NotImplementedError('In order to sign in via VisaCheckout, the shopper must click on "Visa Checkout" button.');
    };
    BraintreeVisaCheckoutCustomerStrategy.prototype.signOut = function (options) {
        return this._store.dispatch(this._remoteCheckoutActionCreator.signOut('braintreevisacheckout', options));
    };
    BraintreeVisaCheckoutCustomerStrategy.prototype.deinitialize = function (options) {
        var _this = this;
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._paymentMethod = undefined;
        return this._braintreeVisaCheckoutPaymentProcessor.deinitialize()
            .then(function () { return _super.prototype.deinitialize.call(_this, options); });
    };
    BraintreeVisaCheckoutCustomerStrategy.prototype._paymentInstrumentSelected = function (paymentSuccessPayload) {
        var _this = this;
        var state = this._store.getState();
        if (!this._paymentMethod) {
            throw new Error('Payment method not initialized');
        }
        var methodId = this._paymentMethod.id;
        return this._store.dispatch(this._customerStrategyActionCreator.widgetInteraction(function () {
            return _this._braintreeVisaCheckoutPaymentProcessor.handleSuccess(paymentSuccessPayload, state.shippingAddress.getShippingAddress(), state.billingAddress.getBillingAddress())
                .then(function () { return _this._store.dispatch(_this._checkoutActionCreator.loadCurrentCheckout()); });
        }, { methodId: methodId }), { queueId: 'widgetInteraction' });
    };
    BraintreeVisaCheckoutCustomerStrategy.prototype._createSignInButton = function (containerId, buttonClass) {
        var container = document.querySelector("#" + containerId);
        if (!container) {
            throw new Error('Need a container to place the button');
        }
        return container.querySelector('.' + buttonClass) ||
            this._insertVisaCheckoutButton(container, buttonClass);
    };
    BraintreeVisaCheckoutCustomerStrategy.prototype._insertVisaCheckoutButton = function (container, buttonClass) {
        var buttonSource = 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png?acceptCanadianVisaDebit=false&cobrand=true&size=154';
        var buttonTemplate = "\n            <img\n                alt=\"Visa Checkout\"\n                class=\"v-button\"\n                role=\"button\"\n                src=\"" + buttonSource + "\"\n                />\n            <a class=\"v-learn v-learn-default\" style=\"text-align: right; display: block; font-size: 10px; color: #003366;\" href=\"#\" data-locale=\"en_US\">Tell Me More</a>";
        var visaCheckoutButton = document.createElement('div');
        visaCheckoutButton.style.visibility = 'hidden';
        visaCheckoutButton.className = buttonClass;
        visaCheckoutButton.innerHTML = buttonTemplate;
        container.appendChild(visaCheckoutButton);
        return visaCheckoutButton;
    };
    return BraintreeVisaCheckoutCustomerStrategy;
}(customer_strategy_1.default));
exports.default = BraintreeVisaCheckoutCustomerStrategy;


/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var http_request_1 = __webpack_require__(11);
var customer_strategy_1 = __webpack_require__(27);
var ChasePayCustomerStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(ChasePayCustomerStrategy, _super);
    function ChasePayCustomerStrategy(store, _paymentMethodActionCreator, _remoteCheckoutActionCreator, _chasePayScriptLoader, _requestSender, _formPoster) {
        var _this = _super.call(this, store) || this;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._chasePayScriptLoader = _chasePayScriptLoader;
        _this._requestSender = _requestSender;
        _this._formPoster = _formPoster;
        return _this;
    }
    ChasePayCustomerStrategy.prototype.initialize = function (options) {
        var _this = this;
        var chasePayOptions = options.chasepay, methodId = options.methodId;
        if (!chasePayOptions || !methodId) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "options.chasepay" argument is not provided.');
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) {
            _this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            var cart = state.cart.getCart();
            var storeConfig = state.config.getStoreConfig();
            if (!cart) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCart);
            }
            if (!storeConfig) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
            }
            if (!_this._paymentMethod || !_this._paymentMethod.initializationData.digitalSessionId) {
                throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
            }
            var container = chasePayOptions.container;
            return _this._chasePayScriptLoader.load(_this._paymentMethod.config.testMode)
                .then(function (JPMC) {
                var ChasePay = JPMC.ChasePay;
                if (ChasePay.isChasePayUp) {
                    ChasePay.insertButtons({
                        containers: [container],
                    });
                }
                ChasePay.on(ChasePay.EventType.START_CHECKOUT, function () {
                    _this._store.dispatch(_this._paymentMethodActionCreator.loadPaymentMethod(methodId))
                        .then(function () {
                        var state = _this._store.getState();
                        var method = state.paymentMethods.getPaymentMethod(methodId);
                        var sessionId = method && method.initializationData && method.initializationData.digitalSessionId;
                        if (sessionId) {
                            ChasePay.startCheckout(sessionId);
                        }
                    });
                });
                ChasePay.on(ChasePay.EventType.COMPLETE_CHECKOUT, function (payload) {
                    var state = _this._store.getState();
                    var method = state.paymentMethods.getPaymentMethod(methodId);
                    var requestId = method && method.initializationData && method.initializationData.merchantRequestId;
                    if (requestId) {
                        _this._setExternalCheckoutData(payload, requestId)
                            .then(function () {
                            _this._reloadPage();
                        });
                    }
                });
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    ChasePayCustomerStrategy.prototype.signIn = function (credentials, options) {
        throw new errors_1.NotImplementedError('In order to sign in via Chase Pay®, the shopper must click on "Chase Pay®" button.');
    };
    ChasePayCustomerStrategy.prototype.signOut = function (options) {
        var state = this._store.getState();
        var payment = state.payment.getPaymentId();
        if (!payment) {
            return Promise.resolve(this._store.getState());
        }
        return this._store.dispatch(this._remoteCheckoutActionCreator.signOut(payment.providerId, options));
    };
    ChasePayCustomerStrategy.prototype._setExternalCheckoutData = function (payload, requestId) {
        var url = "checkout.php?provider=chasepay&action=set_external_checkout";
        var options = {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: http_request_1.toFormUrlEncoded({
                sessionToken: payload.sessionToken,
                merchantRequestId: requestId,
            }),
            method: 'post',
        };
        return this._requestSender.sendRequest(url, options);
    };
    ChasePayCustomerStrategy.prototype._reloadPage = function () {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                fromChasePay: true,
            },
        });
    };
    return ChasePayCustomerStrategy;
}(customer_strategy_1.default));
exports.default = ChasePayCustomerStrategy;


/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var checkout_1 = __webpack_require__(7);
var DEFAULT_STATE = {};
function customerReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
    });
    return reducer(state, action);
}
exports.default = customerReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
            return action.payload ? tslib_1.__assign({}, data, action.payload.customer) : data;
        default:
            return data;
    }
}


/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CustomerRequestSender = /** @class */ (function () {
    function CustomerRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    CustomerRequestSender.prototype.signInCustomer = function (credentials, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/customer';
        return this._requestSender.post(url, { timeout: timeout, body: credentials });
    };
    CustomerRequestSender.prototype.signOutCustomer = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/customer';
        return this._requestSender.delete(url, { timeout: timeout });
    };
    return CustomerRequestSender;
}());
exports.default = CustomerRequestSender;


/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var CustomerSelector = /** @class */ (function () {
    function CustomerSelector(_customer) {
        this._customer = _customer;
    }
    CustomerSelector.prototype.getCustomer = function () {
        return this._customer.data;
    };
    CustomerSelector = tslib_1.__decorate([
        selector_1.selector
    ], CustomerSelector);
    return CustomerSelector;
}());
exports.default = CustomerSelector;


/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var customer_strategy_actions_1 = __webpack_require__(71);
var CustomerStrategyActionCreator = /** @class */ (function () {
    function CustomerStrategyActionCreator(_strategyRegistry) {
        this._strategyRegistry = _strategyRegistry;
    }
    CustomerStrategyActionCreator.prototype.signIn = function (credentials, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            var methodId = options && options.methodId;
            var meta = { methodId: methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignInRequested, undefined, meta));
            _this._strategyRegistry.get(methodId)
                .signIn(credentials, options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignInSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.SignInFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.signOut = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            var methodId = options && options.methodId;
            var meta = { methodId: methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignOutRequested, undefined, meta));
            _this._strategyRegistry.get(methodId)
                .signOut(options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignOutSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.SignOutFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.initialize = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            var methodId = options && options.methodId;
            var meta = { methodId: methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.InitializeRequested, undefined, meta));
            _this._strategyRegistry.get(methodId)
                .initialize(options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.InitializeSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.InitializeFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.deinitialize = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            var methodId = options && options.methodId;
            var meta = { methodId: methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeRequested, undefined, meta));
            _this._strategyRegistry.get(methodId)
                .deinitialize(options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.widgetInteraction = function (method, options) {
        return Observable_1.Observable.create(function (observer) {
            var methodId = options && options.methodId;
            var meta = { methodId: methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionStarted, undefined, meta));
            method().then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionFinished, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionFailed, error, meta));
            });
        });
    };
    return CustomerStrategyActionCreator;
}());
exports.default = CustomerStrategyActionCreator;


/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CustomerStrategySelector = /** @class */ (function () {
    function CustomerStrategySelector(_customerStrategies) {
        this._customerStrategies = _customerStrategies;
    }
    CustomerStrategySelector.prototype.getSignInError = function (methodId) {
        if (methodId && this._customerStrategies.errors.signInMethodId !== methodId) {
            return;
        }
        return this._customerStrategies.errors.signInError;
    };
    CustomerStrategySelector.prototype.getSignOutError = function (methodId) {
        if (methodId && this._customerStrategies.errors.signOutMethodId !== methodId) {
            return;
        }
        return this._customerStrategies.errors.signOutError;
    };
    CustomerStrategySelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._customerStrategies.errors.initializeMethodId !== methodId) {
            return;
        }
        return this._customerStrategies.errors.initializeError;
    };
    CustomerStrategySelector.prototype.getWidgetInteractionError = function (methodId) {
        if (methodId && this._customerStrategies.errors.widgetInteractionMethodId !== methodId) {
            return;
        }
        return this._customerStrategies.errors.widgetInteractionError;
    };
    CustomerStrategySelector.prototype.isSigningIn = function (methodId) {
        if (methodId && this._customerStrategies.statuses.signInMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategies.statuses.isSigningIn;
    };
    CustomerStrategySelector.prototype.isSigningOut = function (methodId) {
        if (methodId && this._customerStrategies.statuses.signOutMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategies.statuses.isSigningOut;
    };
    CustomerStrategySelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._customerStrategies.statuses.initializeMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategies.statuses.isInitializing;
    };
    CustomerStrategySelector.prototype.isWidgetInteracting = function (methodId) {
        if (methodId && this._customerStrategies.statuses.widgetInteractionMethodId !== methodId) {
            return false;
        }
        return !!this._customerStrategies.statuses.isWidgetInteracting;
    };
    return CustomerStrategySelector;
}());
exports.default = CustomerStrategySelector;


/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var customer_strategy_actions_1 = __webpack_require__(71);
var customer_strategy_state_1 = __webpack_require__(185);
function customerStrategyReducer(state, action) {
    if (state === void 0) { state = customer_strategy_state_1.DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = customerStrategyReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = customer_strategy_state_1.DEFAULT_STATE.errors; }
    switch (action.type) {
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeFailed:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, errors, { deinitializeError: undefined, deinitializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeFailed:
            return tslib_1.__assign({}, errors, { deinitializeError: action.payload, deinitializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInSucceeded:
            return tslib_1.__assign({}, errors, { signInError: undefined, signInMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInFailed:
            return tslib_1.__assign({}, errors, { signInError: action.payload, signInMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutRequested:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutSucceeded:
            return tslib_1.__assign({}, errors, { signOutError: undefined, signOutMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutFailed:
            return tslib_1.__assign({}, errors, { signOutError: action.payload, signOutMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionStarted:
        case customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionFinished:
            return tslib_1.__assign({}, errors, { widgetInteractionError: undefined, widgetInteractionMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionFailed:
            return tslib_1.__assign({}, errors, { widgetInteractionError: action.payload, widgetInteractionMethodId: action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = customer_strategy_state_1.DEFAULT_STATE.statuses; }
    switch (action.type) {
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeRequested:
            return tslib_1.__assign({}, statuses, { isInitializing: true, initializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isInitializing: false, initializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeRequested:
            return tslib_1.__assign({}, statuses, { isDeinitializing: true, deinitializeMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isDeinitializing: false, deinitializeMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInRequested:
            return tslib_1.__assign({}, statuses, { isSigningIn: true, signInMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignInSucceeded:
            return tslib_1.__assign({}, statuses, { isSigningIn: false, signInMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutRequested:
            return tslib_1.__assign({}, statuses, { isSigningOut: true, signOutMethodId: action.meta && action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutFailed:
        case customer_strategy_actions_1.CustomerStrategyActionType.SignOutSucceeded:
            return tslib_1.__assign({}, statuses, { isSigningOut: false, signOutMethodId: undefined });
        case customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionStarted:
            return tslib_1.__assign({}, statuses, { isWidgetInteracting: true, widgetInteractionMethodId: action.meta.methodId });
        case customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionFinished:
        case customer_strategy_actions_1.CustomerStrategyActionType.WidgetInteractionFailed:
            return tslib_1.__assign({}, statuses, { isWidgetInteracting: false, widgetInteractionMethodId: undefined });
        default:
            return statuses;
    }
}


/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STATE = {
    errors: {},
    statuses: {},
};


/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = __webpack_require__(21);
function mapToInternalCustomer(customer, billingAddress) {
    var firstName = customer.firstName || billingAddress.firstName || '';
    var lastName = customer.lastName || billingAddress.lastName || '';
    return {
        addresses: (customer.addresses || []).map(function (address) { return address_1.mapToInternalAddress(address); }),
        customerId: customer.id,
        isGuest: customer.isGuest,
        storeCredit: customer.storeCredit,
        email: customer.email || billingAddress.email || '',
        firstName: firstName,
        lastName: lastName,
        name: customer.fullName || [firstName, lastName].join(' '),
    };
}
exports.default = mapToInternalCustomer;


/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = __webpack_require__(18);
var script_loader_1 = __webpack_require__(37);
var checkout_request_sender_1 = __webpack_require__(33);
var registry_1 = __webpack_require__(40);
var payment_1 = __webpack_require__(13);
var remote_checkout_1 = __webpack_require__(26);
var amazon_pay_1 = __webpack_require__(39);
var _1 = __webpack_require__(15);
var consignment_action_creator_1 = __webpack_require__(72);
var strategies_1 = __webpack_require__(188);
function createShippingStrategyRegistry(store, client) {
    var requestSender = request_sender_1.createRequestSender();
    var registry = new registry_1.Registry();
    var checkoutRequestSender = new checkout_request_sender_1.default(requestSender);
    var consignmentRequestSender = new _1.ConsignmentRequestSender(requestSender);
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayShippingStrategy(store, new consignment_action_creator_1.default(consignmentRequestSender, checkoutRequestSender), new payment_1.PaymentMethodActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(requestSender)), new amazon_pay_1.AmazonPayScriptLoader(script_loader_1.getScriptLoader()));
    });
    registry.register('default', function () {
        return new strategies_1.DefaultShippingStrategy(store, new consignment_action_creator_1.default(consignmentRequestSender, checkoutRequestSender));
    });
    return registry;
}
exports.default = createShippingStrategyRegistry;


/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var amazon_pay_shipping_strategy_1 = __webpack_require__(189);
exports.AmazonPayShippingStrategy = amazon_pay_shipping_strategy_1.default;
var default_shipping_strategy_1 = __webpack_require__(191);
exports.DefaultShippingStrategy = default_shipping_strategy_1.default;
var shipping_strategy_1 = __webpack_require__(44);
exports.ShippingStrategy = shipping_strategy_1.default;


/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var address_1 = __webpack_require__(21);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(73);
var shipping_strategy_actions_1 = __webpack_require__(43);
var shipping_strategy_1 = __webpack_require__(44);
var AmazonPayShippingStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(AmazonPayShippingStrategy, _super);
    function AmazonPayShippingStrategy(store, _consignmentActionCreator, _paymentMethodActionCreator, _remoteCheckoutActionCreator, _scriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._consignmentActionCreator = _consignmentActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayShippingStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        var amazonOptions = options.amazon, methodId = options.methodId;
        if (!amazonOptions || !methodId) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "options.amazon" argument is not provided.');
        }
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) { return new Promise(function (resolve, reject) {
            _this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            if (!_this._paymentMethod) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            var onReady = function () {
                _this._createAddressBook(amazonOptions)
                    .then(resolve)
                    .catch(reject);
            };
            _this._scriptLoader.loadWidget(_this._paymentMethod, onReady)
                .catch(reject);
        }); })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AmazonPayShippingStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._paymentMethod = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayShippingStrategy.prototype.updateAddress = function (address, options) {
        return Promise.resolve(this._store.getState());
    };
    AmazonPayShippingStrategy.prototype.selectOption = function (optionId, options) {
        return this._store.dispatch(this._consignmentActionCreator.selectShippingOption(optionId, options));
    };
    AmazonPayShippingStrategy.prototype._createAddressBook = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var container = options.container, _a = options.onAddressSelect, onAddressSelect = _a === void 0 ? function () { } : _a, _b = options.onError, onError = _b === void 0 ? function () { } : _b, _c = options.onReady, onReady = _c === void 0 ? function () { } : _c;
            var merchantId = _this._paymentMethod && _this._paymentMethod.config.merchantId;
            if (!document.getElementById(container)) {
                return reject(new errors_1.InvalidArgumentError('Unable to create AmazonPay AddressBook widget without valid container ID.'));
            }
            if (!_this._window.OffAmazonPayments) {
                return reject(new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.ShippingNotInitialized));
            }
            if (!merchantId) {
                return reject(new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod));
            }
            var widget = new _this._window.OffAmazonPayments.Widgets.AddressBook({
                design: {
                    designMode: 'responsive',
                },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onAddressSelect: function (orderReference) {
                    _this._synchronizeShippingAddress()
                        .then(function () { return onAddressSelect(orderReference); })
                        .catch(onError);
                },
                onError: function (error) {
                    reject(error);
                    onError(error);
                },
                onOrderReferenceCreate: function (orderReference) {
                    _this._handleOrderReferenceCreate(orderReference);
                },
                onReady: function () {
                    resolve();
                    onReady();
                },
            });
            widget.bind(container);
            return widget;
        });
    };
    AmazonPayShippingStrategy.prototype._synchronizeShippingAddress = function () {
        var _this = this;
        var methodId = this._paymentMethod && this._paymentMethod.id;
        var amazon = this._store.getState().remoteCheckout.getCheckout('amazon');
        var referenceId = amazon ? amazon.referenceId : undefined;
        if (!methodId || !referenceId) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.ShippingNotInitialized);
        }
        return this._store.dispatch(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId: methodId }))
            .then(function () { return _this._store.dispatch(_this._remoteCheckoutActionCreator.initializeShipping(methodId, { referenceId: referenceId })); })
            .then(function (state) {
            var amazon = state.remoteCheckout.getCheckout('amazon');
            var remoteAddress = amazon && amazon.shipping && amazon.shipping.address;
            var address = state.shippingAddress.getShippingAddress();
            if (remoteAddress === false) {
                throw new errors_2.RemoteCheckoutSynchronizationError();
            }
            if (!remoteAddress || address_1.isAddressEqual(remoteAddress, address || {})) {
                return _this._store.getState();
            }
            return _this._store.dispatch(_this._consignmentActionCreator.updateAddress(address_1.mapFromInternalAddress(remoteAddress)));
        })
            .then(function () { return _this._store.dispatch(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId: methodId })); })
            .catch(function (error) { return _this._store.dispatch(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed, error, { methodId: methodId })); });
    };
    AmazonPayShippingStrategy.prototype._handleOrderReferenceCreate = function (orderReference) {
        if (!this._paymentMethod) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.ShippingNotInitialized);
        }
        this._store.dispatch(this._remoteCheckoutActionCreator.updateCheckout(this._paymentMethod.id, {
            referenceId: orderReference.getAmazonOrderReferenceId(),
        }));
    };
    return AmazonPayShippingStrategy;
}(shipping_strategy_1.default));
exports.default = AmazonPayShippingStrategy;


/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var RemoteCheckoutSynchronizationError = /** @class */ (function (_super) {
    tslib_1.__extends(RemoteCheckoutSynchronizationError, _super);
    function RemoteCheckoutSynchronizationError(error) {
        var _this = _super.call(this, 'Unable to synchronize your checkout details with a third party provider. Please try again later.') || this;
        _this.error = error;
        _this.type = 'remote_checkout_synchronization';
        return _this;
    }
    return RemoteCheckoutSynchronizationError;
}(errors_1.StandardError));
exports.default = RemoteCheckoutSynchronizationError;


/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var shipping_strategy_1 = __webpack_require__(44);
var DefaultShippingStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(DefaultShippingStrategy, _super);
    function DefaultShippingStrategy(store, _consignmentActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._consignmentActionCreator = _consignmentActionCreator;
        return _this;
    }
    DefaultShippingStrategy.prototype.updateAddress = function (address, options) {
        return this._store.dispatch(this._consignmentActionCreator.updateAddress(address, options));
    };
    DefaultShippingStrategy.prototype.selectOption = function (optionId, options) {
        return this._store.dispatch(this._consignmentActionCreator.selectShippingOption(optionId, options));
    };
    return DefaultShippingStrategy;
}(shipping_strategy_1.default));
exports.default = DefaultShippingStrategy;


/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var selector_1 = __webpack_require__(4);
var ConsignmentSelector = /** @class */ (function () {
    function ConsignmentSelector(_consignments) {
        this._consignments = _consignments;
    }
    ConsignmentSelector.prototype.getConsignments = function () {
        return this._consignments.data;
    };
    ConsignmentSelector.prototype.getShippingOption = function () {
        var consignments = this._consignments.data;
        if (consignments && consignments.length) {
            return consignments[0].selectedShippingOption;
        }
    };
    ConsignmentSelector.prototype.getLoadError = function () {
        return this._consignments.errors.loadError;
    };
    ConsignmentSelector.prototype.getCreateError = function () {
        return this._consignments.errors.createError;
    };
    ConsignmentSelector.prototype.getLoadShippingOptionsError = function () {
        return this._consignments.errors.loadShippingOptionsError;
    };
    ConsignmentSelector.prototype.getUpdateError = function (consignmentId) {
        if (consignmentId) {
            return this._consignments.errors.updateError[consignmentId];
        }
        return lodash_1.find(this._consignments.errors.updateError);
    };
    ConsignmentSelector.prototype.getUpdateShippingOptionError = function (consignmentId) {
        if (consignmentId) {
            return this._consignments.errors.updateShippingOptionError[consignmentId];
        }
        return lodash_1.find(this._consignments.errors.updateShippingOptionError);
    };
    ConsignmentSelector.prototype.isLoading = function () {
        return this._consignments.statuses.isLoading === true;
    };
    ConsignmentSelector.prototype.isLoadingShippingOptions = function () {
        return this._consignments.statuses.isLoadingShippingOptions === true;
    };
    ConsignmentSelector.prototype.isCreating = function () {
        return this._consignments.statuses.isCreating === true;
    };
    ConsignmentSelector.prototype.isUpdating = function (consignmentId) {
        if (consignmentId) {
            return this._consignments.statuses.isUpdating[consignmentId] === true;
        }
        return lodash_1.find(this._consignments.statuses.isUpdating) === true;
    };
    ConsignmentSelector.prototype.isUpdatingShippingOption = function (consignmentId) {
        if (consignmentId) {
            return this._consignments.statuses.isUpdatingShippingOption[consignmentId] === true;
        }
        return lodash_1.find(this._consignments.statuses.isUpdatingShippingOption) === true;
    };
    ConsignmentSelector = tslib_1.__decorate([
        selector_1.selector
    ], ConsignmentSelector);
    return ConsignmentSelector;
}());
exports.default = ConsignmentSelector;


/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var checkout_1 = __webpack_require__(7);
var customer_1 = __webpack_require__(14);
var consignment_actions_1 = __webpack_require__(24);
var DEFAULT_STATE = {
    errors: {
        updateShippingOptionError: {},
        updateError: {},
    },
    statuses: {
        isUpdating: {},
        isUpdatingShippingOption: {},
    },
};
function consignmentReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = consignmentReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsSucceeded:
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded:
            return action.payload ? action.payload.consignments : data;
        case customer_1.CustomerActionType.SignOutCustomerSucceeded:
            return [];
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsSucceeded:
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsRequested:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsRequested:
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded:
            return tslib_1.__assign({}, errors, { createError: undefined });
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsFailed:
            return tslib_1.__assign({}, errors, { createError: action.payload });
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentRequested:
            if (action.meta) {
                errors.updateError[action.meta.id] = undefined;
            }
            return errors;
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentFailed:
            if (action.meta) {
                errors.updateError[action.meta.id] = action.payload;
            }
            return errors;
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionRequested:
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded:
            if (action.meta) {
                errors.updateShippingOptionError[action.meta.id] = undefined;
            }
            return errors;
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionFailed:
            if (action.meta) {
                errors.updateShippingOptionError[action.meta.id] = action.payload;
            }
            return errors;
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsRequested:
            return tslib_1.__assign({}, statuses, { isLoadingShippingOptions: true });
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case checkout_1.CheckoutActionType.LoadCheckoutFailed:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsSucceeded:
        case consignment_actions_1.ConsignmentActionType.LoadShippingOptionsFailed:
            return tslib_1.__assign({}, statuses, { isLoadingShippingOptions: false });
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsRequested:
            return tslib_1.__assign({}, statuses, { isCreating: true });
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded:
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsFailed:
            return tslib_1.__assign({}, statuses, { isCreating: false });
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentRequested:
            if (action.meta) {
                statuses.isUpdating[action.meta.id] = true;
            }
            return statuses;
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentFailed:
            if (action.meta) {
                statuses.isUpdating[action.meta.id] = false;
            }
            return statuses;
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionRequested:
            if (action.meta) {
                statuses.isUpdatingShippingOption[action.meta.id] = true;
            }
            return statuses;
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionFailed:
            if (action.meta) {
                statuses.isUpdatingShippingOption[action.meta.id] = false;
            }
            return statuses;
        default:
            return statuses;
    }
}


/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var http_request_1 = __webpack_require__(11);
var DEFAULT_PARAMS = {
    include: [
        'consignments.availableShippingOptions',
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(','),
};
var ConsignmentRequestSender = /** @class */ (function () {
    function ConsignmentRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    ConsignmentRequestSender.prototype.createConsignments = function (checkoutId, consignments, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkouts/" + checkoutId + "/consignments";
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.post(url, { body: consignments, params: DEFAULT_PARAMS, headers: headers, timeout: timeout });
    };
    ConsignmentRequestSender.prototype.updateConsignment = function (checkoutId, consignment, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var id = consignment.id, body = tslib_1.__rest(consignment, ["id"]);
        var url = "/api/storefront/checkouts/" + checkoutId + "/consignments/" + id;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.put(url, { params: DEFAULT_PARAMS, body: body, headers: headers, timeout: timeout });
    };
    return ConsignmentRequestSender;
}());
exports.default = ConsignmentRequestSender;


/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var ShippingAddressSelector = /** @class */ (function () {
    function ShippingAddressSelector(_consignments, _config) {
        this._consignments = _consignments;
        this._config = _config;
    }
    ShippingAddressSelector.prototype.getShippingAddress = function () {
        var consignments = this._consignments.data;
        var context = this._config.data && this._config.data.context;
        if (!consignments || !consignments[0]) {
            if (!context || !context.geoCountryCode) {
                return;
            }
            return {
                firstName: '',
                lastName: '',
                company: '',
                address1: '',
                address2: '',
                city: '',
                stateOrProvince: '',
                stateOrProvinceCode: '',
                postalCode: '',
                country: '',
                phone: '',
                customFields: [],
                countryCode: context.geoCountryCode,
            };
        }
        return consignments[0].shippingAddress;
    };
    ShippingAddressSelector = tslib_1.__decorate([
        selector_1.selector
    ], ShippingAddressSelector);
    return ShippingAddressSelector;
}());
exports.default = ShippingAddressSelector;


/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var actionTypes = __webpack_require__(74);
/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
var ShippingCountryActionCreator = /** @class */ (function () {
    function ShippingCountryActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    ShippingCountryActionCreator.prototype.loadCountries = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED));
            _this._checkoutClient.loadShippingCountries(options)
                .then(function (response) {
                observer.next(data_store_1.createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED, response.body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED, response));
            });
        });
    };
    return ShippingCountryActionCreator;
}());
exports.default = ShippingCountryActionCreator;


/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ShippingCountryRequestSender = /** @class */ (function () {
    function ShippingCountryRequestSender(_requestSender, _config) {
        this._requestSender = _requestSender;
        this._config = _config;
    }
    ShippingCountryRequestSender.prototype.loadCountries = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/shipping/countries';
        var headers = {
            'Accept-Language': this._config.locale,
        };
        return this._requestSender.get(url, { headers: headers, timeout: timeout });
    };
    return ShippingCountryRequestSender;
}());
exports.default = ShippingCountryRequestSender;


/***/ }),
/* 198 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var ShippingCountrySelector = /** @class */ (function () {
    function ShippingCountrySelector(_shippingCountries) {
        this._shippingCountries = _shippingCountries;
    }
    ShippingCountrySelector.prototype.getShippingCountries = function () {
        return this._shippingCountries.data;
    };
    ShippingCountrySelector.prototype.getLoadError = function () {
        return this._shippingCountries.errors.loadError;
    };
    ShippingCountrySelector.prototype.isLoading = function () {
        return !!this._shippingCountries.statuses.isLoading;
    };
    ShippingCountrySelector = tslib_1.__decorate([
        selector_1.selector
    ], ShippingCountrySelector);
    return ShippingCountrySelector;
}());
exports.default = ShippingCountrySelector;


/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var actionTypes = __webpack_require__(74);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
function shippingCountryReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        data: dataReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingCountryReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
            return action.payload || [];
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED:
        case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED:
        case actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 200 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var shipping_strategy_actions_1 = __webpack_require__(43);
var ShippingStrategyActionCreator = /** @class */ (function () {
    function ShippingStrategyActionCreator(_strategyRegistry) {
        this._strategyRegistry = _strategyRegistry;
    }
    ShippingStrategyActionCreator.prototype.updateAddress = function (address, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var payment = store.getState().payment.getPaymentId();
            var methodId = options && options.methodId || payment && payment.providerId;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .updateAddress(address, tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed, error, { methodId: methodId }));
            });
        }); };
    };
    ShippingStrategyActionCreator.prototype.selectOption = function (shippingOptionId, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var payment = store.getState().payment.getPaymentId();
            var methodId = options && options.methodId || payment && payment.providerId;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .selectOption(shippingOptionId, tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionFailed, error, { methodId: methodId }));
            });
        }); };
    };
    ShippingStrategyActionCreator.prototype.initialize = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var payment = store.getState().payment.getPaymentId();
            var methodId = options && options.methodId || payment && payment.providerId;
            var mergedOptions = tslib_1.__assign({}, options, { methodId: methodId });
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.InitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .initialize(mergedOptions)
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.InitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.InitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    ShippingStrategyActionCreator.prototype.deinitialize = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var payment = store.getState().payment.getPaymentId();
            var methodId = options && options.methodId || payment && payment.providerId;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .deinitialize(tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    return ShippingStrategyActionCreator;
}());
exports.default = ShippingStrategyActionCreator;


/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var ShippingStrategySelector = /** @class */ (function () {
    function ShippingStrategySelector(_shippingStrategies) {
        this._shippingStrategies = _shippingStrategies;
    }
    ShippingStrategySelector.prototype.getUpdateAddressError = function (methodId) {
        if (methodId && this._shippingStrategies.errors.updateAddressMethodId !== methodId) {
            return;
        }
        return this._shippingStrategies.errors.updateAddressError;
    };
    ShippingStrategySelector.prototype.getSelectOptionError = function (methodId) {
        if (methodId && this._shippingStrategies.errors.selectOptionMethodId !== methodId) {
            return;
        }
        return this._shippingStrategies.errors.selectOptionError;
    };
    ShippingStrategySelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._shippingStrategies.errors.initializeMethodId !== methodId) {
            return;
        }
        return this._shippingStrategies.errors.initializeError;
    };
    ShippingStrategySelector.prototype.isUpdatingAddress = function (methodId) {
        if (methodId && this._shippingStrategies.statuses.updateAddressMethodId !== methodId) {
            return false;
        }
        return !!this._shippingStrategies.statuses.isUpdatingAddress;
    };
    ShippingStrategySelector.prototype.isSelectingOption = function (methodId) {
        if (methodId && this._shippingStrategies.statuses.selectOptionMethodId !== methodId) {
            return false;
        }
        return !!this._shippingStrategies.statuses.isSelectingOption;
    };
    ShippingStrategySelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._shippingStrategies.statuses.initializeMethodId !== methodId) {
            return false;
        }
        return !!this._shippingStrategies.statuses.isInitializing;
    };
    ShippingStrategySelector = tslib_1.__decorate([
        selector_1.selector
    ], ShippingStrategySelector);
    return ShippingStrategySelector;
}());
exports.default = ShippingStrategySelector;


/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var shipping_strategy_actions_1 = __webpack_require__(43);
var shipping_strategy_state_1 = __webpack_require__(203);
function shippingStrategyReducer(state, action) {
    if (state === void 0) { state = shipping_strategy_state_1.DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = shippingStrategyReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = shipping_strategy_state_1.DEFAULT_STATE.errors; }
    switch (action.type) {
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeFailed:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, errors, { deinitializeError: undefined, deinitializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeFailed:
            return tslib_1.__assign({}, errors, { deinitializeError: action.payload, deinitializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded:
            return tslib_1.__assign({}, errors, { updateAddressError: undefined, updateAddressMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed:
            return tslib_1.__assign({}, errors, { updateAddressError: action.payload, updateAddressMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionRequested:
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionSucceeded:
            return tslib_1.__assign({}, errors, { selectOptionError: undefined, selectOptionMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionFailed:
            return tslib_1.__assign({}, errors, { selectOptionError: action.payload, selectOptionMethodId: action.meta && action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = shipping_strategy_state_1.DEFAULT_STATE.statuses; }
    switch (action.type) {
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeRequested:
            return tslib_1.__assign({}, statuses, { isInitializing: true, initializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isInitializing: false, initializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeRequested:
            return tslib_1.__assign({}, statuses, { isDeinitializing: true, deinitializeMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isDeinitializing: false, deinitializeMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested:
            return tslib_1.__assign({}, statuses, { isUpdatingAddress: true, updateAddressMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded:
            return tslib_1.__assign({}, statuses, { isUpdatingAddress: false, updateAddressMethodId: undefined });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionRequested:
            return tslib_1.__assign({}, statuses, { isSelectingOption: true, selectOptionMethodId: action.meta && action.meta.methodId });
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionFailed:
        case shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionSucceeded:
            return tslib_1.__assign({}, statuses, { isSelectingOption: false, selectOptionMethodId: undefined });
        default:
            return statuses;
    }
}


/***/ }),
/* 203 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STATE = {
    errors: {},
    statuses: {},
};


/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var map_to_internal_shipping_option_1 = __webpack_require__(75);
function mapToInternalShippingOptions(consignments) {
    return consignments.reduce(function (result, consignment) {
        var _a;
        var shippingOptions;
        if (consignment.availableShippingOptions && consignment.availableShippingOptions.length) {
            shippingOptions = consignment.availableShippingOptions;
        }
        else if (consignment.selectedShippingOption) {
            shippingOptions = [consignment.selectedShippingOption];
        }
        return tslib_1.__assign({}, result, (_a = {}, _a[consignment.id] = (shippingOptions || []).map(function (option) {
            var selectedOptionId = consignment.selectedShippingOption && consignment.selectedShippingOption.id;
            return map_to_internal_shipping_option_1.default(option, option.id === selectedOptionId);
        }), _a));
    }, {});
}
exports.default = mapToInternalShippingOptions;


/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var afterpay_payment_strategy_1 = __webpack_require__(206);
exports.AfterpayPaymentStrategy = afterpay_payment_strategy_1.default;
var amazon_pay_payment_strategy_1 = __webpack_require__(207);
exports.AmazonPayPaymentStrategy = amazon_pay_payment_strategy_1.default;
var credit_card_payment_strategy_1 = __webpack_require__(80);
exports.CreditCardPaymentStrategy = credit_card_payment_strategy_1.default;
var klarna_payment_strategy_1 = __webpack_require__(208);
exports.KlarnaPaymentStrategy = klarna_payment_strategy_1.default;
var legacy_payment_strategy_1 = __webpack_require__(209);
exports.LegacyPaymentStrategy = legacy_payment_strategy_1.default;
var no_payment_data_required_strategy_1 = __webpack_require__(210);
exports.NoPaymentDataRequiredPaymentStrategy = no_payment_data_required_strategy_1.default;
var offline_payment_strategy_1 = __webpack_require__(211);
exports.OfflinePaymentStrategy = offline_payment_strategy_1.default;
var offsite_payment_strategy_1 = __webpack_require__(212);
exports.OffsitePaymentStrategy = offsite_payment_strategy_1.default;
var payment_strategy_1 = __webpack_require__(6);
exports.PaymentStrategy = payment_strategy_1.default;
var paypal_express_payment_strategy_1 = __webpack_require__(213);
exports.PaypalExpressPaymentStrategy = paypal_express_payment_strategy_1.default;
var paypal_pro_payment_strategy_1 = __webpack_require__(214);
exports.PaypalProPaymentStrategy = paypal_pro_payment_strategy_1.default;
var sage_pay_payment_strategy_1 = __webpack_require__(215);
exports.SagePayPaymentStrategy = sage_pay_payment_strategy_1.default;
var wepay_payment_strategy_1 = __webpack_require__(216);
exports.WepayPaymentStrategy = wepay_payment_strategy_1.default;
var braintree_1 = __webpack_require__(41);
exports.BraintreeCreditCardPaymentStrategy = braintree_1.BraintreeCreditCardPaymentStrategy;
exports.BraintreePaypalPaymentStrategy = braintree_1.BraintreePaypalPaymentStrategy;
exports.BraintreeVisaCheckoutPaymentStrategy = braintree_1.BraintreeVisaCheckoutPaymentStrategy;
var square_1 = __webpack_require__(81);
exports.SquarePaymentStrategy = square_1.SquarePaymentStrategy;


/***/ }),
/* 206 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(12);
var payment_strategy_1 = __webpack_require__(6);
var AfterpayPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(AfterpayPaymentStrategy, _super);
    function AfterpayPaymentStrategy(store, _checkoutValidator, _orderActionCreator, _paymentActionCreator, _paymentMethodActionCreator, _remoteCheckoutActionCreator, _afterpayScriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._checkoutValidator = _checkoutValidator;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._afterpayScriptLoader = _afterpayScriptLoader;
        return _this;
    }
    AfterpayPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        var state = this._store.getState();
        var paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId, options.gatewayId);
        var config = state.config.getStoreConfig();
        var storeCountryName = config ? config.storeProfile.storeCountry : '';
        if (!paymentMethod) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
        }
        return this._afterpayScriptLoader.load(paymentMethod, this._mapCountryToISO2(storeCountryName))
            .then(function (afterpaySdk) {
            _this._afterpaySdk = afterpaySdk;
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AfterpayPaymentStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        if (this._afterpaySdk) {
            this._afterpaySdk = undefined;
        }
        return _super.prototype.deinitialize.call(this, options);
    };
    AfterpayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var paymentId = payload.payment && payload.payment.gatewayId;
        if (!paymentId) {
            throw new errors_2.PaymentArgumentInvalidError(['payment.gatewayId']);
        }
        var useStoreCredit = !!payload.useStoreCredit;
        var state = this._store.getState();
        var config = state.config.getStoreConfig();
        var storeCountryName = config ? config.storeProfile.storeCountry : '';
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(paymentId, { useStoreCredit: useStoreCredit }))
            .then(function (state) { return _this._checkoutValidator.validate(state.checkout.getCheckout(), options); })
            .then(function () { return _this._store.dispatch(_this._paymentMethodActionCreator.loadPaymentMethod(paymentId, options)); })
            .then(function (state) { return _this._displayModal(storeCountryName, state.paymentMethods.getPaymentMethod(paymentId)); })
            // Afterpay will handle the rest of the flow so return a promise that doesn't really resolve
            .then(function () { return new Promise(function () { }); });
    };
    AfterpayPaymentStrategy.prototype.finalize = function (options) {
        var _this = this;
        return this._store.dispatch(this._remoteCheckoutActionCreator.loadSettings(options.methodId))
            .then(function (state) {
            var payment = state.payment.getPaymentId();
            var config = state.config.getContextConfig();
            var afterpay = state.remoteCheckout.getCheckout('afterpay');
            if (!payment) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            if (!config || !config.payment.token) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
            }
            if (!afterpay || !afterpay.settings) {
                throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
            }
            var orderPayload = {
                useStoreCredit: afterpay.settings.useStoreCredit,
            };
            var paymentPayload = {
                methodId: payment.providerId,
                paymentData: { nonce: config.payment.token },
            };
            return _this._store.dispatch(_this._orderActionCreator.submitOrder(orderPayload, options))
                .then(function () { return _this._store.dispatch(_this._paymentActionCreator.submitPayment(paymentPayload)); });
        });
    };
    AfterpayPaymentStrategy.prototype._displayModal = function (countryName, paymentMethod) {
        if (!this._afterpaySdk || !paymentMethod || !paymentMethod.clientToken) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
        }
        this._afterpaySdk.initialize({ countryCode: this._mapCountryToISO2(countryName) });
        this._afterpaySdk.display({ token: paymentMethod.clientToken });
    };
    AfterpayPaymentStrategy.prototype._mapCountryToISO2 = function (countryName) {
        switch (countryName) {
            case 'Australia':
                return 'AU';
            case 'New Zealand':
                return 'NZ';
            case 'United States':
                return 'US';
            default:
                return 'AU';
        }
    };
    return AfterpayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = AfterpayPaymentStrategy;


/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var address_1 = __webpack_require__(21);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(73);
var payment_strategy_1 = __webpack_require__(6);
var AmazonPayPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(AmazonPayPaymentStrategy, _super);
    function AmazonPayPaymentStrategy(store, _orderActionCreator, _billingAddressActionCreator, _remoteCheckoutActionCreator, _scriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._billingAddressActionCreator = _billingAddressActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._scriptLoader = _scriptLoader;
        _this._window = window;
        return _this;
    }
    AmazonPayPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        if (this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        var amazonOptions = options.amazon, methodId = options.methodId;
        var state = this._store.getState();
        var paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
        if (!amazonOptions) {
            throw new errors_1.InvalidArgumentError('Unable to initialize payment because "options.amazon" argument is not provided.');
        }
        if (!paymentMethod) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
        }
        this._walletOptions = amazonOptions;
        this._paymentMethod = paymentMethod;
        return new Promise(function (resolve, reject) {
            var onReady = function () {
                _this._createWallet(amazonOptions)
                    .then(resolve)
                    .catch(reject);
            };
            _this._scriptLoader.loadWidget(paymentMethod, onReady)
                .catch(reject);
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    AmazonPayPaymentStrategy.prototype.deinitialize = function (options) {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this, options);
        }
        this._walletOptions = undefined;
        return _super.prototype.deinitialize.call(this, options);
    };
    AmazonPayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var referenceId = this._getOrderReferenceId();
        if (!referenceId) {
            throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
        }
        if (!payload.payment) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "payload.payment.methodId" argument is not provided.');
        }
        var _a = payload.payment, paymentData = _a.paymentData, paymentPayload = tslib_1.__rest(_a, ["paymentData"]), _b = payload.useStoreCredit, useStoreCredit = _b === void 0 ? false : _b;
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(paymentPayload.methodId, { referenceId: referenceId, useStoreCredit: useStoreCredit }))
            .then(function () { return _this._store.dispatch(_this._orderActionCreator.submitOrder(tslib_1.__assign({}, payload, { payment: paymentPayload }), options)); })
            .catch(function (error) {
            if (error instanceof errors_1.RequestError && error.body.type === 'provider_widget_error' && _this._walletOptions) {
                return _this._createWallet(_this._walletOptions)
                    .then(function () { return Promise.reject(error); });
            }
            return Promise.reject(error);
        });
    };
    AmazonPayPaymentStrategy.prototype._getMerchantId = function () {
        return this._paymentMethod && this._paymentMethod.config.merchantId;
    };
    AmazonPayPaymentStrategy.prototype._getOrderReferenceId = function () {
        var state = this._store.getState();
        var amazon = state.remoteCheckout.getCheckout('amazon');
        return amazon ? amazon.referenceId : undefined;
    };
    AmazonPayPaymentStrategy.prototype._createWallet = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var container = options.container, _a = options.onError, onError = _a === void 0 ? lodash_1.noop : _a, _b = options.onPaymentSelect, onPaymentSelect = _b === void 0 ? lodash_1.noop : _b, _c = options.onReady, onReady = _c === void 0 ? lodash_1.noop : _c;
            var referenceId = _this._getOrderReferenceId();
            var merchantId = _this._getMerchantId();
            if (!document.getElementById(container)) {
                return reject(new errors_1.InvalidArgumentError('Unable to create AmazonPay Wallet widget without valid container ID.'));
            }
            if (!_this._window.OffAmazonPayments) {
                return reject(new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized));
            }
            if (!merchantId) {
                return reject(new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod));
            }
            var walletOptions = {
                design: { designMode: 'responsive' },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onError: function (error) {
                    reject(error);
                    onError(error);
                },
                onPaymentSelect: function (orderReference) {
                    _this._synchronizeBillingAddress()
                        .then(function () { return onPaymentSelect(orderReference); })
                        .catch(onError);
                },
                onReady: function (orderReference) {
                    resolve();
                    onReady(orderReference);
                },
            };
            if (referenceId) {
                walletOptions.amazonOrderReferenceId = referenceId;
            }
            else {
                walletOptions.onOrderReferenceCreate = function (orderReference) {
                    if (!_this._paymentMethod) {
                        throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
                    }
                    _this._store.dispatch(_this._remoteCheckoutActionCreator.updateCheckout(_this._paymentMethod.id, {
                        referenceId: orderReference.getAmazonOrderReferenceId(),
                    }));
                };
            }
            var widget = new _this._window.OffAmazonPayments.Widgets.Wallet(walletOptions);
            widget.bind(container);
            return widget;
        });
    };
    AmazonPayPaymentStrategy.prototype._synchronizeBillingAddress = function () {
        var _this = this;
        var referenceId = this._getOrderReferenceId();
        var methodId = this._paymentMethod && this._paymentMethod.id;
        if (!methodId || !referenceId) {
            throw new errors_2.RemoteCheckoutSynchronizationError();
        }
        return this._store.dispatch(this._remoteCheckoutActionCreator.initializeBilling(methodId, { referenceId: referenceId }))
            .then(function (state) {
            var amazon = state.remoteCheckout.getCheckout('amazon');
            var remoteAddress = amazon && amazon.billing && amazon.billing.address;
            var billingAddress = state.billingAddress.getBillingAddress();
            var internalBillingAddress = billingAddress && address_1.mapToInternalAddress(billingAddress);
            if (remoteAddress === false) {
                throw new errors_2.RemoteCheckoutSynchronizationError();
            }
            if (!remoteAddress || address_1.isAddressEqual(remoteAddress, internalBillingAddress || {})) {
                return _this._store.getState();
            }
            return _this._store.dispatch(_this._billingAddressActionCreator.updateAddress(address_1.mapFromInternalAddress(remoteAddress)));
        });
    };
    return AmazonPayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = AmazonPayPaymentStrategy;


/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var payment_strategy_1 = __webpack_require__(6);
var KlarnaPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(KlarnaPaymentStrategy, _super);
    function KlarnaPaymentStrategy(store, _orderActionCreator, _paymentMethodActionCreator, _remoteCheckoutActionCreator, _klarnaScriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentMethodActionCreator = _paymentMethodActionCreator;
        _this._remoteCheckoutActionCreator = _remoteCheckoutActionCreator;
        _this._klarnaScriptLoader = _klarnaScriptLoader;
        return _this;
    }
    KlarnaPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        return this._klarnaScriptLoader.load()
            .then(function (klarnaCredit) { _this._klarnaCredit = klarnaCredit; })
            .then(function () {
            _this._unsubscribe = _this._store.subscribe(function () { return _this._loadWidget(options); }, function (state) {
                var checkout = state.checkout.getCheckout();
                return checkout && checkout.grandTotal;
            });
            return _this._loadWidget(options);
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    KlarnaPaymentStrategy.prototype.deinitialize = function (options) {
        if (this._unsubscribe) {
            this._unsubscribe();
        }
        return _super.prototype.deinitialize.call(this, options);
    };
    KlarnaPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        if (!payload.payment) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "payload.payment" argument is not provided.');
        }
        var _a = payload.payment, paymentData = _a.paymentData, paymentPayload = tslib_1.__rest(_a, ["paymentData"]);
        return this._authorize()
            .then(function (_a) {
            var authorizationToken = _a.authorization_token;
            return _this._store.dispatch(_this._remoteCheckoutActionCreator.initializePayment(paymentPayload.methodId, { authorizationToken: authorizationToken }));
        })
            .then(function () { return _this._store.dispatch(_this._orderActionCreator.submitOrder(tslib_1.__assign({}, payload, { payment: paymentPayload, 
            // Note: API currently doesn't support using Store Credit with Klarna.
            // To prevent deducting customer's store credit, set it as false.
            useStoreCredit: false }), options)); });
    };
    KlarnaPaymentStrategy.prototype._loadWidget = function (options) {
        var _this = this;
        if (!options.klarna) {
            throw new errors_1.InvalidArgumentError('Unable to load widget because "options.klarna" argument is not provided.');
        }
        var methodId = options.methodId, _a = options.klarna, container = _a.container, onLoad = _a.onLoad;
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(function (state) { return new Promise(function (resolve, reject) {
            var paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
            if (!paymentMethod) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            if (!_this._klarnaCredit || !paymentMethod.clientToken) {
                throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
            }
            _this._klarnaCredit.init({ client_token: paymentMethod.clientToken });
            _this._klarnaCredit.load({ container: container }, function (response) {
                if (onLoad) {
                    onLoad(response);
                }
                if (!response.show_form) {
                    reject(response);
                }
                else {
                    resolve(response);
                }
            });
        }); });
    };
    KlarnaPaymentStrategy.prototype._authorize = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this._klarnaCredit) {
                throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
            }
            _this._klarnaCredit.authorize({}, function (res) {
                if (!res.approved) {
                    reject(res);
                }
                else {
                    resolve(res);
                }
            });
        });
    };
    return KlarnaPaymentStrategy;
}(payment_strategy_1.default));
exports.default = KlarnaPaymentStrategy;


/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var payment_strategy_1 = __webpack_require__(6);
var LegacyPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(LegacyPaymentStrategy, _super);
    function LegacyPaymentStrategy(store, _orderActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        return _this;
    }
    LegacyPaymentStrategy.prototype.execute = function (payload, options) {
        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));
    };
    return LegacyPaymentStrategy;
}(payment_strategy_1.default));
exports.default = LegacyPaymentStrategy;


/***/ }),
/* 210 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var payment_strategy_1 = __webpack_require__(6);
var NoPaymentDataRequiredPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(NoPaymentDataRequiredPaymentStrategy, _super);
    function NoPaymentDataRequiredPaymentStrategy(store, _orderActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        return _this;
    }
    NoPaymentDataRequiredPaymentStrategy.prototype.execute = function (orderRequest, options) {
        return this._store.dispatch(this._orderActionCreator.submitOrder(lodash_1.omit(orderRequest, 'payment'), options));
    };
    return NoPaymentDataRequiredPaymentStrategy;
}(payment_strategy_1.default));
exports.default = NoPaymentDataRequiredPaymentStrategy;


/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var payment_strategy_1 = __webpack_require__(6);
var OfflinePaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(OfflinePaymentStrategy, _super);
    function OfflinePaymentStrategy(store, _orderActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        return _this;
    }
    OfflinePaymentStrategy.prototype.execute = function (payload, options) {
        var action = this._orderActionCreator.submitOrder(tslib_1.__assign({}, payload, { payment: payload.payment ? { methodId: payload.payment.methodId } : undefined }), options);
        return this._store.dispatch(action);
    };
    return OfflinePaymentStrategy;
}(payment_strategy_1.default));
exports.default = OfflinePaymentStrategy;


/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(12);
var paymentStatusTypes = __webpack_require__(20);
var payment_strategy_1 = __webpack_require__(6);
var OffsitePaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(OffsitePaymentStrategy, _super);
    function OffsitePaymentStrategy(store, _orderActionCreator, _paymentActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        return _this;
    }
    OffsitePaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var payment = payload.payment, order = tslib_1.__rest(payload, ["payment"]);
        var paymentData = payment && payment.paymentData;
        var orderPayload = payment && payment.gatewayId === 'adyen' ? payload : order;
        if (!payment || !paymentData) {
            throw new errors_1.PaymentArgumentInvalidError(['payment.paymentData']);
        }
        return this._store.dispatch(this._orderActionCreator.submitOrder(orderPayload, options))
            .then(function () {
            return _this._store.dispatch(_this._paymentActionCreator.initializeOffsitePayment(tslib_1.__assign({}, payment, { paymentData: paymentData })));
        });
    };
    OffsitePaymentStrategy.prototype.finalize = function (options) {
        var state = this._store.getState();
        var order = state.order.getOrder();
        var status = state.payment.getPaymentStatus();
        if (order && (status === paymentStatusTypes.ACKNOWLEDGE || status === paymentStatusTypes.FINALIZE)) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }
        return _super.prototype.finalize.call(this);
    };
    return OffsitePaymentStrategy;
}(payment_strategy_1.default));
exports.default = OffsitePaymentStrategy;


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var paymentStatusTypes = __webpack_require__(20);
var payment_strategy_1 = __webpack_require__(6);
/**
 * @todo Convert this file into TypeScript properly
 */
var PaypalExpressPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(PaypalExpressPaymentStrategy, _super);
    function PaypalExpressPaymentStrategy(store, _orderActionCreator, _scriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._scriptLoader = _scriptLoader;
        return _this;
    }
    PaypalExpressPaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        var state = this._store.getState();
        this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);
        if (!this._isInContextEnabled() || this._isInitialized) {
            return _super.prototype.initialize.call(this, options);
        }
        return this._scriptLoader.loadScript('//www.paypalobjects.com/api/checkout.min.js')
            .then(function () {
            _this._paypalSdk = window.paypal;
            if (!_this._paymentMethod || !_this._paymentMethod.config.merchantId) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            _this._paypalSdk.checkout.setup(_this._paymentMethod.config.merchantId, {
                button: 'paypal-button',
                environment: _this._paymentMethod.config.testMode ? 'sandbox' : 'production',
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    PaypalExpressPaymentStrategy.prototype.deinitialize = function () {
        if (!this._isInitialized) {
            return _super.prototype.deinitialize.call(this);
        }
        if (this._isInContextEnabled() && this._paypalSdk) {
            this._paypalSdk.checkout.closeFlow();
            this._paypalSdk = null;
        }
        return _super.prototype.deinitialize.call(this);
    };
    PaypalExpressPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        if (this._isAcknowledgedOrFinalized()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options));
        }
        if (!this._isInContextEnabled()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
                .then(function (state) {
                var redirectUrl = state.payment.getPaymentRedirectUrl();
                if (redirectUrl) {
                    window.location.assign(redirectUrl);
                }
                // We need to hold execution so the consumer does not redirect us somewhere else
                return new Promise(function () { });
            });
        }
        this._paypalSdk.checkout.initXO();
        return this._store.dispatch(this._orderActionCreator.submitOrder(payload, options))
            .then(function (state) {
            var redirectUrl = state.payment.getPaymentRedirectUrl();
            if (redirectUrl) {
                _this._paypalSdk.checkout.startFlow(redirectUrl);
            }
            // We need to hold execution so the consumer does not redirect us somewhere else
            return new Promise(function () { });
        })
            .catch(function (error) {
            _this._paypalSdk.checkout.closeFlow();
            return Promise.reject(error);
        });
    };
    PaypalExpressPaymentStrategy.prototype.finalize = function (options) {
        var state = this._store.getState();
        var order = state.order.getOrder();
        if (order && this._isAcknowledgedOrFinalized()) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }
        return _super.prototype.finalize.call(this);
    };
    PaypalExpressPaymentStrategy.prototype._isAcknowledgedOrFinalized = function () {
        var state = this._store.getState();
        return state.payment.getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE
            || state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE;
    };
    PaypalExpressPaymentStrategy.prototype._isInContextEnabled = function () {
        return !!(this._paymentMethod && this._paymentMethod.config.merchantId);
    };
    return PaypalExpressPaymentStrategy;
}(payment_strategy_1.default));
exports.default = PaypalExpressPaymentStrategy;


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(12);
var paymentStatusTypes = __webpack_require__(20);
var payment_strategy_1 = __webpack_require__(6);
var PaypalProPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(PaypalProPaymentStrategy, _super);
    function PaypalProPaymentStrategy(store, _orderActionCreator, _paymentActionCreator) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        return _this;
    }
    PaypalProPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        if (this._isPaymentAcknowledged()) {
            return this._store.dispatch(this._orderActionCreator.submitOrder(tslib_1.__assign({}, payload, { payment: payload.payment ? { methodId: payload.payment.methodId } : undefined }), options));
        }
        var payment = payload.payment, order = tslib_1.__rest(payload, ["payment"]);
        var paymentData = payment && payment.paymentData;
        if (!payment || !paymentData) {
            throw new errors_1.PaymentArgumentInvalidError(['payment.paymentData']);
        }
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(function () {
            return _this._store.dispatch(_this._paymentActionCreator.submitPayment(tslib_1.__assign({}, payment, { paymentData: paymentData })));
        });
    };
    PaypalProPaymentStrategy.prototype._isPaymentAcknowledged = function () {
        var state = this._store.getState();
        return state.payment.getPaymentStatus() === paymentStatusTypes.ACKNOWLEDGE;
    };
    return PaypalProPaymentStrategy;
}(payment_strategy_1.default));
exports.default = PaypalProPaymentStrategy;


/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(12);
var paymentStatusTypes = __webpack_require__(20);
var payment_strategy_1 = __webpack_require__(6);
var SagePayPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(SagePayPaymentStrategy, _super);
    function SagePayPaymentStrategy(store, _orderActionCreator, _paymentActionCreator, _formPoster) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        _this._formPoster = _formPoster;
        return _this;
    }
    SagePayPaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var payment = payload.payment, order = tslib_1.__rest(payload, ["payment"]);
        var paymentData = payment && payment.paymentData;
        if (!payment || !paymentData) {
            throw new errors_2.PaymentArgumentInvalidError(['payment.paymentData']);
        }
        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(function () {
            return _this._store.dispatch(_this._paymentActionCreator.submitPayment(tslib_1.__assign({}, payment, { paymentData: paymentData })));
        })
            .catch(function (error) {
            if (!(error instanceof errors_1.RequestError) || !lodash_1.some(error.body.errors, { code: 'three_d_secure_required' })) {
                return Promise.reject(error);
            }
            return new Promise(function () {
                _this._formPoster.postForm(error.body.three_ds_result.acs_url, {
                    PaReq: error.body.three_ds_result.payer_auth_request,
                    TermUrl: error.body.three_ds_result.callback_url,
                    MD: error.body.three_ds_result.merchant_data,
                });
            });
        });
    };
    SagePayPaymentStrategy.prototype.finalize = function (options) {
        var state = this._store.getState();
        var order = state.order.getOrder();
        if (order && state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }
        return _super.prototype.finalize.call(this);
    };
    return SagePayPaymentStrategy;
}(payment_strategy_1.default));
exports.default = SagePayPaymentStrategy;


/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var credit_card_payment_strategy_1 = __webpack_require__(80);
var WepayPaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(WepayPaymentStrategy, _super);
    function WepayPaymentStrategy(store, orderActionCreator, paymentActionCreator, _wepayRiskClient) {
        var _this = _super.call(this, store, orderActionCreator, paymentActionCreator) || this;
        _this._wepayRiskClient = _wepayRiskClient;
        return _this;
    }
    WepayPaymentStrategy.prototype.initialize = function (options) {
        this._wepayRiskClient.initialize();
        return _super.prototype.initialize.call(this, options);
    };
    WepayPaymentStrategy.prototype.execute = function (payload, options) {
        var token = this._wepayRiskClient.getRiskToken();
        var payloadWithToken = lodash_1.merge({}, payload, {
            payment: {
                paymentData: {
                    extraData: {
                        riskToken: token,
                    },
                },
            },
        });
        return _super.prototype.execute.call(this, payloadWithToken, options);
    };
    return WepayPaymentStrategy;
}(credit_card_payment_strategy_1.default));
exports.default = WepayPaymentStrategy;


/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var payment_strategy_1 = __webpack_require__(6);
var SquarePaymentStrategy = /** @class */ (function (_super) {
    tslib_1.__extends(SquarePaymentStrategy, _super);
    function SquarePaymentStrategy(store, _orderActionCreator, _paymentActionCreator, _scriptLoader) {
        var _this = _super.call(this, store) || this;
        _this._orderActionCreator = _orderActionCreator;
        _this._paymentActionCreator = _paymentActionCreator;
        _this._scriptLoader = _scriptLoader;
        return _this;
    }
    SquarePaymentStrategy.prototype.initialize = function (options) {
        var _this = this;
        return this._scriptLoader.load()
            .then(function (createSquareForm) {
            return new Promise(function (resolve, reject) {
                _this._paymentForm = createSquareForm(_this._getFormOptions(options, { resolve: resolve, reject: reject }));
                _this._paymentForm.build();
            });
        })
            .then(function () { return _super.prototype.initialize.call(_this, options); });
    };
    SquarePaymentStrategy.prototype.execute = function (payload, options) {
        var _this = this;
        var payment = payload.payment, order = tslib_1.__rest(payload, ["payment"]);
        if (!payment || !payment.methodId) {
            throw new errors_1.InvalidArgumentError('Unable to submit payment because "payload.payment.methodId" argument is not provided.');
        }
        var paymentName = payment.methodId;
        return new Promise(function (resolve, reject) {
            if (!_this._paymentForm) {
                throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
            }
            if (_this._deferredRequestNonce) {
                _this._deferredRequestNonce.reject(new errors_1.TimeoutError());
            }
            _this._deferredRequestNonce = { resolve: resolve, reject: reject };
            _this._paymentForm.requestCardNonce();
        })
            .then(function (paymentData) {
            var paymentPayload = {
                methodId: paymentName,
                paymentData: paymentData,
            };
            return _this._store.dispatch(_this._orderActionCreator.submitOrder(order, options))
                .then(function () {
                return _this._store.dispatch(_this._paymentActionCreator.submitPayment(paymentPayload));
            });
        });
    };
    SquarePaymentStrategy.prototype._getFormOptions = function (options, deferred) {
        var _this = this;
        var squareOptions = options.square, methodId = options.methodId;
        var state = this._store.getState();
        var paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
        if (!squareOptions || !paymentMethod) {
            throw new errors_1.InvalidArgumentError('Unable to proceed because "options.square" argument is not provided.');
        }
        return tslib_1.__assign({}, squareOptions, paymentMethod.initializationData, { callbacks: {
                paymentFormLoaded: function () {
                    deferred.resolve();
                    var state = _this._store.getState();
                    var billingAddress = state.billingAddress.getBillingAddress();
                    if (!_this._paymentForm) {
                        throw new errors_1.NotInitializedError(errors_1.NotInitializedErrorType.PaymentNotInitialized);
                    }
                    if (billingAddress && billingAddress.postalCode) {
                        _this._paymentForm.setPostalCode(billingAddress.postalCode);
                    }
                },
                unsupportedBrowserDetected: function () {
                    deferred.reject(new errors_1.UnsupportedBrowserError());
                },
                cardNonceResponseReceived: function (errors, nonce) {
                    _this._cardNonceResponseReceived(errors, nonce);
                },
            } });
    };
    SquarePaymentStrategy.prototype._cardNonceResponseReceived = function (errors, nonce) {
        if (!this._deferredRequestNonce) {
            throw new errors_1.StandardError();
        }
        if (errors) {
            this._deferredRequestNonce.reject(errors);
        }
        else {
            this._deferredRequestNonce.resolve({ nonce: nonce });
        }
    };
    return SquarePaymentStrategy;
}(payment_strategy_1.default));
exports.default = SquarePaymentStrategy;


/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SquareScriptLoader = /** @class */ (function () {
    function SquareScriptLoader(_scriptLoader) {
        this._scriptLoader = _scriptLoader;
    }
    SquareScriptLoader.prototype.load = function () {
        var scriptURI = '//js.squareup.com/v2/paymentform';
        return this._scriptLoader.loadScript(scriptURI)
            .then(function () { return function (options) {
            return new window.SqPaymentForm(options);
        }; });
    };
    return SquareScriptLoader;
}());
exports.default = SquareScriptLoader;


/***/ }),
/* 219 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var utility_1 = __webpack_require__(8);
var actionTypes = __webpack_require__(35);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
function paymentMethodReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = paymentMethodReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
            return utility_1.mergeOrPush(data || [], action.payload.paymentMethod, {
                id: action.payload.paymentMethod.id,
                gateway: action.payload.paymentMethod.gateway,
            });
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
            return action.payload.paymentMethods || [];
        default:
            return data;
    }
}
function metaReducer(meta, action) {
    switch (action.type) {
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
            return action.meta ? tslib_1.__assign({}, meta, action.meta) : meta;
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case actionTypes.LOAD_PAYMENT_METHODS_REQUESTED:
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.LOAD_PAYMENT_METHODS_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case actionTypes.LOAD_PAYMENT_METHOD_REQUESTED:
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadMethodId: undefined, loadMethodError: undefined });
        case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, errors, { loadMethodId: action.meta.methodId, loadMethodError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case actionTypes.LOAD_PAYMENT_METHODS_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.LOAD_PAYMENT_METHODS_SUCCEEDED:
        case actionTypes.LOAD_PAYMENT_METHODS_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case actionTypes.LOAD_PAYMENT_METHOD_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoadingMethod: true, loadMethodId: action.meta.methodId });
        case actionTypes.LOAD_PAYMENT_METHOD_SUCCEEDED:
        case actionTypes.LOAD_PAYMENT_METHOD_FAILED:
            return tslib_1.__assign({}, statuses, { isLoadingMethod: false, loadMethodId: undefined });
        default:
            return statuses;
    }
}


/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var PaymentMethodRequestSender = /** @class */ (function () {
    function PaymentMethodRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    PaymentMethodRequestSender.prototype.loadPaymentMethods = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/payments';
        return this._requestSender.get(url, { timeout: timeout });
    };
    PaymentMethodRequestSender.prototype.loadPaymentMethod = function (methodId, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/internalapi/v1/checkout/payments/" + methodId;
        return this._requestSender.get(url, { timeout: timeout });
    };
    return PaymentMethodRequestSender;
}());
exports.default = PaymentMethodRequestSender;


/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var selector_1 = __webpack_require__(4);
var PaymentMethodSelector = /** @class */ (function () {
    function PaymentMethodSelector(_paymentMethods) {
        this._paymentMethods = _paymentMethods;
    }
    PaymentMethodSelector.prototype.getPaymentMethods = function () {
        return this._paymentMethods.data;
    };
    PaymentMethodSelector.prototype.getPaymentMethodsMeta = function () {
        return this._paymentMethods.meta;
    };
    PaymentMethodSelector.prototype.getPaymentMethod = function (methodId, gatewayId) {
        return gatewayId ?
            lodash_1.find(this._paymentMethods.data, { id: methodId, gateway: gatewayId }) :
            lodash_1.find(this._paymentMethods.data, { id: methodId });
    };
    PaymentMethodSelector.prototype.getLoadError = function () {
        return this._paymentMethods.errors && this._paymentMethods.errors.loadError;
    };
    PaymentMethodSelector.prototype.getLoadMethodError = function (methodId) {
        if (methodId && this._paymentMethods.errors.loadMethodId !== methodId) {
            return;
        }
        return this._paymentMethods.errors.loadMethodError;
    };
    PaymentMethodSelector.prototype.isLoading = function () {
        return !!this._paymentMethods.statuses.isLoading;
    };
    PaymentMethodSelector.prototype.isLoadingMethod = function (methodId) {
        if (methodId && this._paymentMethods.statuses.loadMethodId !== methodId) {
            return false;
        }
        return !!this._paymentMethods.statuses.isLoadingMethod;
    };
    PaymentMethodSelector = tslib_1.__decorate([
        selector_1.selector
    ], PaymentMethodSelector);
    return PaymentMethodSelector;
}());
exports.default = PaymentMethodSelector;


/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var payment_actions_1 = __webpack_require__(76);
function paymentReducer(state, action) {
    if (state === void 0) { state = {}; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
    });
    return reducer(state, action);
}
exports.default = paymentReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case payment_actions_1.PaymentActionType.SubmitPaymentSucceeded:
            return action.payload;
        default:
            return data;
    }
}


/***/ }),
/* 223 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var selector_1 = __webpack_require__(4);
var payment_method_types_1 = __webpack_require__(36);
var payment_status_types_1 = __webpack_require__(20);
var PaymentSelector = /** @class */ (function () {
    function PaymentSelector(_checkout, _order) {
        this._checkout = _checkout;
        this._order = _order;
    }
    PaymentSelector.prototype.getPaymentId = function () {
        var internalPayment = this._getInternalPayment();
        if (internalPayment && internalPayment.id) {
            return {
                providerId: internalPayment.id,
                gatewayId: internalPayment.gateway,
            };
        }
        var payment = this._getHostedPayment() || this._getGatewayPayment();
        if (payment && payment.providerId) {
            return {
                providerId: payment.providerId,
                gatewayId: payment.gatewayId,
            };
        }
    };
    PaymentSelector.prototype.getPaymentStatus = function () {
        var internalPayment = this._getInternalPayment();
        if (internalPayment && internalPayment.status) {
            return internalPayment.status.replace('PAYMENT_STATUS_', '');
        }
        var payment = this._getHostedPayment() || this._getGatewayPayment();
        if (payment) {
            return payment.detail.step;
        }
    };
    PaymentSelector.prototype.getPaymentToken = function () {
        var meta = this._order.getOrderMeta();
        return meta && meta.token;
    };
    PaymentSelector.prototype.getPaymentRedirectUrl = function () {
        var payment = this._getInternalPayment();
        return payment && payment.redirectUrl;
    };
    PaymentSelector.prototype.isPaymentDataRequired = function (useStoreCredit) {
        if (useStoreCredit === void 0) { useStoreCredit = false; }
        var checkout = this._checkout.getCheckout();
        if (!checkout) {
            return false;
        }
        var grandTotal = checkout.grandTotal || 0;
        var storeCredit = checkout.customer.storeCredit || 0;
        return (useStoreCredit ? grandTotal - storeCredit : grandTotal) > 0;
    };
    PaymentSelector.prototype.isPaymentDataSubmitted = function (paymentMethod) {
        if (paymentMethod && paymentMethod.nonce) {
            return true;
        }
        return this.getPaymentStatus() === payment_status_types_1.ACKNOWLEDGE || this.getPaymentStatus() === payment_status_types_1.FINALIZE;
    };
    PaymentSelector.prototype._getInternalPayment = function () {
        var meta = this._order.getOrderMeta();
        return meta && meta.payment;
    };
    PaymentSelector.prototype._getGatewayPayment = function () {
        var order = this._order.getOrder();
        return lodash_1.find(order && order.payments, function (_a) {
            var providerId = _a.providerId;
            return providerId !== 'giftcertificate' && providerId !== 'storecredit';
        });
    };
    PaymentSelector.prototype._getHostedPayment = function () {
        var checkout = this._checkout.getCheckout();
        return lodash_1.find(checkout && checkout.payments, function (_a) {
            var providerType = _a.providerType;
            return providerType === payment_method_types_1.HOSTED;
        });
    };
    PaymentSelector = tslib_1.__decorate([
        selector_1.selector
    ], PaymentSelector);
    return PaymentSelector;
}());
exports.default = PaymentSelector;


/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var concat_1 = __webpack_require__(22);
var empty_1 = __webpack_require__(225);
var from_1 = __webpack_require__(82);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var errors_2 = __webpack_require__(64);
var payment_strategy_actions_1 = __webpack_require__(83);
var PaymentStrategyActionCreator = /** @class */ (function () {
    function PaymentStrategyActionCreator(_strategyRegistry, _orderActionCreator) {
        this._strategyRegistry = _strategyRegistry;
        this._orderActionCreator = _orderActionCreator;
    }
    PaymentStrategyActionCreator.prototype.execute = function (payload, options) {
        var _this = this;
        return function (store) {
            var executeAction = new Observable_1.Observable(function (observer) {
                var state = store.getState();
                var _a = payload.payment, payment = _a === void 0 ? {} : _a, useStoreCredit = payload.useStoreCredit;
                var meta = { methodId: payment.methodId };
                var strategy;
                if (state.payment.isPaymentDataRequired(useStoreCredit)) {
                    var method = state.paymentMethods.getPaymentMethod(payment.methodId, payment.gatewayId);
                    if (!method) {
                        throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
                    }
                    strategy = _this._strategyRegistry.getByMethod(method);
                }
                else {
                    strategy = _this._strategyRegistry.get('nopaymentdatarequired');
                }
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.ExecuteRequested, undefined, meta));
                strategy
                    .execute(payload, tslib_1.__assign({}, options, { methodId: payment.methodId, gatewayId: payment.gatewayId }))
                    .then(function () {
                    observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.ExecuteSucceeded, undefined, meta));
                    observer.complete();
                })
                    .catch(function (error) {
                    observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.ExecuteFailed, error, meta));
                });
            });
            return concat_1.concat(_this._loadOrderPaymentsIfNeeded(store, options), executeAction);
        };
    };
    PaymentStrategyActionCreator.prototype.finalize = function (options) {
        var _this = this;
        return function (store) {
            var finalizeAction = new Observable_1.Observable(function (observer) {
                var state = store.getState();
                var payment = state.payment.getPaymentId();
                if (!payment) {
                    throw new errors_2.OrderFinalizationNotRequiredError();
                }
                var method = state.paymentMethods.getPaymentMethod(payment.providerId, payment.gatewayId);
                var meta = { methodId: payment.providerId };
                if (!method) {
                    throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
                }
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.FinalizeRequested, undefined, meta));
                _this._strategyRegistry.getByMethod(method)
                    .finalize(tslib_1.__assign({}, options, { methodId: method.id, gatewayId: method.gateway }))
                    .then(function () {
                    observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.FinalizeSucceeded, undefined, meta));
                    observer.complete();
                })
                    .catch(function (error) {
                    observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.FinalizeFailed, error, meta));
                });
            });
            return concat_1.concat(_this._loadOrderPaymentsIfNeeded(store, options), finalizeAction);
        };
    };
    PaymentStrategyActionCreator.prototype.initialize = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var methodId = options.methodId, gatewayId = options.gatewayId;
            var method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);
            if (!method) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.InitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.getByMethod(method)
                .initialize(tslib_1.__assign({}, options, { methodId: methodId, gatewayId: gatewayId }))
                .then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.InitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.InitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    PaymentStrategyActionCreator.prototype.deinitialize = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var methodId = options.methodId, gatewayId = options.gatewayId;
            var method = state.paymentMethods.getPaymentMethod(methodId, gatewayId);
            if (!method) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingPaymentMethod);
            }
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.getByMethod(method)
                .deinitialize(tslib_1.__assign({}, options, { methodId: methodId, gatewayId: gatewayId }))
                .then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    PaymentStrategyActionCreator.prototype.widgetInteraction = function (method, options) {
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var methodId = options && options.methodId;
            var meta = { methodId: methodId };
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionStarted, undefined, meta));
            method().then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionFinished, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionFailed, error, meta));
            });
        }); };
    };
    PaymentStrategyActionCreator.prototype._loadOrderPaymentsIfNeeded = function (store, options) {
        var checkout = store.getState().checkout.getCheckout();
        if (checkout && checkout.orderId) {
            return from_1.from(this._orderActionCreator.loadCurrentOrderPayments(options)(store));
        }
        return empty_1.empty();
    };
    return PaymentStrategyActionCreator;
}());
exports.default = PaymentStrategyActionCreator;


/***/ }),
/* 225 */
/***/ (function(module, exports) {

module.exports = require("rxjs/observable/empty");

/***/ }),
/* 226 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var payment_strategy_actions_1 = __webpack_require__(83);
var payment_strategy_state_1 = __webpack_require__(84);
function paymentStrategyReducer(state, action) {
    if (state === void 0) { state = payment_strategy_state_1.DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = paymentStrategyReducer;
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = payment_strategy_state_1.DEFAULT_STATE.errors; }
    switch (action.type) {
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, errors, { initializeError: undefined, initializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeFailed:
            return tslib_1.__assign({}, errors, { initializeError: action.payload, initializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, errors, { deinitializeError: undefined, deinitializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeFailed:
            return tslib_1.__assign({}, errors, { deinitializeError: action.payload, deinitializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteSucceeded:
            return tslib_1.__assign({}, errors, { executeError: undefined, executeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteFailed:
            return tslib_1.__assign({}, errors, { executeError: action.payload, executeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeRequested:
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeSucceeded:
            return tslib_1.__assign({}, errors, { finalizeError: undefined, finalizeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeFailed:
            return tslib_1.__assign({}, errors, { finalizeError: action.payload, finalizeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionStarted:
        case payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionFinished:
            return tslib_1.__assign({}, errors, { widgetInteractionError: undefined, widgetInteractionMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionFailed:
            return tslib_1.__assign({}, errors, { widgetInteractionError: action.payload, widgetInteractionMethodId: action.meta.methodId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = payment_strategy_state_1.DEFAULT_STATE.statuses; }
    switch (action.type) {
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeRequested:
            return tslib_1.__assign({}, statuses, { isInitializing: true, initializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.InitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isInitializing: false, initializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeRequested:
            return tslib_1.__assign({}, statuses, { isDeinitializing: true, deinitializeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeSucceeded:
            return tslib_1.__assign({}, statuses, { isDeinitializing: false, deinitializeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteRequested:
            return tslib_1.__assign({}, statuses, { isExecuting: true, executeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.ExecuteSucceeded:
            return tslib_1.__assign({}, statuses, { isExecuting: false, executeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeRequested:
            return tslib_1.__assign({}, statuses, { isFinalizing: true, finalizeMethodId: action.meta && action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeFailed:
        case payment_strategy_actions_1.PaymentStrategyActionType.FinalizeSucceeded:
            return tslib_1.__assign({}, statuses, { isFinalizing: false, finalizeMethodId: undefined });
        case payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionStarted:
            return tslib_1.__assign({}, statuses, { isWidgetInteracting: true, widgetInteractionMethodId: action.meta.methodId });
        case payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionFinished:
        case payment_strategy_actions_1.PaymentStrategyActionType.WidgetInteractionFailed:
            return tslib_1.__assign({}, statuses, { isWidgetInteracting: false, widgetInteractionMethodId: undefined });
        default:
            return statuses;
    }
}


/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var payment_strategy_state_1 = __webpack_require__(84);
var PaymentStrategySelector = /** @class */ (function () {
    function PaymentStrategySelector(_paymentStrategies) {
        if (_paymentStrategies === void 0) { _paymentStrategies = payment_strategy_state_1.DEFAULT_STATE; }
        this._paymentStrategies = _paymentStrategies;
    }
    PaymentStrategySelector.prototype.getInitializeError = function (methodId) {
        if (methodId && this._paymentStrategies.errors.initializeMethodId !== methodId) {
            return;
        }
        return this._paymentStrategies.errors.initializeError;
    };
    PaymentStrategySelector.prototype.getExecuteError = function (methodId) {
        if (methodId && this._paymentStrategies.errors.executeMethodId !== methodId) {
            return;
        }
        return this._paymentStrategies.errors.executeError;
    };
    PaymentStrategySelector.prototype.getFinalizeError = function (methodId) {
        if (methodId && this._paymentStrategies.errors.finalizeMethodId !== methodId) {
            return;
        }
        return this._paymentStrategies.errors.finalizeError;
    };
    PaymentStrategySelector.prototype.getWidgetInteractingError = function (methodId) {
        if (methodId && this._paymentStrategies.errors.widgetInteractionMethodId !== methodId) {
            return;
        }
        return this._paymentStrategies.errors.widgetInteractionError;
    };
    PaymentStrategySelector.prototype.isInitializing = function (methodId) {
        if (methodId && this._paymentStrategies.statuses.initializeMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategies.statuses.isInitializing;
    };
    PaymentStrategySelector.prototype.isExecuting = function (methodId) {
        if (methodId && this._paymentStrategies.statuses.executeMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategies.statuses.isExecuting;
    };
    PaymentStrategySelector.prototype.isFinalizing = function (methodId) {
        if (methodId && this._paymentStrategies.statuses.finalizeMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategies.statuses.isFinalizing;
    };
    PaymentStrategySelector.prototype.isWidgetInteracting = function (methodId) {
        if (methodId && this._paymentStrategies.statuses.widgetInteractionMethodId !== methodId) {
            return false;
        }
        return !!this._paymentStrategies.statuses.isWidgetInteracting;
    };
    PaymentStrategySelector = tslib_1.__decorate([
        selector_1.selector
    ], PaymentStrategySelector);
    return PaymentStrategySelector;
}());
exports.default = PaymentStrategySelector;


/***/ }),
/* 228 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var errors_1 = __webpack_require__(1);
var gift_certificate_actions_1 = __webpack_require__(29);
var GiftCertificateActionCreator = /** @class */ (function () {
    function GiftCertificateActionCreator(_giftCertificateRequestSender) {
        this._giftCertificateRequestSender = _giftCertificateRequestSender;
    }
    GiftCertificateActionCreator.prototype.applyGiftCertificate = function (giftCertificate, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateRequested));
            _this._giftCertificateRequestSender.applyGiftCertificate(checkout.id, giftCertificate, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateFailed, response));
            });
        }); };
    };
    GiftCertificateActionCreator.prototype.removeGiftCertificate = function (giftCertificate, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var state = store.getState();
            var checkout = state.checkout.getCheckout();
            if (!checkout) {
                throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckout);
            }
            observer.next(data_store_1.createAction(gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateRequested));
            _this._giftCertificateRequestSender.removeGiftCertificate(checkout.id, giftCertificate, options)
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateFailed, response));
            });
        }); };
    };
    return GiftCertificateActionCreator;
}());
exports.default = GiftCertificateActionCreator;


/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var checkout_1 = __webpack_require__(7);
var http_request_1 = __webpack_require__(11);
var GiftCertificateRequestSender = /** @class */ (function () {
    function GiftCertificateRequestSender(_requestSender) {
        this._requestSender = _requestSender;
    }
    GiftCertificateRequestSender.prototype.applyGiftCertificate = function (checkoutId, giftCertificateCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkouts/" + checkoutId + "/gift-certificates";
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.post(url, {
            headers: headers,
            timeout: timeout,
            params: {
                include: checkout_1.CheckoutDefaultIncludes.join(','),
            },
            body: { giftCertificateCode: giftCertificateCode },
        });
    };
    GiftCertificateRequestSender.prototype.removeGiftCertificate = function (checkoutId, giftCertificateCode, _a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = "/api/storefront/checkouts/" + checkoutId + "/gift-certificates/" + giftCertificateCode;
        var headers = { Accept: http_request_1.ContentType.JsonV1 };
        return this._requestSender.delete(url, {
            headers: headers,
            timeout: timeout,
            params: {
                include: checkout_1.CheckoutDefaultIncludes.join(','),
            },
        });
    };
    return GiftCertificateRequestSender;
}());
exports.default = GiftCertificateRequestSender;


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var GiftCertificateSelector = /** @class */ (function () {
    function GiftCertificateSelector(_giftCertificate) {
        this._giftCertificate = _giftCertificate;
    }
    GiftCertificateSelector.prototype.getGiftCertificates = function () {
        return this._giftCertificate.data;
    };
    GiftCertificateSelector.prototype.getRemoveError = function () {
        return this._giftCertificate.errors.removeGiftCertificateError;
    };
    GiftCertificateSelector.prototype.getApplyError = function () {
        return this._giftCertificate.errors.applyGiftCertificateError;
    };
    GiftCertificateSelector.prototype.isApplying = function () {
        return !!this._giftCertificate.statuses.isApplyingGiftCertificate;
    };
    GiftCertificateSelector.prototype.isRemoving = function () {
        return !!this._giftCertificate.statuses.isRemovingGiftCertificate;
    };
    GiftCertificateSelector = tslib_1.__decorate([
        selector_1.selector
    ], GiftCertificateSelector);
    return GiftCertificateSelector;
}());
exports.default = GiftCertificateSelector;


/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var checkout_1 = __webpack_require__(7);
var consignment_actions_1 = __webpack_require__(24);
var coupon_actions_1 = __webpack_require__(23);
var gift_certificate_actions_1 = __webpack_require__(29);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function giftCertificateReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = giftCertificateReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_1.CheckoutActionType.LoadCheckoutSucceeded:
        case consignment_actions_1.ConsignmentActionType.CreateConsignmentsSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateConsignmentSucceeded:
        case consignment_actions_1.ConsignmentActionType.UpdateShippingOptionSucceeded:
        case coupon_actions_1.CouponActionType.ApplyCouponSucceeded:
        case coupon_actions_1.CouponActionType.RemoveCouponSucceeded:
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateSucceeded:
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateSucceeded:
            return action.payload ? action.payload.giftCertificates : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateRequested:
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateSucceeded:
            return tslib_1.__assign({}, errors, { applyGiftCertificateError: undefined });
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateFailed:
            return tslib_1.__assign({}, errors, { applyGiftCertificateError: action.payload });
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateRequested:
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateSucceeded:
            return tslib_1.__assign({}, errors, { removeGiftCertificateError: undefined });
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateFailed:
            return tslib_1.__assign({}, errors, { removeGiftCertificateError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateRequested:
            return tslib_1.__assign({}, statuses, { isApplyingGiftCertificate: true });
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateSucceeded:
        case gift_certificate_actions_1.GiftCertificateActionType.ApplyGiftCertificateFailed:
            return tslib_1.__assign({}, statuses, { isApplyingGiftCertificate: false });
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateRequested:
            return tslib_1.__assign({}, statuses, { isRemovingGiftCertificate: true });
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateSucceeded:
        case gift_certificate_actions_1.GiftCertificateActionType.RemoveGiftCertificateFailed:
            return tslib_1.__assign({}, statuses, { isRemovingGiftCertificate: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var couponTypes = [
    'per_item_discount',
    'percentage_discount',
    'per_total_discount',
    'shipping_discount',
    'free_shipping',
];
function mapToInternalCoupon(coupon) {
    return {
        code: coupon.code,
        discount: coupon.displayName,
        discountType: couponTypes.indexOf(coupon.couponType),
    };
}
exports.default = mapToInternalCoupon;


/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalGiftCertificate(giftCertificate) {
    return {
        code: giftCertificate.code,
        discountedAmount: giftCertificate.used,
        remainingBalance: giftCertificate.remaining,
        giftCertificate: {
            balance: giftCertificate.balance,
            code: giftCertificate.code,
            purchaseDate: giftCertificate.purchaseDate,
        },
    };
}
exports.default = mapToInternalGiftCertificate;


/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var map_to_discount_notifications_1 = __webpack_require__(235);
exports.mapToDiscountNotifications = map_to_discount_notifications_1.default;


/***/ }),
/* 235 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function mapToDiscountNotifications(promotions) {
    var notifications = [];
    (promotions || []).forEach(function (promotion) {
        (promotion.banners || []).forEach(function (banner) {
            notifications.push({
                placeholders: [],
                discountType: null,
                message: '',
                messageHtml: banner.text,
            });
        });
    });
    return notifications;
}
exports.default = mapToDiscountNotifications;


/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var cart_changed_error_1 = __webpack_require__(237);
exports.CartChangedError = cart_changed_error_1.default;


/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var errors_1 = __webpack_require__(1);
var CartChangedError = /** @class */ (function (_super) {
    tslib_1.__extends(CartChangedError, _super);
    function CartChangedError() {
        var _this = _super.call(this, 'An update to your shopping cart has been detected and your available shipping costs have been updated.') || this;
        _this.type = 'cart_changed';
        return _this;
    }
    return CartChangedError;
}(errors_1.StandardError));
exports.default = CartChangedError;


/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var actionTypes = __webpack_require__(89);
/**
 * @todo Convert this file into TypeScript properly
 */
var CountryActionCreator = /** @class */ (function () {
    function CountryActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    CountryActionCreator.prototype.loadCountries = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_COUNTRIES_REQUESTED));
            _this._checkoutClient.loadCountries(options)
                .then(function (response) {
                observer.next(data_store_1.createAction(actionTypes.LOAD_COUNTRIES_SUCCEEDED, response.body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_COUNTRIES_FAILED, response));
            });
        });
    };
    return CountryActionCreator;
}());
exports.default = CountryActionCreator;


/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CountryRequestSender = /** @class */ (function () {
    function CountryRequestSender(_requestSender, _config) {
        this._requestSender = _requestSender;
        this._config = _config;
    }
    CountryRequestSender.prototype.loadCountries = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/store/countries';
        var headers = {
            'Accept-Language': this._config.locale,
        };
        return this._requestSender.get(url, { headers: headers, timeout: timeout });
    };
    return CountryRequestSender;
}());
exports.default = CountryRequestSender;


/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var selector_1 = __webpack_require__(4);
var CountrySelector = /** @class */ (function () {
    function CountrySelector(_countries) {
        this._countries = _countries;
    }
    CountrySelector.prototype.getCountries = function () {
        return this._countries.data;
    };
    CountrySelector.prototype.getLoadError = function () {
        return this._countries.errors.loadError;
    };
    CountrySelector.prototype.isLoading = function () {
        return !!this._countries.statuses.isLoading;
    };
    CountrySelector = tslib_1.__decorate([
        selector_1.selector
    ], CountrySelector);
    return CountrySelector;
}());
exports.default = CountrySelector;


/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var actionTypes = __webpack_require__(89);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action
 */
function countryReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = countryReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
            return action.payload || [];
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case actionTypes.LOAD_COUNTRIES_REQUESTED:
        case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.LOAD_COUNTRIES_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case actionTypes.LOAD_COUNTRIES_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.LOAD_COUNTRIES_SUCCEEDED:
        case actionTypes.LOAD_COUNTRIES_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 242 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = __webpack_require__(18);
var billing_1 = __webpack_require__(17);
var log_1 = __webpack_require__(93);
var utility_1 = __webpack_require__(8);
var config_1 = __webpack_require__(25);
var coupon_1 = __webpack_require__(19);
var customer_1 = __webpack_require__(14);
var geography_1 = __webpack_require__(30);
var order_1 = __webpack_require__(10);
var payment_1 = __webpack_require__(13);
var instrument_1 = __webpack_require__(45);
var shipping_1 = __webpack_require__(15);
var checkout_action_creator_1 = __webpack_require__(47);
var checkout_request_sender_1 = __webpack_require__(33);
var checkout_service_1 = __webpack_require__(55);
var checkout_validator_1 = __webpack_require__(58);
var create_checkout_client_1 = __webpack_require__(88);
var create_checkout_store_1 = __webpack_require__(91);
/**
 * Creates an instance of `CheckoutService`.
 *
 * ```js
 * const service = createCheckoutService();
 *
 * service.subscribe(state => {
 *     console.log(state);
 * });
 *
 * service.loadCheckout();
 * ```
 *
 * @param options - A set of construction options.
 * @returns an instance of `CheckoutService`.
 */
function createCheckoutService(options) {
    if (document.location.protocol !== 'https:') {
        log_1.getDefaultLogger().warn('The BigCommerce Checkout SDK should not be used on a non-HTTPS page');
    }
    if (utility_1.getEnvironment() !== 'production') {
        log_1.getDefaultLogger().warn('Note that the development build is not optimized. To create a production build, set process.env.NODE_ENV to `production`.');
    }
    var _a = options || {}, _b = _a.locale, locale = _b === void 0 ? '' : _b, _c = _a.shouldWarnMutation, shouldWarnMutation = _c === void 0 ? true : _c;
    var client = create_checkout_client_1.default({ locale: locale });
    var store = create_checkout_store_1.default({}, { shouldWarnMutation: shouldWarnMutation });
    var paymentClient = payment_1.createPaymentClient(store);
    var requestSender = request_sender_1.createRequestSender();
    var checkoutRequestSender = new checkout_request_sender_1.default(requestSender);
    var configRequestSender = new config_1.ConfigRequestSender(requestSender);
    var configActionCreator = new config_1.ConfigActionCreator(configRequestSender);
    var consignmentRequestSender = new shipping_1.ConsignmentRequestSender(requestSender);
    var orderActionCreator = new order_1.OrderActionCreator(client, new checkout_validator_1.default(checkoutRequestSender));
    return new checkout_service_1.default(store, new billing_1.BillingAddressActionCreator(client), new checkout_action_creator_1.default(checkoutRequestSender, configActionCreator), configActionCreator, new shipping_1.ConsignmentActionCreator(consignmentRequestSender, checkoutRequestSender), new geography_1.CountryActionCreator(client), new coupon_1.CouponActionCreator(new coupon_1.CouponRequestSender(requestSender)), new customer_1.CustomerStrategyActionCreator(customer_1.createCustomerStrategyRegistry(store, client)), new coupon_1.GiftCertificateActionCreator(new coupon_1.GiftCertificateRequestSender(requestSender)), new instrument_1.InstrumentActionCreator(new instrument_1.InstrumentRequestSender(paymentClient, requestSender)), orderActionCreator, new payment_1.PaymentMethodActionCreator(client), new payment_1.PaymentStrategyActionCreator(payment_1.createPaymentStrategyRegistry(store, client, paymentClient), orderActionCreator), new shipping_1.ShippingCountryActionCreator(client), new shipping_1.ShippingStrategyActionCreator(shipping_1.createShippingStrategyRegistry(store, client)));
}
exports.default = createCheckoutService;


/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger(_console) {
        this._console = _console;
    }
    ConsoleLogger.prototype.log = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['log'].concat(messages));
    };
    ConsoleLogger.prototype.info = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['info'].concat(messages));
    };
    ConsoleLogger.prototype.warn = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['warn'].concat(messages));
    };
    ConsoleLogger.prototype.error = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['error'].concat(messages));
    };
    ConsoleLogger.prototype.debug = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this._logToConsole.apply(this, ['debug'].concat(messages));
    };
    ConsoleLogger.prototype._logToConsole = function (type) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        var _a;
        if (!this._console || !this._console[type]) {
            return;
        }
        (_a = this._console[type]).call.apply(_a, [this._console].concat(messages));
    };
    return ConsoleLogger;
}());
exports.default = ConsoleLogger;


/***/ }),
/* 244 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var NoopLogger = /** @class */ (function () {
    function NoopLogger() {
    }
    NoopLogger.prototype.log = function () { };
    NoopLogger.prototype.info = function () { };
    NoopLogger.prototype.warn = function () { };
    NoopLogger.prototype.error = function () { };
    NoopLogger.prototype.debug = function () { };
    return NoopLogger;
}());
exports.default = NoopLogger;


/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var Observable_1 = __webpack_require__(5);
var date_time_1 = __webpack_require__(246);
var errors_1 = __webpack_require__(1);
var actionTypes = __webpack_require__(90);
var InstrumentActionCreator = /** @class */ (function () {
    function InstrumentActionCreator(_instrumentRequestSender) {
        this._instrumentRequestSender = _instrumentRequestSender;
    }
    InstrumentActionCreator.prototype.loadInstruments = function () {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_INSTRUMENTS_REQUESTED));
            var session = _this._getSessionContext(store);
            var token = _this._getCurrentAccessToken(store);
            var shippingAddress = _this._getShippingAddress(store);
            return _this._getValidAccessToken(token)
                .then(function (currentToken) {
                return _this._instrumentRequestSender.loadInstruments(tslib_1.__assign({}, session, { authToken: currentToken.vaultAccessToken }), shippingAddress)
                    .then(function (_a) {
                    var body = _a.body;
                    observer.next(data_store_1.createAction(actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, body, currentToken));
                    observer.complete();
                });
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_INSTRUMENTS_FAILED, response));
            });
        }); };
    };
    InstrumentActionCreator.prototype.deleteInstrument = function (instrumentId) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.DELETE_INSTRUMENT_REQUESTED, undefined, { instrumentId: instrumentId }));
            var session = _this._getSessionContext(store);
            var token = _this._getCurrentAccessToken(store);
            return _this._getValidAccessToken(token)
                .then(function (currentToken) {
                return _this._instrumentRequestSender.deleteInstrument(tslib_1.__assign({}, session, { authToken: currentToken.vaultAccessToken }), instrumentId)
                    .then(function () {
                    observer.next(data_store_1.createAction(actionTypes.DELETE_INSTRUMENT_SUCCEEDED, undefined, tslib_1.__assign({ instrumentId: instrumentId }, currentToken)));
                    observer.complete();
                });
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.DELETE_INSTRUMENT_FAILED, response, { instrumentId: instrumentId }));
            });
        }); };
    };
    InstrumentActionCreator.prototype._isValidVaultAccessToken = function (token) {
        if (!token || !token.vaultAccessToken) {
            return false;
        }
        var expiryBuffer = 2;
        var expiry = date_time_1.addMinutes(new Date(token.vaultAccessExpiry), expiryBuffer);
        return date_time_1.isFuture(expiry);
    };
    InstrumentActionCreator.prototype._getCurrentAccessToken = function (store) {
        var instruments = store.getState().instruments;
        var meta = instruments.getInstrumentsMeta();
        if (!meta) {
            return;
        }
        return {
            vaultAccessToken: meta.vaultAccessToken,
            vaultAccessExpiry: meta.vaultAccessExpiry,
        };
    };
    InstrumentActionCreator.prototype._getValidAccessToken = function (token) {
        return token && this._isValidVaultAccessToken(token)
            ? Promise.resolve(token)
            : this._instrumentRequestSender.getVaultAccessToken()
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                return ({
                    vaultAccessToken: body.data.token,
                    vaultAccessExpiry: body.data.expires_at,
                });
            });
    };
    InstrumentActionCreator.prototype._getShippingAddress = function (store) {
        var state = store.getState();
        return state.shippingAddress.getShippingAddress();
    };
    InstrumentActionCreator.prototype._getSessionContext = function (store) {
        var state = store.getState();
        var config = state.config.getStoreConfig();
        var cart = state.cart.getCart();
        if (!config) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCheckoutConfig);
        }
        if (!cart) {
            throw new errors_1.MissingDataError(errors_1.MissingDataErrorType.MissingCart);
        }
        var customerId = cart.customerId;
        var storeId = config.storeProfile.storeId;
        return {
            customerId: customerId,
            storeId: storeId,
        };
    };
    return InstrumentActionCreator;
}());
exports.default = InstrumentActionCreator;


/***/ }),
/* 246 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var add_minutes_1 = __webpack_require__(247);
exports.addMinutes = add_minutes_1.default;
var is_future_1 = __webpack_require__(248);
exports.isFuture = is_future_1.default;


/***/ }),
/* 247 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function addMinutes(date, amount) {
    var newDate = new Date(date.getTime());
    newDate.setMinutes(date.getMinutes() + amount);
    return newDate;
}
exports.default = addMinutes;


/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isFuture(date) {
    return date.valueOf() > Date.now();
}
exports.default = isFuture;


/***/ }),
/* 249 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var address_1 = __webpack_require__(21);
var instrument_response_transformer_1 = __webpack_require__(250);
var InstrumentRequestSender = /** @class */ (function () {
    function InstrumentRequestSender(_client, _requestSender) {
        this._client = _client;
        this._requestSender = _requestSender;
        this._transformer = new instrument_response_transformer_1.default();
    }
    InstrumentRequestSender.prototype.getVaultAccessToken = function (_a) {
        var timeout = (_a === void 0 ? {} : _a).timeout;
        var url = '/internalapi/v1/checkout/payments/vault-access-token';
        return this._requestSender.get(url, { timeout: timeout });
    };
    InstrumentRequestSender.prototype.loadInstruments = function (requestContext, shippingAddress) {
        return (shippingAddress) ?
            this._loadInstrumentsWithAddress(requestContext, shippingAddress) :
            this._loadInstruments(requestContext);
    };
    InstrumentRequestSender.prototype.deleteInstrument = function (requestContext, instrumentId) {
        var _this = this;
        var payload = tslib_1.__assign({}, requestContext, { instrumentId: instrumentId });
        return new Promise(function (resolve, reject) {
            _this._client.deleteShopperInstrument(payload, function (error, response) {
                if (error) {
                    reject(_this._transformer.transformErrorResponse(error));
                }
                else {
                    resolve(_this._transformer.transformResponse(response));
                }
            });
        });
    };
    InstrumentRequestSender.prototype._loadInstruments = function (requestContext) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.loadInstruments(requestContext, function (error, response) {
                if (error) {
                    reject(_this._transformer.transformErrorResponse(error));
                }
                else {
                    resolve(_this._transformer.transformResponse(response));
                }
            });
        });
    };
    InstrumentRequestSender.prototype._loadInstrumentsWithAddress = function (requestContext, shippingAddress) {
        var _this = this;
        var payload = tslib_1.__assign({}, requestContext, { shippingAddress: address_1.mapToInternalAddress(shippingAddress) });
        return new Promise(function (resolve, reject) {
            _this._client.loadInstrumentsWithAddress(payload, function (error, response) {
                if (error) {
                    reject(_this._transformer.transformErrorResponse(error));
                }
                else {
                    resolve(_this._transformer.transformResponse(response));
                }
            });
        });
    };
    return InstrumentRequestSender;
}());
exports.default = InstrumentRequestSender;


/***/ }),
/* 250 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var InstrumentResponseTransformer = /** @class */ (function () {
    function InstrumentResponseTransformer() {
    }
    InstrumentResponseTransformer.prototype.transformResponse = function (response) {
        var payload = this._transformResponse(response);
        var vaulted_instruments = payload.body.vaulted_instruments;
        payload.body = {
            vaultedInstruments: this._transformVaultedInstruments(vaulted_instruments),
        };
        return payload;
    };
    InstrumentResponseTransformer.prototype.transformErrorResponse = function (response) {
        return this._transformResponse(response);
    };
    InstrumentResponseTransformer.prototype._transformVaultedInstruments = function (vaultedInstruments) {
        if (vaultedInstruments === void 0) { vaultedInstruments = []; }
        return vaultedInstruments.map(function (instrument) { return ({
            bigpayToken: instrument.bigpay_token,
            provider: instrument.provider,
            iin: instrument.iin,
            last4: instrument.last_4,
            expiryMonth: instrument.expiry_month,
            expiryYear: instrument.expiry_year,
            brand: instrument.brand,
            trustedShippingAddress: instrument.trusted_shipping_address,
        }); });
    };
    InstrumentResponseTransformer.prototype._transformResponse = function (_a) {
        var body = _a.data, status = _a.status, statusText = _a.statusText;
        return {
            headers: {},
            body: body,
            status: status,
            statusText: statusText,
        };
    };
    return InstrumentResponseTransformer;
}());
exports.default = InstrumentResponseTransformer;


/***/ }),
/* 251 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var InstrumentSelector = /** @class */ (function () {
    function InstrumentSelector(_instruments) {
        this._instruments = _instruments;
    }
    InstrumentSelector.prototype.getInstruments = function () {
        return this._instruments.data;
    };
    InstrumentSelector.prototype.getInstrumentsMeta = function () {
        return this._instruments.meta;
    };
    InstrumentSelector.prototype.getLoadError = function () {
        return this._instruments.errors && this._instruments.errors.loadError;
    };
    InstrumentSelector.prototype.getDeleteError = function (instrumentId) {
        if (!this._instruments.errors || (instrumentId && this._instruments.errors.failedInstrument !== instrumentId)) {
            return;
        }
        return this._instruments.errors.deleteError;
    };
    InstrumentSelector.prototype.isLoading = function () {
        return !!(this._instruments.statuses && this._instruments.statuses.isLoading);
    };
    InstrumentSelector.prototype.isDeleting = function (instrumentId) {
        if (!this._instruments.statuses || (instrumentId && this._instruments.statuses.deletingInstrument !== instrumentId)) {
            return false;
        }
        return !!this._instruments.statuses.isDeleting;
    };
    return InstrumentSelector;
}());
exports.default = InstrumentSelector;


/***/ }),
/* 252 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var actionTypes = __webpack_require__(90);
var DEFAULT_STATE = {
    data: [],
    errors: {},
    statuses: {},
};
function instrumentReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        meta: metaReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = instrumentReducer;
function dataReducer(data, action) {
    if (data === void 0) { data = DEFAULT_STATE.data; }
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
            return action.payload.vaultedInstruments || [];
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
            return data.filter(function (instrument) {
                return instrument.bigpayToken !== action.meta.instrumentId;
            });
        default:
            return data;
    }
}
function metaReducer(meta, action) {
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
            return tslib_1.__assign({}, meta, action.meta);
        default:
            return meta;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case actionTypes.DELETE_INSTRUMENT_REQUESTED:
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
            return tslib_1.__assign({}, errors, { deleteError: undefined, failedInstrument: undefined });
        case actionTypes.LOAD_INSTRUMENTS_FAILED:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case actionTypes.DELETE_INSTRUMENT_FAILED:
            return tslib_1.__assign({}, errors, { deleteError: action.payload, failedInstrument: action.meta.instrumentId });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case actionTypes.LOAD_INSTRUMENTS_REQUESTED:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case actionTypes.DELETE_INSTRUMENT_REQUESTED:
            return tslib_1.__assign({}, statuses, { isDeleting: true, deletingInstrument: action.meta.instrumentId });
        case actionTypes.LOAD_INSTRUMENTS_SUCCEEDED:
        case actionTypes.LOAD_INSTRUMENTS_FAILED:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case actionTypes.DELETE_INSTRUMENT_SUCCEEDED:
        case actionTypes.DELETE_INSTRUMENT_FAILED:
            return tslib_1.__assign({}, statuses, { isDeleting: false, deletingInstrument: undefined });
        default:
            return statuses;
    }
}


/***/ }),
/* 253 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var from_1 = __webpack_require__(82);
var operators_1 = __webpack_require__(254);
function createActionTransformer(requestErrorFactory) {
    return function (action$) { return from_1.from(action$).pipe(operators_1.catchError(function (action) {
        if (action instanceof Error || action.payload instanceof Error) {
            throw action;
        }
        if (isResponse(action.payload)) {
            throw tslib_1.__assign({}, action, { payload: requestErrorFactory.createError(action.payload) });
        }
        throw action;
    })); };
}
exports.default = createActionTransformer;
function isResponse(object) {
    if (!object || typeof object !== 'object') {
        return false;
    }
    return ['body', 'headers', 'status', 'statusText'].every(function (key) {
        return object.hasOwnProperty(key);
    });
}


/***/ }),
/* 254 */
/***/ (function(module, exports) {

module.exports = require("rxjs/operators");

/***/ }),
/* 255 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = __webpack_require__(2);
var billing_1 = __webpack_require__(17);
var cart_1 = __webpack_require__(9);
var config_1 = __webpack_require__(25);
var coupon_1 = __webpack_require__(19);
var customer_1 = __webpack_require__(14);
var geography_1 = __webpack_require__(30);
var order_1 = __webpack_require__(10);
var payment_1 = __webpack_require__(13);
var instrument_1 = __webpack_require__(45);
var remote_checkout_1 = __webpack_require__(26);
var shipping_1 = __webpack_require__(15);
var checkout_reducer_1 = __webpack_require__(256);
function createCheckoutStoreReducer() {
    return data_store_1.combineReducers({
        billingAddress: billing_1.billingAddressReducer,
        cart: cart_1.cartReducer,
        checkout: checkout_reducer_1.default,
        config: config_1.configReducer,
        consignments: shipping_1.consignmentReducer,
        countries: geography_1.countryReducer,
        coupons: coupon_1.couponReducer,
        customer: customer_1.customerReducer,
        customerStrategies: customer_1.customerStrategyReducer,
        giftCertificates: coupon_1.giftCertificateReducer,
        instruments: instrument_1.instrumentReducer,
        order: order_1.orderReducer,
        payment: payment_1.paymentReducer,
        paymentMethods: payment_1.paymentMethodReducer,
        paymentStrategies: payment_1.paymentStrategyReducer,
        remoteCheckout: remote_checkout_1.remoteCheckoutReducer,
        shippingCountries: shipping_1.shippingCountryReducer,
        shippingStrategies: shipping_1.shippingStrategyReducer,
    });
}
exports.default = createCheckoutStoreReducer;


/***/ }),
/* 256 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var data_store_1 = __webpack_require__(2);
var lodash_1 = __webpack_require__(3);
var billing_1 = __webpack_require__(17);
var coupon_1 = __webpack_require__(19);
var order_1 = __webpack_require__(10);
var shipping_1 = __webpack_require__(15);
var checkout_actions_1 = __webpack_require__(31);
var DEFAULT_STATE = {
    errors: {},
    statuses: {},
};
function checkoutReducer(state, action) {
    if (state === void 0) { state = DEFAULT_STATE; }
    var reducer = data_store_1.combineReducers({
        data: dataReducer,
        errors: errorsReducer,
        statuses: statusesReducer,
    });
    return reducer(state, action);
}
exports.default = checkoutReducer;
function dataReducer(data, action) {
    switch (action.type) {
        case checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded:
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutSucceeded:
        case billing_1.BillingAddressActionType.UpdateBillingAddressSucceeded:
        case coupon_1.CouponActionType.ApplyCouponSucceeded:
        case coupon_1.CouponActionType.RemoveCouponSucceeded:
        case shipping_1.ConsignmentActionType.CreateConsignmentsSucceeded:
        case shipping_1.ConsignmentActionType.UpdateConsignmentSucceeded:
        case shipping_1.ConsignmentActionType.UpdateShippingOptionSucceeded:
        case coupon_1.GiftCertificateActionType.ApplyGiftCertificateSucceeded:
        case coupon_1.GiftCertificateActionType.RemoveGiftCertificateSucceeded:
            return action.payload
                ? lodash_1.omit(tslib_1.__assign({}, data, action.payload), ['billingAddress', 'cart', 'consignments', 'customer', 'coupons', 'giftCertifcates'])
                : data;
        case order_1.OrderActionType.SubmitOrderSucceeded:
            return action.payload && data
                ? tslib_1.__assign({}, data, { orderId: action.payload.order.orderId }) : data;
        default:
            return data;
    }
}
function errorsReducer(errors, action) {
    if (errors === void 0) { errors = DEFAULT_STATE.errors; }
    switch (action.type) {
        case checkout_actions_1.CheckoutActionType.LoadCheckoutRequested:
        case checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, errors, { loadError: undefined });
        case checkout_actions_1.CheckoutActionType.LoadCheckoutFailed:
            return tslib_1.__assign({}, errors, { loadError: action.payload });
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutRequested:
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutSucceeded:
            return tslib_1.__assign({}, errors, { updateError: undefined });
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutFailed:
            return tslib_1.__assign({}, errors, { updateError: action.payload });
        default:
            return errors;
    }
}
function statusesReducer(statuses, action) {
    if (statuses === void 0) { statuses = DEFAULT_STATE.statuses; }
    switch (action.type) {
        case checkout_actions_1.CheckoutActionType.LoadCheckoutRequested:
            return tslib_1.__assign({}, statuses, { isLoading: true });
        case checkout_actions_1.CheckoutActionType.LoadCheckoutFailed:
        case checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded:
            return tslib_1.__assign({}, statuses, { isLoading: false });
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutRequested:
            return tslib_1.__assign({}, statuses, { isUpdating: true });
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutFailed:
        case checkout_actions_1.CheckoutActionType.UpdateCheckoutSucceeded:
            return tslib_1.__assign({}, statuses, { isUpdating: false });
        default:
            return statuses;
    }
}


/***/ }),
/* 257 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var form_selector_1 = __webpack_require__(258);
exports.FormSelector = form_selector_1.default;


/***/ }),
/* 258 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var lodash_1 = __webpack_require__(3);
var selector_1 = __webpack_require__(4);
var FormSelector = /** @class */ (function () {
    function FormSelector(_config) {
        this._config = _config;
    }
    FormSelector.prototype.getShippingAddressFields = function (countries, countryCode) {
        var _this = this;
        if (countries === void 0) { countries = []; }
        var selectedCountry = lodash_1.find(countries, { code: countryCode });
        var fields = this._config.data ? this._config.data.storeConfig.formFields.shippingAddressFields : [];
        return fields.map(function (field) { return _this._processField(field, countries, selectedCountry); });
    };
    FormSelector.prototype.getBillingAddressFields = function (countries, countryCode) {
        var _this = this;
        if (countries === void 0) { countries = []; }
        var selectedCountry = lodash_1.find(countries, { code: countryCode });
        var fields = this._config.data ? this._config.data.storeConfig.formFields.billingAddressFields : [];
        return fields.map(function (field) { return _this._processField(field, countries, selectedCountry); });
    };
    FormSelector.prototype._processField = function (field, countries, selectedCountry) {
        if (field.name === 'countryCode') {
            return this._processCountry(field, countries, selectedCountry);
        }
        if (field.name === 'stateOrProvince') {
            return this._processProvince(field, selectedCountry);
        }
        if (field.name === 'postalCode') {
            return this._processsPostCode(field, selectedCountry);
        }
        return field;
    };
    FormSelector.prototype._processCountry = function (field, countries, country) {
        if (countries === void 0) { countries = []; }
        if (!countries.length) {
            return field;
        }
        var _a = (country || {}).code, code = _a === void 0 ? '' : _a;
        var items = countries.map(function (_a) {
            var code = _a.code, name = _a.name;
            return ({
                value: code,
                label: name,
            });
        });
        return tslib_1.__assign({}, field, { options: { items: items }, default: code, type: 'array', fieldType: 'dropdown', itemtype: 'string' });
    };
    FormSelector.prototype._processProvince = function (field, country) {
        var _a = (country || {}).subdivisions, subdivisions = _a === void 0 ? [] : _a;
        if (!subdivisions.length) {
            return tslib_1.__assign({}, field, { required: false });
        }
        var items = subdivisions.map(function (_a) {
            var code = _a.code, name = _a.name;
            return ({
                value: code,
                label: name,
            });
        });
        return tslib_1.__assign({}, field, { name: 'stateOrProvinceCode', options: { items: items }, required: true, type: 'array', fieldType: 'dropdown', itemtype: 'string' });
    };
    FormSelector.prototype._processsPostCode = function (field, country) {
        var _a = (country || {}).hasPostalCodes, hasPostalCodes = _a === void 0 ? [] : _a;
        if (hasPostalCodes === undefined) {
            return field;
        }
        return tslib_1.__assign({}, field, { required: Boolean(hasPostalCodes) });
    };
    FormSelector = tslib_1.__decorate([
        selector_1.selector
    ], FormSelector);
    return FormSelector;
}());
exports.default = FormSelector;


/***/ }),
/* 259 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./messageformat.d.ts" />
var lodash_1 = __webpack_require__(3);
var MessageFormat = __webpack_require__(263);
var DEFAULT_LOCALE = 'en';
var KEY_PREFIX = 'optimized_checkout';
/**
 * Responsible for getting language strings.
 *
 * This object can be used to retrieve language strings that are most
 * appropriate for a given locale.
 *
 * The language strings provided to the object should follow [ICU
 * MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.
 */
var LanguageService = /** @class */ (function () {
    /**
     * @internal
     */
    function LanguageService(config, _logger) {
        this._logger = _logger;
        var _a = this._transformConfig(config), locale = _a.locale, locales = _a.locales, translations = _a.translations;
        this._locale = locale;
        this._locales = locales;
        this._translations = translations;
        this._formatters = {};
    }
    /**
     * Remaps a set of language strings with a different set of keys.
     *
     * ```js
     * service.mapKeys({
     *     'new_key': 'existing_key',
     * });
     *
     * console.log(service.translate('new_key'));
     * ```
     *
     * @param maps - The set of language strings.
     */
    LanguageService.prototype.mapKeys = function (maps) {
        var _this = this;
        Object.keys(maps).forEach(function (key) {
            var translationKey = KEY_PREFIX + "." + maps[key];
            _this._translations[KEY_PREFIX + "." + key] = _this._translations[translationKey];
        });
    };
    /**
     * Gets the preferred locale of the current customer.
     *
     * @returns The preferred locale code.
     */
    LanguageService.prototype.getLocale = function () {
        return this._hasTranslations() ? this._locale : DEFAULT_LOCALE;
    };
    /**
     * Gets a language string by a key.
     *
     * ```js
     * service.translate('language_key');
     * ```
     *
     * If the language string contains a placeholder, you can replace it by
     * providing a second argument.
     *
     * ```js
     * service.translate('language_key', { placeholder: 'Hello' });
     * ```
     *
     * @param key - The language key.
     * @param data - Data for replacing placeholders in the language string.
     * @returns The translated language string.
     */
    LanguageService.prototype.translate = function (key, data) {
        if (data === void 0) { data = {}; }
        var prefixedKey = KEY_PREFIX + "." + key;
        if (typeof this._translations[prefixedKey] !== 'string') {
            this._logger.warn("Translation key \"" + prefixedKey + "\" is missing");
            return prefixedKey;
        }
        if (!this._formatters[prefixedKey]) {
            var messageFormat = new MessageFormat(this._locales[prefixedKey]);
            this._formatters[prefixedKey] = messageFormat.compile(this._translations[prefixedKey] || '');
        }
        return this._formatters[prefixedKey](this._transformData(data));
    };
    LanguageService.prototype._transformConfig = function (config) {
        if (config === void 0) { config = {}; }
        var output = {
            defaultTranslations: {},
            translations: {},
            locales: {},
            locale: config.locale || DEFAULT_LOCALE,
        };
        var locales = config.locales || {};
        var translations = this._flattenObject(config.translations || {});
        var defaultTranslations = this._flattenObject(config.defaultTranslations || {});
        var translationKeys = lodash_1.union(Object.keys(defaultTranslations), Object.keys(translations));
        translationKeys.forEach(function (key) {
            if (translations && translations[key]) {
                output.translations[key] = translations[key];
                output.locales[key] = locales[key] || output.locale;
            }
            else {
                output.translations[key] = defaultTranslations[key];
                output.locales[key] = DEFAULT_LOCALE;
            }
        });
        return output;
    };
    LanguageService.prototype._flattenObject = function (object, result, parentKey) {
        var _this = this;
        if (result === void 0) { result = {}; }
        if (parentKey === void 0) { parentKey = ''; }
        try {
            Object.keys(object).forEach(function (key) {
                var value = object[key];
                var resultKey = parentKey ? parentKey + "." + key : key;
                if (lodash_1.isObject(value)) {
                    return _this._flattenObject(value, result, resultKey);
                }
                result[resultKey] = value;
            });
        }
        catch (err) {
            this._logger.warn("Unable to parse object: " + err);
        }
        return result;
    };
    LanguageService.prototype._transformData = function (data) {
        return Object.keys(data).reduce(function (result, key) {
            var value = data[key];
            result[key] = value === null || value === undefined ? '' : value;
            return result;
        }, {});
    };
    LanguageService.prototype._hasTranslations = function () {
        var _this = this;
        return Object.keys(this._locales).map(function (key) { return _this._locales[key]; })
            .filter(function (code) { return code.split('-')[0] === _this._locale.split('-')[0]; })
            .length > 0;
    };
    return LanguageService;
}());
exports.default = LanguageService;


/***/ }),
/* 260 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = __webpack_require__(18);
exports.createTimeout = request_sender_1.createTimeout;
var checkout_1 = __webpack_require__(7);
exports.createCheckoutService = checkout_1.createCheckoutService;
var locale_1 = __webpack_require__(261);
exports.createLanguageService = locale_1.createLanguageService;


/***/ }),
/* 261 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var create_language_service_1 = __webpack_require__(262);
exports.createLanguageService = create_language_service_1.default;
var language_service_1 = __webpack_require__(259);
exports.LanguageService = language_service_1.default;


/***/ }),
/* 262 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = __webpack_require__(93);
var language_service_1 = __webpack_require__(259);
/**
 * Creates an instance of `LanguageService`.
 *
 * ```js
 * const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
 * const service = createLanguageService(language);
 *
 * console.log(service.translate('address.city_label'));
 * ```
 *
 * @param config - A configuration object.
 * @returns An instance of `LanguageService`.
 */
function createLanguageService(config) {
    if (config === void 0) { config = {}; }
    return new language_service_1.default(config, log_1.getDefaultLogger());
}
exports.default = createLanguageService;


/***/ }),
/* 263 */
/***/ (function(module, exports) {

module.exports = require("messageformat");

/***/ })
/******/ ]);
//# sourceMappingURL=checkout-sdk.js.map