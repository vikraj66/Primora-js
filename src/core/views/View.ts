import { EjsRenderer } from '../../utils/ejsRenderer';
import { html } from '../../utils/htm';
import { Model } from '../models/Model';
import { generateUniqueId } from '../../utils/uniqueId';
import { applyScopedStyles, loadAndApplyScopedStyles } from '../../utils/scopedStyles';

interface HasId {
    id?: number;
}

export abstract class View<T extends Model<K>, K extends HasId> {
    regions: { [key: string]: Element } = {};
    private uniqueId: string;
    private scopedStylesEnabled: boolean;

    constructor(public parent: Element, public model: T, public useEjs: boolean = false, scopedStylesEnabled: boolean = true) {
        this.scopedStylesEnabled = scopedStylesEnabled;
        if (scopedStylesEnabled) {
            this.uniqueId = generateUniqueId('view');
        }
        this.bindModel();
    }

    abstract template(): string;

    protected html = html;

     styles(): string | undefined {
        return undefined;
     };

     cssFilePath(): string | undefined {
        return undefined;
    }

    regionsMap(): { [key: string]: string } {
        return {};
    }

    eventsMap(): { [key: string]: () => void } {
        return {};
    }

    bindModel(): void {
        this.model.on('change', () => {
            this.render();
        });
    }

    bindEvents(fragment: DocumentFragment): void {
        const eventsMap = this.eventsMap();

        for (let eventKey in eventsMap) {
            const [eventName, selector] = eventKey.split(':');

            fragment.querySelectorAll(selector).forEach(element => {
                element.addEventListener(eventName, eventsMap[eventKey]);
            });
        }
    }

    mapRegions(fragment: DocumentFragment): void {
        const regionsMap = this.regionsMap();

        for (let key in regionsMap) {
            const selector = regionsMap[key];
            const element = fragment.querySelector(selector);

            if (element) {
                this.regions[key] = element;
            }
        }
    }

    onRender(): void { }

    render(): void {
        this.parent.innerHTML = '';
        const templateElement = document.createElement('template');
        let html = this.useEjs ? EjsRenderer.render(this.template(), this.model.toJson()) : this.template();

        if (this.scopedStylesEnabled) {
            html = html.replace(/class="/g, `class="${this.uniqueId}-`);
        }

        templateElement.innerHTML = html;
        this.bindEvents(templateElement.content);
        this.mapRegions(templateElement.content);
        this.onRender();
        this.parent.append(templateElement.content);

        // Apply scoped styles from string or file
        if (this.scopedStylesEnabled) {
            const styles = this.styles();
            if (styles) {
                applyScopedStyles(this.uniqueId, styles);
            } else {
                const cssFilePath = this.cssFilePath();
                if (cssFilePath) {
                    loadAndApplyScopedStyles(this.uniqueId, cssFilePath);
                }
            }
        } else {
            const cssFilePath = this.cssFilePath();
            if (cssFilePath) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssFilePath;
                document.head.appendChild(link);
            }
        }
    }
}
