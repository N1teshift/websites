/**
 * ITT Metadata Extraction and Parsing
 * Handles extraction of ITT metadata from W3MMD actions and parsing player stats
 */

/**
 * Extract ITT metadata from W3MMD actions
 */
export function extractITTMetadata(w3mmdActions) {
    const customData = new Map();

    for (const action of w3mmdActions) {
        const key = action?.cache?.key;
        if (!key || typeof key !== 'string') continue;

        if (key.startsWith('custom itt_')) {
            const content = key.slice('custom '.length);
            const firstSpace = content.indexOf(' ');
            if (firstSpace !== -1) {
                const identifier = content.substring(0, firstSpace);
                const data = content.substring(firstSpace + 1);
                customData.set(identifier, data);
            }
        }
    }

    const chunksCountStr = customData.get('itt_chunks');
    if (!chunksCountStr) {
        return undefined;
    }

    const numChunks = parseInt(chunksCountStr, 10);
    if (isNaN(numChunks) || numChunks <= 0) {
        return undefined;
    }

    const chunks = [];
    for (let i = 0; i < numChunks; i++) {
        const chunk = customData.get(`itt_data_${i}`);
        if (chunk !== undefined) {
            chunks.push(chunk);
        }
    }

    const payload = chunks.join('').replace(/\\(.)/g, '$1');
    const schemaVersion = customData.get('itt_schema') ? parseInt(customData.get('itt_schema'), 10) : undefined;

    const { players, buildingEvents, craftEvents } = parseITTPayload(payload, schemaVersion);

    return {
        version: customData.get('itt_version'),
        schema: schemaVersion,
        payload,
        players,
        buildingEvents,
        craftEvents,
        chunks
    };
}

/**
 * Parse item string with optional charges (format: "itemId:charges" or "itemId")
 * Returns { itemId, charges }
 */
function parseItemWithCharges(itemStr) {
    const colonIndex = itemStr.indexOf(':');
    if (colonIndex !== -1) {
        const itemId = parseInt(itemStr.substring(0, colonIndex), 10) || 0;
        const charges = parseInt(itemStr.substring(colonIndex + 1), 10) || 0;
        return { itemId, charges };
    }
    const itemId = parseInt(itemStr, 10) || 0;
    return { itemId, charges: itemId === 0 ? 0 : 1 }; // Default to 1 charge if item exists, 0 if empty slot
}

/**
 * Parse ITT payload into player stats, building events, and craft events
 * Supports schema v2, v3, v4, v5, v6, v7, and v8 formats
 * Format: slot|name|race|class|team|result|dmg|selfHeal|allyHeal|gold|meat|elk|hawk|snake|wolf|bear|panther|items
 * Building events (v7+): build:<team>|<timeSeconds>|<unitTypeId>|<status>
 * Craft events (v8+): craft:<team>|<timeSeconds>|<itemId>|<status>
 */
