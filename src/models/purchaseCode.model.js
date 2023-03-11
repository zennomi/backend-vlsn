const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const Schema = mongoose.Schema;

const purchaseCodeSchema = new Schema(
    {
        _id: String,
        user: {
            type: String,
            ref: 'FirebaseUser',
            required: true,
        },
        courses: [{
            type: mongoose.Types.ObjectId,
            ref: 'Course',
        }],
    },
    {
        timestamps: true,
        toObject: { getters: true, setters: true, virtual: true },
        toJSON: { getters: true, setters: true, virtual: true },
    }
);

purchaseCodeSchema.plugin(paginate);
purchaseCodeSchema.plugin(toJSON);

module.exports = mongoose.model("PurchaseCode", purchaseCodeSchema);
