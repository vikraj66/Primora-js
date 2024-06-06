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


describe('ViewAdditionalTest', () => {
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

    it("should apply scoped styles correctly", () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="test-class">Content</div>`
            }
        }
        const view = new TestView(parentElement, model, false, true);
        view.render();
        const uniqueId = view.getUniqueId();
        const div = parentElement.querySelector(`.${uniqueId}-test-class`) as HTMLDivElement;
        expect(div).not.toBeNull();
    })

    it("should bind click event to dynamically added element", () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="container"></div>`
            }

            eventsMap(): { [key: string]: (event: Event) => void; } {
                return {
                    'click:.dynamic-button': this.onDynamicClick
                }
            }

            onDynamicClick(event: Event): void {
                console.log('Dynamic button clicked');
            }

            onRender(): void {
                const container = this.parent.querySelector('.container') as HTMLElement;
                container.innerHTML = `<button class="dynamic-button">Dynamic Button</button>`;
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        const button = parentElement.querySelector(`.${uniqueId}-dynamic-button`) as HTMLButtonElement;
        expect(button).not.toBeNull();

        button.click();
        expect(logSpy).toHaveBeenCalledWith('Dynamic button clicked');
        logSpy.mockRestore();
    })


    it("should handle multiple event with scoped styles", () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="container">
                    <button class="button1">Button 1</button>
                    <button class="button2">Button 2</button>
                </div>`
            }

            eventsMap(): { [key: string]: (event: Event) => void; } {
                return {
                    'click:.button1': this.onButton1Click,
                    'click:.button2': this.onButton2Click
                }
            }

            onButton1Click(event: Event): void {
                console.log('Button 1 clicked');
            }

            onButton2Click(event: Event): void {
                console.log('Button 2 clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        const button1 = parentElement.querySelector(`.${uniqueId}-button1`) as HTMLButtonElement;
        const button2 = parentElement.querySelector(`.${uniqueId}-button2`) as HTMLButtonElement;
        expect(button1).not.toBeNull();
        expect(button2).not.toBeNull();

        button1.click();
        expect(logSpy).toHaveBeenCalledWith('Button 1 clicked');
        button2.click();
        expect(logSpy).toHaveBeenCalledWith('Button 2 clicked');
        logSpy.mockRestore();
    })

    it("should correctly map regions with dynamic elements and scoped styles", () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="container">
                </div>`
            }

            regionsMap(): { [key: string]: string } {
                return {
                    dynamicRegion: '.dynamic-region'
                }
            }

            onRender(): void {
                const container = this.parent.querySelector('.container') as HTMLElement;
                container.innerHTML = `<div class="dynamic-region">Dynamic Region</div>`;
            }
        }

        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        expect(view.regions.dynamicRegion).toBeTruthy();
        expect(view.regions.dynamicRegion?.classList.contains(`${uniqueId}-dynamic-region`)).toBeTruthy();
    })

    it('should apply styles from string correctly with scoped styles enabled', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="styled-element">Styled Element</div>`;
            }

            styles(): string {
                return `.styled-element { color: red; }`;
            }
        }

        const view = new TestView(parentElement, model, false, true);
        view.render();

        const uniqueId = view.getUniqueId();
        const element = parentElement.querySelector(`.${uniqueId}-styled-element`) as HTMLElement;
        expect(element).not.toBeNull();
        expect(window.getComputedStyle(element).color).toBe('red');
    });

    it('should apply styles from file correctly with scoped styles enabled', async () => {
        const fakeCss = `.file-styled-element { color: blue; }`;

        // Creating a detailed mock for fetch
        const fetchMock = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                text: () => Promise.resolve(fakeCss),
                headers: new Headers(),
                redirected: false,
                type: 'basic',
                url: '',
                clone: jest.fn(),
                body: null,
                bodyUsed: false,
                arrayBuffer: jest.fn(),
                blob: jest.fn(),
                formData: jest.fn(),
                json: jest.fn(),
            } as unknown as Response)
        );
        global.fetch = fetchMock as jest.Mock;

        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="file-styled-element">File Styled Element</div>`;
            }

            cssFilePath(): string {
                return '/path/to/fake.css';
            }
        }

        const view = new TestView(parentElement, model, false, true);
        await view.render();

        await new Promise(r => setTimeout(r, 1000))
        
        const uniqueId = view.getUniqueId();
        const element = parentElement.querySelector(`.${uniqueId}-file-styled-element`) as HTMLElement;
        expect(element).not.toBeNull();
        expect(window.getComputedStyle(element).color).toBe('blue');

        // Clean up the mock to avoid affecting other tests
        fetchMock.mockClear();
        delete global.fetch;
    });
})