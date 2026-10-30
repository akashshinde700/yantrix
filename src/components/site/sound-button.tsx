"use client";

import { useSyncExternalStore } from "react";
import { VolumeX } from "lucide-react";
import { isAmbientPlaying, subscribeAmbient, toggleAmbient } from "@/components/site/universe/ambient-sound";
import { cn } from "@/lib/utils";

/**
 * Space-sound toggle. While playing it shows live equalizer bars; muted, a
 * crossed speaker. Shared state, so the header and the chapter dock stay in sync.
 */
export function SoundButton({ className }: { className?: string }) {
  const playing = useSyncExternalStore(subscribeAmbient, isAmbientPlaying, () => false);
  return (
    <button
      type="button"
      onClick={toggleAmbient}
      aria-pressed={playing}
      aria-label={playing ? "Mute space sound" : "Play space sound"}
      title={playing ? "Sound on — click to mute" : "Play space sound"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
        playing ? "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/40" : "text-slate-400 hover:bg-white/5 hover:text-white",
        className
      )}
    >
      {playing ? (
        <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="sound-bar w-[3px] rounded-full bg-current" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </span>
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
