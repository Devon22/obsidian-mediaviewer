import { App, Modal, TFile, Notice } from 'obsidian';
import MediaViewPlugin from './main';
import { t } from './translations';
import { captureScrollRestore } from './scrollHelper';

export class ImageUploadModal extends Modal {
    plugin: MediaViewPlugin;
    galleryElement: HTMLElement;
    insertAtEnd: boolean; // 新增變數來儲存插入位置選項
    sourcePath?: string; // 新增來源路徑

    constructor(app: App, plugin: MediaViewPlugin, galleryElement: HTMLElement, sourcePath?: string) {
        super(app);
        this.plugin = plugin;
        this.galleryElement = galleryElement; // 儲存觸發上傳的 gallery 元素
        this.insertAtEnd = this.plugin.settings.insertAtEnd; // 初始化為設定中的值
        this.sourcePath = sourcePath; // 儲存來源路徑
    }

    onOpen() {
        const { contentEl } = this;
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

        // 新增貼上剪貼簿按鈕
        const pasteButton = contentEl.createEl('button', {
            text: t('paste_from_clipboard'),
            cls: 'mvgb-paste-button',
        });

        pasteButton.addEventListener('click', async () => {
            try {
                // 先嘗試讀取剪貼簿中的文字內容
                const text = await navigator.clipboard.readText();
                if (text) {
                    // 使用正則表達式找出所有網址
                    const urlRegex = /(https?:\/\/[^\s]+)/gi;
                    const urls = text.match(urlRegex);

                    if (urls && urls.length > 0) {
                        // 將每個網址轉換成 Markdown 圖片格式
                        const markdownLinks = urls.map(url => `![](${url})`);
                        await this.handleLinks(markdownLinks);
                        return;
                    }
                }

                // 如果不是網址或檔案路徑，或是讀取失敗，則嘗試讀取剪貼簿中的圖片
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                    const imageType = item.types.find(type => imageTypes.includes(type));

                    if (imageType) {
                        const blob = await item.getType(imageType);
                        // 嘗試取得目前的 Markdown 檔案
                        // 優先使用來源路徑，若無效則使用當前開啟的檔案
                        let activeFile: TFile | null = null;
                        if (this.sourcePath) {
                            activeFile = this.app.vault.getAbstractFileByPath(this.sourcePath) as TFile | null;
                        }

                        if (!activeFile) {
                            activeFile = this.app.workspace.getActiveFile();
                            if (!activeFile) {
                                new Notice(t('please_open_note'));
                                return;
                            }
                        }
                        // 取得附件資料夾路徑
                        const attachmentFolderPath = this.getAttachmentFolderPath(activeFile);
                        // 確保附件資料夾存在
                        await this.ensureFolderExists(attachmentFolderPath);
                        let safeName = this.getSafeFileName(`pasted_image.${imageType.split('/')[1]}`);
                        let timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
                        let fileNameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.'));
                        let extension = safeName.substring(safeName.lastIndexOf('.'));
                        safeName = `${fileNameWithoutExt}_${timestamp}${extension}`;
                        let newFilePath = `${attachmentFolderPath}/${safeName}`;
                        if (await this.app.vault.adapter.exists(newFilePath)) {
                            let counter = 1;
                            while (await this.app.vault.adapter.exists(newFilePath)) {
                                safeName = `${fileNameWithoutExt}_${timestamp}_${counter}${extension}`;
                                newFilePath = `${attachmentFolderPath}/${safeName}`;
                                counter++;
                            }
                        }
                        const newFile = new File([blob], safeName, { type: imageType });
                        await this.handleFiles([newFile]);
                    }
                }
            } catch (err) {
                new Notice(t('clipboard_error' + err));
                console.error('剪貼簿讀取錯誤:', err);
            }
        });

        // 新增插入位置選項
        const insertPositionContainer = contentEl.createDiv('mvgb-insert-position-container');
        insertPositionContainer.addClass('mvgb-setting-item');

        const insertPositionLabel = insertPositionContainer.createDiv('mvgb-setting-label');
        insertPositionLabel.setText(t('insert_position'));

        const insertPositionControl = insertPositionContainer.createDiv('mvgb-setting-control');

        // 建立下拉選單
        const insertPositionDropdown = insertPositionControl.createEl('select', {
            cls: 'mvgb-insert-position-dropdown'
        });

        // 添加選項
        const endOption = insertPositionDropdown.createEl('option', {
            text: t('insert_at_end'),
            value: 'true'
        });

        const startOption = insertPositionDropdown.createEl('option', {
            text: t('insert_at_start'),
            value: 'false'
        });

        // 設定初始選擇的選項
        if (this.insertAtEnd) {
            endOption.selected = true;
        } else {
            startOption.selected = true;
        }