function parseITTPayload(payload, schemaVersion) {
    const players = [];
    const buildingEvents = [];
    const craftEvents = [];
    const lines = payload.split('\n');

    for (const line of lines) {
        if (!line.startsWith('player:')) continue;

        try {
            const parts = line.slice('player:'.length).split('|');

            // Schema v6 format (18+ parts)
            // Items format: "itemId:charges" for stacked items, "itemId" for non-stacked or empty
            if (parts.length >= 18 && schemaVersion && schemaVersion >= 6) {
                const itemsStr = parts[17];
                const items = [];
                const itemCharges = [];
                
                if (itemsStr) {
                    const itemParts = itemsStr.split(',');
                    for (const itemPart of itemParts) {
                        const { itemId, charges } = parseItemWithCharges(itemPart);
                        items.push(itemId);
                        itemCharges.push(charges);
                    }
                }
                
                const result = parts[5] || ''; // WIN, LOSS, LEAVE, etc.

                players.push({
                    slotIndex: parseInt(parts[0], 10) || 0,
                    name: parts[1] || '',
                    trollClass: parts[3] || undefined,
                    team: parseInt(parts[4], 10) || 0,
                    result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
                    damageTroll: parseInt(parts[6], 10) || 0,
                    selfHealing: parseInt(parts[7], 10) || 0,
                    allyHealing: parseInt(parts[8], 10) || 0,
                    goldAcquired: parseInt(parts[9], 10) || 0,
                    meatEaten: parseInt(parts[10], 10) || 0,
                    killsElk: parseInt(parts[11], 10) || 0,
                    killsHawk: parseInt(parts[12], 10) || 0,
                    killsSnake: parseInt(parts[13], 10) || 0,
                    killsWolf: parseInt(parts[14], 10) || 0,
                    killsBear: parseInt(parts[15], 10) || 0,
                    killsPanther: parseInt(parts[16], 10) || 0,
                    items,
                    // Always include itemCharges if items exist (parallel array, needed to match indices)
                    itemCharges: items.length > 0 ? itemCharges : undefined,
                });
            }
            // Schema v4/v5 format (18+ parts)
            // Items are typically just comma-separated item IDs, but may include charges (format: "itemId:charges") for newer builds
            else if (parts.length >= 18 && schemaVersion && schemaVersion >= 4) {
                const itemsStr = parts[17];
                const items = [];
                const itemCharges = [];
                
                if (itemsStr) {
                    const itemParts = itemsStr.split(',');
                    for (const itemPart of itemParts) {
                        const { itemId, charges } = parseItemWithCharges(itemPart);
                        items.push(itemId);
                        itemCharges.push(charges);
                    }
                }
                
                const result = parts[5] || ''; // WIN, LOSS, LEAVE, etc.

                players.push({
                    slotIndex: parseInt(parts[0], 10) || 0,
                    name: parts[1] || '',
                    trollClass: parts[3] || undefined,
                    team: parseInt(parts[4], 10) || 0,
                    result: result.toUpperCase(), // WIN, LOSS, LEAVE, etc.
                    damageTroll: parseInt(parts[6], 10) || 0,
                    selfHealing: parseInt(parts[7], 10) || 0,
                    allyHealing: parseInt(parts[8], 10) || 0,
                    goldAcquired: parseInt(parts[9], 10) || 0,
                    meatEaten: parseInt(parts[10], 10) || 0,
                    killsElk: parseInt(parts[11], 10) || 0,
                    killsHawk: parseInt(parts[12], 10) || 0,
                    killsSnake: parseInt(parts[13], 10) || 0,
                    killsWolf: parseInt(parts[14], 10) || 0,
                    killsBear: parseInt(parts[15], 10) || 0,
                    killsPanther: parseInt(parts[16], 10) || 0,
                    items,
                    // Always include itemCharges if items exist (parallel array, needed to match indices)
                    itemCharges: items.length > 0 ? itemCharges : undefined,
                });
            }
        } catch (error) {
            // Skip RangeError when accessing parts array (malformed player data)
            if (error.code === 'ERR_OUT_OF_RANGE' || error.name === 'RangeError') {
                continue;
            }
            throw error;
        }
    }

    // Parse building events (schema version 7+)
    if (schemaVersion && schemaVersion >= 7) {
        for (const line of lines) {
            if (!line.startsWith('build:')) continue;

            try {
                const parts = line.slice('build:'.length).split('|');
                if (parts.length !== 4) continue;

                const team = parseInt(parts[0], 10);
                const timeSeconds = parseInt(parts[1], 10);
                const buildingId = parseInt(parts[2], 10);
                const status = parts[3] || '';

                if (isNaN(team) || isNaN(timeSeconds) || isNaN(buildingId) || !status) {
                    continue; // Skip invalid entries
                }

                buildingEvents.push({
                    team,
                    timeSeconds,
                    buildingId,
                    status: status.toUpperCase(), // Normalize to uppercase
                });
            } catch (error) {
                // Skip malformed building event data
                continue;
            }
        }
    }

    // Parse craft events (schema version 8+)
    if (schemaVersion && schemaVersion >= 8) {
        for (const line of lines) {
            if (!line.startsWith('craft:')) continue;

            try {
                const parts = line.slice('craft:'.length).split('|');
                if (parts.length !== 4) continue;

                const team = parseInt(parts[0], 10);
                const timeSeconds = parseInt(parts[1], 10);
                const itemId = parseInt(parts[2], 10);
                const status = parts[3] || '';

                if (isNaN(team) || isNaN(timeSeconds) || isNaN(itemId) || !status) {
                    continue; // Skip invalid entries
                }

                craftEvents.push({
                    team,
                    timeSeconds,
                    itemId,
                    status: status.toUpperCase(), // Normalize to uppercase
                });
            } catch (error) {
                // Skip malformed craft event data
                continue;
            }
        }
    }

    return {
        players,
        buildingEvents: buildingEvents.length > 0 ? buildingEvents : undefined,
        craftEvents: craftEvents.length > 0 ? craftEvents : undefined,
    };
}

