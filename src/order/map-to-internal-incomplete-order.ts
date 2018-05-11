import { InternalIncompleteOrder, InternalSocialDataList } from './internal-order';
import Order from './order';

export default function mapToInternalIncompleteOrder(order: Order): InternalIncompleteOrder {
    return {
        orderId: order.orderId,
        socialData: mapToInternalSocialDataList(order),
        status: order.status,
        customerCreated: order.customerCreated,
        hasDigitalItems: order.hasDigitalItems,
        isDownloadable: order.isDownloadable,
        isComplete: order.isComplete,
    };
}

export function mapToInternalSocialDataList(order: Order): InternalSocialDataList | undefined {
    const lineItem =  order.lineItems.physicalItems && order.lineItems.physicalItems[0] ||
        order.lineItems.digitalItems && order.lineItems.digitalItems[0];

    const codes = ['fb', 'tw', 'gp'];

    let socialData: InternalSocialDataList | undefined;

    codes.forEach(code => {
        if (!lineItem.socialMedia) {
            return;
        }

        const item = lineItem.socialMedia.find(item => item.code === code);

        if (!item) {
            return;
        }

        socialData = socialData || {};

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
    });

    return socialData;
}
