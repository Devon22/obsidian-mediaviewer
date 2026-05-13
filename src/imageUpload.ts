import { App, Modal, Notice, TFile } from 'obsidian';
import MediaViewPlugin from './main';
import { t } from './translations';
import { captureScrollRestore } from './scrollHelper';

type DraggedDataItem = {
    type: 'uri' | 'text';
    getData: () => string;
};

type UploadItem = File | DraggedDataItem;

type VaultWithAttachmentConfig = {
    config?: {
        attachmentFolderPath?: string;
    };
};

const supportedMediaExtRegex = /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/i;

/**
 * 判斷拖放項目是否為 Obsidian 內部提供的 uri/text 資料。
 */
function isDraggedDataItem(item: UploadItem, type: DraggedDataItem['type']): item is DraggedDataItem {
    return !(item instanceof File) && item.type === type;
}

export class ImageUploadModal extends Modal {
    plugin: MediaViewPlugin;
    galleryElement: HTMLElement;
    insertAtEnd: boolean;
    sourcePath?: string;

    constructor(app: App, plugin: MediaViewPlugin, galleryElement: HTMLElement, sourcePath?: string) {
        super(app);
        this.plugin = plugin;
        this.galleryElement = galleryElement;
        this.insertAtEnd = this.plugin.settings.insertAtEnd;
        this.sourcePath = sourcePath;
    }

    /**
     * 建立上傳 Modal 的介面與事件處理。
     */
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('mvgb-upload-modal');

        const dropZone = contentEl.createDiv('mvgb-upload-dropzone');

