require("dotenv").config();

const Test = require("../models/test.model");
const mongoose = require("../configs/mongoose");

const main = async () => {
    // const tests = await Test.find({});
    // for (const test of tests) {
    //     if(test.tags) test.tempTags = test.tags.map(t => t.value);
    //     await test.save();
    //     console.log(test._id);
    // }
    await Test.updateMany({}, { $unset: { tempTags: "" } })
    await mongoose.disconnect();

}

main();