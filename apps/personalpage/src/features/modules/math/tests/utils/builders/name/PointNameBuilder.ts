import { PointSettings } from '../../../../types/mathObjectSettingsInterfaces';
import { NameBuilder } from './NameBuilder';

/**
 * Builds descriptive names for point test cases
 */
export class PointNameBuilder extends NameBuilder<PointSettings> {
    /**
     * Builds a descriptive name for a point test case
     * @param settings The point settings to use for name generation
     * @returns A string name suitable for display in test listings
     */
    build(settings: Partial<PointSettings>): string {
        const { name, coefficients } = settings;
        
        let baseName = 'Point';
        
        // Add the point name if available
        if (name) {
            baseName = `Point ${name}`;
        }
        
        // Add dimension information based on coefficients
        if (coefficients) {
            const { collectionCount } = coefficients;
            
            if (collectionCount) {
                if (collectionCount === 2) {
                    baseName += ' (2D)';
                } else if (collectionCount === 3) {
                    baseName += ' (3D)';
                } else {
                    baseName += ` (${collectionCount}D)`;
                }
            }
        }
        
        return baseName;
    }
} 