        // 添加變更事件
        insertPositionDropdown.addEventListener('change', () => {
            this.insertAtEnd = insertPositionDropdown.value === 'true';
        });

        // 處理拖放事件（加入左右分區效果）
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.addClass('drag-over');
            const rect = dropZone.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            const clientX = (e as DragEvent).clientX;
            if (clientX < midX) {
                dropZone.addClass('drag-left');
                dropZone.removeClass('drag-right');
                this.insertAtEnd = false; // 左側 -> 插入最前
            } else {
                dropZone.addClass('drag-right');
                dropZone.removeClass('drag-left');
                this.insertAtEnd = true;  // 右側 -> 插入最後
            }
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.removeClass('drag-over');
            dropZone.removeClass('drag-left');
            dropZone.removeClass('drag-right');
        });

        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.removeClass('drag-over');
            dropZone.removeClass('drag-left');
            dropZone.removeClass('drag-right');

            if (e.dataTransfer === null) return;
            // 依左右區域設定插入位置
            const rect = dropZone.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            const clientX = (e as DragEvent).clientX;
            this.insertAtEnd = clientX >= midX;

            const files = (e.dataTransfer.files as any);
            await this.handleFiles(files);
        });

        const fileInput = contentEl.createEl('input', {
            type: 'file',
            attr: {
                accept: 'image/*,video/*,audio/*',
                multiple: true,
                style: 'display: none;' // 隱藏但保持在DOM中
            }
        });

        fileInput.addEventListener('change', async () => {
            if (fileInput.files && fileInput.files.length > 0) {
                await this.handleFiles(Array.from(fileInput.files));
            }
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
    }

    async handleFiles(files: File[]): Promise<void> {
        // 嘗試取得目前的 Markdown 檔案
        // 優先使用來源路徑，若無效則使用當前開啟的檔案
        let activeFile: TFile | null = null;
        if (this.sourcePath) {
            activeFile = this.app.vault.getAbstractFileByPath(this.sourcePath) as TFile | null;
        }

        if (!activeFile) {
            activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice(t('please_open_note'));
                return;
            }
        }

        try {
            const newLinks: string[] = []; // 儲存新連結

            // 處理每個檔案或連結
            for (const file of files) {
                if (file && typeof file === 'object' && (file.type === 'uri')) {
                    const linkContent = (file as any).getData();

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
                            if (/\.(jpg|jpeg|png|gif|webp|mp4|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/i.test(fileName)) {
                                newLinks.push(`![[${fileName}]]`);
                            } else {
                                newLinks.push(`[[${fileName}]]`);
                            }
                        }
                    }
                    continue;
                }

                if (file && typeof file === 'object' && (file.type === 'text')) {
                    const textContent = (file as any).getData();
                    const textContents = textContent.split('\n');
                    for (const content of textContents) {
                        if (content.startsWith('obsidian://')) {
                            continue;
                        }
                        const fileName = content.replace('.md]]', ']]');
                        newLinks.push(fileName);
                    }
                    continue;
                }

                // 處理一般檔案
                if (file instanceof File) {
                    // 檢查是否為支援的媒體類型（MIME）或副檔名
                    const lowerName = file.name.toLowerCase();
                    const isSupportedExt = /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm|mp3|m4a|flac|ogg|wav|3gp)$/i.test(lowerName);
                    const isSupportedMime = file.type && (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/'));
                    if (isSupportedMime || isSupportedExt) {

                        // 取得附件資料夾路徑
                        const attachmentFolderPath = this.getAttachmentFolderPath(activeFile);

                        // 確保附件資料夾存在
                        await this.ensureFolderExists(attachmentFolderPath);

                        // 生成安全的檔案名稱
                        let safeName = this.getSafeFileName(file.name);

                        // 檢查檔案是否已存在，如果存在就在檔名後加上數字
                        let counter = 1;
                        let fileNameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.'));
                        let extension = safeName.substring(safeName.lastIndexOf('.'));
                        let newFilePath = `${attachmentFolderPath}/${safeName}`;

                        while (await this.app.vault.adapter.exists(newFilePath)) {
                            safeName = `${fileNameWithoutExt}_${counter}${extension}`;
                            newFilePath = `${attachmentFolderPath}/${safeName}`;
                            counter++;
                        }

                        // 建立完整的檔案路徑
                        const filePath = newFilePath;

                        // 讀取並儲存檔案
                        const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                if (reader.result instanceof ArrayBuffer) {
                                    resolve(reader.result);
                                } else {
                                    reject(new Error('Failed to read file as ArrayBuffer'));
                                }
                            };
                            reader.onerror = () => reject(reader.error);
                            reader.readAsArrayBuffer(file);
                        });

                        const fileExists = await this.app.vault.adapter.exists(filePath);
                        if (!fileExists) {
                            await this.app.vault.createBinary(filePath, arrayBuffer);
                        }

                        new Notice(filePath);

                        // 將新連結加入陣列
                        newLinks.push(`![[${safeName}]]`);
                    }
                }
            }

            // 從觸發上傳的 gallery 元素獲取唯一識別碼
            const galleryId = this.galleryElement.getAttribute('data-gallery-id');

            // 使用 process 方法來修改檔案內容
            const restoreScroll = galleryId ? captureScrollRestore(this.app, galleryId) : null;
            await this.app.vault.process(activeFile, (content) => {
                // 找出所有 gallery 區塊
                const galleryBlocks = Array.from(content.matchAll(/```gallery\n([\s\S]*?)```/g));

                // 找到對應的 gallery 區塊
                for (const match of galleryBlocks) {
                    const blockContent = match[1].trim();
                    const blockStart = match.index;
                    const blockEnd = blockStart + match[0].length;

                    // 計算這個區塊的 galleryId
                    const currentGalleryId = 'gallery-' + this.hashString(blockContent);

                    // 如果這個 gallery 區塊的 ID 與觸發上傳的元素相同
                    if (currentGalleryId === galleryId) {
                        // 在 gallery 區塊內容的最前或最後一行插入新連結 (根據選擇的選項)
                        const newBlockContent = this.insertAtEnd
                            ? blockContent.trimEnd() + `\n${newLinks.join('\n')}\n`
                            : `${newLinks.join('\n')}\n` + blockContent + '\n';

                        // 計算並記錄新的 gallery ID
                        const newGalleryId = 'gallery-' + this.hashString(newBlockContent.trim());

                        // 使用 setTimeout 確保在 DOM 更新後執行
                        if (restoreScroll) setTimeout(() => restoreScroll(newGalleryId), 0);

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

    async handleLinks(links: string[]): Promise<void> {
        // 嘗試取得目前的 Markdown 檔案
        // 優先使用來源路徑，若無效則使用當前開啟的檔案
        let activeFile: TFile | null = null;
        if (this.sourcePath) {
            activeFile = this.app.vault.getAbstractFileByPath(this.sourcePath) as TFile | null;
        }

        if (!activeFile) {
            activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice(t('please_open_note'));
                return;
            }
        }

        try {
            // 從觸發上傳的 gallery 元素獲取唯一識別碼
            const galleryId = this.galleryElement.getAttribute('data-gallery-id');

            // 使用 process 方法來修改檔案內容
            const restoreScroll = galleryId ? captureScrollRestore(this.app, galleryId) : null;
            await this.app.vault.process(activeFile, (content) => {
                // 找出所有 gallery 區塊
                const galleryBlocks = Array.from(content.matchAll(/```gallery\n([\s\S]*?)```/g));

                // 找到對應的 gallery 區塊
                for (const match of galleryBlocks) {
                    const blockContent = match[1].trim();
                    const blockStart = match.index;
                    const blockEnd = blockStart + match[0].length;

                    // 計算這個區塊的 galleryId
                    const currentGalleryId = 'gallery-' + this.hashString(blockContent);

                    // 如果這個 gallery 區塊的 ID 與觸發上傳的元素相同
                    if (currentGalleryId === galleryId) {
                        // 在 gallery 區塊內容的最前或最後一行插入新連結 (根據選擇的選項)
                        const newBlockContent = this.insertAtEnd
                            ? blockContent.trimEnd() + `\n${links.join('\n')}\n`
                            : `${links.join('\n')}\n` + blockContent + '\n';

                        // 計算並記錄新的 gallery ID
                        const newGalleryId = 'gallery-' + this.hashString(newBlockContent.trim());

                        // 使用 setTimeout 確保在 DOM 更新後執行
                        if (restoreScroll) setTimeout(() => restoreScroll(newGalleryId), 0);

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
            console.error('Error handling links:', error);
            new Notice(t('error_adding_file'));
        }

        this.close();
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

    getSafeFileName(originalName: string) {
        // 移除不安全的字元，只保留字母、數字、底線和檔案副檔名
        const name = originalName.replace(/[#<>:"/\\|?*]/g, '_');
        // 確保檔案名稱唯一
        return name;
    }

    getAttachmentFolderPath(activeFile: TFile) {
        // 取得 vault 的附件設定
        const basePath = (this.app.vault as any).config.attachmentFolderPath


        if (basePath.startsWith('./')) {
            // 如果是相對路徑，則使用筆記所在資料夾
            if (!activeFile.parent) {
                new Notice(t('active_file_not_found'));
                return;
            }
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

    async ensureFolderExists(folderPath: string) {
        if (!(await this.app.vault.adapter.exists(folderPath))) {
            await this.app.vault.createFolder(folderPath);
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}