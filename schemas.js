const mongoose = require('mongoose');
const { text } = require('stream/consumers');
const urlmdb = "mongodb://127.0.0.1:27017/SMCTidont"
mongoose.set("strictQuery", false);
mongoose.connect(urlmdb, () => {
    console.log("Connected to MongoDB");
});

const User = mongoose.model("User", {
    userid: Number,
    username: String,
    stage: String,
    levelGame: String,
    subLevelGame: String,
    level: Object,
    idont: Boolean,
    promo: Number,
    lspromo: String,
    cheat: Number,
    moder: Boolean,
    created: String,
    text: String,
    mail: Object,
    mailModer: Object,
    score: Number,
    start: String,
    testStateQ: Number,
    testStateA: Number,
    testState: Boolean,
    sircleFirst: Boolean,
});
const Text = mongoose.model("text", {
    stage: String,
    level: Array,
    text: Array,
    que: Object,
});
const Mail = mongoose.model("Mail", {
    file_id: String,
    user_id: Number,
    moder: Boolean,
    combo: Number,
    format: String,
    text: String,
})

const Task = mongoose.model("Task", {
    user_id: String,
    date: Number,
    message: String,
    image: String
})

module.exports = { User, Text, Mail, Task }


