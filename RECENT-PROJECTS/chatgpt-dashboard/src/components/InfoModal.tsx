import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-[100]"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 pr-8">{title}</h3>
                    <div className="text-sm text-gray-600 leading-relaxed">
                        {content}
                    </div>
                </div>
            </div>
        </>
    );
};
