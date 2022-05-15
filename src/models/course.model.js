const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { decode } = require("html-entities");
const { encode: base64Encode } = require("js-base64");

const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    tags: [String],
    name: String,
    grade: { type: Number },
    description: {
      type: String,
      get: decode,
    },
    isPublished: Boolean
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
