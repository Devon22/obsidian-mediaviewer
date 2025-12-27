import { App, TFile, Menu, Notice, Platform } from 'obsidian';
import MediaViewPlugin from './main';
import { FullScreenModal } from './fullscreen';
import { MediaViewSettings } from './settings';
import { ImageUploadModal } from './imageUpload';
import { GalleryBlockGenerateModal } from './galleryBlockGenerate';
import { t } from './translations';
import { captureScrollRestore } from './scrollHelper';

interface GalleryItem {
    type: 'image' | 'video' | 'note' | string;
    url?: string;
    path?: string;
    title?: {
        type: 'internal' | 'external' | 'text' | string;
        url?: string;
        text: string;
    } | string | null;
    linkUrl?: string | null;
    file?: TFile | null;
    isInternalLink?: boolean;
    isExternalLink?: boolean;
    thumbnail?: string | null;
    originalBlock?: string;
    loc?: { start: number; end: number };
}

interface ContainerInfo {
    title: {
        type: 'internal' | 'external' | 'text' | string;
        url?: string;
        text: string;
    } | string | null;
    addButtonEnabled: boolean;
    gridSize: string;
    paginationEnabled: number;
}

interface MediaUrlsData {
    items: GalleryItem[];
    headerLines: string[];
    containerInfo: ContainerInfo;
    galleryId: string;
    sourcePath?: string;
    isFiltered?: boolean;
}

export class GalleryBlock {
    app: App;
    plugin: MediaViewPlugin;
    static paginationState: Map<string, number> = new Map();

    constructor(app: App, plugin: MediaViewPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    // 處理 gallery 區塊
    async processGalleryBlock(source: string, el: HTMLElement, sourcePath?: string): Promise<void> {
        if (el.querySelector('.mvgb-media-gallery-grid')) {
            return;
        }

        try {
            const mediaUrlsData = await this.parseGalleryContent(source, sourcePath);
            const galleryDiv = this.createGalleryElement(mediaUrlsData);
            el.appendChild(galleryDiv);
        } catch (error) {
            console.error('Error processing gallery block:', error);
        }
    }

    // 解析 gallery 內容
    async parseGalleryContent(content: string, sourcePath?: string, skipFilter: boolean = false): Promise<MediaUrlsData> {
        const items: GalleryItem[] = [];
        const lines = content.split('\n');

        const headerLines: string[] = [];
        let pendingItemLines: string[] = [];

        let currentTitle = null;
        let currentLinkUrl = null;
        let currentThumbnail = null;
        let containerTitle = null;
        let addButtonEnabled = false;
        let gridSize = this.plugin.settings.galleryGridSize || 'medium';
        let paginationEnabled = this.plugin.settings.itemsPerPage || 0; // 設定變數以決定是否開啟分頁功能
        let filterKeyword: string | null = null; // 新增搜尋關鍵字

        // 產生基於內容的唯一識別碼
        const galleryId = 'gallery-' + this.hashString(content.trim());

        // 處理縮圖連結的輔助函數
        const processMediaLink = (linkText: string) => {
            // 處理 Obsidian 內部連結 ![[file]]
            const internalMatch = linkText.match(/!\[\[(.*?)\]\]/);
            if (internalMatch) {
                const file = this.app.metadataCache.getFirstLinkpathDest(internalMatch[1], '');
                if (file) {
                    return this.app.vault.getResourcePath(file);
                }
            }

            // 處理標準 Markdown 連結 ![alt](path)
            const markdownMatch = linkText.match(/!\[(.*?)\]\((.*?)\)/);
            if (markdownMatch) {
                const url = markdownMatch[2].split(' "')[0];
                if (url.startsWith('http')) {
                    return url;
                } else {
                    const file = this.app.metadataCache.getFirstLinkpathDest(url, '');
                    if (!file) {
                        const fileByPath = this.app.vault.getAbstractFileByPath(url);
                        if (fileByPath && fileByPath instanceof TFile) {
                            return this.app.vault.getResourcePath(fileByPath);
                        }
                    } else {
                        return this.app.vault.getResourcePath(file);
                    }
                }
            }

            // 處理直接的 URL 或路徑 (僅img參數)
            if (linkText.startsWith('http')) {
                return linkText;
            } else {
                const file = this.app.vault.getAbstractFileByPath(linkText);
                if (file instanceof TFile) {
                    return this.app.vault.getResourcePath(file);
                }
            }

            return null;
        };

        // 新增：處理筆記內容中的第一張圖片
        const findFirstImageInNote = async (file: TFile) => {
            try {
                const content = await this.app.vault.cachedRead(file);
                const internalMatch = content.match(/(?:!?\[\[(.*?\.(?:jpg|jpeg|png|gif|webp))(?:\|.*?)?\]\]|!\[(.*?)\]\(\s*(\S+?(?:\.(?:jpg|jpeg|png|gif|webp)|format=(?:jpg|jpeg|png|gif|webp))[^\s)]*)\s*(?:\s+["'][^"']*["'])?\s*\))/i);
                if (internalMatch) {
                    if (internalMatch[1]) {
                        return `![[${internalMatch[1]}]]`;
                    }
                    return internalMatch[0];
                } else {
                    return null;
                }
            } catch (error) {
                console.error('Error reading note content:', error);
                return null;
            }
        };

        let tempStartLine = -1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                if (pendingItemLines.length > 0) {
                    pendingItemLines.push(line);
                } else {
                    headerLines.push(line);
                }
                continue;
            }

            const paginationMatch = trimmedLine.match(/^pagination:\s*(\d+)$/i);
            if (paginationMatch) {
                headerLines.push(line);
                const paginationValue = parseInt(paginationMatch[1]);
                paginationEnabled = paginationValue || 0;
                continue;
            }

            // 新增 filter 參數的處理
            const filterMatch = trimmedLine.match(/^filter:\s*(.*?)\s*$/i);
            if (filterMatch) {
                headerLines.push(line);
                const keyword = filterMatch[1].trim().toLowerCase();
                if (keyword && keyword !== 'null' && keyword !== 'undefined') {
                    filterKeyword = keyword;
                }
                continue;
            }

