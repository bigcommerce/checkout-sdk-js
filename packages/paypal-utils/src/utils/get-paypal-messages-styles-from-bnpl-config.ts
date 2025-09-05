import { MessagesStyleOptions, PayPalBNPLConfigurationItem } from '../paypal-types';

function getPaypalMessagesStylesFromBNPLConfig({
    styles,
}: PayPalBNPLConfigurationItem): MessagesStyleOptions {
    const messagesStyles: MessagesStyleOptions = {};

    if (styles.color) {
        messagesStyles.color = styles.color;
    }

    if (styles.layout) {
        messagesStyles.layout = styles.layout;
    }

    if (styles['logo-type'] || styles['logo-position']) {
        messagesStyles.logo = {};

        if (styles['logo-type']) {
            messagesStyles.logo.type = styles['logo-type'];
        }

        if (styles['logo-position']) {
            messagesStyles.logo.position = styles['logo-position'];
        }
    }

    if (styles.ratio) {
        messagesStyles.ratio = styles.ratio;
    }

    if (styles['text-color'] || styles['text-size']) {
        messagesStyles.text = {};

        if (styles['text-color']) {
            messagesStyles.text.color = styles['text-color'];
        }

        if (styles['text-size']) {
            messagesStyles.text.size = +styles['text-size'];
        }
    }

    return messagesStyles;
}

export default getPaypalMessagesStylesFromBNPLConfig;
