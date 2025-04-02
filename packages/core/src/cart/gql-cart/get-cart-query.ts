const getCartQuery = (cartId: string) => {
    return `
        query GetCartQuery {
            site {
                cart(entityId: "${cartId}") {
                    entityId
                    isTaxIncluded
                    currencyCode
                    id
                    updatedAt {
                        utc
                    }
                    createdAt {
                        utc
                    }
                    discounts {
                        entityId
                        discountedAmount {
                            currencyCode
                            value
                        }
                    }
                    baseAmount {
                        currencyCode
                        value
                    }
                    lineItems {
                        totalQuantity
                        customItems {
                            entityId
                            extendedListPrice {
                                value
                            }
                            listPrice {
                                value
                            }
                            name
                            quantity
                            sku
                        }
                        giftCertificates {
                            amount {
                                value
                            }
                            recipient {
                                email
                                name
                            }
                            sender {
                                email
                                name
                            }
                            theme
                            entityId
                            isTaxable
                            message
                            name
                        }
                        physicalItems {
                            name
                            brand
                            imageUrl
                            entityId
                            quantity
                            productEntityId
                            variantEntityId
                            couponAmount {
                                value
                                currencyCode
                            }
                            discountedAmount {
                                value
                            }
                            discounts {
                                discountedAmount {
                                    value
                                }
                                entityId
                            }
                            extendedListPrice {
                                currencyCode
                                value
                            }
                            extendedSalePrice {
                                currencyCode
                                value
                            }
                            giftWrapping {
                                amount {
                                    value
                                }
                                message
                                name
                            }
                            listPrice {
                                value
                            }
                            originalPrice {
                                value
                            }
                            salePrice {
                                value
                            }
                            sku
                            url
                            isShippingRequired
                            isTaxable
                            selectedOptions {
                                entityId
                                name
                            ... on CartSelectedMultipleChoiceOption {
                                    value
                                    valueEntityId
                                }
                            ... on CartSelectedCheckboxOption {
                                    value
                                    valueEntityId
                                }
                            ... on CartSelectedNumberFieldOption {
                                    number
                                }
                            ... on CartSelectedMultiLineTextFieldOption {
                                    text
                                }
                            ... on CartSelectedTextFieldOption {
                                    text
                                }
                            ... on CartSelectedDateFieldOption {
                                    date {
                                        utc
                                    }
                                }
                            }
                        }
                        digitalItems {
                            name
                            brand
                            imageUrl
                            entityId
                            quantity
                            productEntityId
                            variantEntityId
                            extendedListPrice {
                                currencyCode
                                value
                            }
                            extendedSalePrice {
                                currencyCode
                                value
                            }
                            selectedOptions {
                                entityId
                                name
                            ... on CartSelectedMultipleChoiceOption {
                                    value
                                    valueEntityId
                                }
                            ... on CartSelectedCheckboxOption {
                                    value
                                    valueEntityId
                                }
                            ... on CartSelectedNumberFieldOption {
                                    number
                                }
                            ... on CartSelectedMultiLineTextFieldOption {
                                    text
                                }
                            ... on CartSelectedTextFieldOption {
                                    text
                                }
                            ... on CartSelectedDateFieldOption {
                                    date {
                                        utc
                                    }
                                }
                            }
                        }
                    }
                    amount {
                        currencyCode
                        value
                    }
                    discountedAmount {
                        currencyCode
                        value
                    }
                }
                checkout(entityId: "${cartId}") {
                    coupons {
                        entityId
                        code
                        couponType
                        discountedAmount {
                            currencyCode
                            value
                        }
                    }
                }
            }
        }`;
};

export default getCartQuery;
