"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { whatsappUrl } from "@/lib/site-config";

export function WhatsAppFloat() {
  return (
    <motion.a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Yantrix Technology on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-0 rounded-full bg-whatsapp p-4 text-white shadow-xl shadow-emerald-600/30 transition-colors hover:bg-whatsapp-dark sm:bottom-6 sm:right-6"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp opacity-25" />
      <WhatsAppIcon className="h-7 w-7" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:ml-2 group-hover:max-w-[140px]">
        Chat with us
      </span>
    </motion.a>
  );
}
