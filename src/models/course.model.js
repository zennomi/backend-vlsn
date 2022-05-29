const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { decode } = require("html-entities");

const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    tags: [String],
    title: {
      type: String,
      required: true
    },
    grade: { type: Number },
    description: {
      type: String,
      get: decode,
    },
    coverURL: {
      type: String,
      required: true,
    },
    isPublished: Boolean,
    isSale: Boolean,
    videos: [{
      id: {
        type: Schema.Types.ObjectId,
        ref: "Video"
      },
      index: {
        type: Number,
        required: true
      },
      _id: false
    }],
    tests: [{
      id: {
        type: Schema.Types.ObjectId,
        ref: "Test"
      },
      index: {
        type: Number,
        required: true
      },
      _id: false
    }],
    price: {
      type: Number,
      required: true,
    },
    priceSale: Number
  },
  {
    timestamps: true,
    toObject: { getters: true, setters: true, virtual: true },
    toJSON: { getters: true, setters: true, virtual: true },
  }
);

courseSchema.plugin(paginate);
courseSchema.plugin(toJSON);

module.exports = mongoose.model("Course", courseSchema);
