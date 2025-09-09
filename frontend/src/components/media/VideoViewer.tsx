import React from 'react';
import { Item } from '../../types';
import { X, Download, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';

interface VideoViewerProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
}

const VideoViewer: React.FC<VideoViewerProps> = ({ item, isOpen, onClose }) => {
    const { privateKey } = useEncryption();
    const { showToast } = useToast();
    const [videoUrl, setVideoUrl] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string>('');
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen && item && privateKey) {
            loadVideo();
        }
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [isOpen, item, privateKey]);

    const loadVideo = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            if (!privateKey) {
                throw new Error('Private key not available');
            }
            
            // Download and decrypt the video
            const blob = await itemService.getItemAsBlob(item, privateKey);
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        } catch (error) {
            console.error('Error loading video:', error);
            setError('Failed to load video');
            showToast('Failed to load video', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            if (!privateKey) {
                showToast('Private key not available', 'error');
                return;
            }
            await itemService.downloadItem(item, privateKey);
            showToast('Download started', 'success');
        } catch (error) {
            showToast('Download failed', 'error');
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = vol;
            setVolume(vol);
            setIsMuted(vol === 0);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const restart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                if (isFullscreen) {
                    document.exitFullscreen();
                } else {
                    onClose();
                }
                break;
            case ' ':
                e.preventDefault();
                togglePlay();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                toggleMute();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                restart();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
                }
                break;
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isFullscreen, duration]);

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (!isOpen) return null;

    return (
        <div 
            ref={containerRef}
            className="fixed inset-0 bg-black z-50 flex flex-col"
        >
            {/* Header */}
            <div className={`bg-black bg-opacity-75 text-white p-4 z-10 ${isFullscreen ? 'absolute top-0 left-0 right-0' : ''}`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium truncate">{item.itemName}</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Download"
                        >
                            <Download className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Close (Esc)"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center">
                {isLoading ? (
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
                        <p>Loading video...</p>
                    </div>
                ) : error ? (
                    <div className="text-white text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={loadVideo}
                            className="px-4 py-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            className="max-w-full max-h-full"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onError={() => setError('Failed to play video')}
                            controls={false}
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            {!isLoading && !error && (
                <div className={`bg-black bg-opacity-75 text-white p-4 ${isFullscreen ? 'absolute bottom-0 left-0 right-0' : ''}`}>
                    {/* Progress bar */}
                    <div className="mb-4">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-300 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={restart}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                                title="Restart (R)"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </button>
                            
                            <button
                                onClick={togglePlay}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                            >
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </button>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                                >
                                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                </button>
                                
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                            title="Fullscreen (F)"
                        >
                            <Maximize className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { VideoViewer };
