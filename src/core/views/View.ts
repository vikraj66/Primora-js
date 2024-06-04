import { EjsRenderer } from '../../utils/ejsRenderer';
import { html } from '../../utils/htm';
import { Model } from '../models/Model';
interface HasId {
  id?: number;
}
export abstract class View<T extends Model<K>, K extends HasId> {

  regions: { [key: string]: Element } = {};
  constructor(public parent: Element, public model: T, public useEjs: boolean = false) {
    this.bindModel();
  }

  abstract template(): string;
  protected html = html;
  regionsMap(): { [key: string]: string } {
    return {};
  }

  eventsMap(): { [key: string]: () => void } {
    return {};
  }

  bindModel(): void {
    this.model.on('change', () => {
      this.render();
    });
  }

  bindEvents(fragment: DocumentFragment): void {
    const eventsMap = this.eventsMap();

    for (let eventKey in eventsMap) {
      const [eventName, selector] = eventKey.split(':');

      fragment.querySelectorAll(selector).forEach(element => {
        element.addEventListener(eventName, eventsMap[eventKey]);
      });
    }
  }

  mapRegions(fragment: DocumentFragment): void {
    const regionsMap = this.regionsMap();

    for (let key in regionsMap) {
      const selector = regionsMap[key];
      const element = fragment.querySelector(selector);

      if (element) {
        this.regions[key] = element;
      }
    }
  }

  onRender(): void { }

  render(): void {
    this.parent.innerHTML = '';
    const templateElement = document.createElement('template');
    const html = this.useEjs ? EjsRenderer.render(this.template(), this.model.toJson()) : this.template();
    templateElement.innerHTML = html;
    this.bindEvents(templateElement.content);
    this.mapRegions(templateElement.content);
    this.onRender();
    this.parent.append(templateElement.content);
  }
}
