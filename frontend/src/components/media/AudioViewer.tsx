import React from 'react';
import { Item } from '../../types';
import { X, Download, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, RotateCcw } from 'lucide-react';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';

interface AudioViewerProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
}

const AudioViewer: React.FC<AudioViewerProps> = ({ item, isOpen, onClose }) => {
    const { privateKey } = useEncryption();
    const { showToast } = useToast();
    const [audioUrl, setAudioUrl] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string>('');
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isLooping, setIsLooping] = React.useState(false);
    const [playbackRate, setPlaybackRate] = React.useState(1);
    
    const audioRef = React.useRef<HTMLAudioElement>(null);

    React.useEffect(() => {
        if (isOpen && item && privateKey) {
            loadAudio();
        }
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [isOpen, item, privateKey]);

    const loadAudio = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            if (!privateKey) {
                throw new Error('Private key not available');
            }
            
            // Download and decrypt the audio
            const blob = await itemService.getItemAsBlob(item, privateKey);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error('Error loading audio:', error);
            setError('Failed to load audio');
            showToast('Failed to load audio', 'error');
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
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleLoop = () => {
        if (audioRef.current) {
            audioRef.current.loop = !isLooping;
            setIsLooping(!isLooping);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolume(vol);
            setIsMuted(vol === 0);
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    const skipTime = (seconds: number) => {
        if (audioRef.current) {
            const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const restart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getAudioType = (extension: string) => {
        const typeMap: Record<string, string> = {
            'mp3': 'MP3',
            'wav': 'WAV',
            'flac': 'FLAC',
            'aac': 'AAC',
            'ogg': 'OGG',
            'wma': 'WMA',
            'm4a': 'M4A',
        };
        return typeMap[extension.toLowerCase()] || extension.toUpperCase();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                onClose();
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
            case 'l':
            case 'L':
                e.preventDefault();
                toggleLoop();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                restart();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                skipTime(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                skipTime(10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const newVol = Math.min(1, volume + 0.1);
                handleVolumeChange({ target: { value: newVol.toString() } } as any);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const newVolDown = Math.max(0, volume - 0.1);
                handleVolumeChange({ target: { value: newVolDown.toString() } } as any);
                break;
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, volume]);

    if (!isOpen) return null;

    const extension = item.encryptedMetadata?.extension || '';
    const audioType = getAudioType(extension);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>

            {/* Content Container */}
            <div className="relative w-full max-w-2xl mx-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div></div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleDownload}
                                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                title="Download"
                            >
                                <Download className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                title="Close (Esc)"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{item.itemName}</h2>
                    <p className="text-gray-300 text-sm">{audioType} Audio File</p>
                </div>

                {/* Main Content */}
                {isLoading ? (
                    <div className="text-center text-white">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                        <p className="text-lg">Loading audio...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-white">
                        <p className="text-red-400 mb-4 text-lg">{error}</p>
                        <button
                            onClick={loadAudio}
                            className="px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                        {/* Audio Element */}
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onError={() => setError('Failed to play audio')}
                        />

                        {/* Album Art Placeholder */}
                        <div className="w-48 h-48 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Volume2 className="h-20 w-20 text-white opacity-60" />
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-sm text-gray-300 mt-2">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center justify-center space-x-6 mb-6">
                            <button
                                onClick={() => skipTime(-10)}
                                className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                title="Back 10s (←)"
                            >
                                <SkipBack className="h-6 w-6" />
                            </button>
                            
                            <button
                                onClick={restart}
                                className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                title="Restart (R)"
                            >
                                <RotateCcw className="h-5 w-5" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
                                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                            >
                                {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white ml-1" />}
                            </button>

                            <button
                                onClick={toggleLoop}
                                className={`p-3 rounded-full transition-colors ${
                                    isLooping 
                                        ? 'text-yellow-400 bg-yellow-400 bg-opacity-20' 
                                        : 'text-white hover:bg-white hover:bg-opacity-20'
                                }`}
                                title="Loop (L)"
                            >
                                <Repeat className="h-5 w-5" />
                            </button>

                            <button
                                onClick={() => skipTime(10)}
                                className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                title="Forward 10s (→)"
                            >
                                <SkipForward className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Volume and Speed Controls */}
                        <div className="flex items-center justify-between">
                            {/* Volume */}
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
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
                                    className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <span className="text-white text-sm w-8">{Math.round(volume * 100)}</span>
                            </div>

                            {/* Playback Speed */}
                            <div className="flex items-center space-x-2">
                                <span className="text-white text-sm">Speed:</span>
                                <select
                                    value={playbackRate}
                                    onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                                    className="bg-white bg-opacity-20 text-white rounded px-2 py-1 text-sm"
                                >
                                    <option value="0.5" className="text-black">0.5x</option>
                                    <option value="0.75" className="text-black">0.75x</option>
                                    <option value="1" className="text-black">1x</option>
                                    <option value="1.25" className="text-black">1.25x</option>
                                    <option value="1.5" className="text-black">1.5x</option>
                                    <option value="2" className="text-black">2x</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    .slider::-webkit-slider-thumb {
                        appearance: none;
                        height: 16px;
                        width: 16px;
                        border-radius: 50%;
                        background: #ffffff;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }

                    .slider::-moz-range-thumb {
                        height: 16px;
                        width: 16px;
                        border-radius: 50%;
                        background: #ffffff;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                `
            }} />
        </div>
    );
};

export { AudioViewer };
