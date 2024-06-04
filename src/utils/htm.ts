import htm from 'htm';

export const html = htm.bind((tag: string, props: any, ...children: any[]) => {
    const element = document.createElement(tag);

    if (props) {
        for (const key in props) {
            if (props.hasOwnProperty(key)) {
                const value = props[key];
                if (key.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(key.substring(2).toLowerCase(), value);
                } else {
                    element.setAttribute(key, value);
                }
            }
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            element.textContent += child;
        } else {
            element.appendChild(child);
        }
    });

    return element;
});
