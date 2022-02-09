const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const Schema = mongoose.Schema;

const choiceSchema = new Schema({
    _id: false,
    choice_id:  Schema.Types.ObjectId,
    moment: Date
})

const answersheetSchema = new Schema({
    user: {
        type: String,
        ref: 'FirebaseUser'
    },
    choices: [choiceSchema]
}, {
    timestamps: true
})

answersheetSchema.plugin(paginate);

module.exports = mongoose.model('answersheet', answersheetSchema);