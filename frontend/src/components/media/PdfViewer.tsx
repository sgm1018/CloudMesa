import React from 'react';
import { Item } from '../../types';
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { itemService } from '../../services/ItemService';
import { useEncryption } from '../../context/EncryptionContext';
import { useToast } from '../../context/ToastContext';

interface PdfViewerProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ item, isOpen, onClose }) => {
    const { privateKey } = useEncryption();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string>('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(0);
    const [scale, setScale] = React.useState(1);
    const [rotation, setRotation] = React.useState(0);
    const [pdfInstance, setPdfInstance] = React.useState<any>(null);
    const [pageRendering, setPageRendering] = React.useState(false);
    const [pageNumPending, setPageNumPending] = React.useState<number | null>(null);
    
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (isOpen && item && privateKey) {
            loadPdf();
        }
    }, [isOpen, item, privateKey]);

    const loadPdf = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            if (!privateKey) {
                throw new Error('Private key not available');
            }
            
            // Check if PDF.js is available
            if (typeof window === 'undefined' || !(window as any).pdfjsLib) {
                setError('PDF.js library not loaded. Please add PDF.js to your project.');
                return;
            }

            // Download and decrypt the PDF
            const blob = await itemService.getItemAsBlob(item, privateKey);
            const arrayBuffer = await blob.arrayBuffer();
            
            const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPdfInstance(pdf);
            setTotalPages(pdf.numPages);
            
            // Render first page
            renderPage(1, pdf);
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            setError('Failed to load PDF. Make sure PDF.js is installed.');
            showToast('Failed to load PDF', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPage = async (pageNum: number, pdf?: any) => {
        const pdfDoc = pdf || pdfInstance;
        if (!pdfDoc || !canvasRef.current) return;

        setPageRendering(true);
        
        try {
            const page = await pdfDoc.getPage(pageNum);
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (!context) return;

            const viewport = page.getViewport({ 
                scale: scale, 
                rotation: rotation 
            });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            setCurrentPage(pageNum);
            
        } catch (error) {
            console.error('Error rendering page:', error);
            setError('Failed to render PDF page');
        } finally {
            setPageRendering(false);
            
            // If another page was requested while we were rendering,
            // render the requested page now
            if (pageNumPending !== null) {
                const pending = pageNumPending;
                setPageNumPending(null);
                renderPage(pending);
            }
        }
    };

    const queueRenderPage = (pageNum: number) => {
        if (pageRendering) {
            setPageNumPending(pageNum);
        } else {
            renderPage(pageNum);
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

    const zoomIn = () => {
        const newScale = Math.min(scale + 0.25, 3);
        setScale(newScale);
        if (pdfInstance) {
            queueRenderPage(currentPage);
        }
    };

    const zoomOut = () => {
        const newScale = Math.max(scale - 0.25, 0.25);
        setScale(newScale);
        if (pdfInstance) {
            queueRenderPage(currentPage);
        }
    };

    const rotate = () => {
        const newRotation = (rotation + 90) % 360;
        setRotation(newRotation);
        if (pdfInstance) {
            queueRenderPage(currentPage);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            queueRenderPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            queueRenderPage(currentPage + 1);
        }
    };

    const goToPage = (pageNum: number) => {
        if (pageNum >= 1 && pageNum <= totalPages) {
            queueRenderPage(pageNum);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                onClose();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                goToPreviousPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                goToNextPage();
                break;
            case '=':
            case '+':
                e.preventDefault();
                zoomIn();
                break;
            case '-':
                e.preventDefault();
                zoomOut();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                rotate();
                break;
            case 'Home':
                e.preventDefault();
                goToPage(1);
                break;
            case 'End':
                e.preventDefault();
                goToPage(totalPages);
                break;
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentPage, totalPages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <FileText className="h-6 w-6 text-blue-400" />
                    <div>
                        <h2 className="text-white font-semibold text-lg">{item.itemName}</h2>
                        <p className="text-gray-400 text-sm">PDF Document</p>
                    </div>
                </div>

                {!isLoading && !error && totalPages > 0 && (
                    <div className="flex items-center space-x-4 text-white">
                        {/* Page Navigation */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage <= 1}
                                className="p-2 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Previous Page (←)"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={(e) => goToPage(parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 bg-gray-700 text-white rounded text-center text-sm"
                                />
                                <span className="text-gray-400">/ {totalPages}</span>
                            </div>
                            
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= totalPages}
                                className="p-2 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Next Page (→)"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={zoomOut}
                                disabled={scale <= 0.25}
                                className="p-2 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="h-5 w-5" />
                            </button>
                            
                            <span className="text-sm text-gray-300 w-16 text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            
                            <button
                                onClick={zoomIn}
                                disabled={scale >= 3}
                                className="p-2 text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Rotate */}
                        <button
                            onClick={rotate}
                            className="p-2 text-white hover:bg-gray-700 rounded"
                            title="Rotate (R)"
                        >
                            <RotateCw className="h-5 w-5" />
                        </button>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleDownload}
                        className="p-2 text-white hover:bg-gray-700 rounded"
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-white hover:bg-gray-700 rounded"
                        title="Close (Esc)"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-900 p-4">
                {isLoading ? (
                    <div className="text-center text-white">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                        <p className="text-lg">Loading PDF...</p>
                    </div>
                ) : error ? (
                    <div className="text-center text-white max-w-md">
                        <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 mb-4 text-lg">{error}</p>
                        {error.includes('PDF.js') && (
                            <div className="text-sm text-gray-400 mb-4">
                                <p>To enable PDF viewing, add PDF.js to your project:</p>
                                <code className="block mt-2 p-2 bg-gray-800 rounded text-xs">
                                    npm install pdfjs-dist
                                </code>
                                <p className="mt-2">And include it in your HTML:</p>
                                <code className="block mt-2 p-2 bg-gray-800 rounded text-xs">
                                    {'<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>'}
                                </code>
                            </div>
                        )}
                        <button
                            onClick={loadPdf}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-full shadow-lg bg-white"
                        />
                        {pageRendering && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
                                    Rendering page...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer with keyboard shortcuts */}
            {!isLoading && !error && (
                <div className="bg-gray-800 border-t border-gray-700 p-2">
                    <div className="text-xs text-gray-400 text-center">
                        <span className="mr-4">← → Navigate pages</span>
                        <span className="mr-4">+ - Zoom</span>
                        <span className="mr-4">R Rotate</span>
                        <span>Esc Close</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export { PdfViewer };
