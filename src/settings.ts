import { App, PluginSettingTab, Setting } from 'obsidian';
import MediaViewPlugin from '../main';
import { t } from './translations';

export interface MediaViewSettings {
    showImageInfo: boolean;
    allowMediaDeletion: boolean;
    autoOpenFirstImage: boolean;
    openMediaBrowserOnClick: boolean;
    muteVideoOnOpen: boolean;
    galleryGridSize: string;
    galleryGridSizeSmall: number;
    galleryGridSizeMedium: number;
    galleryGridSizeLarge: number;
    itemsPerPage: number;
    insertAtEnd: boolean;
}

export const DEFAULT_SETTINGS: MediaViewSettings = {
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

export class MediaViewSettingTab extends PluginSettingTab {
    plugin: MediaViewPlugin;
    
    constructor(app: App, plugin: MediaViewPlugin) {
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
                    this.plugin.settings.itemsPerPage = isNaN(numValue) ? 20 : numValue;
                    await this.plugin.saveSettings();
                }));
    }
}
