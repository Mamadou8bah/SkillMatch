import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Share2, Copy, X } from 'lucide-react';
import '../styles/sharemodal.css';

const ShareModal = ({ isOpen, onClose, job, isBookmarked, onToggleBookmark }) => {
  const shareUrl = `${window.location.origin}/jobs/${job.id}`;

  const options = [
    {
      id: 'bookmark',
      label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
      icon: <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />,
      onClick: () => {
        onToggleBookmark();
        onClose();
      }
    },
    {
      id: 'share',
      label: 'Share via...',
      icon: <Share2 size={20} />,
      onClick: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: job.title,
              text: `Check out this job: ${job.title} at ${job.company || job.employer?.name || 'Company'}`,
              url: shareUrl
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        } else {
          alert('Sharing not supported on this browser');
        }
      }
    },
    {
      id: 'copy',
      label: 'Copy Link',
      icon: <Copy size={20} />,
      onClick: async () => {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        onClose();
      }
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="share-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="share-modal-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="share-modal-header">
              <div className="share-modal-handle" />
              <div className="share-modal-title-row">
                <h3>Share Job</h3>
                <button className="share-modal-close" onClick={onClose}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="share-modal-options">
              {options.map((option) => (
                <button key={option.id} className="share-modal-option" onClick={option.onClick}>
                  <div className="option-icon">{option.icon}</div>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
