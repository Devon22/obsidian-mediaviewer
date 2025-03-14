import { App, Modal,Setting, EditorPosition} from 'obsidian';
import { t } from './translations';

// Gallery 生成對話框
export class GalleryBlockGenerateModal extends Modal {
    selectedText: string;
    title: string;
    size: string;
    addButton: boolean;
    pagination: number;
    replaceRange: { from: EditorPosition, to: EditorPosition } | null;
    onConfirm: ((newGalleryBlock: string) => void) | null;

    constructor(app: App, selectedText: string) {
        super(app);
        this.selectedText = this.parseExistingContent(selectedText);
        this.replaceRange = null;
        this.onConfirm = null;
        if (this.title === undefined) this.title = '';
        if (this.size === undefined) this.size = 'medium';
        if (this.addButton === undefined) this.addButton = false;
        if (this.pagination === undefined) this.pagination = 0;
    }

    // 解析現有的 gallery 區塊內容
    parseExistingContent(content: string): string {
        const lines = content.split('\n');
        let mediaItems = '';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // 解析標題
            const titleMatch = trimmedLine.match(/^title:\s*(.+)$/);
            if (titleMatch) {
                this.title = titleMatch[1];
                continue;
            } 
            
            // 解析尺寸
            const sizeMatch = trimmedLine.match(/^size:\s*(small|medium|large)$/i);
            if (sizeMatch) {
                this.size = sizeMatch[1].toLowerCase();
                continue;
            } 
            
            // 解析新增按鈕設定
            const addButtonMatch = trimmedLine.match(/^addbutton:\s*(true|false)$/i);
            if (addButtonMatch) {
                this.addButton = addButtonMatch[1].toLowerCase() === 'true';
                continue;
            } 
            
            // 解析分頁設定
            const paginationMatch = trimmedLine.match(/^pagination:\s*(\d+)$/i);
            if (paginationMatch) {
                this.pagination = parseInt(paginationMatch[1]) || 0;
                continue;
            } 
            
            // 將非設定行收集為媒體項目
            if (!trimmedLine.match(/^(title|size|addbutton|pagination):/i) && trimmedLine) {
                mediaItems += line + '\n';
            }
        }
        
        return mediaItems.trim();
    }

    onOpen() {
        const { contentEl } = this;

        // 標題
        new Setting(contentEl)
            .setName(t('gallery_title'))
            .setDesc(t('gallery_title_desc'))
            .addText(text => text
                .setValue(this.title || '')
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
                    
                    const newGalleryBlockContent = galleryBlock.join('\n');
                    if (this.onConfirm) {
                        this.onConfirm(newGalleryBlockContent.trim());
                    }
                    
                    this.close();
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}