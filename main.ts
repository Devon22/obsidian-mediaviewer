import { Plugin, Notice, MarkdownView } from 'obsidian';
import { MediaViewSettingTab, DEFAULT_SETTINGS, MediaViewSettings } from './src/settings';
import { FullScreenModal } from './src/fullscreen';
import { GalleryBlock } from './src/galleryBlock';
import { GalleryBlockGenerateModal } from './src/galleryBlockGenerate';
import { t } from './src/translations';

export default class MediaViewPlugin extends Plugin {
    settings: MediaViewSettings;
    async onload() {
        await this.loadSettings();
        
        // 添加命令
        this.addCommand({
            id: 'open-media-viewer',
            name: t('open_media_viewer'),
            callback: () => {
                const modal = new FullScreenModal(this.app, this, 'command');
                modal.open();
            }
        });

        // 添加 ribbon 命令
        this.addRibbonIcon('images', t('open_media_viewer'), () => {
            const modal = new FullScreenModal(this.app, this, 'command');
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
                const target = (evt.target) as HTMLImageElement;
                if (!target) return;

                if (!target.closest('.markdown-reading-view') &&
                !target.closest('.cm-s-obsidian') ) {
                    return;
                }

                // 確認點擊的是圖片，且不在 code block 內，也不在 modal 內
                if (target.tagName === 'IMG' && 
                    !target.closest('pre') && 
                    !target.closest('.mv-media-viewer-modal') &&
                    !target.closest('.mvgb-media-gallery-grid')) {
                    // 阻止預設行為
                    evt.preventDefault();
                    evt.stopPropagation();

                    // 開啟 modal
                    const modal = new FullScreenModal(this.app, this, 'thumbnail');
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

        // 初始化 GalleryBlockProcessor
        const galleryProcessor = new GalleryBlock(this.app, this);

        // 統一使用 registerMarkdownCodeBlockProcessor 來處理兩種模式
        this.registerMarkdownCodeBlockProcessor("gallery", (source, el, ctx) => 
            galleryProcessor.processGalleryBlock(source, el)
        );

        // 添加設定頁面
        this.addSettingTab(new MediaViewSettingTab(this.app, this));
    }

    generateGallery() {
        const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView) as MarkdownView;
        if (activeView) {
            const editor = activeView.editor;
            const selectedText = editor.getSelection();
            //new GalleryBlockGenerateModal(this.app, selectedText).open();
            // 創建並打開設定對話框
            const modal = new GalleryBlockGenerateModal(this.app, selectedText);
                            
            // 設置確認後的回調函數，使用 vault.process 修改文件
            modal.onConfirm = (newGalleryBlock: string) => {
                editor.replaceSelection(newGalleryBlock);
            };
            
            modal.open();
        } else {
            new Notice(t('please_open_note'));
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}