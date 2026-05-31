import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface AppImages {
  banker: string;
  player: string;
  tie: string;
  bankerPair: string;
  playerPair: string;
  super6: string;
  baccarat: string;
}

// Fallback bundled assets (used until AppData images are ready)
import bankerFallback from "../assets/banker.png";
import playerFallback from "../assets/player.png";
import tieFallback from "../assets/tie.png";
import bankerPairFallback from "../assets/bankerpair.png";
import playerPairFallback from "../assets/playerpair.png";
import super6Fallback from "../assets/super6.png";
import baccaratFallback from "../assets/baccarat.png";

const FALLBACKS: AppImages = {
  banker: bankerFallback,
  player: playerFallback,
  tie: tieFallback,
  bankerPair: bankerPairFallback,
  playerPair: playerPairFallback,
  super6: super6Fallback,
  baccarat: baccaratFallback,
};

const IMAGE_NAMES: (keyof AppImages)[] = [
  "banker",
  "player",
  "tie",
  "bankerPair",
  "playerPair",
  "super6",
  "baccarat",
];

// Tauri invoke: returns base64 data URL or empty string if not found
async function loadImage(name: string): Promise<string> {
  try {
    const b64: string = await invoke("get_image_base64", { name });
    if (b64) {
      console.log(`[useAppImages] Loaded image successfully: ${name}`);
      return `data:image/png;base64,${b64}`;
    }
    console.log(`[useAppImages] Image is empty or not found: ${name}`);
    return "";
  } catch (error) {
    console.error(`[useAppImages] Error loading image: ${name}`, error);
    return "";
  }
}

export function useAppImages(): AppImages {
  const [images, setImages] = useState<AppImages>(FALLBACKS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const results: Partial<AppImages> = {};
      await Promise.all(
        IMAGE_NAMES.map(async (name) => {
          const url = await loadImage(name);
          results[name] = url || FALLBACKS[name];
        })
      );

      if (!cancelled) {
        setImages({ ...FALLBACKS, ...results });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}
