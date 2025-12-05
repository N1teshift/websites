import { useEffect } from "react";

/**
 * Utility function to synchronize the length of an array (`currentItems`)
 * to match a `targetCount`.
 *
 * @template T - The type of items in the array.
 * @param {T[]} currentItems - The current array of items.
 * @param {number} targetCount - The desired number of items in the array.
 * @param {T} defaultItem - The default item to use when adding new elements.
 * @param {(items: T[], interfaceType: "simple" | "complex") => T} [getNewItem] - Optional function to generate a new item.
 * @param {"simple" | "complex"} [interfaceType="complex"] - The interface mode, affecting how new items are added.
 * @returns {T[]} A new array with the length matching `targetCount`.
 * @remarks
 * - If the array is shorter than `targetCount`, items are added:
 *   - Using `getNewItem` if provided.
 *   - By copying the first item if `interfaceType` is "simple" and the array is not empty.
 *   - By copying `defaultItem` otherwise.
 * - If the array is longer than `targetCount`, items are removed from the end.
 * - Returns a new array instance.
 * @private
 */
function synchronizeCollection<T>(
  currentItems: T[],
  targetCount: number,
  defaultItem: T,
  getNewItem?: (items: T[], interfaceType: "simple" | "complex") => T,
  interfaceType: "simple" | "complex" = "complex"
): T[] {
  // Create a new array to avoid mutation
  const result = [...currentItems];
  
  // Add items if needed
  while (result.length < targetCount) {
    if (getNewItem) {
      result.push(getNewItem(result, interfaceType));
    } else if (interfaceType === "simple" && result.length > 0) {
      // In simple mode, copy the first item when available
      const firstItem = result[0] || defaultItem;
      result.push({ ...firstItem });
    } else {
      // Otherwise use the default item
      result.push({ ...defaultItem });
    }
  }
  
  // Remove items if needed
  while (result.length > targetCount) {
    result.pop();
  }
  
  return result;
}

/**
 * Custom hook to synchronize the length of an array property within a settings object
 * with a corresponding count property in the same object.
 *
 * @template T - The type of items in the collection array.
 * @template S - The type of the settings object (must be a Record).
 * @param {S} settings - The current settings object.
 * @param {(newSettings: S) => void} updateSettings - Callback function to update the settings object.
 * @param {keyof S} countProperty - The key in `settings` that holds the target count.
 * @param {keyof S} itemsProperty - The key in `settings` that holds the array to be synchronized.
 * @param {T} defaultItem - The default item to use when adding elements to the array.
 * @param {"simple" | "complex"} [interfaceType="complex"] - The interface mode, affecting synchronization logic.
 * @param {(newCount: number, items: T[]) => Partial<S>} [onCountChange] - Optional callback executed when the count changes,
 *                                                                      allowing for additional settings updates.
 * @returns {{ handleCountChange: (newCount: number) => void }} An object containing a handler function `handleCountChange`
 *          to manually trigger an update of the count and the synchronized array.
 * @remarks
 * - Uses an effect (`useEffect`) to automatically synchronize the array length if the `count` or `items` properties
 *   change externally.
 * - `handleCountChange` updates both the count property and the items array property, calling `synchronizeCollection`.
 * - Both the effect and `handleCountChange` will incorporate any additional updates returned by the optional `onCountChange` callback.
 */
function useCollectionCountSync<T, S extends Record<string, unknown>>(
  settings: S,
  updateSettings: (newSettings: S) => void,
  countProperty: keyof S,
  itemsProperty: keyof S,
  defaultItem: T,
  interfaceType: "simple" | "complex" = "complex",
  onCountChange?: (newCount: number, items: T[]) => Partial<S>
) {
  // Ensure type safety
  const items = settings[itemsProperty] as unknown as T[];
  const count = settings[countProperty] as unknown as number;
  
  // Effect to sync array when count changes
  useEffect(() => {
    const currentItems = items;
    
    if (currentItems.length !== count) {
      const updatedItems = synchronizeCollection(
        currentItems,
        count,
        defaultItem,
        undefined,
        interfaceType
      );
      
      // Only update if there was a change
      if (JSON.stringify(updatedItems) !== JSON.stringify(currentItems)) {
        const updates: Partial<S> = {
          [itemsProperty]: updatedItems
        } as unknown as Partial<S>;
        
        // Apply any additional updates from the callback
        if (onCountChange) {
          const additionalUpdates = onCountChange(count, updatedItems);
          Object.assign(updates, additionalUpdates);
        }
        
        updateSettings({
          ...settings,
          ...updates
        });
      }
    }
  }, [settings, itemsProperty, countProperty, defaultItem, interfaceType, onCountChange, updateSettings, count, items]);
  
  /**
   * Handle count change with optional additional logic
   */
  const handleCountChange = (newCount: number) => {
    const updatedItems = synchronizeCollection(
      items,
      newCount,
      defaultItem,
      undefined,
      interfaceType
    );
    
    const updates: Partial<S> = {
      [countProperty]: newCount,
      [itemsProperty]: updatedItems
    } as unknown as Partial<S>;
    
    // Apply any additional updates from the callback
    if (onCountChange) {
      const additionalUpdates = onCountChange(newCount, updatedItems);
      Object.assign(updates, additionalUpdates);
    }
    
    updateSettings({
      ...settings,
      ...updates
    });
  };
  
  return { handleCountChange };
} 

export default useCollectionCountSync;



