import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const getMe = async (req, res, next) => {
    try{
        res.status(200).json({
            success: true,
            data: req.user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (req, res, next) => {
    try{
        const { name, email, password } = req.body;

        if(name !== undefined) req.user.name = name;
        if(email !== undefined) req.user.email = email;
        if(password !== undefined) {
            if(password.length < 8){
                const error = new Error('Password must be at least 8 characters long');
                error.statusCode = 400;
                throw error;
            }
            const salt = await bcrypt.genSalt(10);
            req.user.password = await bcrypt.hash(password, salt);
        }

        await req.user.save();

        res.status(200).json({
            success: true,
            data: await User.findById(req.user._id).select('-password'),
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMe = async (req, res, next) => {
    try{
        await req.user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
