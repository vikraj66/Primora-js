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

describe('CollectionViewBindEvent', () => {
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

    it('should bind click event to collection item', () => {
        class TestModel extends Model<TestProps> { }

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div class="click-item">${model.get('name')}</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.click-item': this.onItemClick
                };
            }

            onItemClick(event: Event): void {
                console.log('Item clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection, true);
        view.render();

        const item = parentElement.querySelector(`.${view.getUniqueId()}-click-item`) as HTMLElement;
        console.info(parentElement.innerHTML)
        item.click();

        expect(logSpy).toHaveBeenCalledWith('Item clicked');
        logSpy.mockRestore();
    });

    it('should bind multiple events to collection items', () => {
        class TestModel extends Model<TestProps> { }

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `
                    <div class="click-item">${model.get('name')}</div>
                    <button class="delete-item">Delete</button>
                `;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.click-item': this.onItemClick,
                    'click:.delete-item': this.onDeleteClick
                };
            }

            onItemClick(event: Event): void {
                console.log('Item clicked');
            }

            onDeleteClick(event: Event): void {
                console.log('Item deleted');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection, false);
        view.render();

        const item = parentElement.querySelector('.click-item') as HTMLElement;
        const button = parentElement.querySelector('.delete-item') as HTMLButtonElement;

        item.click();
        button.click();

        expect(logSpy).toHaveBeenCalledWith('Item clicked');
        expect(logSpy).toHaveBeenCalledWith('Item deleted');
        logSpy.mockRestore();
    });
    it('should bind events to dynamically added collection items', () => {
        class TestModel extends Model<TestProps> { }
    
        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }
    
        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div class="dynamic-item">${model.get('name')}</div>`;
            }
    
            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.dynamic-item': this.onDynamicItemClick
                };
            }
    
            onDynamicItemClick(event: Event): void {
                console.log('Dynamic item clicked');
            }
    
            onRender(): void {
                const container = this.parent.querySelector('.container') as HTMLElement;
                container.innerHTML = `<div class="dynamic-item">Dynamic Item</div>`;
            }
        }
    
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    
        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];
    
        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;
    
        const parentElement = document.createElement('div');
        parentElement.innerHTML = '<div class="container"></div>';  // Ensure .container is present
    
        const view = new TestCollectionView(parentElement, collection, false);
        view.render();
    
        const item = parentElement.querySelector('.dynamic-item') as HTMLElement;
        item.click();
    
        expect(logSpy).toHaveBeenCalledWith('Dynamic item clicked');
        logSpy.mockRestore();
    });
    

    it('should handle events correctly after collection changes', () => {
        class TestModel extends Model<TestProps> { }

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div class="click-item">${model.get('name')}</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.click-item': this.onItemClick
                };
            }

            onItemClick(event: Event): void {
                console.log('Item clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection, false);
        view.render();

        // Update the collection
        collection.models.push(new TestModel(new Attributes({ id: 3, name: 'Jim Doe', age: 20 }), new Eventing(), new ApiSync('http://example.com/users')));
        view.render();

        const item = parentElement.querySelector('.click-item:last-child') as HTMLElement;
        item.click();

        expect(logSpy).toHaveBeenCalledWith('Item clicked');
        logSpy.mockRestore();
    });

    it('should not bind events to non-existing collection items', () => {
        class TestModel extends Model<TestProps> { }

        class TestCollection extends Collection<TestModel, TestProps> {
            model = TestModel;
        }

        class TestCollectionView extends CollectionView<TestModel, TestProps> {
            renderItem(model: TestModel, itemParent: Element): void {
                itemParent.innerHTML = `<div class="non-existing-item">${model.get('name')}</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.non-existing-item': this.onNonExistingItemClick
                };
            }

            onNonExistingItemClick(event: Event): void {
                console.log('Non-existing item clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const models = [
            new TestModel(new Attributes({ id: 1, name: 'John Doe', age: 30 }), new Eventing(), new ApiSync('http://example.com/users')),
            new TestModel(new Attributes({ id: 2, name: 'Jane Doe', age: 25 }), new Eventing(), new ApiSync('http://example.com/users'))
        ];

        const collection = new TestCollection('http://example.com/users', (json: TestProps) => new TestModel(new Attributes(json), new Eventing(), new ApiSync('http://example.com/users')));
        collection.models = models;

        const view = new TestCollectionView(parentElement, collection, true);
        view.render();

        const item = parentElement.querySelector('.non-existing-item') as HTMLElement;
        if (item) {
            item.click();
        }

        expect(logSpy).not.toHaveBeenCalled();
        logSpy.mockRestore();
    });
});
