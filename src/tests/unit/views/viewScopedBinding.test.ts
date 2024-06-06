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

describe('ViewScopedEventBinding', () => {
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
        document.body.appendChild(parentElement);
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        if (mock) {
            mock.reset();
        }
        jest.clearAllMocks();
        document.body.removeChild(parentElement);
    });

    it('should bind click event to button with scoped styles enabled', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<button class="click-me">Click Me</button>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.click-me': this.onClick
                };
            }

            onClick(event: Event): void {
                console.log('Button clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        const button = parentElement.querySelector(`.${uniqueId}-click-me`) as HTMLButtonElement;
        expect(button).not.toBeNull();

        button.click();
        expect(logSpy).toHaveBeenCalledWith('Button clicked');
        logSpy.mockRestore();
    });

    it('should map regions correctly with scoped styles enabled', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="container"><div class="test-region">Region Content</div></div>`;
            }

            regionsMap(): { [key: string]: string } {
                return {
                    testRegion: '.test-region'
                };
            }
        }

        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        expect(view.regions.testRegion).toBeTruthy();
        expect(view.regions.testRegion?.classList.contains(`${uniqueId}-test-region`)).toBeTruthy();
    });

    it('should bind events to dynamically added elements with scoped styles enabled', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="container"></div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.dynamic-button': this.onDynamicClick
                };
            }

            onDynamicClick(event: Event): void {
                console.log('Dynamic button clicked');
            }

            onRender(): void {
                const container = this.parent.querySelector(`.container`) as HTMLElement;
                // if (container) {
                container.innerHTML = `<button class="dynamic-button">Dynamic Button</button>`;
                // }
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        const button = parentElement.querySelector(`.${view.getUniqueId()}-dynamic-button`) as HTMLButtonElement;
        console.info(parentElement.innerHTML)
        expect(button).not.toBeNull();

        button.click();
        expect(logSpy).toHaveBeenCalledWith('Dynamic button clicked');
        logSpy.mockRestore();
    });
});



