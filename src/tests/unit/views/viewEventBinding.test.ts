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

describe('ViewEventBinding', () => {
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

    it('should bind click event to button', () => {
        console.log("CHALLO")
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

        console.log("CHALLO2")

        console.log("CHALLO3")
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        console.info("PARENT ELEMENT", parentElement.innerHTML)
        const button = parentElement.querySelector('.click-me') as HTMLButtonElement;
        button.click();

        expect(logSpy).toHaveBeenCalledWith('Button clicked');
        logSpy.mockRestore();
    });

    it('should bind multiple events to different elements', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `
                    <button class="click-me">Click Me</button>
                    <input class="input-field" />
                `;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.click-me': this.onClick,
                    'input:.input-field': this.onInput
                };
            }

            onClick(event: Event): void {
                console.log('Button clicked');
            }

            onInput(event: Event): void {
                console.log('Input changed');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const button = parentElement.querySelector('.click-me') as HTMLButtonElement;
        const input = parentElement.querySelector('.input-field') as HTMLInputElement;

        button.click();
        input.dispatchEvent(new Event('input'));

        expect(logSpy).toHaveBeenCalledWith('Button clicked');
        expect(logSpy).toHaveBeenCalledWith('Input changed');
        logSpy.mockRestore();
    });

    it('should bind events to dynamically added elements', () => {
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
                console.info("INNERHTML_INFO1", this.parent.innerHTML);
                console.info("PARENT_INNERHTML", this.parent);
                const container = this.parent.querySelector('.container') as HTMLElement;
                container.innerHTML = `<button class="dynamic-button">Dynamic Button</button>`;
                console.info("INNERHTML_INFO2", this.parent.innerHTML);
            }
        }
    
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model, false , false);
        view.render();
    
        const button = parentElement.querySelector('.dynamic-button') as HTMLButtonElement;
        console.info("BUTTON_INFO", button);
        button.click();
    
        expect(logSpy).toHaveBeenCalledWith('Dynamic button clicked');
        logSpy.mockRestore();
    });
    

    it('should unbind events when the view is re-rendered', () => {
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
        const view = new TestView(parentElement, model);
        view.render();

        const button = parentElement.querySelector('.click-me') as HTMLButtonElement;
        button.click();

        view.render();
        button.click();

        expect(logSpy).toHaveBeenCalledTimes(2);
        logSpy.mockRestore();
    });

    it('should not bind events to non-existing elements', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div>No button here</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.non-existing-button': this.onClick
                };
            }

            onClick(event: Event): void {
                console.log('Button clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const button = parentElement.querySelector('.non-existing-button') as HTMLButtonElement;
        if (button) {
            button.click();
        }

        expect(logSpy).not.toHaveBeenCalled();
        logSpy.mockRestore();
    });

    it('should handle events correctly after model changes', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<button class="click-me">${this.model.get('name')}</button>`;
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
        const view = new TestView(parentElement, model);
        view.render();

        model.set({ name: 'Jane Doe' });
        view.render();

        const button = parentElement.querySelector('.click-me') as HTMLButtonElement;
        button.click();

        expect(logSpy).toHaveBeenCalledWith('Button clicked');
        logSpy.mockRestore();
    });

    it('should bind focus event to input', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<input class="focus-me" />`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'focus:.focus-me': this.onFocus
                };
            }

            onFocus(event: Event): void {
                console.log('Input focused');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const input = parentElement.querySelector('.focus-me') as HTMLInputElement;
        input.focus();

        expect(logSpy).toHaveBeenCalledWith('Input focused');
        logSpy.mockRestore();
    });

    it('should bind mouseover event to div', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="hover-me">Hover over me</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'mouseover:.hover-me': this.onMouseOver
                };
            }

            onMouseOver(event: Event): void {
                console.log('Mouse over div');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const div = parentElement.querySelector('.hover-me') as HTMLDivElement;
        div.dispatchEvent(new MouseEvent('mouseover'));

        expect(logSpy).toHaveBeenCalledWith('Mouse over div');
        logSpy.mockRestore();
    });

    it('should bind submit event to form', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<form class="submit-me"><button type="submit">Submit</button></form>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'submit:.submit-me': this.onSubmit
                };
            }

            onSubmit(event: Event): void {
                event.preventDefault(); // Prevent actual form submission
                console.log('Form submitted');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const form = parentElement.querySelector('.submit-me') as HTMLFormElement;
        form.dispatchEvent(new Event('submit'));

        expect(logSpy).toHaveBeenCalledWith('Form submitted');
        logSpy.mockRestore();
    });

    it('should handle event delegation for child elements', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="parent"><button class="child">Click Me</button></div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'click:.parent': this.onParentClick
                };
            }

            onParentClick(event: Event): void {
                const target = event.target as HTMLElement;
                if (target.classList.contains('child')) {
                    console.log('Child button clicked');
                }
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const button = parentElement.querySelector('.child') as HTMLButtonElement;
        button.click();

        expect(logSpy).toHaveBeenCalledWith('Child button clicked');
        logSpy.mockRestore();
    });

    it('should bind custom events', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="custom-event">Custom Event</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'custom:.custom-event': this.onCustomEvent
                };
            }

            onCustomEvent(event: Event): void {
                console.log('Custom event triggered');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const div = parentElement.querySelector('.custom-event') as HTMLDivElement;
        const event = new Event('custom', { bubbles: true, cancelable: true });
        div.dispatchEvent(event);

        expect(logSpy).toHaveBeenCalledWith('Custom event triggered');
        logSpy.mockRestore();
    });

    it('should bind double click event to button', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<button class="double-click-me">Double Click Me</button>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'dblclick:.double-click-me': this.onDoubleClick
                };
            }

            onDoubleClick(event: Event): void {
                console.log('Button double-clicked');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const button = parentElement.querySelector('.double-click-me') as HTMLButtonElement;
        button.dispatchEvent(new MouseEvent('dblclick'));

        expect(logSpy).toHaveBeenCalledWith('Button double-clicked');
        logSpy.mockRestore();
    });

    it('should bind change event to select', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<select class="change-me"><option value="1">One</option><option value="2">Two</option></select>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'change:.change-me': this.onChange
                };
            }

            onChange(event: Event): void {
                console.log('Select value changed');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const select = parentElement.querySelector('.change-me') as HTMLSelectElement;
        select.value = '2';
        select.dispatchEvent(new Event('change'));

        expect(logSpy).toHaveBeenCalledWith('Select value changed');
        logSpy.mockRestore();
    });

    it('should bind keydown event to input', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<input class="keydown-me" />`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'keydown:.keydown-me': this.onKeyDown
                };
            }

            onKeyDown(event: Event): void {
                console.log('Key down event triggered');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const input = parentElement.querySelector('.keydown-me') as HTMLInputElement;
        input.dispatchEvent(new KeyboardEvent('keydown'));

        expect(logSpy).toHaveBeenCalledWith('Key down event triggered');
        logSpy.mockRestore();
    });

    it('should bind mouseout event to div', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="mouseout-me">Mouse out of me</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'mouseout:.mouseout-me': this.onMouseOut
                };
            }

            onMouseOut(event: Event): void {
                console.log('Mouse out event triggered');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const div = parentElement.querySelector('.mouseout-me') as HTMLDivElement;
        div.dispatchEvent(new MouseEvent('mouseout'));

        expect(logSpy).toHaveBeenCalledWith('Mouse out event triggered');
        logSpy.mockRestore();
    });

    it('should bind contextmenu event to div', () => {
        class TestView extends View<Model<TestProps>, TestProps> {
            template(): string {
                return `<div class="contextmenu-me">Right-click on me</div>`;
            }

            eventsMap(): { [key: string]: (event: Event) => void } {
                return {
                    'contextmenu:.contextmenu-me': this.onContextMenu
                };
            }

            onContextMenu(event: Event): void {
                event.preventDefault(); // Prevent the actual context menu from appearing
                console.log('Context menu event triggered');
            }
        }

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const view = new TestView(parentElement, model);
        view.render();

        const div = parentElement.querySelector('.contextmenu-me') as HTMLDivElement;
        div.dispatchEvent(new MouseEvent('contextmenu'));

        expect(logSpy).toHaveBeenCalledWith('Context menu event triggered');
        logSpy.mockRestore();
    });
});