/**
 * Extract player position data from W3MMD actions
 * Position data is stored in keys like: itt_pos_p<slot>_<chunkIndex> and itt_pos_p<slot>_chunks
 * Format: time|x|y,time|x|y,...
 */
export function extractPositionData(w3mmdActions) {
    const customData = new Map();

    // Extract all position-related custom messages
    for (const action of w3mmdActions) {
        const key = action?.cache?.key;
        if (!key || typeof key !== 'string') continue;

        if (key.startsWith('custom itt_pos_')) {
            const content = key.slice('custom '.length);
            const firstSpace = content.indexOf(' ');
            if (firstSpace !== -1) {
                const identifier = content.substring(0, firstSpace);
                const data = content.substring(firstSpace + 1);
                customData.set(identifier, data);
            }
        }
    }

    // Find all unique player slots that have position data
    const playerSlots = new Set();
    for (const key of customData.keys()) {
        // Keys are like: itt_pos_p0_0, itt_pos_p0_1, itt_pos_p0_chunks, itt_pos_p1_0, etc.
        const match = key.match(/^itt_pos_p(\d+)_/);
        if (match) {
            playerSlots.add(parseInt(match[1], 10));
        }
    }

    if (playerSlots.size === 0) {
        return undefined;
    }

    // Reconstruct position data for each player
    const positionData = {};
    
    for (const slot of playerSlots) {
        // Get chunk count for this player
        const chunksCountStr = customData.get(`itt_pos_p${slot}_chunks`);
        if (!chunksCountStr) {
            continue; // Skip if no chunk count
        }

        const numChunks = parseInt(chunksCountStr, 10);
        if (isNaN(numChunks) || numChunks <= 0) {
            continue;
        }

        // Reconstruct position string from chunks
        const chunks = [];
        for (let i = 0; i < numChunks; i++) {
            const chunk = customData.get(`itt_pos_p${slot}_${i}`);
            if (chunk !== undefined) {
                chunks.push(chunk);
            }
        }

        if (chunks.length === 0) {
            continue;
        }

        // Join chunks and unescape (MMD escapes spaces)
        const positionString = chunks.join('').replace(/\\(.)/g, '$1');
        
        // Parse position entries: "time|x|y,time|x|y,..."
        const positions = parsePositionString(positionString);
        
        if (positions.length > 0) {
            positionData[slot] = positions;
        }
    }

    return Object.keys(positionData).length > 0 ? positionData : undefined;
}

/**
 * Parse position string into array of position objects
 * Format: "time|x|y,time|x|y,..."
 */
function parsePositionString(positionString) {
    const positions = [];
    
    if (!positionString || positionString.length === 0) {
        return positions;
    }

    const entries = positionString.split(',');
    
    for (const entry of entries) {
        if (!entry || entry.trim().length === 0) {
            continue;
        }

        const parts = entry.split('|');
        if (parts.length !== 3) {
            continue; // Skip malformed entries
        }

        const timeSeconds = parseInt(parts[0], 10);
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);

        if (isNaN(timeSeconds) || isNaN(x) || isNaN(y)) {
            continue; // Skip invalid entries
        }

        positions.push({
            timeSeconds,
            x,
            y,
        });
    }

    return positions;
}