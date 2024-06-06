/**
 * @jest-environment jsdom
 */

import { CollectionView } from '@/core/views/CollectionView';
import { Collection } from '@/core/models/Collection';
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

describe('CollectionViewRendering', () => {
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

    it('should render collection items correctly', () => {
        class TestModel extends Model<TestProps> {}

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div>${model.get('name')}</div>`;
            }
        }

        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection);
        view.render();

        expect(parentElement.innerHTML).toContain('John Doe');
        expect(parentElement.innerHTML).toContain('Jane Doe');
    });

    it('should apply scoped styles when rendering', () => {
        class TestModel extends Model<TestProps> {}

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div class="test-class">${model.get('name')}</div>`;
            }

            styles(): string {
                return `.test-class { color: red; }`;
            }
        }

        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection, false);
        view.render();

        const styleElement = document.head.querySelector('style');
        expect(styleElement).not.toBeNull();
        const regex = /\.test-class\s*\{\s*color:\s*red;\s*\}/;
        expect(regex.test(styleElement?.innerHTML ?? '')).toBe(true);
    });

    it('should render nested collection items correctly', () => {
        class TestModel extends Model<TestProps> {}

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div><span>${model.get('name')}</span></div>`;
            }
        }

        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection);
        view.render();

        expect(parentElement.innerHTML).toContain('<span>John Doe</span>');
        expect(parentElement.innerHTML).toContain('<span>Jane Doe</span>');
    });
});
