# Tools Group Module

**Purpose**: Developer and analysis tools for maps and game data.

## Sub-modules

### map-analyzer/

Map terrain analysis and visualization tools.

**Exports**:

- Components for map visualization, terrain legends, and analysis
- Hooks: `useMapPersistence`, `useMapUIState`
- Utilities for map data processing
- Types for map data structures

### tools/

Development and simulation tools.

**Exports**:

- Components for inventory simulation and duel simulator
- Utilities for tool data processing
- Types for tool data structures

## Usage

```typescript
import { MapContainer, TerrainVisualizer } from "@/features/modules/tools-group/map-analyzer";
```

## Related Documentation

- [Map Analyzer Sub-module](./map-analyzer/README.md)
- [Tools Sub-module](./tools/README.md)
