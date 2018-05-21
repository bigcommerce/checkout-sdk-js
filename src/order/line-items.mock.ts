import { PhysicalItem } from '../cart';
import { getPhysicalItem as getCartPhysicalItem } from '../cart/line-items.mock';

export function getPhysicalItem(): PhysicalItem {
    return {
        ...getCartPhysicalItem(),
        socialMedia: [
            {
                code: 'fb',
                channel: 'Facebook',
                text: "I just bought '[Sample] Sodling, black leather duffle bag' on s1446156961",
                link: 'http:\/\/www.facebook.com\/sharer\/sharer.php?s=100&p[title]=I+just+bought+%27%5BSample%5D+Sodling%2C+black+leather+duffle+bag%27+on+s1446156961&p[summary]=How+to+write+product+descriptions+that+sellOne+of+the+best+things+you+can+do+to+make+your+store+successful+is+invest+some+time+in+writing+great+product+descriptions.+You+want+to+provide+detailed+ye...&p[url]=http%3A%2F%2Fs1446156961.bcapp.dev%2Fsample-sodling-black-leather-duffle-bag%2F&p[images][0]=http%3A%2F%2Fcdn.bcapp.dev%2Fbcapp%2Fuvn6bltx%2Fproducts%2F68%2Fimages%2F253%2FHERO_mensstyle_034__54484.1348466546.190.285.jpg%3Fc%3D1',
            },
            {
                code: 'tw',
                channel: 'Twitter',
                text: "I just bought '[Sample] Sodling, black leather duffle bag' on s1446156961",
                link: 'https:\/\/twitter.com\/intent\/tweet?url=http%3A%2F%2Fs1446156961.bcapp.dev%2Fsample-sodling-black-leather-duffle-bag%2F&text=I+just+bought+%27%5BSample%5D+Sodling%2C+black+leather+duffle+bag%27+on+s1446156961',
            },
            {
                code: 'gp',
                channel: 'Google Plus',
                text: "I just bought '[Sample] Sodling, black leather duffle bag' on s1446156961",
                link: 'https:\/\/plus.google.com\/share?url=http:\/\/s1446156961.bcapp.dev\/sample-sodling-black-leather-duffle-bag\/',
            },
        ],
        id: 5,
    };
}
