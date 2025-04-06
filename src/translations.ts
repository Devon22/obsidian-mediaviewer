import { getLanguage } from 'obsidian';

interface Translations {
    'zh-TW': { [key: string]: string };
    'en': { [key: string]: string }; 
    'zh': { [key: string]: string };
    'ja': { [key: string]: string };
}

// 定義有效的語言代碼型別
type LanguageKey = keyof Translations;

// 全域翻譯函式
export function t(key: string): string {
    const lang = window.localStorage.getItem('language') as LanguageKey;
    //const lang: LanguageKey = getLanguage() as LanguageKey;
    const translations = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return translations[key] || key;
}

// 語系檔案
const TRANSLATIONS: Translations = {
    'zh-TW': {
        // 通知訊息
        'please_open_note': '請先打開一個筆記文件',
        'error_scanning_media': '掃描媒體文件時出錯',
        'no_media_found': '此筆記中沒有找到媒體文件',
        'media_deleted': '已刪除媒體文件',
        'error_deleting_media': '刪除媒體文件時出錯',
        'gallery_not_found': '無法找到對應的 Gallery 區塊',
        'error_adding_file': '新增檔案時發生錯誤',
        'clipboard_error': '讀取剪貼簿時發生錯誤',

        // 按鈕和標籤
        'delete': '刪除',
        'confirm': '確認',
        'drag_and_drop': '拖曳圖片到這裡或點擊選擇檔案',
        'paste_from_clipboard': '從剪貼簿貼上圖片',
        'add_image': '新增圖片',

        // 設定
        'allow_media_deletion': '允許刪除媒體檔案',
        'allow_media_deletion_desc': '啟用此選項後，可以在媒體瀏覽器中刪除媒體檔案',
        'auto_open_first_image': '自動打開第一張圖片',
        'auto_open_first_image_desc': '啟用此選項後，媒體瀏覽器將自動打開第一張圖片',
        'display_original_size': '以原始尺寸顯示小型圖片',
        'display_original_size_desc': '啟用後，小型圖片將以原始尺寸顯示，而不是全螢幕顯示',
        'click_to_open_media': '點擊圖片打開媒體瀏覽器',
        'click_to_open_media_desc': '啟用此選項後，點擊一般的圖片將以媒體瀏覽器打開 (需重啟)',
        'disable_click_to_open_media_on_gallery': '禁用 Gallery 內圖片點擊打開媒體瀏覽器',
        'disable_click_to_open_media_on_gallery_desc': '點擊 Gallery 內的圖片將不會打開媒體瀏覽器 (以便相容其他圖片類外掛)',
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
        'setting_gallery': '設定 Gallery 區塊',
        'ungenerate_gallery': '取消 Gallery 區塊',
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
        'clipboard_error': 'Error reading clipboard',

        // Buttons and Labels
        'delete': 'Delete',
        'confirm': 'Confirm',
        'drag_and_drop': 'Drag and drop images here or click to select files',
        'paste_from_clipboard': 'Paste image from clipboard',
        'add_image': 'Add image',

        // Settings
        'allow_media_deletion': 'Allow media deletion',
        'allow_media_deletion_desc': 'Enable deletion of media files in the media browser',
        'auto_open_first_image': 'Auto open first image',
        'auto_open_first_image_desc': 'Automatically open the first image when opening the media browser',
        'display_original_size': 'Display small images in original size',
        'display_original_size_desc': 'When enabled, small images will be displayed in their original size instead of full screen',
        'click_to_open_media': 'Click image to open Media Browser',
        'click_to_open_media_desc': 'Open media browser when clicking on images (requires restart)',
        'disable_click_to_open_media_on_gallery': 'Disable click to open media on gallery',
        'disable_click_to_open_media_on_gallery_desc': 'Disable click to open media on gallery (for compatibility with other image plugins)',
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
        'setting_gallery': 'Setting gallery block',
        'ungenerate_gallery': 'Cancel gallery block',
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
        'clipboard_error': '读取剪贴板时发生错误',

        // 按钮和标签
        'delete': '删除',
        'confirm': '确认',
        'drag_and_drop': '拖曳图片到这裡或点击选择图片',
        'paste_from_clipboard': '从剪贴板粘贴图片',
        'add_image': '新增图片',

        // 设置
        'allow_media_deletion': '允许删除媒体文件',
        'allow_media_deletion_desc': '启用此选项后，可以在媒体浏览器中删除媒体文件',
        'auto_open_first_image': '自动打开第一张图片',
        'auto_open_first_image_desc': '启用此选项后，媒体浏览器将自动打开第一张图片',
        'display_original_size': '以原始尺寸显示小型图片',
        'display_original_size_desc': '启用后，小型图片将以原始尺寸显示，而不是全屏幕显示',
        'click_to_open_media': '点击图片打开媒体浏览器',
        'click_to_open_media_desc': '启用此选项后，点击一般的图片将以媒体浏览器打开 (需重启)',
        'disable_click_to_open_media_on_gallery': '禁用 Gallery 内的图片点击打开媒体浏览器',
        'disable_click_to_open_media_on_gallery_desc': '点击 Gallery 内的图片将不会打开媒体浏览器 (以便兼容其他图片插件)',
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
        'setting_gallery': '设置 Gallery 区块',
        'ungenerate_gallery': '取消 Gallery 区块',
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
        'clipboard_error': 'クリップボードの読み取り時にエラーが発生しました',

        // ボタンとラベル
        'delete': '削除',
        'confirm': '確認',
        'drag_and_drop': '画像をドラッグ＆ドロップするか、クリックしてファイルを選択',
        'paste_from_clipboard': 'クリップボードから画像を貼り付け',
        'add_image': '画像を追加',

        // 設定
        'allow_media_deletion': 'メディア削除を許可',
        'allow_media_deletion_desc': 'メディアブラウザでメディアファイルの削除を有効にします',
        'auto_open_first_image': '最初の画像を自動的に開く',
        'auto_open_first_image_desc': 'メディアブラウザを開くときに最初の画像を自動的に開きます',
        'display_original_size': '画像を元のサイズで表示',
        'display_original_size_desc': '有効にすると、画像を元のサイズで表示し、フルスクリーン表示にしない',
        'click_to_open_media': '画像をクリックしてメディアブラウザを開く',
        'click_to_open_media_desc': '画像をクリックするとメディアブラウザが開きます（再起動が必要）',
        'disable_click_to_open_media_on_gallery': 'ギャラリー内の画像をクリックしてメディアブラウザを開くを無効にする',
        'disable_click_to_open_media_on_gallery_desc': 'ギャラリー内の画像をクリックするとメディアブラウザが開かない（他の画像プラグインとの互換性のために）',
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
        'setting_gallery': 'ギャラリーブロックを設定',
        'ungenerate_gallery': 'ギャラリーブロックを削除',
        'gallery_title': 'ギャラリータイトル',
        'gallery_title_desc': 'ギャラリーのタイトルを設定（オプション）',
        'gallery_size': 'ギャラリーサイズ',
        'gallery_size_desc': 'ギャラリー内の画像表示サイズを選択',
        'gallery_add_button': 'アップロードボタンを表示',
        'gallery_add_button_desc': 'ギャラリーにアップロードボタンを表示するかどうか'
    },
};