require("dotenv").config();

const Test = require("../models/test.model");
const mongoose = require("../configs/mongoose");

const main = async () => {
  // const questions = await Question.find({ "main_tags.0": { $exists: true }, "tags.0": { $exists: false } }).limit(5000);
  // await Promise.all(questions.map(q => update(q)));
  // await Question.updateMany({}, { $unset: { main_tags: "", side_tags: "" } })
  await Test.updateMany({}, { $unset: { isPremium: "" } });
  await mongoose.disconnect();
};

async function update(question) {
  question.tags = [];
  if (question.main_tags)
    question.tags.push(...question.main_tags.map((t) => t.value));
  if (question.side_tags)
    question.tags.push(...question.side_tags.map((t) => t.value));
  await question.save();
  console.log(question._id);
}

main();
