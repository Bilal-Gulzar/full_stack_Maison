import { motion } from "framer-motion";

const PHONE = "923430209163"; // +92 343 0209163
const MESSAGE = "Hi Maison! I'd like to know more about your collection.";

const WhatsAppButton = () => {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-4 z-[60] w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-black/20 hover:shadow-xl transition-shadow"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 01-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 01-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.65-1.39.214-.372.214-.717.146-1.118-.13-.4-1.49-1.046-1.78-1.146z" />
        <path d="M16.063 0C7.197 0 0 7.197 0 16.063c0 2.843.745 5.628 2.163 8.07L0 32l8.137-2.135a16.013 16.013 0 007.926 2.07c8.866 0 16.063-7.197 16.063-16.063S24.929 0 16.063 0zm0 29.04a13.04 13.04 0 01-6.652-1.82l-.476-.286-4.83 1.273 1.288-4.728-.31-.487a12.927 12.927 0 01-1.99-6.929c0-7.157 5.83-12.987 12.987-12.987s12.987 5.83 12.987 12.987-5.83 12.987-13.004 12.987z" />
      </svg>
    </motion.a>
  );
};

export default WhatsAppButton;
