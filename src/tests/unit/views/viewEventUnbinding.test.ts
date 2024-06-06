/**
 * @jest-environment jsdom
 */

import { View } from '@/core/views/View';
import { Model } from '@/core/models/Model';
import { Attributes } from '@/core/models/Attributes';
import { Eventing } from '@/core/models/Eventing';

interface TestProps {
    name: string;
    id: number;
}

class TestView extends View<Model<TestProps>, TestProps> {
    template(): string {
        return `<button class="click-me">Click Me</button>`;
    }

    eventsMap(): { [key: string]: (event: Event) => void } {
        return {
            'click:.click-me': this.onClick,
        };
    }

    onClick(event: Event): void {
        console.log('Button clicked');
    }
}

describe('View Event Unbinding', () => {
    let model: Model<TestProps>;
    let parentElement: HTMLElement;

    beforeEach(() => {
        model = new Model<TestProps>(new Attributes<TestProps>({ name: 'Test', id: 1 }), new Eventing(), null);
        parentElement = document.createElement('div');
        document.body.appendChild(parentElement); // Append to body for the test
    });

    afterEach(() => {
        document.body.removeChild(parentElement); // Clean up after each test
    });

    it('should unbind events when view is removed', () => {
        const view = new TestView(parentElement, model);
        view.render();

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        const button = parentElement.querySelector('.click-me') as HTMLButtonElement;

        button.click();
        expect(logSpy).toHaveBeenCalledWith('Button clicked');

        parentElement.innerHTML = ''; // Simulate removing the view from the DOM

        // Attempt to access the button again and trigger the click
        const removedButton = parentElement.querySelector('.click-me') as HTMLButtonElement;
        if (removedButton) {
            removedButton.click();
        }

        expect(logSpy).toHaveBeenCalledTimes(1); // Should still be 1 because the second click should not log

        logSpy.mockRestore();
    });
});
