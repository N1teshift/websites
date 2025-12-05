import { useContext } from "react";
import InterfaceContext from "../components/InterfaceContext";
import { InterfaceType } from "../../types/mathTypes";

/**
 * Custom hook to access and manage the interface type ("simple" or "complex")
 * for a specific settings container, using the `InterfaceContext`.
 *
 * @param {string} containerId - A unique identifier for the settings container
 *                                (e.g., "index-objectType" or "index-objectType-subIndex-subType").
 * @returns {{ interfaceType: InterfaceType; setInterfaceType: (type: InterfaceType) => void; }}
 *          An object containing:
 *          - `interfaceType`: The determined interface type for the container.
 *                             Looks for an exact `containerId` match in the context map,
 *                             then checks if any key in the map is a prefix (parent container),
 *                             and defaults to "simple" otherwise.
 *          - `setInterfaceType`: A function to update the interface type for this specific
 *                                `containerId` in the context.
 */
const useInterfaceType = (containerId: string) => {
    const { interfaceMap, setInterfaceMap } = useContext(InterfaceContext);

    const getInterfaceType = (): InterfaceType => {
        // Try exact match first
        if (containerId in interfaceMap) {
            return interfaceMap[containerId];
        }

        // Try to find a parent key
        const parentKey = Object.keys(interfaceMap).find(key => containerId.startsWith(key));
        if (parentKey) {
            return interfaceMap[parentKey];
        }

        return "simple";
    };

    const setInterfaceTypeFor = (type: InterfaceType) => {
        setInterfaceMap((prev) => ({ ...prev, [containerId]: type }));
    };

    return { interfaceType: getInterfaceType(), setInterfaceType: setInterfaceTypeFor };
};

export default useInterfaceType;



