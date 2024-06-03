import ejs from 'ejs';

export class EjsRenderer {
    static render(template: string, data: object): string {
        return ejs.render(template, data);
    }
}