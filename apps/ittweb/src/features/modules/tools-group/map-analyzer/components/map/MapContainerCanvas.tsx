import React, { useEffect, useRef, useState, useCallback } from "react";
import type { BasicTile } from "../panels/TileInfoPanel";
import type { SimpleMapData, SimpleTile } from "../../types/map";

const BASE_TILE_SIZE = 16;

interface MapContainerCanvasProps {
  onHover: (tile: BasicTile | null) => void;
  onHoverInfo?: (info: { tile: BasicTile; x: number; y: number }) => void;
  onSelect: (tile: BasicTile | null) => void;
  map?: SimpleMapData | null;
  zoom?: number;
  viewportHeightPx?: number;
  onZoomChange?: (z: number) => void;
  initialScrollLeft?: number;
  initialScrollTop?: number;
  onScrollChange?: (pos: { left: number; top: number }) => void;
  renderMode?: "complete" | "elevation" | "cliffs";
  minHeight?: number;
  maxHeight?: number;
  selectedFlags?: number[];
  sliceMin?: number;
  sliceMax?: number;
  sliceEnabled?: boolean;
}

export default function MapContainerCanvas({
  onHover,
  onHoverInfo,
  onSelect,
  map,
  zoom = 1,
  viewportHeightPx = 480,
  onZoomChange,
  initialScrollLeft = 0,
  initialScrollTop = 0,
  onScrollChange,
  renderMode = "complete",
  minHeight,
  maxHeight,
  selectedFlags,
  sliceMin,
  sliceMax,
  sliceEnabled,
}: MapContainerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartMouseRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartScrollRef = useRef<{ left: number; top: number } | null>(null);
  const didDragRef = useRef(false);
  const dragPausedRef = useRef(false);
  const dragPauseTimerRef = useRef<number | null>(null);
  const zoomingRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const wheelRafRef = useRef<number | null>(null);
  const wheelTimerRef = useRef<number | null>(null);

  const [hoveredTileCoords, setHoveredTileCoords] = useState<{ x: number; y: number } | null>(null);
  const [scrollPos, setScrollPos] = useState({ left: initialScrollLeft, top: initialScrollTop });

  const width = map?.width ?? 32;
  const height = map?.height ?? 24;
  const tileSize = BASE_TILE_SIZE * zoom;
  const mapWidth = width * tileSize;
  const mapHeight = height * tileSize;

  // Color calculation functions
  const landColorFromHeight = useCallback((h: number, minH?: number, maxH?: number): string => {
    const minv = typeof minH === "number" ? minH : 0;
    const maxv = typeof maxH === "number" && maxH > minv ? maxH : minv + 1;
    let p = (h - minv) / (maxv - minv);
    p = Math.max(0, Math.min(1, p));
    const stops = [
      [60, 40, 20],
      [90, 70, 30],
      [120, 90, 40],
      [160, 120, 60],
      [220, 200, 120],
    ];
    const idx = Math.min(stops.length - 2, Math.floor(p * (stops.length - 1)));
    const frac = p * (stops.length - 1) - idx;
    const c0 = stops[idx];
    const c1 = stops[idx + 1];
    const r = Math.round(c0[0] + (c1[0] - c0[0]) * frac);
    const g = Math.round(c0[1] + (c1[1] - c0[1]) * frac);
    const b = Math.round(c0[2] + (c1[2] - c0[2]) * frac);
    return `rgb(${r},${g},${b})`;
  }, []);

  const cliffColorFromLevel = useCallback((level: number): string => {
    const palette: Record<number, [number, number, number]> = {
      [-1]: [180, 180, 180],
      0: [200, 200, 200],
      1: [180, 160, 120],
      2: [170, 140, 100],
      3: [160, 120, 80],
      4: [140, 100, 60],
      5: [120, 80, 40],
    } as Record<number, [number, number, number]>;
    const c = palette[level as keyof typeof palette] || [200, 200, 200];
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }, []);

  const getTileColor = useCallback(
    (tile: SimpleTile): string => {
      if (renderMode === "complete") {
        if (tile.isWater) {
          const depth =
            typeof tile.waterHeight === "number" ? tile.waterHeight - tile.groundHeight : 0;
          const d = Math.max(0, Math.min(255, Math.floor(depth)));
          return `rgb(${Math.max(0, 20 - d * 0.1)}, ${Math.max(0, 120 - d * 0.2)}, ${200 - d * 0.3})`;
        }
        return landColorFromHeight(tile.groundHeight, minHeight, maxHeight);
      } else if (renderMode === "elevation") {
        if (tile.isWater) {
          return "rgb(10,70,140)";
        }
        return landColorFromHeight(tile.groundHeight, minHeight, maxHeight);
      } else {
        if (tile.isWater) {
          return "rgb(10,70,140)";
        } else if (typeof tile.cliffLevel === "number") {
          return cliffColorFromLevel(tile.cliffLevel);
        }
        return landColorFromHeight(tile.groundHeight, minHeight, maxHeight);
      }
    },
    [renderMode, minHeight, maxHeight, landColorFromHeight, cliffColorFromLevel]
  );

  const flagColor = useCallback((flagId: number): string => {
    if (flagId === 0x20000000) return "rgb(0,120,220)";
    if (flagId === 0x00000002) return "rgb(180,80,200)";
    if (flagId === 0x00000004) return "rgb(220,150,40)";
    return "rgb(220,60,60)";
  }, []);

  // Optimized rendering function - only renders visible tiles
  const renderMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map || !containerRef.current) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const container = containerRef.current;
    const scrollLeft = scrollPos.left;
    const scrollTop = scrollPos.top;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    // Set canvas size to match viewport (with device pixel ratio for crisp rendering)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewportWidth * dpr;
    canvas.height = viewportHeight * dpr;
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    ctx.scale(dpr, dpr);

    // Calculate visible tile range with minimal padding
    const padding = 1;
    const startX = Math.max(0, Math.floor((scrollLeft - padding * tileSize) / tileSize));
    const endX = Math.min(
      width - 1,
      Math.ceil((scrollLeft + viewportWidth + padding * tileSize) / tileSize)
    );
    const startY = Math.max(0, Math.floor((scrollTop - padding * tileSize) / tileSize));
    const endY = Math.min(
      height - 1,
      Math.ceil((scrollTop + viewportHeight + padding * tileSize) / tileSize)
    );

    // Clear canvas
    ctx.fillStyle = "rgb(12,12,12)";
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Render only visible tiles
    const low = typeof sliceMin === "number" ? sliceMin : -Infinity;
    const high = typeof sliceMax === "number" ? sliceMax : Infinity;
    const minRange = sliceEnabled ? Math.min(low, high) : -Infinity;
    const maxRange = sliceEnabled ? Math.max(low, high) : Infinity;

    // Batch similar operations for better performance
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const index = y * width + x;
        const tile = map.tiles[index];
        if (!tile) continue;

        const tileX = x * tileSize - scrollLeft;
        const tileY = y * tileSize - scrollTop;

        // Skip if tile is outside viewport (with small margin)
        if (
          tileX + tileSize < -1 ||
          tileX > viewportWidth + 1 ||
          tileY + tileSize < -1 ||
          tileY > viewportHeight + 1
        ) {
          continue;
        }

        // Check slice visibility
        const isVisible =
          !sliceEnabled || (tile.groundHeight >= minRange && tile.groundHeight <= maxRange);

        // Draw base tile
        ctx.fillStyle = getTileColor(tile);
        ctx.globalAlpha = isVisible ? 1 : 0.5;
        ctx.fillRect(tileX, tileY, tileSize, tileSize);

        // Draw flag overlay if needed
        if (selectedFlags && selectedFlags.length > 0) {
          const matched = selectedFlags.find((f) => ((tile.flagsMask ?? 0) & f) !== 0);
          if (matched != null) {
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = flagColor(matched);
            ctx.fillRect(tileX, tileY, tileSize, tileSize);
          }
        }

        // Draw slice dimming
        if (!isVisible && sliceEnabled) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "rgba(0,0,0,1)";
          ctx.fillRect(tileX, tileY, tileSize, tileSize);
        }

        // Reset alpha
        ctx.globalAlpha = 1;

        // Draw grid if zoomed enough
        if (tileSize >= 8) {
          ctx.strokeStyle = "rgba(255,191,0,0.12)";
          ctx.lineWidth = 1 / dpr;
          ctx.beginPath();
          ctx.moveTo(tileX + tileSize + 0.5, tileY);
          ctx.lineTo(tileX + tileSize + 0.5, tileY + tileSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tileX, tileY + tileSize + 0.5);
          ctx.lineTo(tileX + tileSize, tileY + tileSize + 0.5);
          ctx.stroke();
        }
      }
    }

    // Draw hover highlight
    if (hoveredTileCoords) {
      const { x, y } = hoveredTileCoords;
      const hoverX = x * tileSize - scrollLeft;
      const hoverY = y * tileSize - scrollTop;
      if (
        hoverX >= -tileSize &&
        hoverX <= viewportWidth &&
        hoverY >= -tileSize &&
        hoverY <= viewportHeight
      ) {
        ctx.strokeStyle = "rgba(255,191,0,0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(hoverX, hoverY, tileSize, tileSize);
      }
    }
  }, [
    map,
    width,
    height,
    tileSize,
    scrollPos,
    renderMode,
    minHeight,
    maxHeight,
    selectedFlags,
    sliceMin,
    sliceMax,
    sliceEnabled,
    hoveredTileCoords,
    getTileColor,
    flagColor,
  ]);

  // Render using requestAnimationFrame for smooth updates
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const render = () => {
      renderMap();
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderMap]);

  // Apply initial scroll
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = initialScrollLeft;
        containerRef.current.scrollTop = initialScrollTop;
        setScrollPos({ left: initialScrollLeft, top: initialScrollTop });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [initialScrollLeft, initialScrollTop]);

  // Enforce scroll bounds when zoom or map size changes
  useEffect(() => {
    if (!containerRef.current || !map) return;
    const viewportWidth = containerRef.current.clientWidth;
    const viewportHeight = containerRef.current.clientHeight;
    const currentTileSize = BASE_TILE_SIZE * zoom;
    const currentMapWidth = width * currentTileSize;
    const currentMapHeight = height * currentTileSize;
    const maxScrollLeft = Math.max(0, currentMapWidth - viewportWidth);
    const maxScrollTop = Math.max(0, currentMapHeight - viewportHeight);

    // Ensure the container's scroll dimensions match the map exactly
    // This prevents "detachment" from container borders
    if (spacerRef.current) {
      spacerRef.current.style.width = `${currentMapWidth}px`;
      spacerRef.current.style.height = `${currentMapHeight}px`;
    }

    const currentScrollLeft = containerRef.current.scrollLeft;
    const currentScrollTop = containerRef.current.scrollTop;

    const clampedLeft = Math.max(0, Math.min(maxScrollLeft, currentScrollLeft));
    const clampedTop = Math.max(0, Math.min(maxScrollTop, currentScrollTop));

    if (clampedLeft !== currentScrollLeft || clampedTop !== currentScrollTop) {
      containerRef.current.scrollLeft = clampedLeft;
      containerRef.current.scrollTop = clampedTop;
      setScrollPos({ left: clampedLeft, top: clampedTop });
    }
  }, [zoom, width, height, map]);

  // Scroll handler with throttling
  const scrollTimeoutRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    // Ignore scroll events during drag - we handle scroll updates manually in handlePointerMove
    if (isDraggingRef.current) return;
    if (!containerRef.current || !map) return;
    const viewportWidth = containerRef.current.clientWidth;
    const viewportHeight = containerRef.current.clientHeight;
    const currentTileSize = BASE_TILE_SIZE * zoom;
    const currentMapWidth = width * currentTileSize;
    const currentMapHeight = height * currentTileSize;
    const maxScrollLeft = Math.max(0, currentMapWidth - viewportWidth);
    const maxScrollTop = Math.max(0, currentMapHeight - viewportHeight);

    let scrollLeft = containerRef.current.scrollLeft;
    let scrollTop = containerRef.current.scrollTop;

    // Clamp scroll position to valid bounds
    scrollLeft = Math.max(0, Math.min(maxScrollLeft, scrollLeft));
    scrollTop = Math.max(0, Math.min(maxScrollTop, scrollTop));

    // Correct if browser allowed scrolling beyond bounds
    if (
      scrollLeft !== containerRef.current.scrollLeft ||
      scrollTop !== containerRef.current.scrollTop
    ) {
      containerRef.current.scrollLeft = scrollLeft;
      containerRef.current.scrollTop = scrollTop;
    }

    const newPos = { left: scrollLeft, top: scrollTop };
    setScrollPos(newPos);

    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      onScrollChange?.(newPos);
    });
  }, [onScrollChange, map, width, height, zoom]);

  // Get tile from mouse event - canvas is viewport-sized, coordinates are relative to scroll
  const getTileFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): BasicTile | null => {
      if (!map || !containerRef.current) return null;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Add scroll offset to get world coordinates
      const x = Math.floor((scrollPos.left + px) / tileSize);
      const y = Math.floor((scrollPos.top + py) / tileSize);
      if (x < 0 || y < 0 || x >= width || y >= height) return null;
      return { x, y };
    },
    [map, width, height, tileSize, scrollPos]
  );

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
    if (containerRef.current) {
      dragStartScrollRef.current = {
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop,
      };
    }
    try {
      if (e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    e.preventDefault();
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (
        isDraggingRef.current &&
        dragStartMouseRef.current &&
        dragStartScrollRef.current &&
        containerRef.current &&
        map
      ) {
        const dx = e.clientX - dragStartMouseRef.current.x;
        const dy = e.clientY - dragStartMouseRef.current.y;
        if (!didDragRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
          didDragRef.current = true;
        }
        const viewportWidth = containerRef.current.clientWidth;
        const viewportHeight = containerRef.current.clientHeight;
        const currentTileSize = BASE_TILE_SIZE * zoom;
        const currentMapWidth = width * currentTileSize;
        const currentMapHeight = height * currentTileSize;
        const maxScrollLeft = Math.max(0, currentMapWidth - viewportWidth);
        const maxScrollTop = Math.max(0, currentMapHeight - viewportHeight);
        let newScrollLeft = Math.max(
          0,
          Math.min(maxScrollLeft, dragStartScrollRef.current.left - dx)
        );
        let newScrollTop = Math.max(0, Math.min(maxScrollTop, dragStartScrollRef.current.top - dy));

        // Ensure we don't exceed the actual scrollable area
        // Clamp to prevent any "detachment" from container borders
        newScrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft));
        newScrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop));

        // Update scroll position immediately for responsive dragging
        containerRef.current.scrollLeft = newScrollLeft;
        containerRef.current.scrollTop = newScrollTop;

        const newPos = { left: newScrollLeft, top: newScrollTop };
        // Update scrollPos state immediately so rendering uses correct position
        // This must be synchronous to prevent "double drag" feeling
        setScrollPos(newPos);

        // Notify parent component of scroll change (throttled)
        if (scrollTimeoutRef.current) {
          cancelAnimationFrame(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = requestAnimationFrame(() => {
          onScrollChange?.(newPos);
        });

        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling and causing conflicts
      }
    },
    [map, width, height, zoom, onScrollChange]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false;
    dragStartMouseRef.current = null;
    dragStartScrollRef.current = null;
    try {
      if (e.currentTarget.releasePointerCapture) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    dragPausedRef.current = true;
    if (dragPauseTimerRef.current) {
      window.clearTimeout(dragPauseTimerRef.current);
      dragPauseTimerRef.current = null;
    }
    dragPauseTimerRef.current = window.setTimeout(() => {
      dragPausedRef.current = false;
    }, 80);
  }, []);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!onZoomChange || !containerRef.current) return;
      e.preventDefault();
      zoomingRef.current = true;
      wheelAccumRef.current += e.deltaY;
      if (wheelRafRef.current == null) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const contentX = scrollPos.left + mouseX;
        const contentY = scrollPos.top + mouseY;
        const oldScale = BASE_TILE_SIZE * zoom;
        const tileX = contentX / oldScale;
        const tileY = contentY / oldScale;
        wheelRafRef.current = requestAnimationFrame(() => {
          wheelRafRef.current = null;
          const dy = wheelAccumRef.current;
          wheelAccumRef.current = 0;
          const factor = Math.exp(-dy * 0.001);
          const nextZoom = Math.max(0.1, Math.min(4, +(zoom * factor).toFixed(3)));
          const newScale = BASE_TILE_SIZE * nextZoom;
          const newContentX = tileX * newScale;
          const newContentY = tileY * newScale;
          const nextScrollLeft = newContentX - mouseX;
          const nextScrollTop = newContentY - mouseY;
          onZoomChange(nextZoom);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!containerRef.current) return;
              containerRef.current.scrollLeft = nextScrollLeft;
              containerRef.current.scrollTop = nextScrollTop;
              if (wheelTimerRef.current) {
                window.clearTimeout(wheelTimerRef.current);
                wheelTimerRef.current = null;
              }
              wheelTimerRef.current = window.setTimeout(() => {
                zoomingRef.current = false;
              }, 100);
            });
          });
        });
      }
    },
    [onZoomChange, zoom, scrollPos]
  );

  if (!map) {
    return (
      <>
        <style>{`
          .map-container-hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div
          ref={containerRef}
          className="map-container-hide-scrollbar relative w-full overflow-auto border border-amber-500/30 rounded"
          style={{
            height: viewportHeightPx,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex items-center justify-center h-full text-gray-400">No map loaded</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .map-container-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={containerRef}
        className={`map-container-hide-scrollbar relative w-full overflow-auto border border-amber-500/30 rounded select-none ${
          isDraggingRef.current ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          height: viewportHeightPx,
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          isDraggingRef.current = false;
          dragStartMouseRef.current = null;
          dragStartScrollRef.current = null;
          onHover(null);
          setHoveredTileCoords(null);
        }}
        onContextMenu={(e) => {
          if (isDraggingRef.current) e.preventDefault();
        }}
        onScroll={handleScroll}
        onWheel={handleWheel}
      >
        {/* Canvas positioned to match scroll - only renders viewport */}
        {/* Canvas is absolutely positioned to stay fixed at viewport, rendering accounts for scroll */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: isDraggingRef.current ? "none" : "auto",
            zIndex: 1,
          }}
          onMouseMove={(e) => {
            if (!isDraggingRef.current && !zoomingRef.current && !dragPausedRef.current) {
              const tile = getTileFromEvent(e);
              onHover(tile);
              if (onHoverInfo && tile) {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                  onHoverInfo({
                    tile,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }
              setHoveredTileCoords(tile);
            }
          }}
          onMouseLeave={() => {
            if (!isDraggingRef.current && !zoomingRef.current) {
              onHover(null);
              setHoveredTileCoords(null);
            }
          }}
          onClick={(e) => {
            if (didDragRef.current) {
              didDragRef.current = false;
              return;
            }
            const tile = getTileFromEvent(e);
            onSelect(tile);
          }}
        />
        {/* Spacer div to enable scrolling to full map size - ensures scrollable area matches map dimensions exactly */}
        {/* This div creates the scrollable content area - must be exactly mapWidth x mapHeight */}
        <div
          ref={spacerRef}
          style={{
            width: mapWidth,
            height: mapHeight,
            display: "block",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}
