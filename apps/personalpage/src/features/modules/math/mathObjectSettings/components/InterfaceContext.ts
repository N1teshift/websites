import { createContext } from "react";
import { InterfaceType } from "../../types/mathTypes";

/**
 * React Context for managing the interface type (simple/complex) for different math object settings.
 *
 * @property {Record<string, InterfaceType>} interfaceMap - A map where keys are identifiers for settings instances
 *                                                        (e.g., "index-objectType") and values are their
 *                                                        current interface type ("simple" or "complex").
 * @property {React.Dispatch<React.SetStateAction<Record<string, InterfaceType>>>} setInterfaceMap - Function to update the interface map.
 */
const InterfaceContext = createContext<{
    interfaceMap: Record<string, InterfaceType>;
    setInterfaceMap: React.Dispatch<React.SetStateAction<Record<string, InterfaceType>>>;
}>({
    interfaceMap: {},
    setInterfaceMap: () => { },
});

export default InterfaceContext;



