import { App, Modal, getFrontMatterInfo, TFile, Notice } from 'obsidian';
import MediaViewPlugin from './main';
import { MediaViewSettings } from './settings';
import { t } from './translations';

interface Media {
    type: string;
    url: string;
    links?: string[];
    path?: string;
    title?: string;
}

export class FullScreenModal extends Modal {
    plugin: MediaViewPlugin;
    mediaUrls: Media[];
    currentIndex: number;
    isZoomed: boolean;
    isImage: boolean;
    openType: string;
    fullMediaView: HTMLDivElement;
    fullImage: HTMLImageElement;
    fullVideo: HTMLVideoElement;
    galleryCloseButton: HTMLButtonElement;
    handleWheel: ((event: WheelEvent) => void) | null;
    autoPlayTimer: number | null; 
    isAutoPlaying: boolean;
    sourcePath?: string; // 來源檔案路徑（由 Gallery Block 傳入）

    constructor(app: App, plugin: MediaViewPlugin, openType: string = 'command', sourcePath?: string) {
        super(app);
        this.plugin = plugin;
        this.mediaUrls = [];
        this.currentIndex = 0;
        this.isZoomed = false;
        this.isImage = true;
        this.openType = openType;
        this.modalEl.addClass('mv-media-viewer-modal');
        this.handleWheel = null; //儲存滾輪事件處理程序
        this.autoPlayTimer = null; //儲存自動播放計時器
        this.isAutoPlaying = false; //自動播放狀態
        this.sourcePath = sourcePath;
    }

