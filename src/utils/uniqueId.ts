export function generateUniqueId(prefix: string = 'component'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
