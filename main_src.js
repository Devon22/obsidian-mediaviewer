const { Plugin, Modal, PluginSettingTab, Setting } = require('obsidian');

// 語系檔案
const TRANSLATIONS = {
    'zh-TW': {
        // 通知訊息
        'PLEASE_OPEN_NOTE': '請先打開一個筆記文件',
        'ERROR_SCANNING_MEDIA': '掃描媒體文件時出錯',
        'NO_MEDIA_FOUND': '此筆記中沒有找到媒體文件',
        'MEDIA_DELETED': '已刪除媒體文件',
        'ERROR_DELETING_MEDIA': '刪除媒體文件時出錯',
        'GALLERY_NOT_FOUND': '無法找到對應的 Gallery 區塊',
        'ERROR_ADDING_FILE': '新增檔案時發生錯誤',

        // 按鈕和標籤
        'DELETE': '刪除',
        'CANCEL': '取消',
        'CONFIRM': '確認',
        'CLOSE': '×',
        'DRAG_AND_DROP': '拖曳圖片到這裡或點擊選擇檔案',
        'ADD_IMAGE': '新增圖片',

        // 設定
        'ALLOW_MEDIA_DELETION': '允許刪除媒體檔案',
        'ALLOW_MEDIA_DELETION_DESC': '啟用此選項後，可以在媒體瀏覽器中刪除媒體檔案',
        'AUTO_OPEN_FIRST_IMAGE': '自動打開第一張圖片',
        'AUTO_OPEN_FIRST_IMAGE_DESC': '啟用此選項後，媒體瀏覽器將自動打開第一張圖片',
        'CLICK_TO_OPEN_MEDIA': '點擊圖片打開媒體瀏覽器',
        'CLICK_TO_OPEN_MEDIA_DESC': '啟用此選項後，點擊一般的圖片將以媒體瀏覽器打開 (需重啟)',
        'MUTE_VIDEO_ON_OPEN': '打開影片時靜音',
        'MUTE_VIDEO_ON_OPEN_DESC': '啟用此選項後，媒體瀏覽器打開影片時會自動靜音',
        'GALLERY_GRID_WIDTH': 'Gallery Grid 佈局寬度',
        'GALLERY_GRID_WIDTH_DESC': '調整 Gallery Grid 佈局的寬度，預設 150px，最小值 100px',

        // 命令
        'OPEN_MEDIA_VIEWER': '打開媒體瀏覽器',
        'GENERATE_GALLERY': '生成 Gallery 區塊'
    },
    'en': {
        // Notifications
        'PLEASE_OPEN_NOTE': 'Please open a note first',
        'ERROR_SCANNING_MEDIA': 'Error scanning media files',
        'NO_MEDIA_FOUND': 'No media found in this note',
        'MEDIA_DELETED': 'Media file deleted',
        'ERROR_DELETING_MEDIA': 'Error deleting media file',
        'GALLERY_NOT_FOUND': 'Gallery block not found',
        'ERROR_ADDING_FILE': 'Error adding file',

        // Buttons and Labels
        'DELETE': 'Delete',
        'CANCEL': 'Cancel',
        'CONFIRM': 'Confirm',
        'CLOSE': '×',
        'DRAG_AND_DROP': 'Drag and drop images here or click to select files',
        'ADD_IMAGE': 'Add Image',

        // Settings
        'ALLOW_MEDIA_DELETION': 'Allow Media Deletion',
        'ALLOW_MEDIA_DELETION_DESC': 'Enable deletion of media files in the media browser',
        'AUTO_OPEN_FIRST_IMAGE': 'Auto Open First Image',
        'AUTO_OPEN_FIRST_IMAGE_DESC': 'Automatically open the first image when opening the media browser',
        'CLICK_TO_OPEN_MEDIA': 'Click Image to Open Media Browser',
        'CLICK_TO_OPEN_MEDIA_DESC': 'Open media browser when clicking on images (requires restart)',
        'MUTE_VIDEO_ON_OPEN': 'Mute Video on Open',
        'MUTE_VIDEO_ON_OPEN_DESC': 'Automatically mute videos when opening in the media browser',
        'GALLERY_GRID_WIDTH': 'Gallery Grid Width',
        'GALLERY_GRID_WIDTH_DESC': 'Adjust the width of gallery grid layout, default 150px, minimum 100px',

        // Commands
        'OPEN_MEDIA_VIEWER': 'Open Media Viewer',
        'GENERATE_GALLERY': 'Generate Gallery Block'
    },
    'zh': {
        // 通知信息
        'PLEASE_OPEN_NOTE': '请先打开一个笔记文件',
        'ERROR_SCANNING_MEDIA': '扫描媒体文件时出错',
        'NO_MEDIA_FOUND': '此笔记中没有找到媒体文件',
        'MEDIA_DELETED': '已删除媒体文件',
        'ERROR_DELETING_MEDIA': '删除媒体文件时出错',
        'GALLERY_NOT_FOUND': '无法找到对应的 Gallery 区块',
        'ERROR_ADDING_FILE': '新增档案时发生错误',

        // 按钮和标签
        'DELETE': '删除',
        'CANCEL': '取消',
        'CONFIRM': '确认',
        'CLOSE': '×',
        'DRAG_AND_DROP': '拖曳图片到这裡或点击选择图片',
        'ADD_IMAGE': '新增图片',

        // 设置
        'ALLOW_MEDIA_DELETION': '允许删除媒体文件',
        'ALLOW_MEDIA_DELETION_DESC': '启用此选项后，可以在媒体浏览器中删除媒体文件',
        'AUTO_OPEN_FIRST_IMAGE': '自动打开第一张图片',
        'AUTO_OPEN_FIRST_IMAGE_DESC': '启用此选项后，媒体浏览器将自动打开第一张图片',
        'CLICK_TO_OPEN_MEDIA': '点击图片打开媒体浏览器',
        'CLICK_TO_OPEN_MEDIA_DESC': '启用此选项后，点击一般的图片将以媒体浏览器打开 (需重启)',
        'MUTE_VIDEO_ON_OPEN': '打开影片时静音',
        'MUTE_VIDEO_ON_OPEN_DESC': '启用此选项后，媒体浏览器打开影片时会自动静音',
        'GALLERY_GRID_WIDTH': 'Gallery Grid 布局宽度',
        'GALLERY_GRID_WIDTH_DESC': '调整 Gallery Grid 布局的宽度，默认 150px，最小值 100px',

        // 命令
        'OPEN_MEDIA_VIEWER': '打开媒体浏览器',
        'GENERATE_GALLERY': '生成 Gallery 区块'
    },
    'ja': {
        // 通知メッジ
        'PLEASE_OPEN_NOTE': '最初にノートを開いてください',
        'ERROR_SCANNING_MEDIA': 'メディアファイルのスキャン中にエラーが発生しました',
        'NO_MEDIA_FOUND': 'このノートにはメディアが見つかりません',
        'MEDIA_DELETED': 'メディアファイルが削除されました',
        'ERROR_DELETING_MEDIA': 'メディアファイルの削除中にエラーが発生しました',
        'GALLERY_NOT_FOUND': 'ギャラリーブロックが見つかりません',
        'ERROR_ADDING_FILE': 'ファイルを追加する際にエラーが発生しました',

        // ボタンとラベル
        'DELETE': '削除',
        'CANCEL': 'キャンセル',
        'CONFIRM': '確認',
        'CLOSE': '×',
        'DRAG_AND_DROP': '画像をドラッグ＆ドロップするか、クリックしてファイルを選択',
        'ADD_IMAGE': '画像を追加',

        // 設定
        'ALLOW_MEDIA_DELETION': 'メディア削除を許可',
        'ALLOW_MEDIA_DELETION_DESC': 'メディアブラウザでメディアファイルの削除を有効にします',
        'AUTO_OPEN_FIRST_IMAGE': '最初の画像を自動的に開く',
        'AUTO_OPEN_FIRST_IMAGE_DESC': 'メディアブラウザを開くときに最初の画像を自動的に開きます',
        'CLICK_TO_OPEN_MEDIA': '画像をクリックしてメディアブラウザを開く',
        'CLICK_TO_OPEN_MEDIA_DESC': '画像をクリックするとメディアブラウザが開きます（再起動が必要）',
        'MUTE_VIDEO_ON_OPEN': '開くときにビデオをミュート',
        'MUTE_VIDEO_ON_OPEN_DESC': 'メディアブラウザで開くときにビデオを自動的にミュートします',
        'GALLERY_GRID_WIDTH': 'ギャラリーグリッドの幅',
        'GALLERY_GRID_WIDTH_DESC': 'ギャラリーグリッドレイアウトの幅を調整します。デフォルトは150px、最小は100px',

        // コマンド
        'OPEN_MEDIA_VIEWER': 'メディアビューワーを開く',
        'GENERATE_GALLERY': 'ギャラリーブロックを生成'
    }
};

