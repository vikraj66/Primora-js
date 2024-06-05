import { html } from '../../utils/htm';
import { Collection } from '../models/Collection';
import { generateUniqueId } from '../../utils/uniqueId';
import { applyScopedStyles, loadAndApplyScopedStyles } from '../../utils/scopedStyles';

export abstract class CollectionView<T, K> {
    private uniqueId: string;
    private scopedStylesEnabled: boolean;

    constructor(public parent: Element, public collection: Collection<T, K>, scopedStylesEnabled: boolean = true) {
        this.scopedStylesEnabled = scopedStylesEnabled;
        if (scopedStylesEnabled) {
            this.uniqueId = generateUniqueId('collection');
        }
    }

    abstract renderItem(model: T, itemParent: Element): void;

     styles(): string | undefined {
        return undefined;
     }

     cssFilePath(): string | undefined {
        return undefined;
     }

    protected html = html;

    render(): void {
        this.parent.innerHTML = '';

        const templateElement = document.createElement('template');

        for (let model of this.collection.models) {
            const itemParent = document.createElement('div');
            this.renderItem(model, itemParent);
            templateElement.content.append(itemParent);
        }

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
