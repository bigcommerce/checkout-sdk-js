const getCartCurrencyQuery = (currencyCode: string) => {
    return `
        query Currency {
            site {
                currency(currencyCode: ${currencyCode}) {
                    display {
                        decimalPlaces
                        symbol
                    }
                    name
                    code
                }
            }
        }
    `;
};

export default getCartCurrencyQuery;
