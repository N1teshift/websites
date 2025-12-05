import { apiRequest } from "@websites/infrastructure/api";

export const resetTestStats = async (refreshStats: () => void) => {
    try {
        await apiRequest<void>('/api/firestore/clearTestDatabase', 'POST');
        alert("Test statistics have been reset successfully.");
        refreshStats();
    } catch (error) {
        alert("Error resetting statistics: " + (error as Error).message);
    }
}; 