        const uploadIcon = dropZone.createDiv('mvgb-upload-icon');
        const svg = activeDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        const path = activeDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', 'currentColor');
        path.setAttribute('d', 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z');
        svg.appendChild(path);
        uploadIcon.appendChild(svg);

        const instructions = dropZone.createDiv('mvgb-upload-instructions');
        instructions.setText(t('drag_and_drop'));

        const pasteButton = contentEl.createEl('button', {
            text: t('paste_from_clipboard'),
            cls: 'mvgb-paste-button',
        });

        // 先嘗試把剪貼簿文字中的網址轉成 Markdown 圖片連結，沒有網址時再讀取圖片資料。
        pasteButton.addEventListener('click', () => {
            void this.handleClipboardPaste();
        });

        const insertPositionContainer = contentEl.createDiv('mvgb-insert-position-container');
        insertPositionContainer.addClass('mvgb-setting-item');

        const insertPositionLabel = insertPositionContainer.createDiv('mvgb-setting-label');
        insertPositionLabel.setText(t('insert_position'));

        const insertPositionControl = insertPositionContainer.createDiv('mvgb-setting-control');
        const insertPositionDropdown = insertPositionControl.createEl('select', {
            cls: 'mvgb-insert-position-dropdown',
        });

        const endOption = insertPositionDropdown.createEl('option', {
            text: t('insert_at_end'),
            value: 'true',
        });

        const startOption = insertPositionDropdown.createEl('option', {
            text: t('insert_at_start'),
            value: 'false',
        });

        if (this.insertAtEnd) {
            endOption.selected = true;
        } else {
            startOption.selected = true;
        }

        insertPositionDropdown.addEventListener('change', () => {
            this.insertAtEnd = insertPositionDropdown.value === 'true';
        });

        // 拖曳時用左右半區快速決定插入到 gallery 開頭或結尾。
        dropZone.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            dropZone.addClass('drag-over');
            const rect = dropZone.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            if (e.clientX < midX) {
                dropZone.addClass('drag-left');
                dropZone.removeClass('drag-right');
                this.insertAtEnd = false;
            } else {
                dropZone.addClass('drag-right');
                dropZone.removeClass('drag-left');
                this.insertAtEnd = true;
            }
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.removeClass('drag-over');
            dropZone.removeClass('drag-left');
            dropZone.removeClass('drag-right');
        });

        dropZone.addEventListener('drop', (e: DragEvent) => {
            void (async () => {
                e.preventDefault();
                dropZone.removeClass('drag-over');
                dropZone.removeClass('drag-left');
                dropZone.removeClass('drag-right');

                if (e.dataTransfer === null) return;

                const rect = dropZone.getBoundingClientRect();
                const midX = rect.left + rect.width / 2;
                this.insertAtEnd = e.clientX >= midX;

                await this.handleFiles(Array.from(e.dataTransfer.files));
            })();
        });

        const fileInput = contentEl.createEl('input', {
            type: 'file',
            attr: {
                accept: 'image/*,video/*,audio/*',
                multiple: true,
                style: 'display: none;',
            },
        });

        fileInput.addEventListener('change', () => {
            void (async () => {
                if (fileInput.files && fileInput.files.length > 0) {
                    await this.handleFiles(Array.from(fileInput.files));
                }
            })();
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
    }

    /**
     * 從剪貼簿讀取網址或圖片，並插入目前 gallery。
     */
    private async handleClipboardPaste(): Promise<void> {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                const urls = text.match(/(https?:\/\/[^\s]+)/gi);

                if (urls && urls.length > 0) {
                    await this.handleLinks(urls.map((url) => `![](${url})`));
                    return;
                }
            }

            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                const imageType = item.types.find((type) => imageTypes.includes(type));

                if (imageType) {
                    const blob = await item.getType(imageType);
                    const extension = imageType.split('/')[1] ?? 'png';
                    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
                    const safeName = this.getSafeFileName(`pasted_image_${timestamp}.${extension}`);
                    const newFile = new File([blob], safeName, { type: imageType });
                    await this.handleFiles([newFile]);
                }
            }
        } catch (err) {
            new Notice(`${t('clipboard_error')}: ${err instanceof Error ? err.message : String(err)}`);
            console.error('Clipboard paste failed:', err);
        }
    }

    /**
     * 處理拖放或檔案選擇取得的檔案與 Obsidian 內部連結資料。
     */
    async handleFiles(files: Iterable<UploadItem>): Promise<void> {
        // 來源路徑存在時優先寫回來源筆記，否則使用目前開啟的 Markdown 檔案。
        const activeFile = this.getActiveTargetFile();
        if (!activeFile) return;

        try {
            const newLinks: string[] = [];

            for (const file of files) {
                if (isDraggedDataItem(file, 'uri')) {
                    this.collectUriLinks(file.getData(), newLinks);
                    continue;
                }

                if (isDraggedDataItem(file, 'text')) {
                    this.collectTextLinks(file.getData(), newLinks);
                    continue;
                }

                if (file instanceof File) {
                    await this.handleMediaFile(file, activeFile, newLinks);
                }
            }

            await this.insertLinksIntoGallery(activeFile, newLinks);
        } catch (error) {
            console.error('Error handling files:', error);
            new Notice(t('error_adding_file'));
        }

        this.close();
    }

    /**
     * 將已整理好的 Markdown 連結插入目前 gallery。
     */
    async handleLinks(links: string[]): Promise<void> {
        const activeFile = this.getActiveTargetFile();
        if (!activeFile) return;

        try {
            await this.insertLinksIntoGallery(activeFile, links);
        } catch (error) {
            console.error('Error handling links:', error);
            new Notice(t('error_adding_file'));
        }

        this.close();
    }

    /**
     * 產生 gallery 內容對應的穩定短 hash。
     */
    hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * 移除檔名中不適合用於 vault 路徑的字元。
     */
    getSafeFileName(originalName: string): string {
        return originalName.replace(/[#<>:"/\\|?*]/g, '_');
    }

    /**
     * 根據 Obsidian 附件設定與目前筆記位置取得附件資料夾路徑。
     */
    getAttachmentFolderPath(activeFile: TFile): string {
        // Obsidian 的附件路徑設定目前沒有公開型別，這裡只取需要的 attachmentFolderPath。
        const vault = this.app.vault as unknown as VaultWithAttachmentConfig;
        const basePath = vault.config?.attachmentFolderPath ?? '/';

        if (basePath.startsWith('./')) {
            if (!activeFile.parent) {
                new Notice(t('active_file_not_found'));
                return 'attachments';
            }
            const noteDir = activeFile.parent.path;
            return `${noteDir}/${basePath.slice(2)}`;
        } else if (basePath === '/') {
            return 'attachments';
        } else {
            return basePath;
        }
    }

    /**
     * 確保目標附件資料夾存在。
     */
    async ensureFolderExists(folderPath: string): Promise<void> {
        if (!(await this.app.vault.adapter.exists(folderPath))) {
            await this.app.vault.createFolder(folderPath);
        }
    }

    /**
     * 關閉 Modal 時清空內容。
     */
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    /**
     * 取得要寫入的 Markdown 檔案。
     */
    private getActiveTargetFile(): TFile | null {
        if (this.sourcePath) {
            const sourceFile = this.app.vault.getAbstractFileByPath(this.sourcePath);
            if (sourceFile instanceof TFile) {
                return sourceFile;
            }
        }

        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice(t('please_open_note'));
        }

        return activeFile;
    }

    /**
     * 將 Obsidian URI 拖放資料轉成 wiki link 或 embed link。
     */
    private collectUriLinks(linkContent: string, newLinks: string[]): void {
        // Obsidian 內部拖放可能給 uri/text 資料，這些不是瀏覽器 File 物件。
        const linkContents = linkContent.split('obsidian://');
        for (const content of linkContents) {
            const obsidianUrlMatch = `obsidian://${content}`.match(/obsidian:\/\/open\?.*?file=([^&]+)/);
            if (obsidianUrlMatch) {
                const fileName = decodeURIComponent(obsidianUrlMatch[1]).replace(/\.md$/, '');
                if (supportedMediaExtRegex.test(fileName)) {
                    newLinks.push(`![[${fileName}]]`);
                } else {
                    newLinks.push(`[[${fileName}]]`);
                }
            }
        }
    }

    /**
     * 將文字拖放資料整理成可插入 gallery 的連結。
     */
    private collectTextLinks(textContent: string, newLinks: string[]): void {
        const textContents = textContent.split('\n');
        for (const content of textContents) {
            if (content.startsWith('obsidian://')) {
                continue;
            }
            newLinks.push(content.replace('.md]]', ']]'));
        }
    }

    /**
     * 儲存媒體檔到附件資料夾，並加入對應的 embed link。
     */
    private async handleMediaFile(file: File, activeFile: TFile, newLinks: string[]): Promise<void> {
        // 剪貼簿圖片可能沒有可靠副檔名，因此同時檢查 MIME type 和檔名副檔名。
        const lowerName = file.name.toLowerCase();
        const isSupportedExt = supportedMediaExtRegex.test(lowerName);
        const isSupportedMime = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/');
        if (!isSupportedMime && !isSupportedExt) {
            return;
        }

        const attachmentFolderPath = this.getAttachmentFolderPath(activeFile);
        await this.ensureFolderExists(attachmentFolderPath);

        let safeName = this.getSafeFileName(file.name);
        let counter = 1;
        const fileNameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.'));
        const extension = safeName.substring(safeName.lastIndexOf('.'));
        let newFilePath = `${attachmentFolderPath}/${safeName}`;

        while (await this.app.vault.adapter.exists(newFilePath)) {
            safeName = `${fileNameWithoutExt}_${counter}${extension}`;
            newFilePath = `${attachmentFolderPath}/${safeName}`;
            counter++;
        }

        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        if (!(await this.app.vault.adapter.exists(newFilePath))) {
            await this.app.vault.createBinary(newFilePath, arrayBuffer);
        }

        new Notice(newFilePath);
        newLinks.push(`![[${safeName}]]`);
    }

    /**
     * 使用 FileReader 將瀏覽器 File 讀成 ArrayBuffer。
     */
    private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer'));
                }
            };
            reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * 找到目前 gallery 區塊並把新連結寫回 Markdown 檔案。
     */
    private async insertLinksIntoGallery(activeFile: TFile, links: string[]): Promise<void> {
        // 以 gallery 內容 hash 算出的 data-gallery-id 找回原本觸發上傳的區塊。
        const galleryId = this.galleryElement.getAttribute('data-gallery-id');
        const restoreScroll = galleryId ? captureScrollRestore(this.app, galleryId) : null;

        await this.app.vault.process(activeFile, (content) => {
            const galleryBlocks = Array.from(content.matchAll(/```gallery\n([\s\S]*?)```/g));

            for (const match of galleryBlocks) {
                const fullMatch = match[0];
                const blockContent = match[1];
                const blockStart = match.index;
                if (fullMatch == null || blockContent == null || blockStart == null) {
                    continue;
                }

                const normalizedBlockContent = blockContent.trim();
                const blockEnd = blockStart + fullMatch.length;
                const currentGalleryId = 'gallery-' + this.hashString(normalizedBlockContent);

                if (currentGalleryId === galleryId) {
                    const newBlockContent = this.insertAtEnd
                        ? normalizedBlockContent.trimEnd() + `\n${links.join('\n')}\n`
                        : `${links.join('\n')}\n` + normalizedBlockContent + '\n';

                    const newGalleryId = 'gallery-' + this.hashString(newBlockContent.trim());

                    // 內容更新後 gallery id 會改變，等 DOM 重繪後再用新的 id 還原捲動位置。
                    if (restoreScroll) window.setTimeout(() => restoreScroll(newGalleryId), 0);

                    return (
                        content.substring(0, blockStart) +
                        '```gallery\n' +
                        newBlockContent +
                        '```' +
                        content.substring(blockEnd)
                    );
                }
            }

            new Notice(t('gallery_not_found'));
            return content;
        });
    }
}
