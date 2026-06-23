"use client";

import { usePathname } from "next/navigation";
import { WHATSAPP_HREF } from "@/lib/whatsapp";

const EXCLUDED_PATH_PREFIXES = ["/register", "/corrections", "/admin"];

export function TalkToUsButton() {
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isExcluded) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 md:bottom-6"
    >
      <svg
        aria-hidden="true"
        className="size-7"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.51 3.62 1.4 5.12L2 22l5.13-1.49a9.84 9.84 0 004.91 1.31h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.04h-.01a8.17 8.17 0 01-4.16-1.14l-.3-.18-3.05.89.91-2.97-.2-.31a8.13 8.13 0 01-1.25-4.33c0-4.49 3.65-8.14 8.14-8.14 2.17 0 4.21.85 5.75 2.39a8.08 8.08 0 012.38 5.75c0 4.49-3.65 8.04-8.21 8.04zm4.47-6.08c-.24-.12-1.43-.71-1.65-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.04-.47-.08-.12-.51-1.23-.7-1.68-.18-.44-.37-.38-.51-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.3-.21.24-.81.79-.81 1.92 0 1.13.83 2.23.94 2.38.12.16 1.61 2.46 3.9 3.36 2.29.9 2.29.6 2.71.56.42-.04 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28z" />
      </svg>
    </a>
  );
}
