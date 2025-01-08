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

        // 按鈕和標籤
        'DELETE': '刪除',
        'CANCEL': '取消',
        'CONFIRM': '確認',
        'CLOSE': '×',

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
        'GENERATE_GALLERY': '生成 Gallery 區塊',
        'GENERATE_LINKED_IMAGES': '生成連結圖片'
    },
    'en': {
        // Notifications
        'PLEASE_OPEN_NOTE': 'Please open a note first',
        'ERROR_SCANNING_MEDIA': 'Error scanning media files',
        'NO_MEDIA_FOUND': 'No media found in this note',
        'MEDIA_DELETED': 'Media file deleted',
        'ERROR_DELETING_MEDIA': 'Error deleting media file',

        // Buttons and Labels
        'DELETE': 'Delete',
        'CANCEL': 'Cancel',
        'CONFIRM': 'Confirm',
        'CLOSE': '×',

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
        'GENERATE_GALLERY': 'Generate Gallery Block',
        'GENERATE_LINKED_IMAGES': 'Generate Linked Images'
    },
    'zh': {
        // 通知信息
        'PLEASE_OPEN_NOTE': '请先打开一个笔记文件',
        'ERROR_SCANNING_MEDIA': '扫描媒体文件时出错',
        'NO_MEDIA_FOUND': '此笔记中没有找到媒体文件',
        'MEDIA_DELETED': '已删除媒体文件',
        'ERROR_DELETING_MEDIA': '删除媒体文件时出错',

        // 按钮和标签
        'DELETE': '删除',
        'CANCEL': '取消',
        'CONFIRM': '确认',
        'CLOSE': '×',

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
        'GENERATE_GALLERY': '生成 Gallery 区块',
        'GENERATE_LINKED_IMAGES': '生成链接图片'
    },
    'ja': {
        // 通知メッ�ージ
        'PLEASE_OPEN_NOTE': '最初にノートを開いてください',
        'ERROR_SCANNING_MEDIA': 'メディアファイルのスキャン中にエラーが発生しました',
        'NO_MEDIA_FOUND': 'このノートにはメディアが見つかりません',
        'MEDIA_DELETED': 'メディアファイルが削除されました',
        'ERROR_DELETING_MEDIA': 'メディアファイルの削除中にエラーが発生しました',

        // ボタンとラベル
        'DELETE': '削除',
        'CANCEL': 'キャンセル',
        'CONFIRM': '確認',
        'CLOSE': '×',

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
        'GENERATE_GALLERY': 'ギャラリーブロックを生成',
        'GENERATE_LINKED_IMAGES': 'リンクされた画像を生成'
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
            
            // 匹配兩種格式：
            // 1. ![[image.jpg]] - Obsidian 內部連結
            // 2. ![alt](path) - 標準 Markdown

            const mediaUrls = [];
            const mediaLinks = new Map(); // 用於儲存媒體連結的原始文字

            // 處理 Obsidian 內部連結
            const internalMatches = Array.from(content.matchAll(/!\[\[(.*?)(?:\|.*?)?\]\]/g));
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
                        if (extension.match(/^(jpg|jpeg|png|gif|webp|mp4|webm)$/)) {
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
            const externalMatches = Array.from(content.matchAll(/!\[(.*?)\]\((.*?)\)/g));
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
                    // 本地文件
                    try {
                        const file = this.app.vault.getAbstractFileByPath(path);
                        if (file) {
                            const url = this.app.vault.getResourcePath(file);
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
                    } catch (e) {
                        console.error('Error processing file path:', path, e);
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
                // Add video icon indicator
                const videoIcon = container.createDiv('video-indicator');
                videoIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
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
        
        // 添加樣式
        this.addStyle();

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
                this.isZoomed = false;
                this.resetImageStyles();
                if (this.fullImage.naturalHeight > this.fullMediaView.clientHeight) {
                    this.fullImage.style.cursor = 'zoom-in';
                } else {
                    this.fullImage.style.cursor = 'default';
                    this.fullImage.style.height = '100%';
                }
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
        this.fullImage.style.maxWidth = '100%';
        this.fullImage.style.maxHeight = '100vh';
        this.fullImage.style.position = 'absolute';
        this.fullImage.style.left = '50%';
        this.fullImage.style.top = '50%';
        this.fullImage.style.transform = 'translate(-50%, -50%)';
        this.fullImage.style.cursor = 'default';
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
                if (this.fullMediaView.clientWidth > this.fullMediaView.clientHeight) { //橫向螢幕
                    if (this.fullImage.naturalHeight > this.fullMediaView.clientHeight) {
                        if (!this.isZoomed) { // 縮放
                            const maxWidth = this.fullMediaView.clientWidth;
                            const scale = Math.min(maxWidth / this.fullImage.naturalWidth, 1);
                            const targetWidth = this.fullImage.naturalWidth * scale;
                            const targetHeight = this.fullImage.naturalHeight * scale;

                            this.fullImage.style.width = targetWidth + 'px';
                            this.fullImage.style.height = targetHeight + 'px';
                            this.fullImage.style.maxWidth = 'none';
                            this.fullImage.style.maxHeight = 'none';
                            this.fullImage.style.position = 'relative';
                            this.fullImage.style.left = '0';
                            this.fullImage.style.top = '0';
                            this.fullImage.style.margin = 'auto';
                            this.fullImage.style.transform = 'none';
                            this.fullImage.style.cursor = 'zoom-out';
                            
                            this.fullMediaView.style.overflowY = 'scroll';
                            this.isZoomed = true;
                        } else {
                            this.resetImageStyles();
                            this.fullMediaView.style.overflowY = 'hidden';
                            this.isZoomed = false;
                        }
                    } else {
                        this.hideMedia();
                    }
                } else { // 直向螢幕
                    if (this.fullImage.naturalHeight > this.fullMediaView.clientHeight) {
                        if (!this.isZoomed) { // 縮放
                            const maxHeight = this.fullMediaView.clientHeight;
                            const scale = Math.min(maxHeight / this.fullImage.naturalHeight, 1);
                            const targetWidth = this.fullImage.naturalWidth * scale;
                            const targetHeight = this.fullImage.naturalHeight * scale;

                            this.fullImage.style.width = targetWidth + 'px';
                            this.fullImage.style.height = targetHeight + 'px';
                            this.fullImage.style.maxWidth = 'none';
                            this.fullImage.style.maxHeight = 'none';
                            this.fullImage.style.position = 'relative';
                            this.fullImage.style.left = '0';
                            this.fullImage.style.top = '0';
                            this.fullImage.style.margin = 'auto';
                            this.fullImage.style.transform = 'none';
                            this.fullImage.style.cursor = 'zoom-out';
                            
                            this.fullMediaView.style.overflowX = 'scroll';
                            this.isZoomed = true;
                        } else {
                            this.resetImageStyles();
                            this.fullMediaView.style.overflowX = 'hidden';
                            this.isZoomed = false;
                        }
                    } else {
                        this.hideMedia();
                    }
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

    addStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .media-viewer-modal {
                padding: 0;
                background: rgba(0, 0, 0, 0.5);
                width: 100vw !important;
                height: 100vh !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                margin: 0 !important;
                border-radius: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                overflow: auto !important;
            }
            
            .gallery-content {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(${this.plugin.settings.galleryGridMinWidth}px, 1fr));
                gap: 15px;
                padding: 20px;
                justify-content: center;
                width: 100%;
                margin: auto;
                max-height: 95vh;
                overflow-y: auto;
                border-radius: 8px;
            }
            
            /* 自定義滾動條樣式 */
            .gallery-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .gallery-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            
            .gallery-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 4px;
            }
            
            .gallery-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .gallery-close-button {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: rgba(0, 0, 0, 0.5);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1001;
                transition: background-color 0.3s;
            }
            
            .gallery-close-button:hover {
                background: #edf5ff;
            }
            
            .media-thumbnail-container {
                aspect-ratio: 1;
                overflow: hidden;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s;
                background: var(--background-primary);
                position: relative;
                margin: 0;
            }

            .media-thumbnail-container:hover {
                transform: scale(1.05);
            }

            .media-thumbnail-container img,
            .media-thumbnail-container video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .media-thumbnail {
                position: relative;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .video-indicator {
                position: absolute;
                top: 8px;
                left: 8px;
                width: 32px;
                height: 32px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                z-index: 1;
                backdrop-filter: blur(2px);
            }

            .video-indicator svg {
                width: 20px;
                height: 20px;
            }

            .delete-button {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                background: rgba(255, 0, 0, 0.7);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                opacity: 0;
                transition: opacity 0.2s;
            }

            .media-thumbnail-container:hover .delete-button {
                opacity: 1;
            }

            .delete-button:hover {
                background: rgba(255, 0, 0, 0.9);
            }

            .full-media-view {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                overflow-x: hidden;
            }
            
            .media-nav-area {
                position: absolute;
                top: 20%;
                height: 70%;
                width: 10%;
                z-index: 1001;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.1;
                transition: opacity 0.3s;
            }

            .media-nav-area:hover {
                opacity: 0.3;
                background: rgba(255, 255, 255, 0.0);
            }

            .prev-area {
                left: 0;
            }

            .next-area {
                right: 0;
            }

            .full-image,
            .full-video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .media-close-button {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: rgba(0, 0, 0, 0.5);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1002;
                transition: background-color 0.3s;
            }
            
            .media-close-button:hover {
                background: #edf5ff;
            }

            .media-delete-button {
                position: fixed;
                top: 20px;
                left: 20px;
                padding: 4px 8px;
                background: rgba(255, 0, 0, 0.5);
                border: none;
                border-radius: 4px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1002;
                transition: background-color 0.3s;
            }
            
            .media-delete-button:hover {
                background: rgba(255, 0, 0, 0.7);
            }
        `;
        document.head.appendChild(style);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    // 刪除媒體檔案
    async deleteMedia(index) {
        if (!this.plugin.settings.allowMediaDeletion) {
            new Notice('刪除媒體檔案功能已被禁用。請在設定中啟用此功能。');
            return;
        }

        const media = this.mediaUrls[index];
        const activeFile = this.app.workspace.getActiveFile();
        
        try {
            // 讀取當前文件內容
            let content = await this.app.vault.read(activeFile);
            
            // 移除所有相關的連結文字
            media.links.forEach(link => {
                content = content.replace(link, '');
            });
            
            // 移除多餘的空行
            content = content.replace(/\n\n\n+/g, '\n\n').trim();

            // 更新文件內容
            await this.app.vault.modify(activeFile, content);

            // 從陣列中移除該媒體
            this.mediaUrls.splice(index, 1);
            
            // 清空當前內容
            const { contentEl } = this;
            contentEl.empty();
            
            // 如果沒有更多媒體，關閉視窗
            if (this.mediaUrls.length === 0) {
                new Notice('已刪除所有媒體文件');
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
                    // Add video icon indicator
                    const videoIcon = container.createDiv('video-indicator');
                    videoIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
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
                    text: '刪除'
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

            new Notice('已刪除媒體文件');
        } catch (error) {
            console.error('Error deleting media:', error);
            new Notice('刪除媒體文件時出錯');
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
    openMediaBrowserOnClick: false,
    muteVideoOnOpen: false,
    galleryGridMinWidth: 150
};

// 新增一個確認視窗類別
class GalleryConfirmModal extends Modal {
    constructor(app, plugin, editor, selectedText) {
        super(app);
        this.plugin = plugin;
        this.editor = editor;
        this.selectedText = selectedText;
        this.generateLinks = false;
        this.generateGallery = true; // 預設勾選生成 Gallery 區塊
    }

    onOpen() {
        const {contentEl} = this;
        
        contentEl.createEl('h3', {text: 'Gallery'});
        
        // 建立勾選框區域
        const settingDiv = contentEl.createDiv();
        settingDiv.style.margin = '20px 0';
        settingDiv.style.display = 'flex';
        settingDiv.style.flexDirection = 'column';
        settingDiv.style.gap = '10px';
        
        // Gallery 區塊勾選框
        const galleryDiv = settingDiv.createDiv();
        const galleryCheckbox = galleryDiv.createEl('input', {
            type: 'checkbox',
            attr: {
                id: 'generateGallery',
                checked: true // 預設勾選
            }
        });
        
        const galleryLabel = galleryDiv.createEl('label', {
            text: this.plugin.t('GENERATE_GALLERY'),
            attr: {
                for: 'generateGallery'
            }
        });
        galleryLabel.style.marginLeft = '10px';
        
        // 連結圖片勾選框
        const linksDiv = settingDiv.createDiv();
        const linksCheckbox = linksDiv.createEl('input', {
            type: 'checkbox',
            attr: {
                id: 'generateLinks'
            }
        });
        
        const linksLabel = linksDiv.createEl('label', {
            text: this.plugin.t('GENERATE_LINKED_IMAGES'),
            attr: {
                for: 'generateLinks'
            }
        });
        linksLabel.style.marginLeft = '10px';
        
        // 建立按鈕區域
        const buttonDiv = contentEl.createDiv();
        buttonDiv.style.display = 'flex';
        buttonDiv.style.justifyContent = 'flex-end';
        buttonDiv.style.gap = '10px';
        buttonDiv.style.marginTop = '20px';
        
        // 取消按鈕
        const cancelButton = buttonDiv.createEl('button', {text: '取消'});
        cancelButton.onclick = () => this.close();
        
        // 確認按鈕
        const confirmButton = buttonDiv.createEl('button', {text: '確認'});
        confirmButton.classList.add('mod-cta');
        confirmButton.onclick = async () => {
            this.generateLinks = linksCheckbox.checked;
            this.generateGallery = galleryCheckbox.checked;
            await this.processGallery();
            this.close();
        };
    }

    async processGallery() {
        let finalText = this.selectedText;
        
        // 如果勾選了生成連結圖片，先處理連結
        if (this.generateLinks) {
            finalText = await this.plugin.processSelectedText(this.selectedText);
        }
        
        // 如果勾選了生成 Gallery 區塊，包裝成 Gallery 區塊
        if (this.generateGallery) {
            finalText = `\`\`\`gallery\n${finalText}\n\`\`\``;
        }
        
        this.editor.replaceSelection(finalText);
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

module.exports = class MediaViewPlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        
        this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor, view) => {
            menu.addItem((subItem) => {
                subItem
                    .setTitle(this.t('GENERATE_GALLERY'))
                    .setIcon('image')
                    .onClick(() => {
                        const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
                        if (activeView) {
                            const editor = activeView.editor;
                            const selectedText = editor.getSelection();
                            new GalleryConfirmModal(this.app, this, editor, selectedText).open();
                        } else {
                            new Notice('請先開啟一個筆記');
                        }
                    })
            });
        }));

        if (this.settings.openMediaBrowserOnClick) {
            // 添加點擊圖片的事件監聽
            this.registerDomEvent(document, 'click', (evt) => {
                const target = evt.target;
                // 確認點擊的是圖片，且不在 code block 內，也不在 modal 內
                if (target.tagName === 'IMG' && 
                    !target.closest('pre') && 
                    !target.closest('.media-viewer-modal')) {
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
            });
        }

        // 統一使用 registerMarkdownCodeBlockProcessor 來處理兩種模式
        this.registerMarkdownCodeBlockProcessor("gallery", (source, el, ctx) => {
            // 檢查元素是否已經處理過
            if (el.querySelector('.media-gallery-grid')) {
                return;
            }

            try {
                // 解析內容並創建圖庫
                const mediaUrlsData = this.parseGalleryContent(source);
                if (mediaUrlsData.items.length > 0) {
                    const galleryDiv = this.createGalleryElement(mediaUrlsData);
                    el.appendChild(galleryDiv);
                }
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

        // 添加設定頁面
        this.addSettingTab(new MyMediaViewSettingTab(this.app, this));

        // 添加樣式
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .media-gallery-grid {
                position: relative;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                padding: 15px;
                background: var(--background-secondary);
                border-radius: 8px;
                margin: 1em 0;
            }

            .media-gallery-grid .media-thumbnail-container {
                aspect-ratio: 1;
                overflow: hidden;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.2s;
                background: var(--background-primary);
                position: relative;
                margin: 0;
            }

            .media-gallery-grid .media-thumbnail-container:hover {
                transform: scale(1.05);
            }

            .media-gallery-grid .media-thumbnail-container img,
            .media-gallery-grid .media-thumbnail-container video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
                    
            .cm-editor .media-gallery-grid {
                pointer-events: all;
            }

            .container-link-area {
                position: absolute;
                background: rgba(0, 0, 0, 0.5);
                padding: 4px 8px;
                border-radius: 4px;
                z-index: 3;
                white-space: nowrap;
                max-width: calc(100% - 40px);  /* 預留左右邊距 */
            }

            .container-link-area.top-left {
                top: 20px;
                left: 20px;
            }

            .container-link-area.top-right {
                top: 20px;
                right: 20px;
            }

            .container-link-area.bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .container-link-area.bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .container-link-area a {
                color: white;
                text-decoration: none;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: block;
            }

            .container-link-area a:hover {
                text-decoration: underline;
            }

            .media-link-area {
                position: absolute;
                bottom: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.7);
                padding: 4px 8px;
                border-top-left-radius: 4px;
                z-index: 2;
                max-width: 100%;
                box-sizing: border-box;
            }

            .media-link-area a {
                color: white;
                text-decoration: none;
                font-size: 12px;
                word-break: break-all;
                display: block;
            }

            .media-link-area a:hover {
                text-decoration: underline;
            }

            .video-indicator {
                position: absolute;
                top: 8px;
                left: 8px;
                width: 32px;
                height: 32px;
                background: rgba(0, 0, 0, 0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                z-index: 1;
                backdrop-filter: blur(2px);
            }

            .video-indicator svg {
                width: 20px;
                height: 20px;
                fill: currentColor;
            }

            .note-thumbnail {
                background: var(--background-primary-alt);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 15px;
                height: 100%;
            }

            .note-preview {
                text-align: center;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }

            .note-thumbnail-image {
                max-width: 100%;
                max-height: calc(100% - 50px); /* 預留標題空間 */
                object-fit: contain;
                border-radius: 8px;
            }

            .note-icon {
                margin: auto 0;
                transition: transform 0.2s;
                flex-grow: 1;
                display: flex;
                align-items: center;
            }

            .note-title {
                font-size: 14px;
                color: var(--text-normal);
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                width: 100%;
                margin-top: auto;
            }

            .note-icon {
                margin-bottom: 10px;
                transition: transform 0.2s;
            }

            .note-icon svg {
                width: 40px;
                height: 40px;
                color: var(--text-muted);
            }

            .note-icon.external-link svg {
                color: var(--text-accent);
            }

            .note-thumbnail:hover .note-title {
                color: var(--text-accent);
            }

            .note-thumbnail:hover {
                background: var(--background-modifier-hover);
            }

            /* 外部連結的特殊樣式 */
            .note-thumbnail.external-link {
                background: var(--background-primary-alt);
            }

            .note-thumbnail.external-link:hover {
                background: var(--background-modifier-hover);
            }
        `;
        document.head.appendChild(styleEl);
        this.register(() => styleEl.remove());
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

    parseGalleryContent(content) {
        const items = [];
        const lines = content.split('\n');
        
        let currentTitle = null;
        let currentLinkUrl = null;
        let currentThumbnail = null;
        let containerTitle = null;
        let containerPosition = 'top-left';
        
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
                    const file = this.app.vault.getAbstractFileByPath(url);
                    if (file) {
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
                        if (extension.match(/^(jpg|jpeg|png|gif|webp|mp4|webm)$/)) {
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
                        const file = this.app.vault.getAbstractFileByPath(url);
                        if (file) {
                            const extension = url.toLowerCase();
                            items.push({
                                type: extension.match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video',
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
        }

        return {
            items,
            containerInfo: {
                title: containerTitle,
                position: containerPosition
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
                        noteIcon.innerHTML = `
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                            </svg>
                        `;
                        noteIcon.classList.add('external-link');
                    } else {
                        noteIcon.innerHTML = `
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M14,17H7V15H14V17M17,13H7V11H17V13M17,9H7V7H17V9M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
                            </svg>
                        `;
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
            videoIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
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

    async processSelectedText(text) {
        const lines = text.split('\n');
        const processedLines = [];
        
        for (const line of lines) {
            // 檢查是否為筆記連結 (非圖片連結)
            const match = line.match(/(?<!!)\[\[(.*?)(?:\|.*?)?\]\]/);
            if (match) {
                const linkText = match[1].split('|')[0];
                const file = this.app.metadataCache.getFirstLinkpathDest(linkText, '');
                
                if (file) {
                    // 讀取筆記內容
                    const content = await this.app.vault.read(file);
                    
                    // 尋找第一個圖片連結
                    let firstImage = null;
                    let firstImagePosition = Infinity;
                    
                    // 檢查 ![[image.jpg]] 格式
                    const internalMatch = content.match(/!\[\[(.*?\.(?:jpg|jpeg|png|gif|webp))\]\]/i);
                    if (internalMatch) {
                        const imageFile = this.app.metadataCache.getFirstLinkpathDest(internalMatch[1], '');
                        if (imageFile) {
                            firstImagePosition = content.indexOf(internalMatch[0]);
                            firstImage = `![[${internalMatch[1]}]]`;
                        }
                    }
                    
                    // 檢查 ![alt](path) 格式
                    const markdownMatch = content.match(/!\[.*?\]\((.*?(?:\.(?:jpg|jpeg|png|gif|webp)|format=(?:jpg|jpeg|png|gif|webp)).*?)\)/i);
                    if (markdownMatch) {
                        const markdownPosition = content.indexOf(markdownMatch[0]);
                        // 如果這個圖片出現的位置比之前找到的更早，就更新 firstImage
                        if (markdownPosition < firstImagePosition) {
                            firstImage = markdownMatch[0];
                            firstImagePosition = markdownPosition;
                        }
                    }
                    
                    // 如果找到圖片，加入處理後的文字
                    if (firstImage) {
                        processedLines.push(`img: ${firstImage}`);
                    }
                }
                
                // 加入原始的筆記連結
                processedLines.push(line);
            } else {
                // 如果不是筆記連結，直接加入原始行
                processedLines.push(line);
            }
        }
        
        return processedLines.join('\n');
    }

    t(key) {
        const langSetting = window.localStorage.getItem('language');
        const lang = TRANSLATIONS[langSetting] || TRANSLATIONS['en'];
        return lang[key] || key;
    }
}
