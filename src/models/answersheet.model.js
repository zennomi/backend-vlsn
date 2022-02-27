const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const Schema = mongoose.Schema;

const choiceSchema = new Schema({
    choiceId: Schema.Types.ObjectId,
    moment: Date
})

const answersheetSchema = new Schema({
    user: {
        type: String,
        ref: 'FirebaseUser',
        required: true
    },
    testId: {
        type: Schema.Types.ObjectId,
        ref: "Test",
        required: true
    },
    choices: [choiceSchema],
    finishedAt: Date,
    blurCount: Number,
    userAgent: String,
    userIp: String
}, {
    timestamps: true
})

answersheetSchema.plugin(paginate);
answersheetSchema.plugin(toJSON);

module.exports = mongoose.model('answersheet', answersheetSchema);