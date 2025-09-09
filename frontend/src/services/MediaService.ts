import { Item } from "../types";

export interface MediaViewerProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
}

export type MediaViewerFunction = (item: Item) => Promise<void>;

class MediaService {
    private static instance: MediaService;

    private constructor() {}

    public static getInstance(): MediaService {
        if (!MediaService.instance) {
            MediaService.instance = new MediaService();
        }
        return MediaService.instance;
    }

    // Media viewer handlers map
    private mediaHandlers: Record<string, MediaViewerFunction> = {
        // Images
        'jpg': this.showImageViewer,
        'jpeg': this.showImageViewer,
        'png': this.showImageViewer,
        'gif': this.showImageViewer,
        'bmp': this.showImageViewer,
        'webp': this.showImageViewer,
        'svg': this.showImageViewer,
        'ico': this.showImageViewer,
        'tiff': this.showImageViewer,

        // Videos
        'mp4': this.showVideoViewer,
        'avi': this.showVideoViewer,
        'mkv': this.showVideoViewer,
        'mov': this.showVideoViewer,
        'wmv': this.showVideoViewer,
        'flv': this.showVideoViewer,
        'webm': this.showVideoViewer,
        '3gp': this.showVideoViewer,

        // Audio
        'mp3': this.showAudioViewer,
        'wav': this.showAudioViewer,
        'flac': this.showAudioViewer,
        'aac': this.showAudioViewer,
        'ogg': this.showAudioViewer,
        'wma': this.showAudioViewer,
        'm4a': this.showAudioViewer,

        // Documents
        'pdf': this.showPdfViewer,
        'txt': this.showTextViewer,
        'md': this.showTextViewer,
        'json': this.showTextViewer,
        'xml': this.showTextViewer,
        'html': this.showTextViewer,
        'css': this.showTextViewer,
        'js': this.showTextViewer,
        'ts': this.showTextViewer,
        'jsx': this.showTextViewer,
        'tsx': this.showTextViewer,
        'py': this.showTextViewer,
        'java': this.showTextViewer,
        'cpp': this.showTextViewer,
        'c': this.showTextViewer,
        'cs': this.showTextViewer,
        'php': this.showTextViewer,
        'rb': this.showTextViewer,
        'go': this.showTextViewer,
        'rs': this.showTextViewer,
        'swift': this.showTextViewer,
        'kt': this.showTextViewer,
        'dart': this.showTextViewer,
        'yaml': this.showTextViewer,
        'yml': this.showTextViewer,
        'toml': this.showTextViewer,
        'ini': this.showTextViewer,
        'env': this.showTextViewer,
        'log': this.showTextViewer,
        'sql': this.showTextViewer,
        'sh': this.showTextViewer,
        'bash': this.showTextViewer,
        'bat': this.showTextViewer,
        'ps1': this.showTextViewer,

        // Office documents (will need special handling)
        'doc': this.showOfficeViewer,
        'docx': this.showOfficeViewer,
        'xls': this.showOfficeViewer,
        'xlsx': this.showOfficeViewer,
        'ppt': this.showOfficeViewer,
        'pptx': this.showOfficeViewer,
    };

    // Event dispatcher for opening media viewers
    private mediaViewerEventTarget = new EventTarget();

    /**
     * Main function to show content based on file extension
     */
    public async showContent(item: Item): Promise<void> {
        if (!item.encryptedMetadata?.extension) {
            console.warn('No extension found for item:', item.itemName);
            return;
        }

        const extension = item.encryptedMetadata.extension.toLowerCase();
        const handler = this.mediaHandlers[extension];

        if (handler) {
            try {
                await handler.call(this, item);
            } catch (error) {
                console.error(`Error showing content for ${extension}:`, error);
                // Fallback to download if viewer fails
                this.showDownloadFallback(item);
            }
        } else {
            console.log(`No viewer available for extension: ${extension}`);
            // Fallback to download for unsupported files
            this.showDownloadFallback(item);
        }
    }

    /**
     * Check if an extension is supported for viewing
     */
    public isViewable(extension: string): boolean {
        return extension.toLowerCase() in this.mediaHandlers;
    }

    /**
     * Get supported extensions grouped by type
     */
    public getSupportedExtensions(): Record<string, string[]> {
        return {
            images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'],
            videos: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', '3gp'],
            audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
            documents: ['pdf'],
            text: ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'dart', 'yaml', 'yml', 'toml', 'ini', 'env', 'log', 'sql', 'sh', 'bash', 'bat', 'ps1'],
            office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
        };
    }

    // Individual viewer methods
    private async showImageViewer(item: Item): Promise<void> {
        this.dispatchMediaEvent('image-viewer-open', item);
    }

    private async showVideoViewer(item: Item): Promise<void> {
        this.dispatchMediaEvent('video-viewer-open', item);
    }

    private async showAudioViewer(item: Item): Promise<void> {
        this.dispatchMediaEvent('audio-viewer-open', item);
    }

    private async showPdfViewer(item: Item): Promise<void> {
        this.dispatchMediaEvent('pdf-viewer-open', item);
    }

    private async showTextViewer(item: Item): Promise<void> {
        this.dispatchMediaEvent('text-viewer-open', item);
    }

    private async showOfficeViewer(item: Item): Promise<void> {
        this.dispatchMediaEvent('office-viewer-open', item);
    }

    private showDownloadFallback(item: Item): void {
        this.dispatchMediaEvent('download-fallback', item);
    }

    // Event system for communication with React components
    private dispatchMediaEvent(eventType: string, item: Item): void {
        const event = new CustomEvent(eventType, {
            detail: { item }
        });
        this.mediaViewerEventTarget.dispatchEvent(event);
    }

    public addEventListener(eventType: string, callback: (event: CustomEvent) => void): void {
        this.mediaViewerEventTarget.addEventListener(eventType, callback as EventListener);
    }

    public removeEventListener(eventType: string, callback: (event: CustomEvent) => void): void {
        this.mediaViewerEventTarget.removeEventListener(eventType, callback as EventListener);
    }
}

// Export singleton instance
export const mediaService = MediaService.getInstance();
