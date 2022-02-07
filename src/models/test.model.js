const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
    _id: false,
    value: String
})

const testSchema = new Schema({
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    tags: [tagSchema],
    time: Number,
    name: String,
    grade: { type: Number, default: 12 },
    link_pdf: String,
    link_fb_live: String,
    note: String,
    isPublic: { type: Boolean, default: false },
    isPremium: {
        type: Boolean,
        default: false
    },
    isShuffled: {
        type: Boolean,
        default: true
    },
    isSorted: {
        type: Boolean,
        default: true
    }
})

testSchema.plugin(paginate);

module.exports = mongoose.model('Test', testSchema);