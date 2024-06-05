import { html } from '../../utils/htm';
import { Collection } from '../models/Collection';
import { generateUniqueId } from '../../utils/uniqueId';
import { applyScopedStyles, loadAndApplyScopedStyles } from '../../utils/scopedStyles';

export abstract class CollectionView<T, K> {
    private uniqueId: string;
    private scopedStylesEnabled: boolean;

    constructor(public parent: Element, public collection: Collection<T, K>, scopedStylesEnabled: boolean = false) {
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