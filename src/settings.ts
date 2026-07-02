import { App, PluginSettingTab, Setting } from 'obsidian';
import MediaViewPlugin from './main';
import { t } from './translations';

export interface MediaViewSettings {
    showImageInfo: boolean; // 是否顯示圖片資訊 (例如尺寸、檔案大小等)
    allowMediaDeletion: boolean; // 是否允許刪除媒體檔案
    autoOpenFirstImage: boolean; // 當打開畫廊時是否自動開啟第一張圖片
    openMediaBrowserOnClick: boolean; // 點擊圖片時是否打開媒體瀏覽器
    disableClickToOpenMediaOnGallery: boolean; // 是否停用在畫廊中點擊圖片以打開媒體瀏覽器的功能
    muteVideoOnOpen: boolean; // 打開影片時是否預設靜音
    galleryGridSize: string; // 畫廊網格大小的預設等級 (small, medium, large)
    galleryGridSizeSmall: number; // 小網格的大小 (像素)
    galleryGridSizeMedium: number; // 中網格的大小 (像素)
    galleryGridSizeLarge: number; // 大網格的大小 (像素)
    itemsPerPage: number; // 每頁顯示的項目數量 (0 代表不分頁)
    insertAtEnd: boolean; // 新加入的媒體是否插入在最後面
    displayOriginalSize: boolean; // 檢視時是否顯示原始尺寸
    autoPlayInterval: number; // 自動播放的時間間隔 (秒，0 代表不自動播放)
    galleryWaterfall: boolean; // 畫廊是否使用瀑布流顯示圖片
}

export const DEFAULT_SETTINGS: MediaViewSettings = {
    showImageInfo: true, // 預設顯示圖片資訊
    allowMediaDeletion: false, // 預設不允許刪除圖片
    autoOpenFirstImage: false, // 預設不自動打開第一張圖片
    openMediaBrowserOnClick: true, // 預設點擊圖片時打開媒體瀏覽器
    disableClickToOpenMediaOnGallery: false, // 預設不停用畫廊點擊事件
    muteVideoOnOpen: false, // 預設不靜音
    galleryGridSize: 'medium', // 預設畫廊網格大小為中
    galleryGridSizeSmall: 100, // 預設小網格大小為 100px
    galleryGridSizeMedium: 150, // 預設中網格大小為 150px
    galleryGridSizeLarge: 200, // 預設大網格大小為 200px
    itemsPerPage: 0, // 預設不分頁
    insertAtEnd: true, // 預設插入在最後
    displayOriginalSize: false, // 預設不顯示原始尺寸
    autoPlayInterval: 0, // 預設不自動播放
    galleryWaterfall: false, // 預設不使用瀑布流 (使用正方形裁剪)
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

        // 1. 是否顯示圖片資訊 (例如尺寸、檔案大小等)
        new Setting(containerEl)
            .setName(t('show_image_info'))
            .setDesc(t('show_image_info_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showImageInfo)
                .onChange(async (value) => {
                    this.plugin.settings.showImageInfo = value;
                    await this.plugin.saveSettings();
                }));

        // 2. 是否允許在媒體檢視器中直接刪除媒體檔案
        new Setting(containerEl)
            .setName(t('allow_media_deletion'))
            .setDesc(t('allow_media_deletion_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.allowMediaDeletion)
                .onChange(async (value) => {
                    this.plugin.settings.allowMediaDeletion = value;
                    await this.plugin.saveSettings();
                }));
        
        // 3. 打開畫廊時是否自動開啟第一張圖片
        new Setting(containerEl)
            .setName(t('auto_open_first_image'))
            .setDesc(t('auto_open_first_image_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoOpenFirstImage)
                .onChange(async (value) => {
                    this.plugin.settings.autoOpenFirstImage = value;
                    await this.plugin.saveSettings();
                }));

        // 4. 檢視時是否以原始大小尺寸顯示
        new Setting(containerEl)
            .setName(t('display_original_size'))
            .setDesc(t('display_original_size_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.displayOriginalSize)
                .onChange(async (value) => {
                    this.plugin.settings.displayOriginalSize = value;
                    await this.plugin.saveSettings();
                }));

        // 5. 點擊圖片時是否打開媒體瀏覽器
        new Setting(containerEl)
            .setName(t('click_to_open_media'))
            .setDesc(t('click_to_open_media_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.openMediaBrowserOnClick)
                .onChange(async (value) => {
                    this.plugin.settings.openMediaBrowserOnClick = value;
                    await this.plugin.saveSettings();
                }));
        
        // 6. 是否停用畫廊內的圖片點擊事件 (用以相容其他圖片類外掛)
        new Setting(containerEl)
            .setName(t('disable_click_to_open_media_on_gallery'))
            .setDesc(t('disable_click_to_open_media_on_gallery_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.disableClickToOpenMediaOnGallery)
                .onChange(async (value) => {
                    this.plugin.settings.disableClickToOpenMediaOnGallery = value;
                    await this.plugin.saveSettings();
                }));

        // 7. 打開影片檔案時是否預設靜音播放
        new Setting(containerEl)
            .setName(t('mute_video_on_open'))
            .setDesc(t('mute_video_on_open_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.muteVideoOnOpen)
                .onChange(async (value) => {
                    this.plugin.settings.muteVideoOnOpen = value;
                    await this.plugin.saveSettings();
                }));

        // 8. 投影片自動播放的間隔時間 (秒，0 代表停用)
        new Setting(containerEl)
            .setName(t('auto_play_interval'))
            .setDesc(t('auto_play_interval_desc'))
            .addText(text => text
                .setPlaceholder('0')
                .setValue(String(this.plugin.settings.autoPlayInterval))
                .onChange(async (value) => {
                    const numValue = parseInt(value);
                    this.plugin.settings.autoPlayInterval = isNaN(numValue) ? 0 : Math.max(0, numValue);
                    await this.plugin.saveSettings();
                }));

        // 9. 畫廊網格大小的預設等級 (小、中、大)
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

        // 10. 小尺寸網格的自訂寬度 (像素)
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

        // 11. 中尺寸網格的自訂寬度 (像素)
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

        // 12. 大尺寸網格的自訂寬度 (像素)
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

        // 13. 畫廊圖片是否使用瀑布流顯示
        new Setting(containerEl)
            .setName(t('gallery_waterfall'))
            .setDesc(t('gallery_waterfall_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.galleryWaterfall)
                .onChange(async (value) => {
                    this.plugin.settings.galleryWaterfall = value;
                    await this.plugin.saveSettings();
                }));

        // 14. 畫廊分頁設定，每頁顯示的項目數量 (0 代表不啟用分頁)
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
        
        // 15. 媒體檔案的插入位置 (最前面或最後面)
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
