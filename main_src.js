const { Plugin, Modal, PluginSettingTab, Setting, getLanguage, getFrontMatterInfo } = require('obsidian');

// 語系檔案
const TRANSLATIONS = {
    'zh-TW': {
        // 通知訊息
        'please_open_note': '請先打開一個筆記文件',
        'error_scanning_media': '掃描媒體文件時出錯',
        'no_media_found': '此筆記中沒有找到媒體文件',
        'media_deleted': '已刪除媒體文件',
        'error_deleting_media': '刪除媒體文件時出錯',
        'gallery_not_found': '無法找到對應的 Gallery 區塊',
        'error_adding_file': '新增檔案時發生錯誤',

        // 按鈕和標籤
        'delete': '刪除',
        'confirm': '確認',
        'drag_and_drop': '拖曳圖片到這裡或點擊選擇檔案',
        'add_image': '新增圖片',

        // 設定
        'allow_media_deletion': '允許刪除媒體檔案',
        'allow_media_deletion_desc': '啟用此選項後，可以在媒體瀏覽器中刪除媒體檔案',
        'auto_open_first_image': '自動打開第一張圖片',
        'auto_open_first_image_desc': '啟用此選項後，媒體瀏覽器將自動打開第一張圖片',
        'click_to_open_media': '點擊圖片打開媒體瀏覽器',
        'click_to_open_media_desc': '啟用此選項後，點擊一般的圖片將以媒體瀏覽器打開 (需重啟)',
        'mute_video_on_open': '打開影片時靜音',
        'mute_video_on_open_desc': '啟用此選項後，媒體瀏覽器打開影片時會自動靜音',
        'grid_size': '網格大小',
        'grid_size_desc': '設定 Gallery 網格大小',
        'grid_size_small': '小型網格',
        'grid_size_medium': '中型網格',
        'grid_size_large': '大型網格',
        'grid_size_small_width': '小型網格寬度',
        'grid_size_small_width_desc': '設定小型網格的寬度，最小值 100px',
        'grid_size_medium_width': '中型網格寬度',
        'grid_size_medium_width_desc': '設定中型網格的寬度，最小值 120px',
        'grid_size_large_width': '大型網格寬度',
        'grid_size_large_width_desc': '設定大型網格的寬度，最小值 150px',
        'show_image_info': '顯示圖片資訊',
        'show_image_info_desc': '在全螢幕模式下顯示圖片的檔案名稱和大小',
        'items_per_page': '每頁顯示項目數量',
        'items_per_page_desc': '當 Gallery 內的項目數量超過此數值時，將以分頁方式顯示',
        'prev_page': '上一頁',
        'next_page': '下一頁',
        'gallery_pagination': '每頁顯示數量',
        'gallery_pagination_desc': '設定每頁要顯示的圖片數量（0：不分頁）',
        'insert_position': '圖片插入位置',
        'insert_at_end': '插入在最後',
        'insert_at_start': '插入在最前',

        // 命令
        'open_media_viewer': '打開媒體瀏覽器',
        'generate_gallery': '生成 Gallery 區塊',
        'gallery_title': 'Gallery 標題',
        'gallery_title_desc': '設定 Gallery 的標題（選填）',
        'gallery_size': 'Gallery 尺寸',
        'gallery_size_desc': '選擇 Gallery 中圖片的顯示大小',
        'gallery_add_button': '顯示上傳按鈕',
        'gallery_add_button_desc': '是否在 Gallery 中顯示上傳圖片的按鈕'
    },
    'en': {
        // Notifications
        'please_open_note': 'Please open a note first',
        'error_scanning_media': 'Error scanning media files',
        'no_media_found': 'No media found in this note',
        'media_deleted': 'Media file deleted',
        'error_deleting_media': 'Error deleting media file',
        'gallery_not_found': 'Gallery block not found',
        'error_adding_file': 'Error adding file',

        // Buttons and Labels
        'delete': 'Delete',
        'confirm': 'Confirm',
        'drag_and_drop': 'Drag and drop images here or click to select files',
        'add_image': 'Add image',

        // Settings
        'allow_media_deletion': 'Allow media deletion',
        'allow_media_deletion_desc': 'Enable deletion of media files in the media browser',
        'auto_open_first_image': 'Auto open first image',
        'auto_open_first_image_desc': 'Automatically open the first image when opening the media browser',
        'click_to_open_media': 'Click image to open Media Browser',
        'click_to_open_media_desc': 'Open media browser when clicking on images (requires restart)',
        'mute_video_on_open': 'Mute video on open',
        'mute_video_on_open_desc': 'Automatically mute videos when opening in the media browser',
        'grid_size': 'Grid size',
        'grid_size_desc': 'Set the grid size for the gallery',
        'grid_size_small': 'Small grid',
        'grid_size_medium': 'Medium grid',
        'grid_size_large': 'Large grid',
        'grid_size_small_width': 'Small grid width',
        'grid_size_small_width_desc': 'Set the width for small grid layout (minimum 100px)',
        'grid_size_medium_width': 'Medium grid width',
        'grid_size_medium_width_desc': 'Set the width for medium grid layout (minimum 120px)',
        'grid_size_large_width': 'Large grid width',
        'grid_size_large_width_desc': 'Set the width for large grid layout (minimum 150px)',
        'show_image_info': 'Show image info',
        'show_image_info_desc': 'Show file name and size in fullscreen mode',
        'items_per_page': 'Items per page',
        'items_per_page_desc': 'When gallery items exceed this number, they will be displayed in pages',
        'prev_page': 'Prev page',
        'next_page': 'Next page',
        'gallery_pagination': 'Items per page',
        'gallery_pagination_desc': 'Set the number of images to display per page (0: no pagination)',
        'insert_position': 'Image insert position',
        'insert_at_end': 'Insert at end',
        'insert_at_start': 'Insert at start',

        // Commands
        'open_media_viewer': 'Open media viewer',
        'generate_gallery': 'Generate gallery block',
        'gallery_title': 'Gallery title',
        'gallery_title_desc': 'Set the title of the gallery (optional)',
        'gallery_size': 'Gallery size',
        'gallery_size_desc': 'Choose the display size of images in the gallery',
        'gallery_add_button': 'Show upload button',
        'gallery_add_button_desc': 'Whether to show the upload button in the gallery'
    },
    'zh': {
        // 通知信息
        'please_open_note': '请先打开一个笔记文件',
        'error_scanning_media': '扫描媒体文件时出错',
        'no_media_found': '此笔记中没有找到媒体文件',
        'media_deleted': '已删除媒体文件',
        'error_deleting_media': '删除媒体文件时出错',
        'gallery_not_found': '无法找到对应的 Gallery 区块',
        'error_adding_file': '新增档案时发生错误',

        // 按钮和标签
        'delete': '删除',
        'confirm': '确认',
        'drag_and_drop': '拖曳图片到这裡或点击选择图片',
        'add_image': '新增图片',

        // 设置
        'allow_media_deletion': '允许删除媒体文件',
        'allow_media_deletion_desc': '启用此选项后，可以在媒体浏览器中删除媒体文件',
        'auto_open_first_image': '自动打开第一张图片',
        'auto_open_first_image_desc': '启用此选项后，媒体浏览器将自动打开第一张图片',
        'click_to_open_media': '点击图片打开媒体浏览器',
        'click_to_open_media_desc': '启用此选项后，点击一般的图片将以媒体浏览器打开 (需重启)',
        'mute_video_on_open': '打开影片时静音',
        'mute_video_on_open_desc': '启用此选项后，媒体浏览器打开影片时会自动静音',
        'grid_size': '网格大小',
        'grid_size_desc': '设置 Gallery 网格大小',
        'grid_size_small': '小型网格',
        'grid_size_medium': '中型网格',
        'grid_size_large': '大型网格',
        'grid_size_small_width': '小型网格宽度',
        'grid_size_small_width_desc': '设置小型网格的宽度，最小值 100px',
        'grid_size_medium_width': '中型网格宽度',
        'grid_size_medium_width_desc': '设置中型网格的宽度，最小值 120px',
        'grid_size_large_width': '大型网格宽度',
        'grid_size_large_width_desc': '设置大型网格的宽度，最小值 150px',
        'show_image_info': '显示图片信息',
        'show_image_info_desc': '在全屏模式下显示图片的文件名和大小',
        'items_per_page': '每页显示项目数量',
        'items_per_page_desc': '当 Gallery 内的项目数量超过此数值时，将以分页方式显示',
        'prev_page': '上一页',
        'next_page': '下一页',
        'gallery_pagination': '每页显示数量',
        'gallery_pagination_desc': '设置每页要显示的图片数量（0：不分页）',
        'insert_position': '图片插入位置',
        'insert_at_end': '插入在最后',
        'insert_at_start': '插入在最前',

        // 命令
        'open_media_viewer': '打开媒体浏览器',
        'generate_gallery': '生成 Gallery 区块',
        'gallery_title': '相册标题',
        'gallery_title_desc': '设置相册的标题（选填）',
        'gallery_size': '相册尺寸',
        'gallery_size_desc': '选择相册中图片的显示大小',
        'gallery_add_button': '显示上传按钮',
        'gallery_add_button_desc': '是否在相册中显示上传图片的按钮'
    },
    'ja': {
        // 通知メッジ
        'please_open_note': '最初にノートを開いてください',
        'error_scanning_media': 'メディアファイルのスキャン中にエラーが発生しました',
        'no_media_found': 'このノートにはメディアが見つかりません',
        'media_deleted': 'メディアファイルが削除されました',
        'error_deleting_media': 'メディアファイルの削除中にエラーが発生しました',
        'gallery_not_found': 'ギャラリーブロックが見つかりません',
        'error_adding_file': 'ファイルを追加する際にエラーが発生しました',

        // ボタンとラベル
        'delete': '削除',
        'confirm': '確認',
        'drag_and_drop': '画像をドラッグ＆ドロップするか、クリックしてファイルを選択',
        'add_image': '画像を追加',

        // 設定
        'allow_media_deletion': 'メディア削除を許可',
        'allow_media_deletion_desc': 'メディアブラウザでメディアファイルの削除を有効にします',
        'auto_open_first_image': '最初の画像を自動的に開く',
        'auto_open_first_image_desc': 'メディアブラウザを開くときに最初の画像を自動的に開きます',
        'click_to_open_media': '画像をクリックしてメディアブラウザを開く',
        'click_to_open_media_desc': '画像をクリックするとメディアブラウザが開きます（再起動が必要）',
        'mute_video_on_open': '開くときにビデオをミュート',
        'mute_video_on_open_desc': 'メディアブラウザで開くときにビデオを自動的にミュートします',
        'grid_size': 'グリッドサイズ',
        'grid_size_desc': 'ギャラリーのグリッドサイズを設定します',
        'grid_size_small': '小さいグリッド',
        'grid_size_medium': '中くらいのグリッド',
        'grid_size_large': '大きいグリッド',
        'grid_size_small_width': '小さいグリッド幅',
        'grid_size_small_width_desc': '小さいグリッド幅を設定します（最小100px）',
        'grid_size_medium_width': '中くらいのグリッド幅',
        'grid_size_medium_width_desc': '中くらいのグリッド幅を設定します（最小120px）',
        'grid_size_large_width': '大きいグリッド幅',
        'grid_size_large_width_desc': '大きいグリッド幅を設定します（最小150px）',
        'show_image_info': '画像情報を表示',
        'show_image_info_desc': 'フルスクリーンモードでファイル名とサイズを表示',
        'items_per_page': '1ページあたりのアイテム数',
        'items_per_page_desc': 'ギャラリー内のアイテム数がこの数値を超えた場合、ページングで表示されます',
        'prev_page': '前のページ',
        'next_page': '次のページ',
        'gallery_pagination': '1ページあたりの表示数',
        'gallery_pagination_desc': '1ページに表示する画像の数を設定（0：ページングなし）',
        'insert_position': '画像の挿入位置',
        'insert_at_end': '最後に挿入',
        'insert_at_start': '先頭に挿入',

        // コマンド
        'open_media_viewer': 'メディアビューワーを開く',
        'generate_gallery': 'ギャラリーブロックを生成',
        'gallery_title': 'ギャラリータイトル',
        'gallery_title_desc': 'ギャラリーのタイトルを設定（オプション）',
        'gallery_size': 'ギャラリーサイズ',
        'gallery_size_desc': 'ギャラリー内の画像表示サイズを選択',
        'gallery_add_button': 'アップロードボタンを表示',
        'gallery_add_button_desc': 'ギャラリーにアップロードボタンを表示するかどうか'
    },
};

