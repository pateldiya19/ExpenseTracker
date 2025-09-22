import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Chatbot from '../pages/Chatbot';

export default function ChatModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[5000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-[95vw] max-w-2xl bg-background border border-border/60 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/40 backdrop-blur">
              <h3 className="font-heading font-semibold">Chat</h3>
              <button onClick={onClose} aria-label="Close chat" className="p-1.5 rounded-md hover:bg-white/5">
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>
            <div className="p-3">
              <div className="h-[60vh] min-h-[420px]">
                <Chatbot embedded={true} height="100%" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
