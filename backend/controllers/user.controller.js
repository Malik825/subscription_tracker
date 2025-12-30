import User from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, message: 'Users retrieved successfully', data: users });

    } catch (error) {
        next(error);

    }
}
export const getUser = async (req, res, next) => {
    try {
        const users = await User.findById(req.params.id).select('-password');
        if (!users) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ success: true, message: 'User retrieved successfully', data: users });

    } catch (error) {
        next(error);

    }
}

export const upgradeToPro = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { plan: 'pro' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Successfully upgraded to Pro!',
            data: user
        });
    } catch (error) {
        next(error);
    }
}