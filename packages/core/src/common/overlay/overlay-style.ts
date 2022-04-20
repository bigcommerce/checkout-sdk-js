interface OverlayStyleOptions {
    background?: string;
    id?: string;
    transitionDuration?: number;
    classLayout?: string;
    classOverlayText?: string;
    classClose?: string;
}

export default function getOverlayStyle(options: OverlayStyleOptions): HTMLElement {
    const { id, background, transitionDuration, classLayout, classOverlayText, classClose } = options;
    const styles = document.createElement('style');
    const addClassLayout = classLayout ? `, .${classLayout}` : '';

    styles.id = `${id}--styles`;
    styles.type = 'text/css';
    styles.innerText = `
        #${id}${addClassLayout} {
            display: block;
            height: 100%;
            width: 100%;
            left: 0;
            top: 0;
            position: fixed;
            z-index: 2147483647;
        }
        #${id} {
            transition: opacity ${transitionDuration}ms ease-out;
            background: ${background};
            opacity: 0;
        }
    `;

    if (classOverlayText) {
        styles.innerText += `
             #${id} {
                display: flex;
                align-items: center;
                justify-content: center;
             }
             #${id} .${classOverlayText} {
                color: white;
                max-width: 330px;
                font-size: 1.2em;
                text-align: center;
             }
        `;
    }

    if (classClose) {
        styles.innerText += `
            #${id} {
                opacity: 1;
            }
            .${classLayout} .${classClose} {
                position: fixed;
                right: 16px;
                top: 16px;
                width: 16px;
                height: 16px;
                opacity: 0.6;
                cursor: pointer;
                z-index: 3147483647;
            }
            .${classLayout} .${classClose}::after, .${classLayout} .${classClose}::before {
                position: absolute;
                left: 8px;
                content: '';
                height: 16px;
                width: 2px;
                background-color: #fff;
            }
            .${classLayout} .${classClose}::after {
                transform: rotate(-45deg);
            }
            .${classLayout} .${classClose}::before {
                transform: rotate(45deg);
            }
        `;
    }

    return styles;
}
