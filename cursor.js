const cursorConfig = {};

class CustomCursorManager {
    constructor(config) {
        this.config = config;
        this.activeCursor = null;
        this.elements = new Map();
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCursors());
        } else {
            this.setupCursors();
        }
    }

    setupCursors() {
        Object.entries(this.config).forEach(([selector, options]) => {
            const elements = document.querySelectorAll(selector);
            
            if (elements.length === 0) {
                console.warn(`CustomCursorManager: No elements found for selector "${selector}"`);
                return;
            }

            elements.forEach(element => {
                this.attachCursor(element, options);
            });
        });
    }

    attachCursor(element, options) {
        const { image, hotspot = [0, 0] } = options;
        
        const cursorValue = this.buildCursorValue(image, hotspot);
        
        const originalCursor = element.style.cursor || 'default';
        
        const handleMouseEnter = () => {
            element.style.cursor = cursorValue;
            this.activeCursor = element;
        };
        
        const handleMouseLeave = () => {
            element.style.cursor = originalCursor;
            if (this.activeCursor === element) {
                this.activeCursor = null;
            }
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        this.elements.set(element, {
            handleMouseEnter,
            handleMouseLeave,
            originalCursor
        });
    }

    buildCursorValue(imagePath, hotspot) {
        const [x, y] = hotspot;
        return `url('${imagePath}') ${x} ${y}, auto`;
    }

    addCursor(selector, options) {
        this.config[selector] = options;
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Check if already attached
            if (!this.elements.has(element)) {
                this.attachCursor(element, options);
            }
        });
    }

    removeCursor(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const handlers = this.elements.get(element);
            if (handlers) {
                element.removeEventListener('mouseenter', handlers.handleMouseEnter);
                element.removeEventListener('mouseleave', handlers.handleMouseLeave);
                element.style.cursor = handlers.originalCursor;
                this.elements.delete(element);
            }
        });
        delete this.config[selector];
    }

    destroy() {
        this.elements.forEach((handlers, element) => {
            element.removeEventListener('mouseenter', handlers.handleMouseEnter);
            element.removeEventListener('mouseleave', handlers.handleMouseLeave);
            element.style.cursor = handlers.originalCursor;
        });
        this.elements.clear();
        this.config = {};
    }
}

const customCursorManager = new CustomCursorManager(cursorConfig);

export default customCursorManager;
export { cursorConfig };