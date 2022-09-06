const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { decode } = require("html-entities");

const Schema = mongoose.Schema;

const videoSchema = new Schema(
    {
        title: {
            required: true,
            type: String
        },
        url: {
            required: true,
            type: String
        },
        description: {
            type: String,
            get: decode,
        },
        isPublic: {
            type: Boolean,
            required: true
        },
        tags: [String],
        grade: {
            type: Number,
            enums: [10, 11, 12]
        },
        price: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toObject: { getters: true, setters: true, virtual: true },
        toJSON: { getters: true, setters: true, virtual: true },
    }
);

videoSchema.plugin(paginate);
videoSchema.plugin(toJSON);

module.exports = mongoose.model("Video", videoSchema);