class FullScreenModal extends Modal {
    constructor(app, openType = 'command') {
        super(app);
        this.mediaUrls = [];
        this.currentIndex = 0;
        this.isZoomed = false;
        this.isImage = true;
        this.plugin = null;
        this.openType = openType;
        this.modalEl.addClass('media-viewer-modal');
        this.modalEl.style.background = openType === 'command' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.0)';
    }

    async scanMedia() {
        // 獲取當前活動的 markdown 文件
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice(this.t('PLEASE_OPEN_NOTE'));
            return [];
        }

        try {
            // 讀取文件內容
            const content = await this.app.vault.read(activeFile);
            
            // 移除 frontmatter 區域
            const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
            
            // 匹配兩種格式：
            // 1. ![[image.jpg]] - Obsidian 內部連結
            // 2. ![alt](path) - 標準 Markdown

            const mediaUrls = [];
            const mediaLinks = new Map(); // 用於儲存媒體連結的原始文字

            // 處理 Obsidian 內部連結
            const internalMatches = Array.from(contentWithoutFrontmatter.matchAll(/!\[\[(.*?)(?:\|.*?)?\]\]/g));
            for (const match of internalMatches) {
                const linktext = match[1];
                const fullMatch = match[0];  // 完整的連結文字
                if (!linktext) continue;

                try {
                    // 使用 Obsidian metadataCache API 解析內部連結
                    const file = this.app.metadataCache.getFirstLinkpathDest(linktext, '');
                    if (file) {
                        const url = this.app.vault.getResourcePath(file);
                        const extension = file.extension.toLowerCase();
                        if (extension.match(/^(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/)) {
                            // 如果這個 URL 已經存在，將新的連結文字加入到現有的列表中
                            if (mediaLinks.has(url)) {
                                mediaLinks.get(url).push(fullMatch);
                            } else {
                                mediaLinks.set(url, [fullMatch]);
                                mediaUrls.push({
                                    type: extension.match(/^(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
                                    url: url
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error processing internal link:', linktext, e);
                }
            }

            // 處理標準 Markdown 連結
            const externalMatches = Array.from(contentWithoutFrontmatter.matchAll(/!\[(.*?)\]\((.*?)\)/g));
            for (const match of externalMatches) {
                const path = match[2];
                const fullMatch = match[0];  // 完整的連結文字
                if (!path) continue;

                if (path.startsWith('http://') || path.startsWith('https://')) {
                    // 網絡圖片
                    if (mediaLinks.has(path)) {
                        mediaLinks.get(path).push(fullMatch);
                    } else {
                        mediaLinks.set(path, [fullMatch]);
                        mediaUrls.push({
                            type: 'image',
                            url: path
                        });
                    }
                } else {
                    // 本地文件 - 使用 getFirstLinkpathDest 來解析路徑
                    const file = this.app.metadataCache.getFirstLinkpathDest(path, '');
                    if (!file) {
                        // 如果找不到檔案，再嘗試直接用路徑查找
                        const fileByPath = this.app.vault.getAbstractFileByPath(path);
                        if (fileByPath) {
                            const url = this.app.vault.getResourcePath(fileByPath);
                            const extension = path.toLowerCase();
                            if (mediaLinks.has(url)) {
                                mediaLinks.get(url).push(fullMatch);
                            } else {
                                mediaLinks.set(url, [fullMatch]);
                                mediaUrls.push({
                                    type: extension.match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
                                    url: url
                                });
                            }
                        }
                    } else {
                        const url = this.app.vault.getResourcePath(file);
                        const extension = file.extension.toLowerCase();
                        if (mediaLinks.has(url)) {
                            mediaLinks.get(url).push(fullMatch);
                        } else {
                            mediaLinks.set(url, [fullMatch]);
                            mediaUrls.push({
                                type: extension.match(/^(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
                                url: url
                            });
                        }
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
            new Notice(this.t('ERROR_SCANNING_MEDIA'));
            return [];
        }
    }

    async onOpen() {
        // 掃描媒體檔案
        this.mediaUrls = await this.scanMedia();
        if (this.mediaUrls.length === 0) {
            new Notice(this.t('NO_MEDIA_FOUND'));
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
        const galleryContent = contentEl.createDiv('gallery-content');
        galleryContent.style.gridTemplateColumns = `repeat(auto-fill, minmax(${this.plugin.settings.galleryGridMinWidth}px, 1fr))`;

        if (this.openType !== 'command') galleryContent.style.display = 'none';

        galleryContent.addEventListener('click', (e) => {
            const isMediaThumbnail = e.target.closest('.media-thumbnail');
            if (!isMediaThumbnail) {
                this.close();
            }
        });
        
        this.mediaUrls.forEach((media, index) => {
            const container = galleryContent.createDiv('media-thumbnail-container');
            container.addClass('media-thumbnail');
            
            if (media.type === 'image') {
                const img = container.createEl('img');
                img.src = media.url;
                img.onclick = () => this.showMedia(index);
            } else {
                const video = container.createEl('video');
                video.src = media.url;
                video.onclick = () => this.showMedia(index);
                const videoIcon = container.createDiv('video-indicator');
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('fill', 'currentColor');
                path.setAttribute('d', 'M8 5v14l11-7z');
                svg.appendChild(path);
                videoIcon.appendChild(svg);
            }
        });

        // 建立縮圖區域關閉按鈕
        const closeButton = contentEl.createEl('button', {
            cls: 'gallery-close-button',
            text: '×'
        });
        closeButton.onclick = () => this.close();
        this.galleryCloseButton = closeButton; 

        // 建立全屏預覽區域
        this.fullMediaView = contentEl.createDiv('full-media-view');
        this.fullMediaView.style.display = 'none';
        this.fullMediaView.style.background = this.openType === 'command' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)';
        
        // 添加刪除按鈕（只在啟用刪除功能時顯示）
        if (this.plugin.settings.allowMediaDeletion) {
            const deleteButton = this.fullMediaView.createEl('button', {
                cls: 'media-delete-button',
                text: this.t('DELETE')
            });
            deleteButton.onclick = async (e) => {
                e.stopPropagation();
                await this.deleteMedia(this.currentIndex);
            };
        }

        // 添加左右切換區域
        const prevArea = this.fullMediaView.createDiv('media-nav-area prev-area');
        const nextArea = this.fullMediaView.createDiv('media-nav-area next-area');

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

        this.fullImage = this.fullMediaView.createEl('img', { cls: 'full-image' });
        this.fullVideo = this.fullMediaView.createEl('video', { 
            cls: 'full-video',
            attr: { controls: true }
        });

        // 建立媒體關閉按鈕
        const fullCloseButton = this.fullMediaView.createEl('button', {
            cls: 'media-close-button',
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

    showMedia(index) {
        // 過濾出所有媒體項目
        const mediaItems = this.mediaUrls.filter(item => item.type === 'image' || item.type === 'video');
        if (mediaItems.length === 0) {
            new Notice(this.t('NO_MEDIA_FOUND'));
            this.close();
            return;
        }

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
            this.fullVideo.muted = this.plugin.settings.muteVideoOnOpen;
            this.fullVideo.style.display = 'block';
            this.fullImage.style.display = 'none';
            this.fullVideo.play();
        }
    }

    hideMedia() {
        if (this.openType === 'thumbnail') {
            this.close();
            return;
        }

        this.fullMediaView.style.display = 'none';
        this.galleryCloseButton.style.display = 'flex';
        this.isZoomed = false;
        this.fullVideo.pause();
    }

    resetImageStyles() {
        this.fullImage.style.width = 'auto';
        this.fullImage.style.height = 'auto';
        this.fullImage.style.maxWidth = '100vw';
        this.fullImage.style.maxHeight = '100vh';
        this.fullImage.style.position = 'absolute';
        this.fullImage.style.left = '50%';
        this.fullImage.style.top = '50%';
        this.fullImage.style.transform = 'translate(-50%, -50%)';
        this.fullImage.style.cursor = 'zoom-in';
        this.fullMediaView.style.overflowX = 'hidden';
        this.fullMediaView.style.overflowY = 'hidden';
        this.isZoomed = false;

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

    registerMediaEvents() {       
        // 點擊預覽區域背景時關閉
        this.fullMediaView.onclick = (event) => {
            // 檢查點擊的是否為預覽區域本身或其直接子元素
            if (event.target === this.fullMediaView || 
                (event.target.parentElement === this.fullMediaView && 
                event.target !== this.fullImage && 
                event.target !== this.fullVideo)) {
                this.hideMedia();
            }
        };

        // 圖片點擊事件（放大）
        this.fullImage.onclick = (event) => {
            // 阻止事件冒泡，避免觸發外層的點擊事件
            event.stopPropagation();
            
            if (event.target === this.fullImage) { 
                if (!this.isZoomed) { // 縮放
                    if (this.fullImage.offsetWidth < this.fullMediaView.clientWidth && this.fullImage.offsetHeight == this.fullMediaView.clientHeight) {
                        this.fullImage.style.width = '100vw';
                        this.fullImage.style.height = 'auto';
                        this.fullMediaView.style.overflowX = 'hidden';
                        this.fullMediaView.style.overflowY = 'scroll';
                    } else if (this.fullImage.offsetWidth == this.fullMediaView.clientWidth && this.fullImage.offsetHeight < this.fullMediaView.clientHeight) {
                        this.fullImage.style.width = 'auto';
                        this.fullImage.style.height = '100vh';
                        this.fullMediaView.style.overflowX = 'scroll';
                        this.fullMediaView.style.overflowY = 'hidden';
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
        this.scope.register(null, 'ArrowLeft', () => {
            if (this.isImage || this.fullVideo.currentTime <= 0) {
                this.currentIndex = (this.currentIndex - 1 + this.mediaUrls.length) % this.mediaUrls.length;
                this.showMedia(this.currentIndex);
            } else {
                this.fullVideo.currentTime -= 5;
            }
        });

        this.scope.register(null, 'ArrowRight', () => {
            if (this.isImage || this.fullVideo.currentTime >= this.fullVideo.duration) {
                this.currentIndex = (this.currentIndex + 1) % this.mediaUrls.length;
                this.showMedia(this.currentIndex);
            } else {
                this.fullVideo.currentTime += 5;
            }
        });

        this.scope.register(null, 'ArrowDown', () => {
            this.hideMedia();
        });

        this.scope.register(null, 'Escape', () => {
            this.hideMedia();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    // 刪除媒體檔案
    async deleteMedia(index) {
        if (!this.plugin.settings.allowMediaDeletion) {
            return;
        }

        const media = this.mediaUrls[index];
        const activeFile = this.app.workspace.getActiveFile();
        
        try {
            // 讀取當前文件內容
            let content = await this.app.vault.read(activeFile);
            
            // 分離 frontmatter 和內容
            const frontmatterMatch = content.match(/^(---\n[\s\S]*?\n---\n)?(.*)$/s);
            const frontmatter = frontmatterMatch[1] || '';
            let mainContent = frontmatterMatch[2];
            
            // 只在主要內容中移除媒體連結
            media.links.forEach(link => {
                mainContent = mainContent.replace(link, '');
            });

            // 重新組合文件內容
            const newContent = frontmatter + mainContent;

            // 更新文件內容
            await this.app.vault.modify(activeFile, newContent);

            // 從陣列中移除該媒體
            this.mediaUrls.splice(index, 1);
            
            // 清空當前內容
            const { contentEl } = this;
            contentEl.empty();
            
            // 如果沒有更多媒體，關閉視窗
            if (this.mediaUrls.length === 0) {
                new Notice(this.t('MEDIA_DELETED'));
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
            const galleryContent = contentEl.createDiv('gallery-content');
            
            galleryContent.addEventListener('click', (e) => {
                const isMediaThumbnail = e.target.closest('.media-thumbnail');
                if (!isMediaThumbnail) {
                    this.close();
                }
            });

            // 重新渲染所有縮圖
            this.mediaUrls.forEach((media, idx) => {
                const container = galleryContent.createDiv('media-thumbnail-container');
                container.addClass('media-thumbnail');
                
                if (media.type === 'image') {
                    const img = container.createEl('img');
                    img.src = media.url;
                    img.onclick = () => this.showMedia(idx);
                } else {
                    const video = container.createEl('video');
                    video.src = media.url;
                    video.onclick = () => this.showMedia(idx);
                    const videoIcon = container.createDiv('video-indicator');
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('width', '24');
                    svg.setAttribute('height', '24');
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('fill', 'currentColor');
                    path.setAttribute('d', 'M8 5v14l11-7z');
                    svg.appendChild(path);
                    videoIcon.appendChild(svg);
                }
            });

            // 建立縮圖區域關閉按鈕
            const closeButton = contentEl.createEl('button', {
                cls: 'gallery-close-button',
                text: '×'
            });
            closeButton.onclick = () => this.close();
            this.galleryCloseButton = closeButton;

            // 建立全屏預覽區域
            this.fullMediaView = contentEl.createDiv('full-media-view');
            this.fullMediaView.style.display = 'none';

            // 添加刪除按鈕（只在啟用刪除功能時顯示）
            if (this.plugin.settings.allowMediaDeletion) {
                const deleteButton = this.fullMediaView.createEl('button', {
                    cls: 'media-delete-button',
                    text: this.t('DELETE')
                });
                deleteButton.onclick = async (e) => {
                    e.stopPropagation();
                    await this.deleteMedia(this.currentIndex);
                };
            }

            // 添加左右切換區域
            const prevArea = this.fullMediaView.createDiv('media-nav-area prev-area');
            const nextArea = this.fullMediaView.createDiv('media-nav-area next-area');

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

            this.fullImage = this.fullMediaView.createEl('img', { cls: 'full-image' });
            this.fullVideo = this.fullMediaView.createEl('video', { 
                cls: 'full-video',
                attr: { controls: true }
            });

            // 建立媒體關閉按鈕
            const fullCloseButton = this.fullMediaView.createEl('button', {
                cls: 'media-close-button',
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

            new Notice(this.t('MEDIA_DELETED'));
        } catch (error) {
            console.error('Error deleting media:', error);
            new Notice(this.t('ERROR_DELETING_MEDIA'));
        }
    }

    t(key) {
        const langSetting = window.localStorage.getItem('language');
        const lang = TRANSLATIONS[langSetting] || TRANSLATIONS['en'];
        return lang[key] || key;
    }
}

//設定視窗
class MyMediaViewSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName(this.plugin.t('ALLOW_MEDIA_DELETION'))
            .setDesc(this.plugin.t('ALLOW_MEDIA_DELETION_DESC'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.allowMediaDeletion)
                .onChange(async (value) => {
                    this.plugin.settings.allowMediaDeletion = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName(this.plugin.t('AUTO_OPEN_FIRST_IMAGE'))
            .setDesc(this.plugin.t('AUTO_OPEN_FIRST_IMAGE_DESC'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoOpenFirstImage)
                .onChange(async (value) => {
                    this.plugin.settings.autoOpenFirstImage = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(this.plugin.t('CLICK_TO_OPEN_MEDIA'))
            .setDesc(this.plugin.t('CLICK_TO_OPEN_MEDIA_DESC'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openMediaBrowserOnClick)
                .onChange(async (value) => {
                    this.plugin.settings.openMediaBrowserOnClick = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName(this.plugin.t('MUTE_VIDEO_ON_OPEN'))
            .setDesc(this.plugin.t('MUTE_VIDEO_ON_OPEN_DESC'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.muteVideoOnOpen)
                .onChange(async (value) => {
                    this.plugin.settings.muteVideoOnOpen = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName(this.plugin.t('GALLERY_GRID_WIDTH'))
            .setDesc(this.plugin.t('GALLERY_GRID_WIDTH_DESC'))
            .addText(text => {
                text.inputEl.type = 'number';  // 設定為數字輸入框
                text.inputEl.min = '100';       // 設定最小值
                text.setPlaceholder('150')
                    .setValue(String(this.plugin.settings.galleryGridMinWidth))
                    .onChange(async (value) => {
                        const width = parseInt(value, 10);
                        if (!isNaN(width) && width >= 100) {
                            this.plugin.settings.galleryGridMinWidth = width;
                            await this.plugin.saveSettings();
                        }
                    });
                return text;
            });
    }
}

const DEFAULT_SETTINGS = {
    allowMediaDeletion: false,
    autoOpenFirstImage: false,
    openMediaBrowserOnClick: true,
    muteVideoOnOpen: false,
    galleryGridMinWidth: 150
};

module.exports = class MediaViewPlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        
        this.addCommand({
            id: 'mediaview-generategallery',
            name: this.t('GENERATE_GALLERY'),
            callback: () => this.generateGallery()
        });

        this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor, view) => {
            menu.addItem((subItem) => {
                subItem
                    .setTitle(this.t('GENERATE_GALLERY'))
                    .setIcon('image')
                    .onClick(() => this.generateGallery())
            });
        }));

        if (this.settings.openMediaBrowserOnClick) {
            // 添加點擊圖片的事件監聽
            this.registerDomEvent(document, 'click', (evt) => {
                const target = evt.target;

                if (!target.closest('.markdown-reading-view') &&
                !target.closest('.cm-s-obsidian') ) {
                    return;
                }

                // 確認點擊的是圖片，且不在 code block 內，也不在 modal 內
                if (target.tagName === 'IMG' && 
                    !target.closest('pre') && 
                    !target.closest('.media-viewer-modal') &&
                    !target.closest('.media-gallery-grid')) {
                    // 阻止預設行為
                    evt.preventDefault();
                    evt.stopPropagation();

                    // 開啟 modal
                    const modal = new FullScreenModal(this.app, 'thumbnail');
                    modal.plugin = this;
                    modal.open();
                    
                    // 等待 modal 載入完成後顯示對應圖片
                    setTimeout(() => {
                        const allUrls = modal.mediaUrls;
                        const targetUrl = target.src;
                        const targetIndex = allUrls.findIndex(m => m.url === targetUrl);
                        if (targetIndex !== -1) {
                            modal.showMedia(targetIndex);
                        }
                    }, 100);
                }
            }, true);
        }

        // 統一使用 registerMarkdownCodeBlockProcessor 來處理兩種模式
        this.registerMarkdownCodeBlockProcessor("gallery", async (source, el, ctx) => {
            if (el.querySelector('.media-gallery-grid')) {
                return;
            }

            try {
                const mediaUrlsData = await this.parseGalleryContent(source);
                //if (mediaUrlsData.items.length > 0) {
                    const galleryDiv = this.createGalleryElement(mediaUrlsData);
                    el.appendChild(galleryDiv);
                //}
            } catch (error) {
                console.error('Error processing gallery block:', error);
            }
        });

        // 添加命令
        this.addCommand({
            id: 'open-media-viewer',
            name: this.t('OPEN_MEDIA_VIEWER'),
            callback: () => {
                const modal = new FullScreenModal(this.app, 'command');
                modal.plugin = this;
                modal.open();
            }
        });

        // 添加 ribbon 命令
        this.addRibbonIcon('images', this.t('OPEN_MEDIA_VIEWER'), () => {
            const modal = new FullScreenModal(this.app, 'command');
            modal.plugin = this;
            modal.open();
        });

        // 添加設定頁面
        this.addSettingTab(new MyMediaViewSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        
        // 確保 galleryGridMinWidth 是數字
        if (typeof this.settings.galleryGridMinWidth === 'string') {
            this.settings.galleryGridMinWidth = parseInt(this.settings.galleryGridMinWidth, 10) || DEFAULT_SETTINGS.galleryGridMinWidth;
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    generateGallery() {
        const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
        if (activeView) {
            const editor = activeView.editor;
            const selectedText = editor.getSelection();
            editor.replaceSelection(`\`\`\`gallery\naddButton: true\n${selectedText}\n\`\`\`\n`);
        } else {
            new Notice(this.t('PLEASE_OPEN_NOTE'));
        }
    }
    
    async parseGalleryContent(content) {
        const items = [];
        const lines = content.split('\n');
        
        let currentTitle = null;
        let currentLinkUrl = null;
        let currentThumbnail = null;
        let containerTitle = null;
        let containerPosition = 'top-left';
        let addButtonEnabled = false; // 預設為 true
        
        // 處理縮圖連結的輔助函數
        const processMediaLink = (linkText) => {
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
                const url = markdownMatch[2];
                if (url.startsWith('http')) {
                    return url;
                } else {
                    const file = this.app.metadataCache.getFirstLinkpathDest(url, '');
                    if(!file) {
                        const fileByPath = this.app.vault.getAbstractFileByPath(url);
                        if (fileByPath) {
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
                if (file) {
                    return this.app.vault.getResourcePath(file);
                }
            }

            return null;
        };

        // 新增：處理筆記內容中的第一張圖片
        const findFirstImageInNote = async (file) => {
            try {
                const content = await this.app.vault.read(file);
                let firstImage = null;
                let firstImagePosition = Infinity;
                
                // 檢查 ![[image.jpg]] 格式
                const internalMatch = content.match(/!\[\[(.*?\.(?:jpg|jpeg|png|gif|webp))\]\]/i);
                if (internalMatch) {
                    firstImage = internalMatch[0];
                    firstImagePosition = content.indexOf(internalMatch[0]);
                }
                
                // 檢查 ![alt](path) 格式
                const markdownMatch = content.match(/!\[.*?\]\((.*?(?:\.(?:jpg|jpeg|png|gif|webp)|format=(?:jpg|jpeg|png|gif|webp)).*?)\)/i);
                if (markdownMatch) {
                    const markdownPosition = content.indexOf(markdownMatch[0]);
                    if (markdownPosition < firstImagePosition) {
                        firstImage = markdownMatch[0];
                        firstImagePosition = markdownPosition;
                    }
                }
                
                return firstImage;
            } catch (error) {
                console.error('Error reading note content:', error);
                return null;
            }
        };

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

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
                currentThumbnail = processMediaLink(thumbnailMatch[1].trim());
                continue;
            }
            
            // 處理筆記連結
            const internalMatch = line.match(/(!?)\[\[(.*?)(?:\|.*?)?\]\]/);
            if (internalMatch) {
                const [_, isImage, linktext] = internalMatch;
                const actualLinktext = linktext.split('|')[0];
                const file = this.app.metadataCache.getFirstLinkpathDest(actualLinktext, '');

                if (isImage && !currentThumbnail) {
                    // 處理一般的圖片/媒體連結
                    if (file) {
                        const extension = file.extension.toLowerCase();
                        if (extension.match(/^(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/)) {
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
                            if (fileByPath) {
                                const extension = url.toLowerCase();
                                items.push({
                                    type: extension.match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
                                    url: this.app.vault.getResourcePath(fileByPath),
                                    path: text || fileByPath.path,
                                    title: currentTitle,
                                    linkUrl: currentLinkUrl
                                });
                            }
                        } else {
                            const extension = file.extension.toLowerCase();
                            items.push({
                                type: extension.match(/^(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
                                url: this.app.vault.getResourcePath(file),
                                path: text || file.path,
                                title: currentTitle,
                                linkUrl: currentLinkUrl
                            });
                        }
                    } else {
                        const urlForTypeCheck = url.split('?')[0].toLowerCase();
                        const isImageFile = urlForTypeCheck.match(/\.(jpg|jpeg|png|gif|webp)$/) || 
                                        url.includes('format=jpg') || 
                                        url.includes('format=jpeg') || 
                                        url.includes('format=png') || 
                                        url.includes('format=gif') || 
                                        url.includes('format=webp');
                        items.push({
                            type: isImageFile ? 'image' : 'video',
                            url: url,
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

            // 檢查是否要禁用新增按鈕
            const addButtonMatch = trimmedLine.match(/^addButton:\s*(true|false)$/i);
            if (addButtonMatch) {
                addButtonEnabled = addButtonMatch[1].toLowerCase() === 'true';
                continue;
            }
        }

        return {
            items,
            containerInfo: {
                title: containerTitle,
                position: containerPosition,
                addButtonEnabled: addButtonEnabled
            }
        };
    }

    createGalleryElement(mediaUrlsData) {
        const { items, containerInfo } = mediaUrlsData;
        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'media-gallery-grid';

        // 使用設定值，確保有預設值
        const minWidth = Math.max(100, this.settings.galleryGridMinWidth || DEFAULT_SETTINGS.galleryGridMinWidth);
        galleryDiv.style.gridTemplateColumns = `repeat(auto-fill, minmax(${minWidth}px, 1fr))`;

        // 處理容器標題
        if (containerInfo.title) {
            const containerLinkArea = document.createElement('div');
            containerLinkArea.className = `container-link-area ${containerInfo.position}`;
            
            if (containerInfo.title.type === 'text') {
                // 純文字
                const textSpan = document.createElement('span');
                textSpan.textContent = containerInfo.title.text;
                textSpan.style.color = 'white';
                containerLinkArea.appendChild(textSpan);
            } else {
                // 內部或外部連結
                const link = document.createElement('a');
                link.textContent = containerInfo.title.text;
                
                if (containerInfo.title.type === 'internal') {
                    // 內部連結
                    const file = this.app.vault.getAbstractFileByPath(containerInfo.title.url);
                    if (file) {
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
                
                containerLinkArea.appendChild(link);
            }
            
            galleryDiv.appendChild(containerLinkArea);
        }

        // 處理所有項目
        items.forEach((item, index) => {
            if (item.type === 'note') {
                const container = document.createElement('div');
                container.className = 'media-thumbnail-container note-thumbnail';
                
                const notePreview = document.createElement('div');
                notePreview.className = 'note-preview';
                
                // 如果有縮圖，使用縮圖
                if (item.thumbnail) {
                    const img = document.createElement('img');
                    img.src = item.thumbnail;
                    img.className = 'note-thumbnail-image';
                    notePreview.appendChild(img);
                } else {
                    // 否則使用預設圖示
                    const noteIcon = document.createElement('div');
                    noteIcon.className = 'note-icon';
                    
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
                
                const noteTitle = document.createElement('div');
                noteTitle.className = 'note-title';
                noteTitle.textContent = item.title;
                notePreview.appendChild(noteTitle);
                
                container.appendChild(notePreview);
                
                container.onclick = (event) => {
                    event.stopPropagation();
                    if (item.isExternalLink) {
                        // 外部連結：在新分頁開啟
                        window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
                    } else if (item.isInternalLink && item.file) {
                        // 內部連結：在新分頁開啟筆記
                        const leaf = this.app.workspace.getLeaf('tab');
                        leaf.openFile(item.file);
                    } else {
                        // 其他連結：嘗試在新分頁開啟
                        window.open(item.path, '_blank', 'noopener,noreferrer');
                    }
                };
                
                galleryDiv.appendChild(container);
            } else {
                // 處理媒體檔案
                const container = this.createMediaContainer(item, index);
                galleryDiv.appendChild(container);
            }
        });

        // 根據 addButtonEnabled 決定是否添加"新增圖片"按鈕
        if (containerInfo.addButtonEnabled || items.length === 0) {
            const addContainer = document.createElement('div');
            addContainer.className = 'media-thumbnail-container add-media-button';
            
            const addIcon = document.createElement('div');
            addIcon.className = 'add-media-icon';
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
            addIconText.className = 'add-media-text';
            addIconText.textContent = this.t('ADD_IMAGE');
            addIcon.appendChild(addIconText);
            addContainer.appendChild(addIcon);
            addContainer.onclick = () => {
                const modal = new ImageUploadModal(this.app, this, galleryDiv);
                modal.open();
            };
            galleryDiv.appendChild(addContainer);
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
            for (const item of e.dataTransfer.items) {
                if (item.kind === 'string') {
                    if (item.type === 'text/uri-list') {
                        // 處理 URI 列表
                        const uriPromise = new Promise(resolve => {
                            item.getAsString(string => {
                                resolve({ type: 'uri', getData: () => string });
                            });
                        });
                        files.push(uriPromise);
                    } else if (item.type === 'text/plain') {
                        // 備用：處理純文字 (應該可以刪)
                        const textPromise = new Promise(resolve => {
                            item.getAsString(string => {
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
            const modal = new ImageUploadModal(this.app, this, galleryDiv);
            await modal.handleFiles(resolvedFiles);
        });
        
        return galleryDiv;
    }

    // 將原有的媒體容器創建邏輯抽取為獨立函數
    createMediaContainer(media, index) {
        const container = document.createElement('div');
        container.className = 'media-thumbnail-container';
        
        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.url;
            img.alt = media.path || '';
            img.style.pointerEvents = 'none';
            container.appendChild(img);
        } else {
            const video = document.createElement('video');
            video.src = media.url;
            video.style.pointerEvents = 'none';
            container.appendChild(video);
            
            const videoIcon = document.createElement('div');
            videoIcon.className = 'video-indicator';
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
        
        if (media.title) {
            const linkArea = document.createElement('div');
            linkArea.className = 'media-link-area';
            
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
                
                if (media.title.type === 'internal') {
                    // 內部連結
                    const file = this.app.vault.getAbstractFileByPath(media.title.url);
                    if (file) {
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
                
                linkArea.appendChild(link);
            }
            
            container.appendChild(linkArea);
        }
        
        container.onclick = () => {
            const modal = new FullScreenModal(this.app, 'thumbnail');
            modal.plugin = this;
            modal.open();
            setTimeout(() => {
                const allUrls = modal.mediaUrls;
                const targetIndex = allUrls.findIndex(m => m.url === media.url);
                if (targetIndex !== -1) {
                    modal.showMedia(targetIndex);
                }
            }, 100);
        };
        
        return container;
    }
    
    t(key) {
        const langSetting = window.localStorage.getItem('language');
        const lang = TRANSLATIONS[langSetting] || TRANSLATIONS['en'];
        return lang[key] || key;
    }
}

class ImageUploadModal extends Modal {
    constructor(app, plugin, galleryElement) {
        super(app);
        this.plugin = plugin;
        this.galleryElement = galleryElement; // 儲存觸發上傳的 gallery 元素
    }

    onOpen() {
        const {contentEl} = this;
        contentEl.empty();
        contentEl.addClass('upload-modal');

        const dropZone = contentEl.createDiv('upload-dropzone');
        
        const uploadIcon = dropZone.createDiv('upload-icon');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('d', 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z');
        svg.appendChild(path);
        uploadIcon.appendChild(svg);
        
        const instructions = dropZone.createDiv('upload-instructions');
        instructions.setText(this.t('DRAG_AND_DROP'));

        // 處理拖放事件
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.addClass('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.removeClass('drag-over');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.removeClass('drag-over');
            
            const files = e.dataTransfer.files;
            await this.handleFiles(files);
        });

        // 點擊上傳
        dropZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,video/*';
            input.multiple = true;
            
            input.onchange = async () => {
                if (input.files) {
                    await this.handleFiles(Array.from(input.files));
                }
            };
            
            input.click();
        });
    }

    async handleFiles(files) {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice(this.t('PLEASE_OPEN_NOTE'));
            return;
        }

        try {
            // 讀取當前文件內容
            const content = await this.app.vault.read(activeFile);
            
            // 找出所有 gallery 區塊
            const galleryBlocks = Array.from(content.matchAll(/```gallery\n([\s\S]*?)```/g));
            
            // 找到對應的 gallery 區塊
            let targetGalleryBlock = null;
            let targetGalleryStart = 0;
            let targetGalleryEnd = 0;
            
            // 遍歷所有 gallery 區塊，找到與當前 galleryElement 對應的區塊
            for (const match of galleryBlocks) {
                const blockContent = match[1];
                const blockStart = match.index;
                const blockEnd = blockStart + match[0].length;
                
                // 建立臨時的 div 來渲染這個 gallery 區塊
                const tempDiv = document.createElement('div');
                const galleryData = await this.plugin.parseGalleryContent(blockContent);
                const galleryEl = this.plugin.createGalleryElement(galleryData);
                tempDiv.appendChild(galleryEl);
                
                // 如果這個 gallery 元素與觸發上傳的元素相同
                if (tempDiv.querySelector('.media-gallery-grid').isEqualNode(this.galleryElement)) {
                    targetGalleryBlock = match;
                    targetGalleryStart = blockStart;
                    targetGalleryEnd = blockEnd;
                    break;
                }
            }
            
            if (!targetGalleryBlock) {
                new Notice(this.t('GALLERY_NOT_FOUND'));
                return;
            }

            const newLinks = []; // 儲存新連結

            // 處理每個檔案或連結
            for (const file of files) {
                if (file && typeof file === 'object' && (file.type === 'uri')) {
                    const linkContent = file.getData();
                    
                    // 拆分 linkContent 內容
                    const linkContents = linkContent.split('obsidian://'); // 假設每個連結在新行
                    for (const content of linkContents) {
                        // 處理 obsidian:// 協議的連結
                        const content1 = `obsidian://${content}`;
                        const obsidianUrlMatch = content1.match(/obsidian:\/\/open\?.*?file=([^&]+)/);
                        if (obsidianUrlMatch) {
                            // 解碼 URL 並移除檔案副檔名
                            const fileName = decodeURIComponent(obsidianUrlMatch[1]).replace(/\.md$/, '');
                            // 判斷 filename 是否有圖片檔的副檔名
                            if (/\.(jpg|jpeg|png|gif|webp|mp4|mov)$/i.test(fileName)) {
                                newLinks.push(`![[${fileName}]]`);
                            } else {
                                newLinks.push(`[[${fileName}]]`);
                            }
                        }
                    }
                    continue;
                }

                // 處理一般檔案
                if (file instanceof File) {
                    // 檢查是否為支援的媒體類型
                    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                        // 生成安全的檔案名稱
                        const safeName = this.getSafeFileName(file.name);
                        
                        // 取得附件資料夾路徑
                        const attachmentFolderPath = this.getAttachmentFolderPath(activeFile);
                        
                        // 確保附件資料夾存在
                        await this.ensureFolderExists(attachmentFolderPath);
                        
                        // 建立完整的檔案路徑
                        const filePath = `${attachmentFolderPath}/${safeName}`;

                        // 讀取並儲存檔案
                        const arrayBuffer = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = () => reject(reader.error);
                            reader.readAsArrayBuffer(file);
                        });

                        const fileExists = await this.app.vault.adapter.exists(filePath);
                        if (!fileExists) {
                            await this.app.vault.createBinary(filePath, arrayBuffer);
                        }

                        // 將新連結加入陣列
                        newLinks.push(`![[${safeName}]]`);
                    }
                }
            }

            // 在 gallery 區塊內容的最後一行插入新連結
            const blockContent = targetGalleryBlock[1];
            const newBlockContent = blockContent.trimEnd() + `\n${newLinks.join('\n')}\n`;
            
            // 更新整個文件內容
            const newContent = 
                content.substring(0, targetGalleryStart) +
                "```gallery\n" +
                newBlockContent +
                "```" +
                content.substring(targetGalleryEnd);
            
            await this.app.vault.modify(activeFile, newContent);
        } catch (error) {
            console.error('Error handling files:', error);
            new Notice(this.t('ERROR_ADDING_FILE'));
        }
        
        this.close();
    }

    getSafeFileName(originalName) {
        // 移除不安全的字元，只保留字母、數字、底線和檔案副檔名
        const name = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        // 確保檔案名稱唯一
        return name;
    }

    getAttachmentFolderPath(activeFile) {
        // 取得 vault 的附件設定
        const basePath = this.app.vault.config.attachmentFolderPath;
        
        if (basePath.startsWith('./')) {
            // 如果是相對路徑，則使用筆記所在資料夾
            const noteDir = activeFile.parent.path;
            return `${noteDir}/${basePath.slice(2)}`;
        } else if (basePath === '/') {
            // 如果是根路徑，直接使用 attachments
            return 'attachments';
        } else {
            // 使用設定的路徑
            return basePath;
        }
    }

    async ensureFolderExists(folderPath) {
        if (!(await this.app.vault.adapter.exists(folderPath))) {
            await this.app.vault.createFolder(folderPath);
        }
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }

    t(key) {
        const langSetting = window.localStorage.getItem('language');
        const lang = TRANSLATIONS[langSetting] || TRANSLATIONS['en'];
        return lang[key] || key;
    }
}