    async scanMedia(): Promise<Media[]> {
        // 優先使用來源路徑，若無則使用當前開啟的檔案
        let activeFile: TFile | null = null;
        activeFile = this.sourcePath 
            ? this.app.vault.getAbstractFileByPath(this.sourcePath) as TFile | null
            : this.app.workspace.getActiveFile();
        
        if (!activeFile) {
            new Notice(t('please_open_note'));
            return [];
        }

        try {
            // 讀取文件內容
            const content = await this.app.vault.read(activeFile);
            
            // 移除 frontmatter 區域
            const frontMatterInfo = getFrontMatterInfo(content);
            const contentWithoutFrontmatter = content.substring(frontMatterInfo.contentStart);
            
            // 使用單一正則表達式同時匹配兩種格式：
            // 1. ![[image.jpg]] - Obsidian 內部連結
            // 2. ![alt](path) - 標準 Markdown
            const mediaUrls: Media[] = [];
            const mediaLinks = new Map(); // 用於儲存媒體連結的原始文字

            // 使用單一正則表達式匹配所有媒體連結
            // Because the links in the Gallery Block need to be parsed, Metadatacache cannot be used
            const mediaMatches = Array.from(contentWithoutFrontmatter.matchAll(/(?:!\[\[(.*?)(?:\|.*?)?\]\]|!\[(.*?)\]\((.*?)\))/g));

            for (const match of mediaMatches) {
                const [fullMatch, internalLink, , markdownLink] = match;
                let url = null;
                let file = null;
                
                if (internalLink) {
                    // 處理 Obsidian 內部連結
                    try {
                        file = this.app.metadataCache.getFirstLinkpathDest(internalLink, '');
                        if (file) {
                            url = this.app.vault.getResourcePath(file);
                        }
                    } catch (e) {
                        console.error('Error processing internal link:', internalLink, e);
                        continue;
                    }
                } else if (markdownLink) {
                    // 處理標準 Markdown 連結
                    if (markdownLink.startsWith('http://') || markdownLink.startsWith('https://')) {
                        // 網絡圖片
                        url = markdownLink.split(' "')[0];
                    } else {
                        // 本地檔案
                        file = this.app.metadataCache.getFirstLinkpathDest(markdownLink, '');
                        if (!file) {
                            // 如果找不到檔案，再嘗試直接用路徑查找
                            const fileByPath = this.app.vault.getAbstractFileByPath(markdownLink);
                            if (fileByPath instanceof TFile) {
                                url = this.app.vault.getResourcePath(fileByPath);
                                if (url) {
                                    const extension = markdownLink.toLowerCase();
                                    if (!extension.match(/\.(jpg|jpeg|png|gif|webp|mp4|mkv|mov|webm|flac|m4a|mp3|ogg|wav|3gp)$/)) {
                                        continue;
                                    }
                                }
                            }
                        } else {
                            url = this.app.vault.getResourcePath(file);
                        }
                    }
                }
                
                if (url) {
                    let type = 'image';
                    const urlExtension = url.split('.').pop()?.toLowerCase();

                    if (file) {
                        const extension = file.extension.toLowerCase();
                        if (!extension.match(/^(jpg|jpeg|png|gif|webp|mp4|mkv|mov|webm|flac|m4a|mp3|ogg|wav|3gp)$/)) {
                            continue;
                        }
                        type = extension.match(/^(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video';
                    } else if (urlExtension) {
                        if (urlExtension.match(/^(mp4|mkv|mov|webm|flac|m4a|mp3|ogg|wav|3gp)$/)) {
                            type = 'video';
                        } else if (!urlExtension.match(/^(jpg|jpeg|png|gif|webp)$/)) {
                            // 檢查 URL 是否包含圖片格式的查詢參數
                            const urlLower = url.toLowerCase();
                            if (urlLower.includes('format=jpg') || 
                                urlLower.includes('format=jpeg') || 
                                urlLower.includes('format=png') || 
                                urlLower.includes('format=gif') || 
                                urlLower.includes('format=webp') ||
                                // 檢查 URL 路徑中是否包含圖片擴展名
                                urlLower.match(/\.(jpg|jpeg|png|gif|webp)(\?|&|#|!|$)/)) {
                                type = 'image';
                            } else {
                                continue;
                            }
                        }
                    }
                    
                    // 如果這個 URL 已經存在，將新的連結文字加入到現有的列表中
                    if (mediaLinks.has(url)) {
                        mediaLinks.get(url).push(fullMatch);
                    } else {
                        mediaLinks.set(url, [fullMatch]);
                        mediaUrls.push({
                            type: type,
                            url: url
                        });
                    }
                }
            }

            // 將連結文字儲存到每個媒體對象中
            mediaUrls.forEach(media => {
                media.links = mediaLinks.get(media.url) || [];
            });

            return mediaUrls;
        } catch (error) {
            console.error('Error scanning media:', error);
            new Notice(t('error_scanning_media'));
            return [];
        }
    }

    async onOpen(): Promise<void> {
        // 掃描媒體檔案
        this.mediaUrls = await this.scanMedia();
        if (this.mediaUrls.length === 0) {
            new Notice(t('no_media_found'));
            this.close();
            return;
        }

        // 建立基本 UI 結構
        const { contentEl } = this;
        
        contentEl.empty();
        contentEl.style.width = '100%'; // 設定寬度佈滿整個空間
        contentEl.style.height = '100%'; // 設定高度佈滿整個空間

        contentEl.addEventListener('click', (e) => {
            if (e.target === contentEl) {
            this.close();
            }
        });

        // 建立縮圖區域
        const galleryContent = contentEl.createDiv('mv-gallery-content');
        const gridSize = this.plugin.settings.galleryGridSize;
        const propertyName = `galleryGridSize${gridSize.charAt(0).toUpperCase() + gridSize.slice(1)}` as keyof MediaViewSettings;
        const width = this.plugin.settings[propertyName];
        galleryContent.style.gridTemplateColumns = `repeat(auto-fill, minmax(${width}px, 1fr))`;

        if (this.openType !== 'command') galleryContent.style.display = 'none';

        galleryContent.addEventListener('click', (e) => {
            const isMediaThumbnail = (e.target as Element).closest('.mv-media-thumbnail');
            if (!isMediaThumbnail) {
                this.close();
            }
        });
        
        this.mediaUrls.forEach((media, index) => {
            const container = galleryContent.createDiv('mv-media-thumbnail-container');
            container.addClass('mv-media-thumbnail');
            
            if (media.type === 'image') {
                const img = container.createEl('img');
                img.src = media.url;
                img.onclick = () => this.showMedia(index);
            } else {
                if (media.url.match(/\.(mp4|mkv|mov|webm)/i)) {
                    const video = container.createEl('video');
                    video.src = media.url;
                    video.onclick = () => this.showMedia(index);
                    const videoIcon = container.createDiv('mv-video-indicator');
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('fill', 'currentColor');
                    path.setAttribute('d', 'M8 5v14l11-7z');
                    svg.appendChild(path);
                    videoIcon.appendChild(svg);
                } else {
                    const audio = container.createEl('audio');
                    audio.src = media.url;
                    container.onclick = () => this.showMedia(index);
                    const audioIcon = container.createDiv('mv-audio-indicator');
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('fill', 'currentColor');
                    path.setAttribute('d', 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z');
                    svg.appendChild(path);
                    audioIcon.appendChild(svg);

                    // 添加檔案名稱顯示
                    const fileName = media.path ? media.path.split('/').pop() : media.url.split('/').pop();
                    if (fileName) {
                        const cleanFileName = fileName.split('?')[0]; // 移除檔案名稱中 ? 後面的部分
                        const decodedFileName = decodeURIComponent(cleanFileName)
                        const filenameDiv = container.createDiv('mv-audio-filename');
                        filenameDiv.textContent = decodedFileName.replace(/\.[^/.]+$/, '');
                    }
                }
            }
        });

        // 建立縮圖區域關閉按鈕
        const closeButton = contentEl.createEl('button', {
            cls: 'mv-gallery-close-button',
            text: '×'
        });
        closeButton.onclick = () => this.close();
        this.galleryCloseButton = closeButton; 

        // 建立全屏預覽區域
        this.fullMediaView = contentEl.createDiv('mv-full-media-view') as HTMLDivElement;
        this.fullMediaView.style.display = 'none';
        this.fullMediaView.style.background = this.openType === 'command' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';

        // 添加左右切換區域
        const prevArea = this.fullMediaView.createDiv('mv-media-nav-area mv-prev-area');
        const nextArea = this.fullMediaView.createDiv('mv-media-nav-area mv-next-area');

        prevArea.onclick = (e) => {
            e.stopPropagation();
            const prevIndex = (this.currentIndex - 1 + this.mediaUrls.length) % this.mediaUrls.length;
            this.showMedia(prevIndex);
        };

        nextArea.onclick = (e) => {
            e.stopPropagation();
            const nextIndex = (this.currentIndex + 1) % this.mediaUrls.length;
            this.showMedia(nextIndex);
        };

        this.fullImage = this.fullMediaView.createEl('img', { cls: 'mv-full-image' });
        this.fullVideo = this.fullMediaView.createEl('video', { 
            cls: 'mv-full-video',
            attr: { controls: true }
        });

        // 建立媒體關閉按鈕
        const fullCloseButton = this.fullMediaView.createEl('button', {
            cls: 'mv-media-close-button',
            text: '×'
        });
        fullCloseButton.onclick = () => this.hideMedia();

        // 註冊事件監聽
        this.registerMediaEvents();

        // 根據類型決定是否自動顯示一張圖片
        if (this.openType === 'command') {
            if (this.plugin.settings.autoOpenFirstImage) {
                this.showMedia(0);
            }
        } else if (this.openType === 'thumbnail') {
            // 從縮圖開啟時，不需要做任何特殊處理，
            // 因為稍後會通過 showMedia() 顯示特定圖片
        }
    }

    async showMedia(index: number): Promise<void> {
        // 過濾出所有媒體項目
        const mediaItems = this.mediaUrls.filter(item => item.type === 'image' || item.type === 'video');
        if (mediaItems.length === 0) {
            new Notice(t('no_media_found'));
            this.close();
            return;
        }

        // 記住當前的自動播放狀態
        const wasAutoPlaying = this.isAutoPlaying;
        
        // 清除現有的自動播放計時器（如果存在）
        this.clearAutoPlayTimer();

        // 移除舊的資訊面板（如果存在）
        const oldInfo = this.fullMediaView.querySelector('.mv-image-info-panel');
        if (oldInfo) oldInfo.remove();

        this.currentIndex = index;
        this.galleryCloseButton.style.display = 'none';
        this.fullMediaView.style.display = 'block';

        const media = mediaItems[index];
        
        this.fullVideo.pause();
        this.isImage = media.type === 'image';
        
        if (this.isImage) {
            this.fullImage.src = media.url;
            this.fullImage.onload = () => {
                this.fullImage.style.display = 'block';
                this.fullVideo.style.display = 'none';
                this.resetImageStyles();
            };
        } else {
            this.fullVideo.src = media.url;
            if (media.url.match(/\.(mp4|mkv|mov|webm)/i)) {
                this.fullVideo.muted = this.plugin.settings.muteVideoOnOpen;
            }
            this.fullVideo.style.display = 'block';
            this.fullImage.style.display = 'none';
            this.fullVideo.loop = true;
            this.fullVideo.play();
        }

        // 顯示圖片資訊
        if (this.plugin.settings.showImageInfo || this.plugin.settings.allowMediaDeletion || this.plugin.settings.autoPlayInterval > 0) {
            this.showImageInfo(media);
        }
        
        // 如果之前是自動播放狀態，則繼續自動播放
        if (wasAutoPlaying) {
            this.startAutoPlay();
        }
    }

    async showImageInfo(media: Media) {
        // 創建資訊面板
        const infoPanel = document.createElement('div');
        infoPanel.className = 'mv-image-info-panel';

        // 添加刪除按鈕（只在啟用刪除功能時顯示）
        if (this.plugin.settings.allowMediaDeletion) {
            const deleteButton = infoPanel.createEl('a', {
                text: t('delete'),
                cls: 'mv-info-item',
                attr: { href: '#' }
            });
            deleteButton.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this.deleteMedia(this.currentIndex);
            };
        }
        
        // 添加自動播放按鈕（只在設定值不為 0 時顯示）
        if (this.plugin.settings.autoPlayInterval > 0) {
            const autoPlayButton = infoPanel.createEl('a', {
                // 根據當前的自動播放狀態設定按鈕文字
                text: this.isAutoPlaying ? t('stop_auto_play') : t('auto_play'),
                cls: 'mv-info-item',
                attr: { 
                    href: '#',
                    'data-action': 'autoplay' // 新增 data-action 屬性以便於選取
                }
            });
            autoPlayButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isAutoPlaying) {
                    this.stopAutoPlay();
                    autoPlayButton.textContent = t('auto_play');
                } else {
                    this.startAutoPlay();
                    autoPlayButton.textContent = t('stop_auto_play');
                }
            };
        }

        if (this.plugin.settings.showImageInfo) {
            // 取得檔案名稱
            const fileName = media.path ? media.path.split('/').pop() : media.url.split('/').pop();
            if (!fileName) return;
            const cleanFileName = fileName.split('?')[0]; // 移除檔案名稱中 ? 後面的部分
            const decodedFileName = decodeURIComponent(cleanFileName);
            
            // 添加檔案編號
            infoPanel.createEl('span', {
                text: `${this.currentIndex + 1}/${this.mediaUrls.length}`,
                cls: 'mv-info-item'
            });
            
            // 添加檔案名稱
            infoPanel.createEl('span', {
                text: decodedFileName,
                cls: ['mv-info-item', 'mv-info-filename'],
                attr: { contentEditable: 'true' }
            });

            // 添加圖片尺寸
            if (this.isImage) {
                infoPanel.createEl('span', {
                    text: `(${this.fullImage.naturalWidth} × ${this.fullImage.naturalHeight})`,
                    cls: ['mv-info-item', 'mv-info-dimensions']
                });
            }
        }

        this.fullMediaView.appendChild(infoPanel);

        // 設定三秒後淡出
        setTimeout(() => {
            infoPanel.classList.add('fade');
        }, 3000);
    }

    hideMedia() {
        if (this.openType === 'thumbnail') {
            this.close();
            return;
        }

        // 清除自動播放計時器
        this.stopAutoPlay();

        this.fullMediaView.style.display = 'none';
        this.galleryCloseButton.style.display = 'flex';
        this.isZoomed = false;
        this.fullVideo.pause();
    }

    resetImageStyles() {
        // 如果存在之前的滾輪事件處理程序，先移除它
        if (this.handleWheel) {
            this.fullMediaView.removeEventListener('wheel', this.handleWheel);
            this.handleWheel = null;
        }

        this.fullImage.style.width = 'auto';
        this.fullImage.style.height = 'auto';
        
        if (this.plugin.settings.displayOriginalSize &&
            this.fullImage.naturalWidth < this.fullMediaView.clientWidth && 
            this.fullImage.naturalHeight < this.fullMediaView.clientHeight) {
            // 以原始尺寸顯示
            this.fullImage.style.maxWidth = `${this.fullImage.naturalWidth}px`;
            this.fullImage.style.maxHeight = `${this.fullImage.naturalHeight}px`;
            this.fullImage.style.cursor = 'default';
        } else {
            // 全螢幕顯示
            this.fullImage.style.maxWidth = '100vw';
            this.fullImage.style.maxHeight = '100vh';
            this.fullImage.style.cursor = 'zoom-in';
        }

        this.fullImage.style.position = 'absolute';
        this.fullImage.style.left = '50%';
        this.fullImage.style.top = '50%';
        this.fullImage.style.transform = 'translate(-50%, -50%)';
        
        this.fullMediaView.style.overflowX = 'hidden';
        this.fullMediaView.style.overflowY = 'hidden';
        this.isZoomed = false;

        if (!this.plugin.settings.displayOriginalSize) {
            if (this.fullMediaView.clientWidth > this.fullMediaView.clientHeight) {
                if (this.fullImage.naturalHeight < this.fullMediaView.clientHeight) {
                    this.fullImage.style.height = '100%';
                }
            } else {
                if (this.fullImage.naturalWidth < this.fullMediaView.clientWidth) {
                    this.fullImage.style.width = '100%';
                }
            }
        }
    }

    registerMediaEvents() {
        // 點擊預覽區域背景時關閉
        this.fullMediaView.onclick = (event) => {
            // 檢查點擊的是否為預覽區域本身或其直接子元素
            if (event.target === this.fullMediaView || 
                ((event.target as Element).parentElement === this.fullMediaView && 
                event.target !== this.fullImage && 
                event.target !== this.fullVideo)) {
                this.hideMedia();
            }
        };

        // 圖片點擊事件（放大）
        this.fullImage.onclick = (event) => {
            // 阻止事件冒泡，避免觸發外層的點擊事件
            event.stopPropagation();

            if (this.plugin.settings.displayOriginalSize &&
                this.fullImage.naturalWidth < this.fullMediaView.clientWidth && 
                this.fullImage.naturalHeight < this.fullMediaView.clientHeight) {
                return;
            }
            
            if (event.target === this.fullImage) { 
                if (!this.isZoomed) { // 縮放
                    // 計算點擊位置相對於圖片的百分比
                    const rect = this.fullImage.getBoundingClientRect();
                    const clickX = event.clientX - rect.left;
                    const clickY = event.clientY - rect.top;
                    const clickXPercent = clickX / rect.width;
                    const clickYPercent = clickY / rect.height;
                    
                    if (this.fullMediaView.clientWidth > this.fullMediaView.clientHeight) {
                        if (this.fullImage.naturalHeight < this.fullMediaView.clientHeight) {
                            this.fullImage.style.maxWidth = 'none';
                        }
                    } else {
                        if (this.fullImage.naturalWidth < this.fullMediaView.clientWidth) {
                            this.fullImage.style.maxHeight = 'none';
                        }
                    }

                    if (this.fullImage.offsetWidth < this.fullMediaView.clientWidth) {
                        this.fullImage.style.width = '100vw';
                        this.fullImage.style.height = 'auto';
                        this.fullMediaView.style.overflowX = 'hidden';
                        this.fullMediaView.style.overflowY = 'scroll';
                    } else {
                        this.fullImage.style.width = 'auto';
                        this.fullImage.style.height = '100vh';
                        this.fullMediaView.style.overflowX = 'scroll';
                        this.fullMediaView.style.overflowY = 'hidden';

                        // 將事件處理程序存儲在類別屬性中
                        this.handleWheel = (e) => {
                            e.preventDefault();
                            this.fullMediaView.scrollLeft += e.deltaY;
                        };
                        this.fullMediaView.addEventListener('wheel', this.handleWheel);
                    }
                    
                    this.fullImage.style.maxWidth = 'none';
                    this.fullImage.style.maxHeight = 'none';
                    this.fullImage.style.position = 'relative';
                    this.fullImage.style.left = '0';
                    this.fullImage.style.top = '0';
                    this.fullImage.style.margin = 'auto';
                    this.fullImage.style.transform = 'none';
                    this.fullImage.style.cursor = 'zoom-out';
                    this.isZoomed = true;

                    // 在下一幀執行滾動，確保圖片已經放大
                    requestAnimationFrame(() => {
                        if (this.fullMediaView.scrollWidth > this.fullMediaView.clientWidth) {
                            // 水平滾動到點擊位置
                            const scrollX = (this.fullImage.scrollWidth * clickXPercent) - (this.fullMediaView.clientWidth / 2);
                            this.fullMediaView.scrollLeft = Math.max(0, Math.min(scrollX, this.fullImage.scrollWidth - this.fullMediaView.clientWidth));
                        }
                        if (this.fullMediaView.scrollHeight > this.fullMediaView.clientHeight) {
                            // 垂直滾動到點擊位置
                            const scrollY = (this.fullImage.scrollHeight * clickYPercent) - (this.fullMediaView.clientHeight / 2);
                            this.fullMediaView.scrollTop = Math.max(0, Math.min(scrollY, this.fullImage.scrollHeight - this.fullMediaView.clientHeight));
                        }
                    });
                } else {
                    this.resetImageStyles();
                }
            }
        };

        // 滾輪事件
        this.fullMediaView.onwheel = (e) => {
            if (this.isZoomed) return;
            
            e.preventDefault();
            if (e.deltaY < 0) {
                this.currentIndex = (this.currentIndex - 1 + this.mediaUrls.length) % this.mediaUrls.length;
            } else {
                this.currentIndex = (this.currentIndex + 1) % this.mediaUrls.length;
            }
            this.showMedia(this.currentIndex);
        };

        // 鍵盤事件
        this.scope.register(null, 'ArrowLeft', (evt) => {
            if (evt.ctrlKey && !this.isImage && this.fullVideo) {
                // Alt+左方向鍵：影片倒退 5 秒
                this.fullVideo.currentTime = Math.max(0, this.fullVideo.currentTime - 5);
                evt.preventDefault();
            } else {
                // 普通左方向鍵：切換到上一個媒體
                this.currentIndex = (this.currentIndex - 1 + this.mediaUrls.length) % this.mediaUrls.length;
                this.showMedia(this.currentIndex);
            }
        });

        this.scope.register(null, 'ArrowRight', (evt) => {
            if (evt.ctrlKey && !this.isImage && this.fullVideo) {
                // Alt+右方向鍵：影片前進 5 秒
                this.fullVideo.currentTime = Math.min(this.fullVideo.duration, this.fullVideo.currentTime + 5);
                evt.preventDefault();
            } else {
                // 普通右方向鍵：切換到下一個媒體
                this.currentIndex = (this.currentIndex + 1) % this.mediaUrls.length;
                this.showMedia(this.currentIndex);
            }
        });

        this.scope.register(null, 'ArrowDown', () => {
            this.hideMedia();
        });

        this.scope.register(null, 'Escape', () => {
            this.hideMedia();
        });
    }

    // 刪除媒體檔案
    async deleteMedia(index: number) {
        if (!this.plugin.settings.allowMediaDeletion) {
            return;
        }

        const media = this.mediaUrls[index];
        
        // 優先使用來源路徑，若無則使用當前開啟的檔案
        let activeFile: TFile | null = null;
        activeFile = this.sourcePath 
            ? this.app.vault.getAbstractFileByPath(this.sourcePath) as TFile | null
            : this.app.workspace.getActiveFile();
        
        if (!activeFile) {
            return;
        }
        
        try {
            // 讀取當前文件內容
            let content = await this.app.vault.read(activeFile);
            
            const frontMatterInfo = getFrontMatterInfo(content);
            const frontmatter = frontMatterInfo.frontmatter;
            let mainContent = content.substring(frontMatterInfo.contentStart);
            
            // 只在主要內容中移除媒體連結
            media.links?.forEach(link => {
                mainContent = mainContent.replace(link, '');
            });

            // 重新組合文件內容
            const newContent = `---\n${frontmatter}---\n${mainContent}`;

            // 更新文件內容
            await this.app.vault.modify(activeFile, newContent);

            // 從陣列中移除該媒體
            this.mediaUrls.splice(index, 1);
            
            // 清空當前內容
            const { contentEl } = this;
            contentEl.empty();
            
            // 如果沒有更多媒體，關閉視窗
            if (this.mediaUrls.length === 0) {
                new Notice(t('media_deleted'));
                this.close();
                return;
            }

            // 重新建立基本 UI 結構
            this.modalEl.addClass('media-viewer-modal');
            
            contentEl.addEventListener('click', (e) => {
                if (e.target === contentEl) {
                    this.close();
                }
            });

            // 重新建立縮圖區域
            const galleryContent = contentEl.createDiv('mv-gallery-content');
            
            galleryContent.addEventListener('click', (e) => {
                const isMediaThumbnail = (e.target as Element).closest('.mv-media-thumbnail');
                if (!isMediaThumbnail) {
                    this.close();
                }
            });

            // 重新渲染所有縮圖
            this.mediaUrls.forEach((media, idx) => {
                const container = galleryContent.createDiv('mv-media-thumbnail-container');
                container.addClass('mv-media-thumbnail');
                
                if (media.type === 'image') {
                    const img = container.createEl('img');
                    img.src = media.url;
                    img.onclick = () => this.showMedia(idx);
                } else {
                    if (media.url.match(/\.(mp4|mkv|mov|webm)/i)) {
                        const video = container.createEl('video');
                        video.src = media.url;
                        video.onclick = () => this.showMedia(idx);
                        const videoIcon = container.createDiv('mv-video-indicator');
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        svg.setAttribute('width', '24');
                        svg.setAttribute('height', '24');
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('d', 'M8 5v14l11-7z');
                        svg.appendChild(path);
                        videoIcon.appendChild(svg);
                    } else {
                        const audio = container.createEl('audio');
                        audio.src = media.url;
                        container.onclick = () => this.showMedia(idx);
                        const audioIcon = container.createDiv('mv-audio-indicator');
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        svg.setAttribute('width', '24');
                        svg.setAttribute('height', '24');
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('fill', 'currentColor');
                        path.setAttribute('d', 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z');
                        svg.appendChild(path);
                        audioIcon.appendChild(svg);

                        // 添加檔案名稱顯示
                        const fileName = media.path ? media.path.split('/').pop() : media.url.split('/').pop();
                        if (fileName) {
                            const cleanFileName = fileName.split('?')[0]; // 移除檔案名稱中 ? 後面的部分
                            const decodedFileName = decodeURIComponent(cleanFileName)
                            const filenameDiv = container.createDiv('mv-audio-filename');
                            filenameDiv.textContent = decodedFileName.replace(/\.[^/.]+$/, '');
                        }
                    }
                }
            });

            // 建立縮圖區域關閉按鈕
            const closeButton = contentEl.createEl('button', {
                cls: 'mv-gallery-close-button',
                text: '×'
            });
            closeButton.onclick = () => this.close();
            this.galleryCloseButton = closeButton;

            // 建立全屏預覽區域
            this.fullMediaView = contentEl.createDiv('mv-full-media-view');
            this.fullMediaView.style.display = 'none';

            // 添加左右切換區域
            const prevArea = this.fullMediaView.createDiv('mv-media-nav-area mv-prev-area');
            const nextArea = this.fullMediaView.createDiv('mv-media-nav-area mv-next-area');

            prevArea.onclick = (e) => {
                e.stopPropagation();
                const prevIndex = (this.currentIndex - 1 + this.mediaUrls.length) % this.mediaUrls.length;
                this.showMedia(prevIndex);
            };

            nextArea.onclick = (e) => {
                e.stopPropagation();
                const nextIndex = (this.currentIndex + 1) % this.mediaUrls.length;
                this.showMedia(nextIndex);
            };

            this.fullImage = this.fullMediaView.createEl('img', { cls: 'mv-full-image' });
            this.fullVideo = this.fullMediaView.createEl('video', { 
                cls: 'mv-full-video',
                attr: { controls: true }
            });

            // 建立媒體關閉按鈕
            const fullCloseButton = this.fullMediaView.createEl('button', {
                cls: 'mv-media-close-button',
                text: '×'
            });
            fullCloseButton.onclick = () => this.hideMedia();

            // 註冊事件監聽
            this.registerMediaEvents();

            // 自動顯示下一張圖片（如果還有的話）
            if (this.mediaUrls.length > 0) {
                const nextIndex = Math.min(index, this.mediaUrls.length - 1);
                this.showMedia(nextIndex);
            }

            new Notice(t('media_deleted'));
        } catch (error) {
            console.error('Error deleting media:', error);
            new Notice(t('error_deleting_media'));
        }
    }

    // 啟動自動播放功能
    startAutoPlay() {
        // 清除現有計時器（如果存在）
        this.clearAutoPlayTimer();
        
        // 檢查是否啟用自動播放
        const interval = this.plugin.settings.autoPlayInterval;
        if (interval > 0) {
            // 設定新的計時器
            this.autoPlayTimer = window.setTimeout(() => {
                // 播放下一張圖片
                const nextIndex = (this.currentIndex + 1) % this.mediaUrls.length;
                this.showMedia(nextIndex);
            }, interval * 1000) as number; // 轉換為毫秒，並確保類型為 number
            
            // 設定自動播放狀態為開啟
            this.isAutoPlaying = true;
            
            // 更新按鈕文字（如果存在）
            const autoPlayButton = this.fullMediaView.querySelector('.mv-info-item[data-action="autoplay"]');
            if (autoPlayButton) {
                autoPlayButton.textContent = t('stop_auto_play');
            }
        }
    }
    
    // 停止自動播放
    stopAutoPlay() {
        this.clearAutoPlayTimer();
        this.isAutoPlaying = false;
        
        // 更新按鈕文字（如果存在）
        if (this.fullMediaView) {
            const autoPlayButton = this.fullMediaView.querySelector('.mv-info-item[data-action="autoplay"]');
            if (autoPlayButton) {
                autoPlayButton.textContent = t('auto_play');
            }
        }
    }
    
    // 清除自動播放計時器
    clearAutoPlayTimer() {
        if (this.autoPlayTimer) {
            window.clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    onClose() {
        // 確保關閉時清除計時器
        this.stopAutoPlay();
        
        const { contentEl } = this;
        contentEl.empty();
    }
}