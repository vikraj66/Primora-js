import { EjsRenderer } from '../../utils/ejsRenderer';
import { html } from '../../utils/htm';
import { Model } from '../models/Model';
import { generateUniqueId } from '../../utils/uniqueId';
import { applyScopedStyles, loadAndApplyScopedStyles } from '../../utils/scopedStyles';

interface HasId {
    id?: number;
}

type EventHandler = (event: Event) => void;

export abstract class View<T extends Model<K>, K extends HasId> {
    regions: { [key: string]: Element } = {};
    private uniqueId: string;
    private scopedStylesEnabled: boolean;

    constructor(
        public parent: Element,
        public model: T,
        public useEjs: boolean = false,
        scopedStylesEnabled: boolean = false
    ) {
        this.scopedStylesEnabled = scopedStylesEnabled;
        if (scopedStylesEnabled) {
            this.uniqueId = generateUniqueId('view');
        }
        this.bindModel();
    }

    abstract template(): string | HTMLTemplateElement;

    protected html = html;

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

    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
    }

    getUniqueId(): string {
        return this.uniqueId;
    }

    applyScopedClasses(element: HTMLElement): void {
        if (this.scopedStylesEnabled) {
            const classList = Array.from(element.classList);
            element.className = classList.map(cls => `${this.uniqueId}-${cls}`).join(' ');
        }
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
        this.parent.innerHTML = '';

        const templateContent = this.template();

        if (this.useEjs === true && typeof templateContent === 'string') {
            const renderedHtml = EjsRenderer.render(templateContent, this.model.toJson());
            const template = document.createElement('template');
            template.innerHTML = renderedHtml;
            this.parent.append(template.content);
        } else {
            if (typeof templateContent === 'string') {
                const templateElement = document.createElement('template');
                templateElement.innerHTML = templateContent;
                this.parent.append(templateElement.content);
            } else {
                this.parent.append(templateContent);
            }
        }

        // const templateElement = document.createElement('template');
        // let html = this.useEjs ? EjsRenderer.render(this.template(), this.model.toJson()) : this.template();

        // templateElement.innerHTML = html;
        // this.parent.append(templateElement.content); // Append the initial content first

        this.onRender(); // Call onRender to allow for dynamic content to be added

        if (this.scopedStylesEnabled) {
            this.parent.innerHTML = this.parent.innerHTML.replace(/class="/g, `class="${this.uniqueId}-`);
        }



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
