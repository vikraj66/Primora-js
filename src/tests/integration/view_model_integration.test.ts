/**
 * @jest-environment jsdom
 */
import { View } from '@/core/views/View';
import { Model } from '@/core/models/Model';
import { Attributes } from '@/core/models/Attributes';
import { Eventing } from '@/core/models/Eventing';
import { ApiSync } from '@/core/models/ApiSync';
import { Collection } from '@/core/models/Collection';
import { CollectionView } from '@/core/views/CollectionView';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Interface for test properties
interface TestProps {
    id?: number;
    name?: string;
    age?: number;
}

// Setup mock for axios
const mock = new MockAdapter(axios);
const rootUrl = 'http://example.com/users';

// Define Test Model
class TestModel extends Model<TestProps> { }

// Define Test Collection
class TestCollection extends Collection<TestModel, TestProps> {
    model = TestModel;
}

// Define Test View
class TestView extends View<TestModel, TestProps> {
    template(): string {
        return `<div class="view-element">${this.model.get('name')}</div>`;
    }
}

// Define Test CollectionView
class TestCollectionView extends CollectionView<TestModel, TestProps> {
    renderItem(model: TestModel, itemParent: Element): void {
        itemParent.innerHTML = `<div class="collection-item">${model.get('name')}</div>`;
    }
}

describe('Integration Tests for Views and Models', () => {
    let attributes: Attributes<TestProps>;
    let eventing: Eventing;
    let sync: ApiSync<TestProps>;
    let model: TestModel;
    let parentElement: HTMLElement;

    beforeEach(() => {
        attributes = new Attributes<TestProps>({ id: 1, name: 'John Doe', age: 30 });
        eventing = new Eventing();
        sync = new ApiSync<TestProps>(rootUrl);
        model = new TestModel(attributes, eventing, sync);
        parentElement = document.createElement('div');
        document.body.appendChild(parentElement);
    });

    afterEach(() => {
        document.body.removeChild(parentElement);
        mock.reset();
        jest.clearAllMocks();
    });

    it('should render the correct template content in the view', () => {
        const view = new TestView(parentElement, model);
        view.render();
        expect(parentElement.innerHTML).toContain('John Doe');
    });

    it('should update the view when the model changes', () => {
        const view = new TestView(parentElement, model);
        view.render();

        model.set({ name: 'Jane Doe' });
        expect(parentElement.innerHTML).toContain('Jane Doe');
    });

    it('should fetch data from the API and update the model', async () => {
        const data = { id: 1, name: 'Jane Doe', age: 25 };
        mock.onGet(`${rootUrl}/1`).reply(200, data);

        await model.fetch();
        expect(model.get('name')).toBe('Jane Doe');
    });

    it('should render collection items correctly', () => {
        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync(rootUrl)),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync(rootUrl))
        ];
        const collection = new TestCollection(rootUrl, (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync(rootUrl)));
        collection.models = models;

        const collectionView = new TestCollectionView(parentElement, collection);
        collectionView.render();

        expect(parentElement.innerHTML).toContain('John Doe');
        expect(parentElement.innerHTML).toContain('Jane Doe');
    });

    it('should apply scoped styles correctly', () => {
        class ScopedView extends View<TestModel, TestProps> {
            constructor(parent: Element, model: TestModel) {
                super(parent, model, false, true);
            }

            template(): string {
                return `<div class="view-element">${this.model.get('name')}</div>`;
            }

            styles(): string {
                return `.scoped-class { color: red; }`;
            }
        }

        const view = new ScopedView(parentElement, model);
        view.render();

        const styleElement = document.head.querySelector('style');
        expect(styleElement).not.toBeNull();
        expect(styleElement?.innerHTML).toContain(`.${view.getUniqueId()}-scoped-class { color: red; }`);
    });
});
