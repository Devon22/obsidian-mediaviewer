import { App, Modal,Setting, Editor} from 'obsidian';
import { t } from './translations';

// Gallery 生成對話框
export class GalleryBlockGenerateModal extends Modal {
    selectedText: string;
    title: string;
    size: string;
    addButton: boolean;
    pagination: number;
    editor: Editor;

    constructor(app: App, editor: Editor, selectedText: string) {
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