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
        if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
            element.appendChild(document.createTextNode(child.toString()));
        } else if (child instanceof Node) {
            element.appendChild(child);
        } else if (Array.isArray(child)) {
            child.forEach(nestedChild => {
                if (typeof nestedChild === 'string' || typeof nestedChild === 'number' || typeof nestedChild === 'boolean') {
                    element.appendChild(document.createTextNode(nestedChild.toString()));
                } else if (nestedChild instanceof Node) {
                    element.appendChild(nestedChild);
                }
            });
        }
    });

    return element;
});
