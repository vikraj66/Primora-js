import { html } from '../../utils/htm';
import { Collection } from '../models/Collection';
import { generateUniqueId } from '../../utils/uniqueId';
import { applyScopedStyles, loadAndApplyScopedStyles } from '../../utils/scopedStyles';

type EventHandler = (event: Event) => void;

export abstract class CollectionView<T, K> {
    regions: { [key: string]: Element } = {};
    private uniqueId: string;
    private scopedStylesEnabled: boolean;

    constructor(
        public parent: Element,
        public collection: Collection<T, K>,
        scopedStylesEnabled: boolean = false
    ) {
        this.scopedStylesEnabled = scopedStylesEnabled;
        if (scopedStylesEnabled) {
            this.uniqueId = generateUniqueId('collection');
        }
        this.bindCollection();
    }

    abstract renderItem(model: T, itemParent: Element): void;

    styles(): string | undefined {
        return undefined;
    }

    cssFilePath(): string | undefined {
        return undefined;
    }

    regionsMap(): { [key: string]: string } {
        return {};
    }

    eventsMap(): { [key: string]: EventHandler } {
        return {};
    }

    getUniqueId(): string {
        return this.uniqueId;
    }

    bindCollection(): void {
        this.collection.on('change', () => {
            this.render();
        });
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();
        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');
            const scopedSelector = this.scopedStylesEnabled
                ? selector.replace(/(\.|#)([a-zA-Z0-9_-]+)/g, `$1${this.uniqueId}-$2`)
                : selector;

            fragment.querySelectorAll(scopedSelector).forEach(element => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    mapRegions(fragment: DocumentFragment): void {
        const regionsMap = this.regionsMap();
        for (let key in regionsMap) {
            const selector = regionsMap[key];
            const scopedSelector = this.scopedStylesEnabled
                ? selector.replace(/(\.|#)([a-zA-Z0-9_-]+)/g, `$1${this.uniqueId}-$2`)
                : selector;

            const element = fragment.querySelector(scopedSelector);
            if (element) {
                this.regions[key] = element;
            }
        }
    }

    onRender(): void { }

    render(): void {
        this.parent.innerHTML = '<div class="container"></div>';  // Ensure .container is present
        const templateElement = document.createElement('template');

        for (let model of this.collection.models) {
            const itemParent = document.createElement('div');
            this.renderItem(model, itemParent);
            templateElement.content.append(itemParent);
        }

        let htmlContent = templateElement.innerHTML;

        if (this.scopedStylesEnabled) {
            htmlContent = htmlContent.replace(/class="/g, `class="${this.uniqueId}-`);
        }

        templateElement.innerHTML = htmlContent;
        this.parent.append(templateElement.content); // Append the initial content first
    
        this.onRender(); // Call onRender to allow for dynamic content to be added
    
        // Create a DocumentFragment from the parent element's innerHTML
        const fragment = document.createDocumentFragment();
        while (this.parent.firstChild) {
            fragment.appendChild(this.parent.firstChild);
        }
    
        this.bindEvents(fragment); // Bind events to the entire fragment, including dynamically added content
        this.mapRegions(fragment); // Map regions to the entire fragment, including dynamically added content
    
        this.parent.appendChild(fragment); // Append the fragment back to the parent
    
        // Apply styles from string
        const styles = this.styles();
        if (styles) {
            if (this.scopedStylesEnabled) {
                applyScopedStyles(this.uniqueId, styles);
            } else {
                const styleElement = document.createElement('style');
                styleElement.textContent = styles;
                document.head.appendChild(styleElement);
            }
        } else {
            // Apply styles from file
            const cssFilePath = this.cssFilePath();
            if (cssFilePath) {
                if (this.scopedStylesEnabled) {
                    loadAndApplyScopedStyles(this.uniqueId, cssFilePath);
                } else {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = cssFilePath;
                    document.head.appendChild(link);
                }
            }
        }
    }
}
