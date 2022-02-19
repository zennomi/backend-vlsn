const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Mathml2latex = require('mathml-to-latex');
const { decode } = require('html-entities');

const Schema = mongoose.Schema;

const tagSchema = new Schema({
    _id: false,
    value: String,
    grade: Number
})

const choiceSchema = new Schema({
    content: {
        type: String,
        get: toInlineElement
    },
    isTrue: { type: Boolean, private: true }
}, {
    toObject: { getters: true },
    toJSON: { getters: true },
})

const questionSchema = new Schema({
    question: {
        type: String,
        get: toInlineElement
    },
    choices: [choiceSchema],
    answer: {
        type: String,
        get: toInlineElement
    },
    grade: Number,
    level: {
        type: Number,
        default: 11
    },
    main_tags: [tagSchema],
    side_tags: [tagSchema]
}, {
    timestamps: true,
    toObject: { getters: true, setters: true, virtual: true },
    toJSON: { getters: true, setters: true, virtual: true },
}
);

questionSchema.methods.getMaxLengthChoice = function () {
    return Math.max(...this.choices.map(c => c.content.replace(/<.*>/g, "").length))
}

questionSchema.methods.getTrueChoiceArray = function () {
    return this.choices.filter(c => c.isTrue).map(c => String(c._id));
}

questionSchema.methods.getFalseChoiceArray = function () {
    return this.choices.filter(c => !c.isTrue).map(c => String(c._id));
}

questionSchema.plugin(paginate);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

function toInlineElement(string) {
    const html = decode(string);
    return html
    .replace(/color:black/g, "")
    .replace(/<p>(.*)<\/p>/, "$1")
    .replace(/(<math.*math>)/g, (match, m1) => `$${Mathml2latex.convert(m1)}$`)
    .replace(/\\mu/g, (match, m1) => `\\mu `)
    .replace(/\\omega/g, (match, m1) => `\\omega `)
    ;
}