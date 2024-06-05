/**
 * @jest-environment jsdom
 */

import { View } from '@/core/views/View';
import { Model } from '@/core/models/Model';
import { Eventing } from '@/core/models/Eventing';
import { Attributes } from '@/core/models/Attributes';
import { ApiSync } from '@/core/models/ApiSync';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

interface TestProps {
    id?: number;
    name?: string;
    age?: number;
}

describe('ViewRendering', () => {
    let attributes: Attributes<TestProps>;
    let eventing: Eventing;
    let sync: ApiSync<TestProps>;
    let model: Model<TestProps>;
    let parentElement: HTMLElement;
    let mock: MockAdapter;

    beforeEach(() => {
        attributes = new Attributes<TestProps>({ id: 1, name: 'John Doe', age: 30 });
        eventing = new Eventing();
        sync = new ApiSync<TestProps>('http://example.com/users');
        model = new Model<TestProps>(attributes, eventing, sync);
        parentElement = document.createElement('div');
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        if (mock) {
            mock.reset();
        }
        jest.clearAllMocks();
    });

    it('should render template correctly', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div>${this.model.get('name')}</div>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.innerHTML).toContain('John Doe');
    });

    it('should update the template when model changes', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div>${this.model.get('name')}</div>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        model.set({ name: 'Jane Doe' });
        view.render();

        expect(parentElement.innerHTML).toContain('Jane Doe');
    });

    it('should render nested templates correctly', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div><span>${this.model.get('name')}</span></div>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.innerHTML).toContain('<span>John Doe</span>');
    });

    it('should render multiple properties from the model', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div>${this.model.get('name')} (${this.model.get('age')})</div>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.innerHTML).toContain('John Doe (30)');
    });

    it('should clear previous content before rendering', () => {
        parentElement.innerHTML = '<p>Old Content</p>';

        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div>${this.model.get('name')}</div>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.innerHTML).not.toContain('Old Content');
        expect(parentElement.innerHTML).toContain('John Doe');
    });

    it('should render template with different HTML tags', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<article><header>${this.model.get('name')}</header></article>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.innerHTML).toContain('<header>John Doe</header>');
    });

    it('should correctly apply HTML attributes in template', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div id="user-${this.model.get('id')}">${this.model.get('name')}</div>`;
            }
        }

        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.querySelector(`#user-${model.get('id')}`)).not.toBeNull();
    });

    it('should render an empty template if model is not set', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return this.model.get('name') ? `<div>${this.model.get('name')}</div>` : '<div>No Data</div>';
            }
        }

        model = new Model(new Attributes<TestProps>({}), eventing, sync);
        const view = new TestView(parentElement, model);
        view.render();

        expect(parentElement.innerHTML).toContain('No Data');
    });

    it('should handle boolean attributes in template', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                const isActive = this.model.get('age') > 18 ? 'active' : 'inactive';
                return `<div class="${isActive}">${this.model.get('name')}</div>`;
            }
        }

        const view = new TestView(parentElement, model, false, false);
        view.render();

        expect(parentElement.querySelector('.active')).not.toBeNull();
    });

    it('should apply scoped styles when rendering', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="test-class">${this.model.get('name')}</div>`;
            }

            styles(): string {
                return `.test-class { color: red; }`;
            }
        }

        const view = new TestView(parentElement, model, false, false);
        view.render();

        const styleElement = document.head.querySelector('style');
        expect(styleElement).not.toBeNull();
        console.log(styleElement.innerHTML)
        // Use regular expression to match the dynamically generated class name
        const regex = /\.test-class\s*\{\s*color:\s*red;\s*\}/;
        expect(regex.test(styleElement?.innerHTML ?? '')).toBe(true);
    });
});
