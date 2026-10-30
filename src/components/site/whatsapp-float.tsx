"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/site/whatsapp-icon";
import { useSettings } from "@/lib/content/provider";
import { whatsappUrl } from "@/lib/content/helpers";

export function WhatsAppFloat() {
  const settings = useSettings();
  return (
    /* <aside> gives this floating action a landmark: without it axe reports
       page content that is not contained by any landmark. */
    <aside aria-label="Quick contact">
      <motion.a
        href={whatsappUrl(settings)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with ${settings.name} on WhatsApp`}
        className="group fixed bottom-5 right-5 z-50 flex items-center gap-0 rounded-full bg-whatsapp p-4 text-white shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 hover:bg-whatsapp-dark sm:bottom-6 sm:right-6"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
      >
        {/* double pulse rings */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-whatsapp opacity-25" />
        <span
          className="absolute inset-0 -z-20 animate-ping rounded-full bg-whatsapp opacity-15"
          style={{ animationDelay: "0.6s" }}
        />
        <WhatsAppIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:ml-2 group-hover:max-w-[140px]">
          Chat with us
        </span>
      </motion.a>
    </aside>
  );
}