// 全域翻譯函式
function t(key) {
    const langSetting = getLanguage();
    const lang = TRANSLATIONS[langSetting] || TRANSLATIONS['en'];
    return lang[key] || key;
}

class FullScreenModal extends Modal {
    constructor(app, openType = 'command') {
        super(app);
        this.mediaUrls = [];
        this.currentIndex = 0;
        this.isZoomed = false;
        this.isImage = true;
        this.plugin = null;
        this.openType = openType;
        this.modalEl.addClass('mv-media-viewer-modal');
        this.handleWheel = null; //儲存滾輪事件處理程序
    }

    async scanMedia() {
        // 獲取當前活動的 markdown 文件
        const activeFile = this.app.workspace.getActiveFile();
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
            const mediaUrls = [];
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
                            if (fileByPath) {
                                url = this.app.vault.getResourcePath(fileByPath);
                                if (url) {
                                    const extension = markdownLink.toLowerCase();
                                    if (!extension.match(/\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/)) {
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
                    if (file) {
                        const extension = file.extension.toLowerCase();
                        if (!extension.match(/^(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/)) {
                            continue;
                        }
                        type = extension.match(/^(jpg|jpeg|png|gif|webp)$/) ? 'image' : 'video';
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

    async onOpen() {
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
        const width = this.plugin.settings[`galleryGridSize${gridSize.charAt(0).toUpperCase() + gridSize.slice(1)}`];
        galleryContent.style.gridTemplateColumns = `repeat(auto-fill, minmax(${width}px, 1fr))`;

        if (this.openType !== 'command') galleryContent.style.display = 'none';

        galleryContent.addEventListener('click', (e) => {
            const isMediaThumbnail = e.target.closest('.mv-media-thumbnail');
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

    async showMedia(index) {
        // 過濾出所有媒體項目
        const mediaItems = this.mediaUrls.filter(item => item.type === 'image' || item.type === 'video');
        if (mediaItems.length === 0) {
            new Notice(t('no_media_found'));
            this.close();
            return;
        }

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
            this.fullVideo.muted = this.plugin.settings.muteVideoOnOpen;
            this.fullVideo.style.display = 'block';
            this.fullImage.style.display = 'none';
            this.fullVideo.loop = true;
            this.fullVideo.play();
        }

        // 顯示圖片資訊
        if (this.plugin.settings.showImageInfo || this.plugin.settings.allowMediaDeletion) {
            this.showImageInfo(media);
        }
    }

    async showImageInfo(media) {
        // 創建資訊面板
        const infoPanel = document.createElement('div');
        infoPanel.className = 'mv-image-info-panel';

        if (this.plugin.settings.showImageInfo) {
            // 取得檔案名稱
            const fileName = media.path ? media.path.split('/').pop() : media.url.split('/').pop();
            const cleanFileName = fileName.split('?')[0]; // 移除檔案名稱中 ? 後面的部分
            const decodedFileName = decodeURIComponent(cleanFileName);
            
            // 添加檔案編號
            const numSpan = infoPanel.createEl('span', {
                text: `${this.currentIndex + 1}/${this.mediaUrls.length}`,
                cls: 'mv-info-item'
            });
            
            // 添加檔案名稱
            const labelSpan = infoPanel.createEl('span', {
                text: decodedFileName,
                cls: ['mv-info-item', 'mv-info-filename'],
                attr: { contentEditable: 'true' }
            });

            // 添加圖片尺寸
            if (this.isImage) {
                const sizeSpan = infoPanel.createEl('span', {
                    text: `(${this.fullImage.naturalWidth} × ${this.fullImage.naturalHeight})`,
                    cls: ['mv-info-item', 'mv-info-dimensions']
                });
            }
        }
        
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
                        this.handleWheel = (event) => {
                            event.preventDefault();
                            this.fullMediaView.scrollLeft += event.deltaY;
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
                const isMediaThumbnail = e.target.closest('.mv-media-thumbnail');
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

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
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
            .setName(t('show_image_info'))
            .setDesc(t('show_image_info_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showImageInfo)
                .onChange(async (value) => {
                    this.plugin.settings.showImageInfo = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('allow_media_deletion'))
            .setDesc(t('allow_media_deletion_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.allowMediaDeletion)
                .onChange(async (value) => {
                    this.plugin.settings.allowMediaDeletion = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName(t('auto_open_first_image'))
            .setDesc(t('auto_open_first_image_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoOpenFirstImage)
                .onChange(async (value) => {
                    this.plugin.settings.autoOpenFirstImage = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('click_to_open_media'))
            .setDesc(t('click_to_open_media_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openMediaBrowserOnClick)
                .onChange(async (value) => {
                    this.plugin.settings.openMediaBrowserOnClick = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName(t('mute_video_on_open'))
            .setDesc(t('mute_video_on_open_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.muteVideoOnOpen)
                .onChange(async (value) => {
                    this.plugin.settings.muteVideoOnOpen = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('grid_size'))
            .setDesc(t('grid_size_desc'))
            .addDropdown(dropdown => dropdown
                .addOption('small', t('grid_size_small'))
                .addOption('medium', t('grid_size_medium'))
                .addOption('large', t('grid_size_large'))
                .setValue(this.plugin.settings.galleryGridSize)
                .onChange(async (value) => {
                    this.plugin.settings.galleryGridSize = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('grid_size_small_width'))
            .setDesc(t('grid_size_small_width_desc'))
            .addText(text => text
                .setPlaceholder('100')
                .setValue(String(this.plugin.settings.galleryGridSizeSmall))
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    this.plugin.settings.galleryGridSizeSmall = isNaN(numValue) ? 100 : numValue;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('grid_size_medium_width'))
            .setDesc(t('grid_size_medium_width_desc'))
            .addText(text => text
                .setPlaceholder('120')
                .setValue(String(this.plugin.settings.galleryGridSizeMedium))
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    this.plugin.settings.galleryGridSizeMedium = isNaN(numValue) ? 120 : numValue;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('grid_size_large_width'))
            .setDesc(t('grid_size_large_width_desc'))
            .addText(text => text
                .setPlaceholder('150')
                .setValue(String(this.plugin.settings.galleryGridSizeLarge))
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    this.plugin.settings.galleryGridSizeLarge = isNaN(numValue) ? 150 : numValue;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('items_per_page'))
            .setDesc(t('items_per_page_desc'))
            .addText(text => text
                .setPlaceholder('20')
                .setValue(String(this.plugin.settings.itemsPerPage))
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    this.plugin.settings.itemsPerPage = isNaN(numValue) ? 0 : numValue;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('insert_position'))
            .addDropdown(dropdown => {
                dropdown
                    .addOption('true', t('insert_at_end'))
                    .addOption('false', t('insert_at_start'))
                    .setValue(this.plugin.settings.insertAtEnd.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.insertAtEnd = value === 'true';
                        await this.plugin.saveSettings();
                    });
            });
    }
}

// Gallery 設定對話框
class GallerySettingsModal extends Modal {
    constructor(app, editor, selectedText) {
        super(app);
        this.editor = editor;
        this.selectedText = selectedText;
        this.title = '';
        this.size = 'medium';
        this.addButton = true;
        this.pagination = 0;
    }

    onOpen() {
        const { contentEl } = this;

        // 標題
        new Setting(contentEl)
            .setName(t('gallery_title'))
            .setDesc(t('gallery_title_desc'))
            .addText(text => text
                .setValue(this.title)
                .onChange(value => this.title = value));

        // 尺寸選擇
        new Setting(contentEl)
            .setName(t('gallery_size'))
            .setDesc(t('gallery_size_desc'))
            .addDropdown(dropdown => dropdown
                .addOption('small', t('grid_size_small'))
                .addOption('medium', t('grid_size_medium'))
                .addOption('large', t('grid_size_large'))
                .setValue(this.size)
                .onChange(value => this.size = value));

        // 上傳按鈕選項
        new Setting(contentEl)
            .setName(t('gallery_add_button'))
            .setDesc(t('gallery_add_button_desc'))
            .addToggle(toggle => toggle
                .setValue(this.addButton)
                .onChange(value => this.addButton = value));

        // 分頁設定
        new Setting(contentEl)
            .setName(t('gallery_pagination'))
            .setDesc(t('gallery_pagination_desc'))
            .addText(text => text
                .setValue(this.pagination ? this.pagination.toString() : '')
                .setPlaceholder('0')
                .onChange(value => {
                    const numValue = parseInt(value);
                    this.pagination = !isNaN(numValue) && numValue > 0 ? numValue : 0;
                }));

        // 確認按鈕
        new Setting(contentEl)
            .addButton(button => button
                .setButtonText(t('confirm'))
                .setCta()
                .onClick(() => {
                    const galleryBlock = ['```gallery'];
                    galleryBlock.push(`title: ${this.title}`);
                    galleryBlock.push(`size: ${this.size}`);
                    galleryBlock.push(`addButton: ${this.addButton}`);
                    galleryBlock.push(`pagination: ${this.pagination}`);
                    if (this.selectedText) galleryBlock.push(this.selectedText);
                    galleryBlock.push('```\n');
                    
                    this.editor.replaceSelection(galleryBlock.join('\n'));
                    this.close();
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

const DEFAULT_SETTINGS = {
    showImageInfo: true,
    allowMediaDeletion: false,
    autoOpenFirstImage: false,
    openMediaBrowserOnClick: true,
    muteVideoOnOpen: false,
    galleryGridSize: 'medium',
    galleryGridSizeSmall: 100,
    galleryGridSizeMedium: 150,
    galleryGridSizeLarge: 200,
    itemsPerPage: 0,
    insertAtEnd: true, // 預設插入在最後
};

module.exports = class MediaViewPlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        
        // 添加命令
        this.addCommand({
            id: 'open-media-viewer',
            name: t('open_media_viewer'),
            callback: () => {
                const modal = new FullScreenModal(this.app, 'command');
                modal.plugin = this;
                modal.open();
            }
        });

        // 添加 ribbon 命令
        this.addRibbonIcon('images', t('open_media_viewer'), () => {
            const modal = new FullScreenModal(this.app, 'command');
            modal.plugin = this;
            modal.open();
        });

        this.addCommand({
            id: 'generategallery',
            name: t('generate_gallery'),
            checkCallback: (checking) => {
                // 檢查是否有開啟的筆記
                const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
                if (activeView) {
                    if (!checking) {
                        this.generateGallery();
                    }
                    return true;
                }
                return false;
            }
        });

        this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor, view) => {
            menu.addItem((subItem) => {
                subItem
                    .setTitle(t('generate_gallery'))
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
                    !target.closest('.mvgb-media-gallery-grid')) {
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
        });

        // 添加設定頁面
        this.addSettingTab(new MyMediaViewSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    generateGallery() {
        const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
        if (activeView) {
            const editor = activeView.editor;
            const selectedText = editor.getSelection();
            new GallerySettingsModal(this.app, editor, selectedText).open();
        } else {
            new Notice(t('please_open_note'));
        }
    }
    
    async parseGalleryContent(content) {
        const items = [];
        const lines = content.split('\n');
        
        let currentTitle = null;
        let currentLinkUrl = null;
        let currentThumbnail = null;
        let containerTitle = null;
        let addButtonEnabled = false;
        let gridSize = this.settings.galleryGridSize || 'medium';
        let paginationEnabled = this.settings.itemsPerPage || 0; // 設定變數以決定是否開啟分頁功能
        
        // 產生基於內容的唯一識別碼
        const galleryId = 'gallery-' + this.hashString(content.trim());
        
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
                const url = markdownMatch[2].split(' "')[0];
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
                const content = await this.app.vault.cachedRead(file);
                const internalMatch = content.match(/(?:!\[\[(.*?\.(?:jpg|jpeg|png|gif|webp))(?:\|.*?)?\]\]|!\[(.*?)\]\(\s*(\S+?(?:\.(?:jpg|jpeg|png|gif|webp)|format=(?:jpg|jpeg|png|gif|webp))[^\s)]*)\s*(?:\s+["'][^"']*["'])?\s*\))/gi);
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
                        const urlForTypeCheck = url.split(' "')[0].split('?')[0].toLowerCase();
                        const isImageFile = urlForTypeCheck.match(/\.(jpg|jpeg|png|gif|webp)$/) || 
                                        url.includes('format=jpg') || 
                                        url.includes('format=jpeg') || 
                                        url.includes('format=png') || 
                                        url.includes('format=gif') || 
                                        url.includes('format=webp');
                        items.push({
                            type: isImageFile ? 'image' : 'video',
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

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36);
    }

    createGalleryElement(mediaUrlsData) {
        const { items, containerInfo, galleryId } = mediaUrlsData;
        const titleDiv = document.createElement('div');
        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'mvgb-media-gallery-grid';
        
        // 使用從 mediaUrlsData 中取得的 galleryId
        galleryDiv.setAttribute('data-gallery-id', galleryId);
        
        // 根據 size 參數添加對應的 class 並設定寬度
        galleryDiv.addClass(`size-${containerInfo.gridSize}`);
        const width = this.settings[`galleryGridSize${containerInfo.gridSize.charAt(0).toUpperCase() + containerInfo.gridSize.slice(1)}`];
        galleryDiv.style.gridTemplateColumns = `repeat(auto-fill, minmax(${width}px, 1fr))`;

        // 處理容器標題
        if (containerInfo.title) {
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
            }

            galleryDiv.style.borderRadius = '0 8px 8px 8px';
        }

        const container = document.createElement('div');
        container.className = 'mvgb-media-container';
        container.appendChild(titleDiv);
        container.appendChild(galleryDiv);

        // 處理分頁和新增按鈕
        const itemsPerPage = containerInfo.paginationEnabled || this.settings.itemsPerPage || 0;
        
        // 當 itemsPerPage 為 0 或項目數量不足時，顯示所有項目
        if (itemsPerPage <= 0 || items.length <= itemsPerPage) {
            // 顯示所有項目
            items.forEach((item, index) => {
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
                    const modal = new ImageUploadModal(this.app, this, galleryDiv);
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
            paginationDiv.dataset.currentPage = currentPage;

            prevPageButton.onclick = () => {
                const currentPage = parseInt(paginationDiv.dataset.currentPage);
                // 如果是第一頁，則跳到最後一頁，否則往前一頁
                const newPage = currentPage === 1 ? totalPages : currentPage - 1;
                paginationDiv.dataset.currentPage = newPage;
                this.updateGalleryPage(galleryDiv, items, newPage, itemsPerPage);
            };
            
            nextPageButton.onclick = () => {
                const currentPage = parseInt(paginationDiv.dataset.currentPage);
                // 如果是最後一頁，則跳到第一頁，否則往後一頁
                const newPage = currentPage === totalPages ? 1 : currentPage + 1;
                paginationDiv.dataset.currentPage = newPage;
                this.updateGalleryPage(galleryDiv, items, newPage, itemsPerPage);
            };

            // 新增圖片按鈕移到分頁控制項旁邊
            if (containerInfo.addButtonEnabled || items.length === 0) {
                const addButton = paginationDiv.createEl('button', {
                    cls: 'mvgb-gallery-control-button mvgb-add-image-button',
                    text: t('add_image')
                });
                addButton.onclick = () => {
                    const modal = new ImageUploadModal(this.app, this, galleryDiv);
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

        return container;
    }

    createNoteContainer(item) {
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
        
        const noteTitle = document.createElement('div');
        noteTitle.className = 'mvgb-note-title';
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

        return container;
    }

    updateGalleryPage(galleryDiv, items, page, itemsPerPage) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentPageItems = items.slice(start, end);
        const totalPages = Math.ceil(items.length / itemsPerPage);
        
        // 移除舊的項目
        galleryDiv.innerHTML = '';
        
        // 新增新的項目
        currentPageItems.forEach((item, index) => {
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
        const paginationDiv = galleryDiv.parentElement.querySelector('.mvgb-pagination');
        const pageInfoSpan = paginationDiv.querySelector('.mvgb-page-info');
        pageInfoSpan.textContent = `${page} / ${totalPages}`;
    }
    
    createMediaContainer(media, index) {
        const container = document.createElement('div');
        container.className = 'mv-media-thumbnail-container';
        
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
        
        if (media.title) {
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
        contentEl.addClass('mvgb-upload-modal');

        const dropZone = contentEl.createDiv('mvgb-upload-dropzone');
        
        const uploadIcon = dropZone.createDiv('mvgb-upload-icon');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('d', 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z');
        svg.appendChild(path);
        uploadIcon.appendChild(svg);
        
        const instructions = dropZone.createDiv('mvgb-upload-instructions');
        instructions.setText(t('drag_and_drop'));

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
            new Notice(t('please_open_note'));
            return;
        }

        try {
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
                            if (/\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i.test(fileName)) {
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

            // 使用 process 方法來修改檔案內容
            await this.app.vault.process(activeFile, (content) => {
                // 找出所有 gallery 區塊
                const galleryBlocks = Array.from(content.matchAll(/```gallery\n([\s\S]*?)```/g));
                
                // 從觸發上傳的 gallery 元素獲取唯一識別碼
                const galleryId = this.galleryElement.getAttribute('data-gallery-id');
                
                // 找到對應的 gallery 區塊
                for (const match of galleryBlocks) {
                    const blockContent = match[1].trim();
                    const blockStart = match.index;
                    const blockEnd = blockStart + match[0].length;
                    
                    // 計算這個區塊的 galleryId
                    const currentGalleryId = 'gallery-' + this.plugin.hashString(blockContent);

                    // 如果這個 gallery 區塊的 ID 與觸發上傳的元素相同
                    if (currentGalleryId === galleryId) {
                        // 在 gallery 區塊內容的最前或最後一行插入新連結 (根據設定)
                        const newBlockContent = this.plugin.settings.insertAtEnd
                            ? blockContent.trimEnd() + `\n${newLinks.join('\n')}\n`
                            : `${newLinks.join('\n')}\n` + blockContent + '\n';
                        
                        // 更新整個文件內容
                        return (
                            content.substring(0, blockStart) +
                            "```gallery\n" +
                            newBlockContent +
                            "```" +
                            content.substring(blockEnd)
                        );
                    }
                }
                
                // 如果沒有找到對應的 gallery 區塊，回傳原始內容
                new Notice(t('gallery_not_found'));
                return content;
            });

        } catch (error) {
            console.error('Error handling files:', error);
            new Notice(t('error_adding_file'));
        }
        
        this.close();
    }

    getSafeFileName(originalName) {
        // 移除不安全的字元，只保留字母、數字、底線和檔案副檔名
        const name = originalName.replace(/[<>:"/\\|?*]/g, '_');
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
}
