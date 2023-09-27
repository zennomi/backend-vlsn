require("dotenv").config();

const User = require("../models/user.model");
const mongoose = require("../configs/mongoose");

(async function () {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const result = await User.aggregate([
            {
                '$addFields': {
                    'lastLogin': {
                        '$toLong': '$lastLoginAt'
                    }
                }
            },
            {
                $match: {
                    "providerData.providerId": "facebook.com",
                    "lastLogin": { "$gte": (new Date(new Date() - 90 * 60 * 60 * 24 * 1000)).valueOf() }
                }
            }, {
                $group: {
                    _id: "$displayName",
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: 2 }
            }
        ])
        console.log(result)
        await mongoose.disconnect();
    } catch (error) {
        console.log(error)
    }
})()