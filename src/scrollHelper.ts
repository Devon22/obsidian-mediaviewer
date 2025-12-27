import { App } from 'obsidian';

/**
 * 尋找可捲動的容器元素
 * @param app Obsidian App 實例
 * @param startEl 起始元素（通常是 gallery 元素）
 * @returns 可捲動的容器元素，找不到則回傳 null
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
    const contentEl = (activeLeaf?.view as any)?.contentEl as HTMLElement | undefined;
    if (contentEl) {
        const cmScroller = contentEl.querySelector('.cm-scroller') as HTMLElement | null;
        if (cmScroller && cmScroller.scrollHeight > cmScroller.clientHeight) return cmScroller;

        const previewView = contentEl.querySelector('.markdown-preview-view') as HTMLElement | null;
        if (previewView && previewView.scrollHeight > previewView.clientHeight) return previewView;

        if (contentEl.scrollHeight > contentEl.clientHeight) return contentEl;
    }

    return null;
}

/**
 * 捕獲當前捲動位置並回傳還原函數
 * @param app Obsidian App 實例
 * @param galleryId Gallery 的唯一識別碼
 * @returns 還原捲動位置的函數
 */
export function captureScrollRestore(app: App, galleryId: string): ((newGalleryId?: string) => void) {
    const galleryEl = document.querySelector(`.mvgb-media-gallery-grid[data-gallery-id="${CSS.escape(galleryId)}"]`) as HTMLElement | null;
    const container = findScrollableContainer(app, galleryEl);
    const top = container ? container.scrollTop : 0;

    return (newGalleryId?: string) => {
        const targetId = newGalleryId || galleryId;
        const galleryElAfter = document.querySelector(
            `.mvgb-media-gallery-grid[data-gallery-id="${CSS.escape(targetId)}"]`
        ) as HTMLElement | null;
        const containerAfter = findScrollableContainer(app, galleryElAfter);

        const doRestore = () => {
            if (containerAfter) {
                containerAfter.scrollTop = top;
            } else if (galleryElAfter) {
                galleryElAfter.scrollIntoView({ block: 'center' });
            }
        };

        requestAnimationFrame(doRestore);
        setTimeout(doRestore, 50);
        setTimeout(doRestore, 250);
    };
}