            // 新增 size 參數的處理
            const sizeMatch = trimmedLine.match(/^size:\s*(small|medium|large)$/i);
            if (sizeMatch) {
                headerLines.push(line);
                gridSize = sizeMatch[1].toLowerCase();
                continue;
            }

            // 檢查是否要禁用新增按鈕
            const addButtonMatch = trimmedLine.match(/^addbutton:\s*(true|false)$/i);
            if (addButtonMatch) {
                headerLines.push(line);
                addButtonEnabled = addButtonMatch[1].toLowerCase() === 'true';
                continue;
            }

            // 檢查是否為容器標題設定
            const containerTitleMatch = trimmedLine.match(/^title:\s*(.+)$/);
            if (containerTitleMatch) {
                headerLines.push(line);
                const titleText = containerTitleMatch[1];

                // 檢查是否為內部連結 [[note]]
                const internalLinkMatch = titleText.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
                if (internalLinkMatch) {
                    const linktext = internalLinkMatch[1].split('|')[0].split('#')[0];
                    const file = this.app.metadataCache.getFirstLinkpathDest(linktext, '');
                    containerTitle = {
                        text: linktext,
                        url: file ? file.path : linktext,
                        type: 'internal'
                    };
                }
                // 檢查是否為外部連結 [text](url)
                else {
                    const externalLinkMatch = titleText.match(/\[(.*?)\]\((.*?)\)/);
                    if (externalLinkMatch) {
                        containerTitle = {
                            text: externalLinkMatch[1],
                            url: externalLinkMatch[2],
                            type: 'external'
                        };
                    } else {
                        // 純文字
                        containerTitle = {
                            text: titleText,
                            type: 'text'
                        };
                    }
                }
                continue;
            }

            // 檢查是否為個別圖片的標題設定
            const titleMatch = trimmedLine.match(/^alt:\s*(.+)$/);
            if (titleMatch) {
                if (pendingItemLines.length === 0) tempStartLine = i;
                pendingItemLines.push(line);
                const titleText = titleMatch[1];

                // 檢查是否為內部連結
                const internalLinkMatch = titleText.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
                if (internalLinkMatch) {
                    const linktext = internalLinkMatch[1].split('|')[0].split('#')[0];
                    const file = this.app.metadataCache.getFirstLinkpathDest(linktext, '');
                    currentTitle = {
                        text: linktext,
                        url: file ? file.path : linktext,
                        type: 'internal'
                    };
                }
                // 檢查是否為外部連結
                else {
                    const externalLinkMatch = titleText.match(/\[(.*?)\]\((.*?)\)/);
                    if (externalLinkMatch) {
                        currentTitle = {
                            text: externalLinkMatch[1],
                            url: externalLinkMatch[2],
                            type: 'external'
                        };
                    } else {
                        // 純文字
                        currentTitle = {
                            text: titleText,
                            type: 'text'
                        };
                    }
                }
                continue;
            }

