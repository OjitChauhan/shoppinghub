import { motion, AnimatePresence } from "framer-motion";

const backdropVariants = {
  visible: { opacity: 0.5 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: "-50%", x: "-50%", scale: 0.9 },
  visible: { opacity: 1, y: "-50%", x: "-50%", scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: "-50%", x: "-50%", scale: 0.9, transition: { duration: 0.2 } },
};

const Modal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            aria-label="Close modal backdrop"
          />
          <motion.div
            className="fixed top-1/2 left-1/2 bg-[#FAF7F6] rounded-xl p-6 z-50 shadow-lg max-w-lg w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-[#285570] hover:text-[#3CBEAC] focus:outline-none focus:ring-2 focus:ring-[#3CBEAC] rounded transition"
            >
              X
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;

