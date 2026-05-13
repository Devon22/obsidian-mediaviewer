import { App } from 'obsidian';

type ViewWithContentEl = {
    contentEl?: HTMLElement;
};

function getViewContentEl(view: unknown): HTMLElement | undefined {
    if (typeof view !== 'object' || view === null || !('contentEl' in view)) {
        return undefined;
    }

    const { contentEl } = view as ViewWithContentEl;
    return contentEl instanceof HTMLElement ? contentEl : undefined;
}

/**
 * 從指定元素往上尋找可捲動的容器。
 * @param app Obsidian App 物件
 * @param startEl 起始元素，通常是 gallery 元素
 * @returns 可捲動的容器，找不到時回傳 null
 */
export function findScrollableContainer(app: App, startEl: HTMLElement | null): HTMLElement | null {
    const isScrollable = (el: HTMLElement) => {
        try {
            const style = window.getComputedStyle(el);
            const overflowY = style.overflowY;
            const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
            return canScroll;
        } catch {
            return false;
        }
    };

    let el: HTMLElement | null = startEl;
    while (el) {
        if (isScrollable(el)) return el;
        el = el.parentElement;
    }

    const activeLeaf = app.workspace.getMostRecentLeaf();
    const contentEl = getViewContentEl(activeLeaf?.view);
    if (contentEl) {
        const cmScroller = contentEl.querySelector<HTMLElement>('.cm-scroller');
        if (cmScroller && cmScroller.scrollHeight > cmScroller.clientHeight) return cmScroller;

        const previewView = contentEl.querySelector<HTMLElement>('.markdown-preview-view');
        if (previewView && previewView.scrollHeight > previewView.clientHeight) return previewView;

        if (contentEl.scrollHeight > contentEl.clientHeight) return contentEl;
    }

    return null;
}

/**
 * 記錄目前捲動位置，並回傳可在重新渲染後還原位置的函式。
 * @param app Obsidian App 物件
 * @param galleryId Gallery 的唯一識別碼
 * @returns 還原捲動位置的函式
 */
export function captureScrollRestore(app: App, galleryId: string): ((newGalleryId?: string) => void) {
    const galleryEl = activeDocument.querySelector<HTMLElement>(`.mvgb-media-gallery-grid[data-gallery-id="${CSS.escape(galleryId)}"]`);
    const container = findScrollableContainer(app, galleryEl);
    const top = container ? container.scrollTop : 0;

    return (newGalleryId?: string) => {
        const targetId = newGalleryId || galleryId;
        const galleryElAfter = activeDocument.querySelector<HTMLElement>(
            `.mvgb-media-gallery-grid[data-gallery-id="${CSS.escape(targetId)}"]`
        );
        const containerAfter = findScrollableContainer(app, galleryElAfter);

        const doRestore = () => {
            if (containerAfter) {
                containerAfter.scrollTop = top;
            } else if (galleryElAfter) {
                galleryElAfter.scrollIntoView({ block: 'center' });
            }
        };

        window.requestAnimationFrame(doRestore);
        window.setTimeout(doRestore, 50);
        window.setTimeout(doRestore, 250);
    };
}
