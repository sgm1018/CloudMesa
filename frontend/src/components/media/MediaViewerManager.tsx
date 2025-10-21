import React from 'react';
import { Item } from '../../types';
import { mediaService } from '../../services/MediaService';
import { ImageViewer } from './ImageViewer';
import { VideoViewer } from './VideoViewer';
import { TextViewer } from './TextViewer';
import { AudioViewer } from './AudioViewer';
// import { OfficeViewer } from './OfficeViewer'; 
import { PdfViewer } from './PdfViewer';
interface MediaViewerState {
    currentItem: Item | null;
    viewerType: string | null;
}

const MediaViewerManager: React.FC = () => {
    const [mediaState, setMediaState] = React.useState<MediaViewerState>({  
        currentItem: null,
        viewerType: null
    });

    React.useEffect(() => {
        // Listen for media viewer events
        const handleImageViewer = (event: CustomEvent) => {
            setMediaState({
                currentItem: event.detail.item,
                viewerType: 'image'
            });
        };

        const handleVideoViewer = (event: CustomEvent) => {
            setMediaState({
                currentItem: event.detail.item,
                viewerType: 'video'
            });
        };

        const handleTextViewer = (event: CustomEvent) => {
            setMediaState({
                currentItem: event.detail.item,
                viewerType: 'text'
            });
        };

        const handleAudioViewer = (event: CustomEvent) => {
            setMediaState({
                currentItem: event.detail.item,
                viewerType: 'audio'
            });
        };

        const handlePdfViewer = (event: CustomEvent) => {
            setMediaState({
                currentItem: event.detail.item,
                viewerType: 'pdf'
            });
        };

        const handleOfficeViewer = (event: CustomEvent) => {
            setMediaState({
                currentItem: event.detail.item,
                viewerType: 'office'
            });
        };

        const handleDownloadFallback = (event: CustomEvent) => {
            console.log('Download fallback for:', event.detail.item.itemName);
        };

        // Add event listeners
        mediaService.addEventListener('image-viewer-open', handleImageViewer);
        mediaService.addEventListener('video-viewer-open', handleVideoViewer);
        mediaService.addEventListener('text-viewer-open', handleTextViewer);
        mediaService.addEventListener('audio-viewer-open', handleAudioViewer);
        mediaService.addEventListener('pdf-viewer-open', handlePdfViewer);
        mediaService.addEventListener('office-viewer-open', handleOfficeViewer);
        mediaService.addEventListener('download-fallback', handleDownloadFallback);

        // Cleanup listeners
        return () => {
            mediaService.removeEventListener('image-viewer-open', handleImageViewer);
            mediaService.removeEventListener('video-viewer-open', handleVideoViewer);
            mediaService.removeEventListener('text-viewer-open', handleTextViewer);
            mediaService.removeEventListener('audio-viewer-open', handleAudioViewer);
            mediaService.removeEventListener('pdf-viewer-open', handlePdfViewer);
            mediaService.removeEventListener('office-viewer-open', handleOfficeViewer);
            mediaService.removeEventListener('download-fallback', handleDownloadFallback);
        };
    }, []);

    const closeViewer = () => {
        setMediaState({
            currentItem: null,
            viewerType: null
        });
    };

    const { currentItem, viewerType } = mediaState;

    return (
        <>
            {/* Image Viewer */}
            <ImageViewer
                item={currentItem!}
                isOpen={viewerType === 'image' && !!currentItem}
                onClose={closeViewer}
            />

            {/* Video Viewer */}
            <VideoViewer
                item={currentItem!}
                isOpen={viewerType === 'video' && !!currentItem}
                onClose={closeViewer}
            />

            {/* Text Viewer */}
            <TextViewer
                item={currentItem!}
                isOpen={viewerType === 'text' && !!currentItem}
                onClose={closeViewer}
            />

            {/* Audio Viewer */}
            <AudioViewer
                item={currentItem!}
                isOpen={viewerType === 'audio' && !!currentItem}
                onClose={closeViewer}
            />

            {/* PDF Viewer */}
            <PdfViewer
                item={currentItem!}
                isOpen={viewerType === 'pdf' && !!currentItem}
                onClose={closeViewer}
            />

            {/* Office Viewer */}
            {/* <OfficeViewer
                item={currentItem!}
                isOpen={viewerType === 'office' && !!currentItem}
                onClose={closeViewer}
            /> */}
        </>
    );
};

export const MediaViewer = MediaViewerManager;
