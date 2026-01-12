
export const requirePro = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    // Check if user has Pro plan
    if (req.user.plan !== "pro") {
        return res.status(403).json({
            success: false,
            message: "This feature requires a Pro subscription. Please upgrade to access this feature.",
            upgradeRequired: true,
        });
    }

    // User has Pro access, proceed
    next();
};

export default requirePro;