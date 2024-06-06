/**
 * @jest-environment jsdom
 */

import { View } from '@/core/views/View';
import { Model } from '@/core/models/Model';
import { Attributes } from '@/core/models/Attributes';
import { Eventing } from '@/core/models/Eventing';

interface TestProps {
    visible: boolean;
    id: number;
}

class TestView extends View<Model<TestProps>, TestProps> {
    template(): string {
        return this.model.get('visible') ? `<div class="visible">Visible Content</div>` : `<div class="hidden">Hidden Content</div>`;
    }
}

describe('View Conditional Rendering', () => {
    let model: Model<TestProps>;
    let parentElement: HTMLElement;

    beforeEach(() => {
        model = new Model<TestProps>(new Attributes<TestProps>({ visible: false, id: 1 }), new Eventing(), null);
        parentElement = document.createElement('div');
    });

    it('should render hidden content initially', () => {
        const view = new TestView(parentElement, model);
        view.render();
        expect(parentElement.querySelector('.hidden')).not.toBeNull();
        expect(parentElement.querySelector('.visible')).toBeNull();
    });

    it('should render visible content when model attribute changes', () => {
        const view = new TestView(parentElement, model);
        model.set({ visible: true, id: 1 });
        view.render();
        expect(parentElement.querySelector('.visible')).not.toBeNull();
        expect(parentElement.querySelector('.hidden')).toBeNull();
    });
});
