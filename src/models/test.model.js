const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { decode } = require("html-entities");
const { encode: base64Encode } = require("js-base64");

const Schema = mongoose.Schema;

const testSchema = new Schema(
  {
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    tags: [String],
    time: Number,
    name: String,
    grade: { type: Number },
    pdfURL: String,
    videoURL: String,
    note: {
      type: String,
      get: decode,
    },
    isPublic: { type: Boolean, default: false },
    isShuffled: {
      type: Boolean,
      default: true,
    },
    isSorted: {
      type: Boolean,
      default: true,
    },
    showKeyMode: {
      type: Number,
      default: 2,
      enums: [0, 1, 2], // 0: only mark, 1: show false option, 2: show full
    },
    password: {
      type: String,
      set: base64Encode,
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

testSchema.methods.getKey = function () {
  if (!this.populated("questions")) return [];
  const key = [];
  this.questions.forEach((q) => {
    key.push(...q.getTrueChoiceArray());
  });
  return key;
};

testSchema.plugin(paginate);
testSchema.plugin(toJSON);

module.exports = mongoose.model("Test", testSchema);