            // 檢查是否為縮圖設定
            const thumbnailMatch = trimmedLine.match(/^img:\s*(.+)$/);
            if (thumbnailMatch) {
                if (pendingItemLines.length === 0) tempStartLine = i;
                pendingItemLines.push(line);
                const imageUrl = thumbnailMatch[1].trim();
                const isImageFile = /\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|tif)$/i.test(imageUrl) || /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|bmp|svg|tiff|tif)$/i.test(imageUrl);
                if (isImageFile) {
                    currentThumbnail = processMediaLink(`![Image](${imageUrl})`);
                } else {
                    currentThumbnail = processMediaLink(imageUrl);
                }
                continue;
            }

            // 處理筆記連結
            const internalMatch = line.match(/(!?)\[\[(.*?)(?:\|.*?)?\]\]/);
            if (internalMatch) {
                if (pendingItemLines.length === 0) tempStartLine = i;
                pendingItemLines.push(line);
                const originalBlock = pendingItemLines.join('\n');
                pendingItemLines = [];

                const [_, isImage, linktext] = internalMatch;
                const actualLinktext = linktext.split('|')[0].split('#')[0];
                const file = this.app.metadataCache.getFirstLinkpathDest(actualLinktext, '');

                if (isImage && !currentThumbnail) {
                    // 處理一般的圖片/媒體連結
                    if (file) {
                        const extension = file.extension.toLowerCase();
                        if (extension.match(/^(jpg|jpeg|png|gif|webp|mp4|mkv|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/)) {
                            items.push({
                                type: extension.match(/^(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
                                url: this.app.vault.getResourcePath(file),
                                path: file.path,
                                title: currentTitle,
                                linkUrl: currentLinkUrl,
                                originalBlock: originalBlock,
                                loc: { start: tempStartLine, end: i }
                            });
                        }
                    }
                } else {
                    // 處理筆記連結
                    if (file && !currentThumbnail) {
                        // 尋找筆記中的第一張圖片
                        const firstImage = await findFirstImageInNote(file);
                        if (firstImage) {
                            currentThumbnail = processMediaLink(firstImage);
                        }
                    }

                    items.push({
                        type: 'note',
                        title: currentTitle || actualLinktext,
                        path: file ? file.path : actualLinktext,
                        linkUrl: currentLinkUrl,
                        file: file,
                        isInternalLink: true,
                        thumbnail: currentThumbnail,
                        originalBlock: originalBlock,
                        loc: { start: tempStartLine, end: i }
                    });
                }
                currentTitle = null;
                currentLinkUrl = null;
                currentThumbnail = null;
                continue;
            }

            // 處理標準 Markdown 連結
            const markdownMatch = line.match(/(!?)\[(.*?)(?:\|.*?)?\]\((.*?)\)/);
            if (markdownMatch) {
                if (pendingItemLines.length === 0) tempStartLine = i;
                pendingItemLines.push(line);
                const originalBlock = pendingItemLines.join('\n');
                pendingItemLines = [];

                const [_, isImage, text, url] = markdownMatch;

                if (isImage && !currentThumbnail) {
                    // 處理一般的圖片連結
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        // 使用 getFirstLinkpathDest 來解析路徑
                        const file = this.app.metadataCache.getFirstLinkpathDest(url, '');
                        if (!file) {
                            // 如果找不到檔案，再嘗試直接用路徑查找
                            const fileByPath = this.app.vault.getAbstractFileByPath(url);
                            if (fileByPath && fileByPath instanceof TFile) {
                                const extension = fileByPath.extension.toLowerCase();
                                items.push({
                                    type: extension.match(/\.(mp4|mkv|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/) ? 'video' : 'image',
                                    url: this.app.vault.getResourcePath(fileByPath),
                                    path: text || fileByPath.path,
                                    title: currentTitle,
                                    linkUrl: currentLinkUrl,
                                    originalBlock: originalBlock,
                                    loc: { start: tempStartLine, end: i }
                                });
                            }
                        } else {
                            const extension = file.extension.toLowerCase();
                            items.push({
                                type: extension.match(/^(mp4|mkv|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/) ? 'video' : 'image',
                                url: this.app.vault.getResourcePath(file),
                                path: text || file.path,
                                title: currentTitle,
                                linkUrl: currentLinkUrl,
                                originalBlock: originalBlock,
                                loc: { start: tempStartLine, end: i }
                            });
                        }
                    } else {
                        const urlForTypeCheck = url.split(' "')[0].split('?')[0].toLowerCase();
                        const isImageFile = urlForTypeCheck.match(/\.(mp4|mkv|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/);
                        items.push({
                            type: isImageFile ? 'video' : 'image',
                            url: url.split(' "')[0],
                            path: text,
                            title: currentTitle,
                            linkUrl: currentLinkUrl,
                            originalBlock: originalBlock,
                            loc: { start: tempStartLine, end: i }
                        });
                    }
                } else {
                    // 處理一般連結
                    items.push({
                        type: 'note',
                        title: currentTitle || text,
                        path: url,
                        linkUrl: url,
                        isExternalLink: url.startsWith('http://') || url.startsWith('https://'),
                        thumbnail: currentThumbnail,
                        originalBlock: originalBlock,
                        loc: { start: tempStartLine, end: i }
                    });
                }
                currentTitle = null;
                currentLinkUrl = null;
                currentThumbnail = null;
                continue;
            }

            if (pendingItemLines.length > 0) {
                pendingItemLines.push(line);
            } else {
                headerLines.push(line);
            }
        }

        const shouldFilter = !!filterKeyword && filterKeyword.trim() !== '' && !skipFilter;
        const finalItems = shouldFilter ? items.filter(item => {
            const titleText = typeof item.title === 'string' ? item.title : (item.title ? (item.title as any).text : '');
            const textToFilter = (titleText || '') + (item.path || '') + (item.url || '');
            return textToFilter.toLowerCase().includes(filterKeyword!);
        }) : items;

        return {
            items: finalItems,
            headerLines: headerLines,
            containerInfo: {
                title: containerTitle,
                addButtonEnabled: addButtonEnabled,
                gridSize: gridSize,
                paginationEnabled: paginationEnabled
            },
            galleryId: galleryId,
            sourcePath: sourcePath,
            isFiltered: shouldFilter
        };
    }

    hashString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    createGalleryElement(mediaUrlsData: MediaUrlsData) {
        const { items, containerInfo, galleryId, sourcePath } = mediaUrlsData;
        const titleDiv = document.createElement('div');
        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'mvgb-media-gallery-grid';

        // 使用從 mediaUrlsData 中取得的 galleryId
        galleryDiv.setAttribute('data-gallery-id', galleryId);

        // 根據 size 參數添加對應的 class 並設定寬度
        galleryDiv.addClass(`size-${containerInfo.gridSize}`);
        const propertyName = `galleryGridSize${containerInfo.gridSize.charAt(0).toUpperCase() + containerInfo.gridSize.slice(1)}` as keyof MediaViewSettings;
        const width = this.plugin.settings[propertyName];
        galleryDiv.style.gridTemplateColumns = `repeat(auto-fill, minmax(${width}px, 1fr))`;

        // 處理容器標題
        if (typeof containerInfo.title === 'object' && containerInfo.title !== null) {
            const containerLinkArea = titleDiv.createEl('div', {
                cls: 'mvgb-container-link-area'
            });

            if (containerInfo.title.type === 'text') {
                // 純文字
                containerLinkArea.createEl('span', {
                    text: containerInfo.title.text
                });
            } else {
                // 內部或外部連結
                const link = containerLinkArea.createEl('a', {
                    text: containerInfo.title.text
                });
                if (containerInfo.title.url) {
                    if (containerInfo.title.type === 'internal') {
                        // 內部連結
                        const file = this.app.vault.getAbstractFileByPath(containerInfo.title.url);
                        if (file instanceof TFile) {
                            link.onclick = (e) => {
                                e.preventDefault();
                                const leaf = this.app.workspace.getLeaf('tab');
                                leaf.openFile(file);
                            };
                        }
                    } else {
                        // 外部連結
                        link.href = encodeURI(containerInfo.title.url);
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.onclick = (e) => {
                            e.stopPropagation();
                        };
                    }
                }
            }

            galleryDiv.style.borderRadius = '0 8px 8px 8px';
        }

        const container = document.createElement('div');
        container.className = 'mvgb-media-container';
        container.appendChild(titleDiv);
        container.appendChild(galleryDiv);

        // 處理分頁和新增按鈕
        const itemsPerPage = containerInfo.paginationEnabled || this.plugin.settings.itemsPerPage || 0;

        // 當 itemsPerPage 為 0 或項目數量不足時，顯示所有項目
        if (itemsPerPage <= 0 || items.length <= itemsPerPage) {
            // 顯示所有項目
            items.forEach((item: GalleryItem, index: number) => {
                if (item.type === 'note') {
                    const noteContainer = this.createNoteContainer(item, index, items, galleryId, sourcePath, mediaUrlsData.isFiltered);
                    galleryDiv.appendChild(noteContainer);
                } else {
                    const mediaContainer = this.createMediaContainer(item, index, items, galleryId, sourcePath, mediaUrlsData.isFiltered);
                    galleryDiv.appendChild(mediaContainer);
                }
            });

            // 不使用分頁時，如果允許新增圖片，則顯示傳統的新增按鈕
            if (containerInfo.addButtonEnabled || items.length === 0) {
                const addContainer = document.createElement('div');
                addContainer.className = 'mv-media-thumbnail-container mvgb-add-media-button';

                const addIcon = addContainer.createDiv('mvgb-add-media-icon');
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('fill', 'currentColor');
                path.setAttribute('d', 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z');
                svg.appendChild(path);
                addIcon.appendChild(svg);

                const addIconText = document.createElement('div');
                addIconText.className = 'mvgb-add-media-text';
                addIconText.textContent = t('add_image');
                addIcon.appendChild(addIconText);

                addContainer.onclick = () => {
                    const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv, sourcePath);
                    modal.open();
                };

                galleryDiv.appendChild(addContainer);
            }
        } else {
            // 使用分頁顯示
            const totalPages = Math.ceil(items.length / itemsPerPage);
            let currentPage = 1;

            // 檢查是否有儲存此 Gallery 的狀態
            if (GalleryBlock.paginationState.has(galleryId)) {
                const savedPage = GalleryBlock.paginationState.get(galleryId);
                if (savedPage) {
                    currentPage = Math.min(savedPage, totalPages);
                }
                GalleryBlock.paginationState.delete(galleryId);
            }

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'mvgb-gallery-controls';

            const paginationDiv = document.createElement('div');
            paginationDiv.className = 'mvgb-pagination';

            const prevPageButton = paginationDiv.createEl('button', {
                cls: 'mvgb-gallery-control-button prev-page-button',
                text: t('prev_page')
            });

            const pageInfoSpan = paginationDiv.createEl('span', {
                cls: 'mvgb-page-info',
                text: `${currentPage} / ${totalPages}`
            });

            const nextPageButton = paginationDiv.createEl('button', {
                cls: 'mvgb-gallery-control-button next-page-button',
                text: t('next_page')
            });

            // 儲存當前頁碼到按鈕上，以便更新時使用
            paginationDiv.dataset.currentPage = currentPage.toString();

            prevPageButton.onclick = () => {
                const currentPage = parseInt(paginationDiv.dataset.currentPage || '0');
                // 如果是第一頁，則跳到最後一頁，否則往前一頁
                if (currentPage !== 0) {
                    const newPage = currentPage === 1 ? totalPages : currentPage - 1;
                    paginationDiv.dataset.currentPage = newPage.toString();
                    this.updateGalleryPage(galleryDiv, items, newPage, itemsPerPage, sourcePath);
                }
            };

            nextPageButton.onclick = () => {
                const currentPage = parseInt(paginationDiv.dataset.currentPage || '0');
                // 如果是最後一頁，則跳到第一頁，否則往後一頁
                if (currentPage !== 0) {
                    const newPage = currentPage === totalPages ? 1 : currentPage + 1;
                    paginationDiv.dataset.currentPage = newPage.toString();
                    this.updateGalleryPage(galleryDiv, items, newPage, itemsPerPage, sourcePath);
                }
            };

            // 新增圖片按鈕移到分頁控制項旁邊
            if (containerInfo.addButtonEnabled || items.length === 0) {
                const addButton = paginationDiv.createEl('button', {
                    cls: 'mvgb-gallery-control-button mvgb-add-image-button',
                    text: t('add_image')
                });
                addButton.onclick = () => {
                    const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv, sourcePath);
                    modal.open();
                };
            }

            paginationDiv.appendChild(prevPageButton);
            paginationDiv.appendChild(pageInfoSpan);
            paginationDiv.appendChild(nextPageButton);
            controlsDiv.appendChild(paginationDiv);
            container.appendChild(controlsDiv);

            controlsDiv.appendChild(paginationDiv);
            container.appendChild(controlsDiv);

            // 初始化第一頁
            this.updateGalleryPage(galleryDiv, items, currentPage, itemsPerPage, sourcePath, mediaUrlsData.isFiltered);
        }

        // 加入拖曳事件處理
        galleryDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            galleryDiv.addClass('drag-over');
            // 根據滑鼠位置決定左右區域並加上對應樣式
            const rect = galleryDiv.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            const clientX = (e as DragEvent).clientX;
            if (clientX < midX) {
                galleryDiv.addClass('drag-left');
                galleryDiv.removeClass('drag-right');
            } else {
                galleryDiv.addClass('drag-right');
                galleryDiv.removeClass('drag-left');
            }
        });

        galleryDiv.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            galleryDiv.removeClass('drag-over');
            galleryDiv.removeClass('drag-left');
            galleryDiv.removeClass('drag-right');
        });

        galleryDiv.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            galleryDiv.removeClass('drag-over');
            galleryDiv.removeClass('drag-left');
            galleryDiv.removeClass('drag-right');

            // 計算是否落在右側（右側代表加到最後，左側代表加到最前）
            const rect = galleryDiv.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            const clientX = (e as DragEvent).clientX;
            const insertAtEnd = clientX >= midX;

            const files = [];

            // 處理所有拖放的項目
            for (const item of (e.dataTransfer as any).items) {
                if (item.kind === 'string') {
                    if (item.type === 'text/uri-list') {
                        // 處理 URI 列表
                        const uriPromise = new Promise(resolve => {
                            item.getAsString((string: string) => {
                                resolve({ type: 'uri', getData: () => string });
                            });
                        });
                        files.push(uriPromise);
                    } else if (item.type === 'text/plain') {
                        const textPromise = new Promise(resolve => {
                            item.getAsString((string: string) => {
                                resolve({ type: 'text', getData: () => string });
                            });
                        });
                        files.push(textPromise);
                    }
                } else if (item.kind === 'file') {
                    // 處理一般檔案
                    files.push(item.getAsFile());
                }
            }

            const resolvedFiles = await Promise.all(files);
            const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv, sourcePath);
            // 依左右區域設定插入位置
            modal.insertAtEnd = insertAtEnd;
            await modal.handleFiles(resolvedFiles);
        });

        // 右鍵選單
        galleryDiv.addEventListener('contextmenu', (event) => {
            if (event.target !== galleryDiv) {
                return;
            }
            event.preventDefault();
            const menu = new Menu();
            menu.addItem((item) => {
                item
                    .setTitle(t('add_image'))
                    .setIcon("image")
                    .onClick(() => {
                        const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv, sourcePath);
                        modal.open();
                    });
            });
            menu.addItem((item) => {
                item
                    .setTitle(t('setting_gallery'))
                    .setIcon("settings")
                    .onClick(() => {
                        // 獲取 gallery 區塊的 ID
                        const galleryId = galleryDiv.getAttribute('data-gallery-id');
                        if (!galleryId) {
                            return;
                        }

                        // 獲取當前筆記的文件
                        // 優先使用來源路徑，若無效則使用當前開啟的檔案
                        let activeFile: TFile | null = null;
                        if (sourcePath) {
                            activeFile = this.app.vault.getAbstractFileByPath(sourcePath) as TFile | null;
                        }

                        if (!activeFile) {
                            activeFile = this.app.workspace.getActiveFile();
                            if (!activeFile) {
                                new Notice(t('please_open_note'));
                                return;
                            }
                        }

                        // 讀取文件內容
                        this.app.vault.read(activeFile).then((content) => {
                            // 尋找包含當前 gallery ID 的 gallery 區塊
                            const galleryBlockRegex = /```gallery\n([\s\S]*?)```/g;
                            let match;
                            let galleryContent = '';
                            let matchPosition = { start: 0, end: 0 };

                            while ((match = galleryBlockRegex.exec(content)) !== null) {
                                const blockContent = match[1];
                                const blockId = 'gallery-' + this.hashString(blockContent.trim());
                                if (blockId === galleryId) {
                                    galleryContent = blockContent;
                                    matchPosition.start = match.index;
                                    matchPosition.end = match.index + match[0].length;
                                    break;
                                }
                            }

                            if (!match || match.length === 0) {
                                new Notice(t('gallery_not_found'));
                                return;
                            }

                            // 創建並打開設定對話框
                            const modal = new GalleryBlockGenerateModal(this.app, galleryContent);

                            // 設置確認後的回調函數，使用 vault.process 修改文件
                            modal.onConfirm = (newGalleryBlock: string) => {
                                this.app.vault.process(activeFile, (fileContent) => {
                                    return fileContent.substring(0, matchPosition.start) +
                                        newGalleryBlock +
                                        fileContent.substring(matchPosition.end);
                                });
                            };

                            modal.open();
                        });
                    });
            });
            menu.addItem((item) => {
                item
                    .setTitle(t('ungenerate_gallery'))
                    .setIcon("eraser")
                    .onClick(() => {
                        // 獲取 gallery 區塊的 ID
                        const galleryId = galleryDiv.getAttribute('data-gallery-id');
                        if (!galleryId) {
                            return;
                        }

                        // 獲取當前筆記的文件
                        // 優先使用來源路徑，若無效則使用當前開啟的檔案
                        let activeFile: TFile | null = null;
                        if (sourcePath) {
                            activeFile = this.app.vault.getAbstractFileByPath(sourcePath) as TFile | null;
                        }

                        if (!activeFile) {
                            activeFile = this.app.workspace.getActiveFile();
                            if (!activeFile) {
                                new Notice(t('please_open_note'));
                                return;
                            }
                        }

                        // 讀取文件內容
                        this.app.vault.read(activeFile).then((content) => {
                            // 尋找包含當前 gallery ID 的 gallery 區塊
                            const galleryBlockRegex = /```gallery\n([\s\S]*?)```/g;
                            let match;
                            let matchPosition = { start: 0, end: 0 };

                            while ((match = galleryBlockRegex.exec(content)) !== null) {
                                const blockContent = match[1];
                                const blockId = 'gallery-' + this.hashString(blockContent.trim());
                                if (blockId === galleryId) {
                                    matchPosition.start = match.index;
                                    matchPosition.end = match.index + match[0].length;
                                    break;
                                }
                            }

                            if (!matchPosition.start) {
                                new Notice(t('gallery_not_found'));
                                return;
                            }

                            // 移除 gallery 標記，保留內容
                            const newContent = content.substring(matchPosition.start + '```gallery\n'.length, matchPosition.end - '```'.length);

                            // 使用 vault.process 修改文件
                            this.app.vault.process(activeFile, (fileContent) => {
                                return fileContent.substring(0, matchPosition.start) +
                                    newContent +
                                    fileContent.substring(matchPosition.end);
                            });
                        });
                    });
            });

            menu.showAtMouseEvent(event);
        });

        return container;
    }

    createNoteContainer(item: GalleryItem, index: number, allItems: GalleryItem[], galleryId: string, sourcePath?: string, isFiltered?: boolean) {
        const container = document.createElement('div');
        container.className = 'mv-media-thumbnail-container mvgb-note-thumbnail';

        const notePreview = document.createElement('div');
        notePreview.className = 'mvgb-note-preview';

        // 如果有縮圖，使用縮圖
        if (item.thumbnail) {
            const img = document.createElement('img');
            img.src = item.thumbnail;
            img.className = 'mvgb-note-thumbnail-image';
            notePreview.appendChild(img);
        } else {
            // 否則使用預設圖示
            const noteIcon = document.createElement('div');
            noteIcon.className = 'mvgb-note-icon';

            if (item.isExternalLink) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('fill', 'currentColor');
                path.setAttribute('d', 'M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z');
                svg.appendChild(path);
                noteIcon.appendChild(svg);
                noteIcon.classList.add('external-link');
            } else {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('fill', 'currentColor');
                path.setAttribute('d', 'M14,17H7V15H14V17M17,13H7V11H17V13M17,9H7V7H17V9M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z');
                svg.appendChild(path);
                noteIcon.appendChild(svg);
                noteIcon.classList.add('internal-link');
            }
            notePreview.appendChild(noteIcon);
        }

        const noteTitle = createEl('div', { cls: 'mvgb-note-title', text: item.title as string });
        if (item.isInternalLink && !item.file) {
            noteTitle.addClass('mvgb-invalid-link');
        }
        notePreview.appendChild(noteTitle);

        container.appendChild(notePreview);

        container.onclick = (event) => {
            event.stopPropagation();
            if (item.isExternalLink) {
                // 外部連結：在新分頁開啟
                if (item.linkUrl) {
                    window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
                }
            } else if (item.isInternalLink && item.file) {
                // 內部連結：在新分頁開啟筆記
                const leaf = this.app.workspace.getLeaf('tab');
                leaf.openFile(item.file);
            } else {
                // 其他連結：嘗試在新分頁開啟
                window.open(item.path, '_blank', 'noopener,noreferrer');
            }
        };

        // 新增懸停控制項
        if (!isFiltered && !Platform.isMobile) {
            const controls = this.createHoverControls(item, index, allItems, galleryId, sourcePath);
            container.appendChild(controls);
        }

        // 右鍵選單
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const menu = new Menu();

            if (index > 0) {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(t('move_left') || 'Move Left')
                        .setIcon('arrow-left')
                        .onClick(async () => {
                            // 從 DOM 獲取當前頁碼
                            const galleryDiv = container.closest('.mvgb-media-gallery-grid');
                            let currentPage = 1;
                            if (galleryDiv) {
                                const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                                if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                                    currentPage = parseInt(paginationDiv.dataset.currentPage);
                                }
                            }
                            await this.swapGalleryItems(galleryId, item, allItems[index - 1], sourcePath, currentPage);
                        });
                });
            }

            if (index < allItems.length - 1) {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(t('move_right') || 'Move Right')
                        .setIcon('arrow-right')
                        .onClick(async () => {
                            // 從 DOM 獲取當前頁碼
                            const galleryDiv = container.closest('.mvgb-media-gallery-grid');
                            let currentPage = 1;
                            if (galleryDiv) {
                                const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                                if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                                    currentPage = parseInt(paginationDiv.dataset.currentPage);
                                }
                            }
                            await this.swapGalleryItems(galleryId, item, allItems[index + 1], sourcePath, currentPage);
                        });
                });
            }

            menu.addItem((menuItem) => {
                menuItem
                    .setTitle(t('delete'))
                    .setIcon("trash")
                    .onClick(() => {
                        // 從 DOM 獲取當前頁碼
                        const galleryDiv = container.closest('.mvgb-media-gallery-grid');
                        let currentPage = 1;
                        if (galleryDiv) {
                            const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                            if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                                currentPage = parseInt(paginationDiv.dataset.currentPage);
                            }
                        }
                        this.deleteGalleryItem(galleryId, item, sourcePath, currentPage);
                    });
            });
            menu.showAtMouseEvent(e);
        });

        return container;
    }

    updateGalleryPage(galleryDiv: HTMLElement, items: GalleryItem[], page: number, itemsPerPage: number, sourcePath?: string, isFiltered?: boolean) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentPageItems = items.slice(start, end);

        const totalPages = Math.ceil(items.length / itemsPerPage);

        if (!galleryDiv) return;

        // 移除舊的項目
        galleryDiv.replaceChildren();

        const galleryId = galleryDiv.getAttribute('data-gallery-id') || '';

        // 新增新的項目
        currentPageItems.forEach((item: GalleryItem, index: number) => {
            const absoluteIndex = start + index;
            if (item.type === 'note') {
                const noteContainer = this.createNoteContainer(item, absoluteIndex, items, galleryId, sourcePath, isFiltered);
                galleryDiv.appendChild(noteContainer);
            } else {
                const mediaContainer = this.createMediaContainer(item, absoluteIndex, items, galleryId, sourcePath, isFiltered);
                galleryDiv.appendChild(mediaContainer);
            }
        });

        // 如果是最後一頁且項目數量不足，添加空的佔位元素
        if (page === totalPages && currentPageItems.length < itemsPerPage) {
            const placeholdersNeeded = itemsPerPage - currentPageItems.length;
            for (let i = 0; i < placeholdersNeeded; i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'mv-media-thumbnail-container placeholder';
                placeholder.style.visibility = 'hidden'; // 隱藏但保持佔位
                galleryDiv.appendChild(placeholder);
            }
        }

        // 更新分頁控制項
        if (galleryDiv.parentElement) {
            const paginationDiv = galleryDiv.parentElement.querySelector('.mvgb-pagination');
            if (paginationDiv) {
                const pageInfoSpan = paginationDiv.querySelector('.mvgb-page-info');
                if (pageInfoSpan) {
                    pageInfoSpan.textContent = `${page} / ${totalPages}`;
                }
            }
        }
    }

    createMediaContainer(media: GalleryItem, index: number, allItems: GalleryItem[], galleryId: string, sourcePath?: string, isFiltered?: boolean) {
        const container = document.createElement('div');
        container.className = 'mv-media-thumbnail-container';

        if (media.type === 'image') {
            const img = document.createElement('img') as HTMLImageElement;
            if (media.url) {
                img.src = media.url;
                img.alt = media.path || '';
                if (Platform.isMobile) img.style.pointerEvents = 'none';
                container.appendChild(img);
            }
        } else {
            if (media.path && media.url) {
                // 處理影片檔案
                if (media.path.toLowerCase().match(/\.(mp4|mkv|mov|webm)$/)) {
                    const video = document.createElement('video') as HTMLVideoElement;
                    if (!Platform.isAndroidApp) {
                        video.src = media.url;
                    }
                    video.style.pointerEvents = 'none';
                    container.appendChild(video);

                    if (!Platform.isAndroidApp) {
                        const videoIcon = document.createElement('div');
                        videoIcon.className = 'mv-video-indicator';
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        svg.setAttribute('width', '24');
                        svg.setAttribute('height', '24');
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', 'M8 5v14l11-7z');
                        svg.appendChild(path);
                        videoIcon.appendChild(svg);
                        container.appendChild(videoIcon);
                    }
                } else {
                    // 處理音樂檔案
                    const audio = document.createElement('audio') as HTMLAudioElement;
                    audio.src = media.url;
                    audio.style.pointerEvents = 'none';
                    container.appendChild(audio);

                    const audioIcon = document.createElement('div');
                    audioIcon.className = 'mv-audio-indicator';
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('fill', 'currentColor');
                    path.setAttribute('d', 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z');
                    svg.appendChild(path);
                    audioIcon.appendChild(svg);
                    container.appendChild(audioIcon);

                    // 添加檔案名稱顯示
                    const filenameDiv = document.createElement('div');
                    filenameDiv.className = 'mv-audio-filename';
                    let filename = '';
                    if (media.path) {
                        // 從路徑中提取檔案名稱
                        const pathParts = media.path.split('/');
                        filename = pathParts[pathParts.length - 1];
                        // 移除副檔名
                        filename = filename.replace(/\.[^/.]+$/, '');
                    }
                    filenameDiv.textContent = filename;
                    container.appendChild(filenameDiv);
                }
            }
        }

        if (typeof media.title === 'object' && media.title !== null) {
            const linkArea = document.createElement('div');
            linkArea.className = 'mvgb-media-link-area';

            if (media.title.type === 'text') {
                // 純文字
                const textSpan = document.createElement('span');
                textSpan.textContent = media.title.text;
                textSpan.style.color = 'white';
                linkArea.appendChild(textSpan);
            } else {
                // 內部或外部連結
                const link = document.createElement('a');
                link.textContent = media.title.text;

                if (media.title.url) {
                    if (media.title.type === 'internal') {
                        // 內部連結
                        const file = this.app.vault.getAbstractFileByPath(media.title.url);
                        if (file instanceof TFile) {
                            link.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const leaf = this.app.workspace.getLeaf('tab');
                                leaf.openFile(file);
                            };
                        }
                    } else {
                        // 外部連結
                        link.href = encodeURI(media.title.url);
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.onclick = (e) => {
                            e.stopPropagation();
                        };
                    }
                }

                linkArea.appendChild(link);
            }

            container.appendChild(linkArea);
        }

        // 使媒體縮圖可拖曳為 URI（包含影片/圖片/音訊）。在行動裝置上略過。
        if (!Platform.isMobile && media.url && media.type === 'video') {
            container.draggable = true;
            container.addEventListener('dragstart', (e: DragEvent) => {
                if (!e.dataTransfer) return;
                // 避免父層或 Obsidian 其他處理器攔截
                e.stopPropagation();
                try {
                    // 針對內部檔案輸出 Obsidian URI；外部連結則維持原本 URL
                    const isHttp = /^https?:\/\//i.test(media.url as string);
                    let outUri = media.url as string;
                    if (!isHttp && media.path) {
                        const vaultName = this.app.vault.getName();
                        outUri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(media.path)}`;
                    }
                    // 主要提供 URI，並以純文字作為備援
                    e.dataTransfer.setData('text/uri-list', outUri);
                    e.dataTransfer.setData('text/plain', outUri);
                    e.dataTransfer.effectAllowed = 'copy';
                } catch (err) {
                    // 忽略 setData 可能的例外
                }
            });
        }

        if ((!this.plugin.settings.disableClickToOpenMediaOnGallery && media.type === 'image') || media.type === 'video') {
            container.onclick = () => {
                const modal = new FullScreenModal(this.app, this.plugin, 'thumbnail', sourcePath);
                modal.open();
                setTimeout(() => {
                    const allUrls = modal.mediaUrls;
                    const targetIndex = allUrls.findIndex(m => m.url === media.url);
                    if (targetIndex !== -1) {
                        modal.showMedia(targetIndex);
                    }
                }, 100);
            };
        }

        // 新增懸停控制項
        if (!isFiltered && !Platform.isMobile) {
            const controls = this.createHoverControls(media, index, allItems, galleryId, sourcePath);
            container.appendChild(controls);
        }

        // 右鍵選單
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const menu = new Menu();

            if (index > 0) {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(t('move_left') || 'Move Left')
                        .setIcon('arrow-left')
                        .onClick(async () => {
                            const galleryDiv = container.closest('.mvgb-media-gallery-grid');
                            let currentPage = 1;
                            if (galleryDiv) {
                                const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                                if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                                    currentPage = parseInt(paginationDiv.dataset.currentPage);
                                }
                            }
                            await this.swapGalleryItems(galleryId, media, allItems[index - 1], sourcePath, currentPage);
                        });
                });
            }

            if (index < allItems.length - 1) {
                menu.addItem((menuItem) => {
                    menuItem
                        .setTitle(t('move_right') || 'Move Right')
                        .setIcon('arrow-right')
                        .onClick(async () => {
                            const galleryDiv = container.closest('.mvgb-media-gallery-grid');
                            let currentPage = 1;
                            if (galleryDiv) {
                                const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                                if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                                    currentPage = parseInt(paginationDiv.dataset.currentPage);
                                }
                            }
                            await this.swapGalleryItems(galleryId, media, allItems[index + 1], sourcePath, currentPage);
                        });
                });
            }

            menu.addItem((menuItem) => {
                menuItem
                    .setTitle(t('delete'))
                    .setIcon("trash")
                    .onClick(() => {
                        // 從 DOM 獲取當前頁碼
                        const galleryDiv = container.closest('.mvgb-media-gallery-grid');
                        let currentPage = 1;
                        if (galleryDiv) {
                            const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                            if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                                currentPage = parseInt(paginationDiv.dataset.currentPage);
                            }
                        }
                        this.deleteGalleryItem(galleryId, media, sourcePath, currentPage);
                    });
            });
            menu.showAtMouseEvent(e);
        });

        return container;
    }

    createHoverControls(item: GalleryItem, index: number, allItems: GalleryItem[], galleryId: string, sourcePath?: string) {
        const controls = document.createElement('div');
        controls.className = 'mvgb-hover-controls';

        // 左箭頭
        if (index > 0) {
            const leftBtn = document.createElement('button');
            leftBtn.className = 'mvgb-hover-btn mvgb-btn-left';
            leftBtn.title = t('move_left') || 'Move Left';
            leftBtn.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" /></svg>';
            leftBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 從 DOM 獲取當前頁碼
                const galleryDiv = controls.closest('.mvgb-media-gallery-grid');
                let currentPage = 1;
                if (galleryDiv) {
                    const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                    if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                        currentPage = parseInt(paginationDiv.dataset.currentPage);
                    }
                }
                await this.swapGalleryItems(galleryId, item, allItems[index - 1], sourcePath, currentPage);
            };
            controls.appendChild(leftBtn);
        }

        // 右箭頭
        if (index < allItems.length - 1) {
            const rightBtn = document.createElement('button');
            rightBtn.className = 'mvgb-hover-btn mvgb-btn-right';
            rightBtn.title = t('move_right') || 'Move Right';
            rightBtn.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>';
            rightBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 從 DOM 獲取當前頁碼
                const galleryDiv = controls.closest('.mvgb-media-gallery-grid');
                let currentPage = 1;
                if (galleryDiv) {
                    const paginationDiv = galleryDiv.parentElement?.querySelector('.mvgb-pagination');
                    if (paginationDiv && paginationDiv instanceof HTMLElement && paginationDiv.dataset.currentPage) {
                        currentPage = parseInt(paginationDiv.dataset.currentPage);
                    }
                }
                await this.swapGalleryItems(galleryId, item, allItems[index + 1], sourcePath, currentPage);
            };
            controls.appendChild(rightBtn);
        }

        return controls;
    }

    async swapGalleryItems(galleryId: string, item1: GalleryItem, item2: GalleryItem, sourcePath?: string, currentPage?: number) {
        // 獲取當前文件
        let activeFile: TFile | null = null;
        if (sourcePath) {
            activeFile = this.app.vault.getAbstractFileByPath(sourcePath) as TFile | null;
        }

        if (!activeFile) {
            activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) return;
        }

        const content = await this.app.vault.read(activeFile);
        const galleryBlockRegex = /```gallery\n([\s\S]*?)```/g;
        let match;

        while ((match = galleryBlockRegex.exec(content)) !== null) {
            const blockContent = match[1];
            const blockId = 'gallery-' + this.hashString(blockContent.trim());

            if (blockId === galleryId) {
                // 如果 item1 和 item2 都有效的地理位置資訊，則直接進行區塊交換
                if (item1.loc && item2.loc) {
                    const lines = blockContent.split('\n');

                    // 取得行號範圍（包含起始與結束）
                    const range1 = item1.loc;
                    const range2 = item2.loc;

                    // 確保交換順序，先處理位置較前的項目
                    const first = range1.start < range2.start ? range1 : range2;
                    const second = range1.start < range2.start ? range2 : range1;

                    // 檢查區塊是否重疊（正常情況不應發生）
                    if (first.end >= second.start) {
                        console.error('Overlapping items, cannot swap');
                        return;
                    }

                    // 將區塊內容分割成五段：前段、第一項、中段、第二項、後段
                    const partBefore = lines.slice(0, first.start);
                    const partFirst = lines.slice(first.start, first.end + 1);
                    const partBetween = lines.slice(first.end + 1, second.start);
                    const partSecond = lines.slice(second.start, second.end + 1);
                    const partAfter = lines.slice(second.end + 1);

                    // 重新組裝：前段 + 第二項 + 中段 + 第一項 + 後段
                    const newLines = [
                        ...partBefore,
                        ...partSecond, // 已交換
                        ...partBetween,
                        ...partFirst, // 已交換
                        ...partAfter
                    ];

                    const newBlockContent = newLines.join('\n');
                    const newId = 'gallery-' + this.hashString(newBlockContent.trim());

                    // 如果提供了當前頁碼，則為重構後的 Gallery ID 儲存分頁狀態
                    if (currentPage) {
                        GalleryBlock.paginationState.set(newId, currentPage);
                    }

                    const matchStart = match.index;
                    const matchEnd = match.index + match[0].length;
                    const newBlock = '```gallery\n' + newBlockContent + '```';

                    // 更新 Obsidian 文件內容
                    const restoreScroll = captureScrollRestore(this.app, galleryId);
                    await this.app.vault.process(activeFile, (fileContent) => {
                        return fileContent.substring(0, matchStart) +
                            newBlock +
                            fileContent.substring(matchEnd);
                    });
                    restoreScroll(newId);
                }
                break;
            }
        }
    }

    async deleteGalleryItem(galleryId: string, item: GalleryItem, sourcePath?: string, currentPage?: number) {
        // 獲取當前文件
        let activeFile: TFile | null = null;
        if (sourcePath) {
            activeFile = this.app.vault.getAbstractFileByPath(sourcePath) as TFile | null;
        }

        if (!activeFile) {
            activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) return;
        }

        const content = await this.app.vault.read(activeFile);
        const galleryBlockRegex = /```gallery\n([\s\S]*?)```/g;
        let match;

        while ((match = galleryBlockRegex.exec(content)) !== null) {
            const blockContent = match[1];
            const blockId = 'gallery-' + this.hashString(blockContent.trim());

            if (blockId === galleryId) {
                if (item.loc) {
                    const lines = blockContent.split('\n');
                    const start = item.loc.start;
                    const end = item.loc.end;

                    // Remove the lines
                    lines.splice(start, end - start + 1);

                    const newBlockContent = lines.join('\n');
                    const newId = 'gallery-' + this.hashString(newBlockContent.trim());

                    // 如果提供了當前頁碼，則為重構後的 Gallery ID 儲存分頁狀態
                    if (currentPage) {
                        GalleryBlock.paginationState.set(newId, currentPage);
                    }

                    const matchStart = match.index;
                    const matchEnd = match.index + match[0].length;
                    const newBlock = '```gallery\n' + newBlockContent + '```';

                    // 更新 Obsidian 文件內容
                    const restoreScroll = captureScrollRestore(this.app, galleryId);
                    await this.app.vault.process(activeFile, (fileContent) => {
                        return fileContent.substring(0, matchStart) +
                            newBlock +
                            fileContent.substring(matchEnd);
                    });
                    restoreScroll(newId);
                }
                break;
            }
        }
    }
}