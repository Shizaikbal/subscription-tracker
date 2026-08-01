import mongoose from'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Subscription Name is required'],
        trim: true,
        minLength: [3, 'Subscription Name must be atleast 3 characters long'],
        maxLength: [50, 'Subscription Name must be less than 50 characters long']
    },
    price:{
        type: Number,
        required: [true, 'SUbscription Price is required'],
        min: [0, 'Subscription Price must be greater than 0']
    },
    currency:{
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP', 'SAR'],
        default: 'INR'
    },
    frequency:{
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    category:{
        type: String,
        enum: ['entertainment', 'productivity', 'education', 'health', 'other'],
        required: true
    },
    paymentMethod:{
        type: String,
        required: true,
        trim: true
    },
    status:{
        type: String,
        enum: ['active', 'paused', 'cancelled', 'expired'],
        default: 'active'
    },
    startDate:{
        type: Date,
        required: [true, 'Subscription Start Date is required'],
        validate: {
            validator: (value) => value <= new Date(),
            message: 'Subscription Start Date cannot be in the future',
        }
    },
    renewalDate:{
        type: Date,
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: 'Subscription Renewal Date must be after the Start Date',
        }
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Subscription must be associated with a User'],
        index: true
    }
}, {timestamps: true});

//autocalculate renewalDate

subscriptionSchema.pre('save', function(next) {
    if(!this.renewalDate){
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    if(this.renewalDate < new Date()){
        this.status = 'expired';
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;