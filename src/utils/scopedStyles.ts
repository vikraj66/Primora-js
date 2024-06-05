export function applyScopedStyles(uniqueId: string, styles: string): void {
    const style = document.createElement('style');
    style.textContent = styles.replace(/\.([a-zA-Z0-9_-]+)/g, `.${uniqueId}-$1`);
    document.head.appendChild(style);
}

export function loadAndApplyScopedStyles(uniqueId: string, cssFilePath: string): Promise<void> {
    return fetch(cssFilePath)
        .then(response => response.text())
        .then(cssText => {
            applyScopedStyles(uniqueId, cssText);
        })
        .catch(err => console.error('Failed to load CSS file:', err));
}
