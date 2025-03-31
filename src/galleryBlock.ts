import { App, TFile, Menu, Notice, Platform } from 'obsidian';
import MediaViewPlugin from '../main';
import { FullScreenModal } from './fullscreen';
import { MediaViewSettings } from './settings';
import { ImageUploadModal } from './imageUpload';
import { GalleryBlockGenerateModal } from './galleryBlockGenerate';
import { t } from './translations';

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
    containerInfo: ContainerInfo;
    galleryId: string;
}

export class GalleryBlock {
    app: App;
    plugin: MediaViewPlugin;

    constructor(app: App, plugin: MediaViewPlugin) {
        this.app = app;
        this.plugin = plugin;
    }

    // 處理 gallery 區塊
    async processGalleryBlock(source: string, el: HTMLElement): Promise<void> {
        if (el.querySelector('.mvgb-media-gallery-grid')) {
            return;
        }

        try {
            const mediaUrlsData = await this.parseGalleryContent(source);
            const galleryDiv = this.createGalleryElement(mediaUrlsData);
            el.appendChild(galleryDiv);
        } catch (error) {
            console.error('Error processing gallery block:', error);
        }
    }

    // 解析 gallery 內容
    async parseGalleryContent(content: string): Promise<MediaUrlsData> {
        const items: GalleryItem[] = [];
        const lines = content.split('\n');
        
        let currentTitle = null;
        let currentLinkUrl = null;
        let currentThumbnail = null;
        let containerTitle = null;
        let addButtonEnabled = false;
        let gridSize = this.plugin.settings.galleryGridSize || 'medium';
        let paginationEnabled = this.plugin.settings.itemsPerPage || 0; // 設定變數以決定是否開啟分頁功能
        
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
                    if(!file) {
                        const fileByPath = this.app.vault.getAbstractFileByPath(url);
                        if (fileByPath && fileByPath instanceof TFile) {
                            return this.app.vault.getResourcePath(fileByPath);
                        }
                    } else {
                        return this.app.vault.getResourcePath(file);
                    }
                }
            }

            // 處理直接的 URL 或路徑
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
                const internalMatch = content.match(/(?:!\[\[(.*?\.(?:jpg|jpeg|png|gif|webp))(?:\|.*?)?\]\]|!\[(.*?)\]\(\s*(\S+?(?:\.(?:jpg|jpeg|png|gif|webp)|format=(?:jpg|jpeg|png|gif|webp))[^\s)]*)\s*(?:\s+["'][^"']*["'])?\s*\))/i);
                if (internalMatch) {
                    return internalMatch[0];
                } else {    
                    return null;
                }
            } catch (error) {
                console.error('Error reading note content:', error);
                return null;
            }
        };

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            const paginationMatch = trimmedLine.match(/^pagination:\s*(\d+)$/i);
            if (paginationMatch) {
                const paginationValue = parseInt(paginationMatch[1]);
                paginationEnabled = paginationValue || 0;
                continue;
            }
            
            // 新增 size 參數的處理
            const sizeMatch = trimmedLine.match(/^size:\s*(small|medium|large)$/i);
            if (sizeMatch) {
                gridSize = sizeMatch[1].toLowerCase();
                continue;
            }

            // 檢查是否要禁用新增按鈕
            const addButtonMatch = trimmedLine.match(/^addbutton:\s*(true|false)$/i);
            if (addButtonMatch) {
                addButtonEnabled = addButtonMatch[1].toLowerCase() === 'true';
                continue;
            }

            // 檢查是否為容器標題設定
            const containerTitleMatch = trimmedLine.match(/^title:\s*(.+)$/);
            if (containerTitleMatch) {
                const titleText = containerTitleMatch[1];
                
                // 檢查是否為內部連結 [[note]]
                const internalLinkMatch = titleText.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
                if (internalLinkMatch) {
                    const linktext = internalLinkMatch[1].split('|')[0];
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
                const titleText = titleMatch[1];
                
                // 檢查是否為內部連結
                const internalLinkMatch = titleText.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
                if (internalLinkMatch) {
                    const linktext = internalLinkMatch[1].split('|')[0];
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
                                linkUrl: currentLinkUrl
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
                        thumbnail: currentThumbnail
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
                                const extension = url.toLowerCase();
                                items.push({
                                    type: extension.match(/\.(mp4|mkv|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/) ? 'video' : 'image',
                                    url: this.app.vault.getResourcePath(fileByPath),
                                    path: text || fileByPath.path,
                                    title: currentTitle,
                                    linkUrl: currentLinkUrl
                                });
                            }
                        } else {
                            const extension = file.extension.toLowerCase();
                            items.push({
                                type: extension.match(/^(mp4|mkv|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/) ? 'video' : 'image',
                                url: this.app.vault.getResourcePath(file),
                                path: text || file.path,
                                title: currentTitle,
                                linkUrl: currentLinkUrl
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
                            linkUrl: currentLinkUrl
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
                        thumbnail: currentThumbnail
                    });
                }
                currentTitle = null;
                currentLinkUrl = null;
                currentThumbnail = null;
                continue;
            }
        }

        return {
            items,
            containerInfo: {
                title: containerTitle,
                addButtonEnabled: addButtonEnabled,
                gridSize: gridSize,
                paginationEnabled: paginationEnabled
            },
            galleryId: galleryId
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
        const { items, containerInfo, galleryId } = mediaUrlsData;
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
                const textSpan = containerLinkArea.createEl('span', {
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
                    const noteContainer = this.createNoteContainer(item);
                    galleryDiv.appendChild(noteContainer);
                } else {
                    const mediaContainer = this.createMediaContainer(item, index);
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
                    const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv);
                    modal.open();
                };

                galleryDiv.appendChild(addContainer);
            }
        } else {
            // 使用分頁顯示
            const totalPages = Math.ceil(items.length / itemsPerPage);
            const currentPage = 1;

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
                    this.updateGalleryPage(galleryDiv, items, newPage, itemsPerPage);
                }
            };
            
            nextPageButton.onclick = () => {
                const currentPage = parseInt(paginationDiv.dataset.currentPage || '0');
                // 如果是最後一頁，則跳到第一頁，否則往後一頁
                if (currentPage !== 0) {
                    const newPage = currentPage === totalPages ? 1 : currentPage + 1;
                    paginationDiv.dataset.currentPage = newPage.toString();
                    this.updateGalleryPage(galleryDiv, items, newPage, itemsPerPage);
                }
            };

            // 新增圖片按鈕移到分頁控制項旁邊
            if (containerInfo.addButtonEnabled || items.length === 0) {
                const addButton = paginationDiv.createEl('button', {
                    cls: 'mvgb-gallery-control-button mvgb-add-image-button',
                    text: t('add_image')
                });
                addButton.onclick = () => {
                    const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv);
                    modal.open();
                };
            }

            paginationDiv.appendChild(prevPageButton);
            paginationDiv.appendChild(pageInfoSpan);
            paginationDiv.appendChild(nextPageButton);
            controlsDiv.appendChild(paginationDiv);
            container.appendChild(controlsDiv);

            // 初始化第一頁
            this.updateGalleryPage(galleryDiv, items, currentPage, itemsPerPage);
        }
        
        // 加入拖曳事件處理
        galleryDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            galleryDiv.addClass('drag-over');
        });

        galleryDiv.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            galleryDiv.removeClass('drag-over');
        });

        galleryDiv.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            galleryDiv.removeClass('drag-over');
            
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
            const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv);
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
                        const modal = new ImageUploadModal(this.app, this.plugin, galleryDiv);
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
                        const activeFile = this.app.workspace.getActiveFile();
                        if (!activeFile) {
                            new Notice(t('please_open_note'));
                            return;
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
                            
                            if (!galleryContent) {
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
            menu.showAtMouseEvent(event);
        });
        
        return container;
    }

    createNoteContainer(item: GalleryItem) {
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

        return container;
    }

    updateGalleryPage(galleryDiv: HTMLElement, items: GalleryItem[], page: number, itemsPerPage: number) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentPageItems = items.slice(start, end);
        const totalPages = Math.ceil(items.length / itemsPerPage);
    
        if(!galleryDiv) return;

        // 移除舊的項目
        galleryDiv.replaceChildren();
        
        // 新增新的項目
        currentPageItems.forEach((item: GalleryItem, index: number) => {
            if (item.type === 'note') {
                const noteContainer = this.createNoteContainer(item);
                galleryDiv.appendChild(noteContainer);
            } else {
                const mediaContainer = this.createMediaContainer(item, start + index);
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
    
    createMediaContainer(media: GalleryItem, index: number) {
        const container = document.createElement('div');
        container.className = 'mv-media-thumbnail-container';
        
        if (media.type === 'image') {
            const img = document.createElement('img') as HTMLImageElement;
            if (media.url) {
                img.src = media.url;
                img.alt = media.path || '';
                if(Platform.isMobile) img.style.pointerEvents = 'none';
                container.appendChild(img);
            }
        } else {
            if (media.path && media.url) {
                // 處理影片檔案
                if (media.path.match(/\.(mp4|mkv|mov|webm)$/)) {
                    const video = document.createElement('video') as HTMLVideoElement;
                    video.src = media.url;
                    video.style.pointerEvents = 'none';
                    container.appendChild(video);
                    
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

        if ((!this.plugin.settings.disableClickToOpenMediaOnGallery && media.type === 'image') || media.type === 'video') {
            container.onclick = () => {
                const modal = new FullScreenModal(this.app, this.plugin, 'thumbnail');
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

        return container;
    }
}