import React from "react";
import { normalizeJsonToSimpleMap, correctIsWaterFromFlags } from "../../utils/mapUtils";

export default function MapFileUploader({
  onJsonLoaded,
}: {
  onJsonLoaded?: (data: unknown) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [saved, setSaved] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("itt_saved_maps");
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const persistList = (list: Array<{ id: string; name: string }>) => {
    setSaved(list);
    try {
      localStorage.setItem("itt_saved_maps", JSON.stringify(list));
    } catch {
      // Ignore localStorage errors
    }
  };

  const openDialog = () => {
    inputRef.current?.click();
  };

  const clearAllSaved = () => {
    try {
      saved.forEach((s) => {
        localStorage.removeItem(`itt_map_data_${s.id}`);
      });
      localStorage.removeItem("itt_saved_maps");
      setSaved([]);
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    if (!file) return;
    const lower = file.name.toLowerCase();
    try {
      setIsProcessing(true);
      if (lower.endsWith(".json")) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const id = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now().toString(36)}`;
        try {
          localStorage.setItem(`itt_map_data_${id}`, JSON.stringify(parsed));
        } catch {
          // Ignore localStorage errors
        }
        persistList([{ id, name: file.name }, ...saved.filter((s) => s.id !== id)].slice(0, 50));
        onJsonLoaded?.(parsed);
        setIsMinimized(true);
      } else if (lower.endsWith(".w3e")) {
        const arrayBuf = await file.arrayBuffer();
        const [{ Buffer }, wc3] = await Promise.all([import("buffer"), import("wc3maptranslator")]);
        const { TerrainTranslator } = wc3 as unknown as {
          TerrainTranslator: { warToJson: (buf: Buffer) => { json: unknown } };
        };
        const buf = Buffer.from(arrayBuf);
        const result = TerrainTranslator.warToJson(buf);
        if (!result || !("json" in result)) throw new Error("Translator returned no JSON");
        const rawJson = result.json;

        // Debug: Log the format to help diagnose water flag issues
        const parsedObj = rawJson as Record<string, unknown>;
        if (parsedObj.flags && Array.isArray(parsedObj.flags)) {
          const flags = parsedObj.flags as number[];
          const WATER_FLAG = 0x20000000;
          const waterFlags = flags.filter((f) => (f & WATER_FLAG) !== 0);
          console.log(
            `[Map Upload] Format: Raw with flags array. Total flags: ${flags.length}, Water flags: ${waterFlags.length}`
          );
          if (waterFlags.length === 0 && flags.length > 0) {
            const maxFlag = Math.max(...flags);
            console.warn(
              `[Map Upload] No water flags detected! Max flag value: ${maxFlag} (0x${maxFlag.toString(16)}). Expected WATER_FLAG: ${WATER_FLAG} (0x${WATER_FLAG.toString(16)})`
            );
          }
        } else if (parsedObj.tiles && Array.isArray(parsedObj.tiles)) {
          const tiles = parsedObj.tiles as Array<Record<string, unknown>>;
          const waterTiles = tiles.filter((t) => t.isWater === true);
          console.log(
            `[Map Upload] Format: Pre-processed tiles. Total tiles: ${tiles.length}, Water tiles: ${waterTiles.length}`
          );
          if (waterTiles.length === 0 && tiles.length > 0) {
            const sampleTile = tiles[0];
            console.warn(`[Map Upload] No water tiles detected! Sample tile:`, sampleTile);
          }
        } else {
          console.log(`[Map Upload] Unknown format. Keys:`, Object.keys(parsedObj));
        }

        // Normalize the JSON to ensure water flags are correctly extracted
        // This converts raw format (with flags array) to SimpleMapData format
        let normalizedJson: unknown;
        try {
          const normalized = normalizeJsonToSimpleMap(rawJson);
          // Apply correction to fix any incorrectly set isWater flags
          const corrected = correctIsWaterFromFlags(normalized);
          normalizedJson = corrected;

          const waterTiles = corrected.tiles.filter((t) => t.isWater === true);
          console.log(
            `[Map Upload] After normalization: ${waterTiles.length} water tiles detected out of ${corrected.tiles.length} total`
          );
        } catch (normalizeError) {
          console.warn("[Map Upload] Failed to normalize JSON, using raw format:", normalizeError);
          normalizedJson = rawJson;
        }

        const id = `${file.name.replace(/\.[^/.]+$/, "")}_${Date.now().toString(36)}`;
        try {
          localStorage.setItem(`itt_map_data_${id}`, JSON.stringify(normalizedJson));
        } catch {
          // Ignore localStorage errors
        }
        persistList([{ id, name: file.name }, ...saved.filter((s) => s.id !== id)].slice(0, 50));
        onJsonLoaded?.(normalizedJson);
        setIsMinimized(true);
      } else {
        console.warn("Unsupported file type:", file.name);
      }
    } catch (err) {
      console.error("Failed to process file:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`bg-black/30 backdrop-blur-sm border border-amber-500/30 rounded-lg text-gray-200 ${isMinimized ? "px-4 py-2" : "p-6"}`}
    >
      <div className={`flex items-center justify-between ${isMinimized ? "mb-0" : "mb-3"}`}>
        <h2 className={`font-medieval-brand ${isMinimized ? "text-lg" : "text-2xl"}`}>
          Upload Map
        </h2>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-400 hover:text-gray-200 transition-colors"
          aria-label={isMinimized ? "Expand" : "Minimize"}
        >
          {isMinimized ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </button>
      </div>
      {!isMinimized && (
        <>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".w3e,.json"
              className="hidden"
              onChange={handleChange}
            />
            <button
              className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded disabled:opacity-50"
              onClick={openDialog}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing…" : "Choose File"}
            </button>
            <span className="text-sm text-gray-400">.w3e or .json</span>
            {fileName && (
              <span className="text-sm text-amber-300 truncate max-w-[16rem]" title={fileName}>
                {fileName}
              </span>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Uploaded map is saved locally and will persist after refresh.
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Saved Maps</div>
              {saved.length > 0 && (
                <button
                  className="px-2 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded"
                  onClick={clearAllSaved}
                >
                  Clear Saved
                </button>
              )}
            </div>
            {saved.length === 0 ? (
              <div className="text-sm text-gray-400">No saved maps yet</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {saved.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between bg-black/20 border border-amber-500/20 rounded px-2 py-1"
                  >
                    <span className="truncate mr-2" title={s.name}>
                      {s.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-0.5 bg-gray-700 text-white rounded"
                        onClick={() => {
                          try {
                            const raw = localStorage.getItem(`itt_map_data_${s.id}`);
                            if (raw) {
                              onJsonLoaded?.(JSON.parse(raw));
                              setIsMinimized(true);
                            }
                          } catch {
                            // Ignore localStorage errors
                          }
                        }}
                      >
                        Load
                      </button>
                      <button
                        className="px-2 py-0.5 bg-red-700 text-white rounded"
                        onClick={() => {
                          try {
                            localStorage.removeItem(`itt_map_data_${s.id}`);
                          } catch {
                            // Ignore localStorage errors
                          }
                          persistList(saved.filter((x) => x.id !== s.id));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
