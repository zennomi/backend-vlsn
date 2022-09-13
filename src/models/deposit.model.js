const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { decode } = require("html-entities");

const Schema = mongoose.Schema;

const depositSchema = new Schema(
    {
        amount: {
            type: Number,
            required: true,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        method: {
            type: String,
            enum: ['MB_BANK', 'MOMO'],
            required: true,
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        verifiedUser: {
            type: mongoose.Types.ObjectId,
        },
        verifiedAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        toObject: { getters: true, setters: true, virtual: true },
        toJSON: { getters: true, setters: true, virtual: true },
    }
);

depositSchema.plugin(paginate);
depositSchema.plugin(toJSON);

module.exports = mongoose.model("Deposit", depositSchema);
