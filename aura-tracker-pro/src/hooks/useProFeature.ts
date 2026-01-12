import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

/**
 * Custom hook to check Pro plan access and trigger upgrade modal
 * Centralizes Pro feature gating logic across the application
 */
export const useProFeature = () => {
    const { user } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isPro = user?.plan === "pro";

    /**
     * Check if user has Pro access. If not, show upgrade modal.
     * @returns true if user has Pro access, false otherwise
     */
    const requirePro = useCallback((): boolean => {
        if (!isPro) {
            setShowUpgradeModal(true);
            return false;
        }
        return true;
    }, [isPro]);

    /**
     * Close the upgrade modal
     */
    const closeUpgradeModal = useCallback(() => {
        setShowUpgradeModal(false);
    }, []);

    return {
        isPro,
        showUpgradeModal,
        requirePro,
        closeUpgradeModal,
        user,
    };
};
