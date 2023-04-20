const connection = require("../config/connection");
const { User, Thought } = require("../models");
const { getArrayOfNames, getMessages, getReaction } = require("./data");

connection.on("error", (err) => err);

connection.once("open", async () => {
  console.log("connected");

  await User.deleteMany({});

  await Thought.deleteMany({});

  const users = [];

  let arrayOfNames = getArrayOfNames();
  for (let i = 0; i < 20; i++) {
    const username =
      arrayOfNames.pop(Math.floor(Math.random() * arrayOfNames.length)) +
      arrayOfNames.pop(Math.floor(Math.random() * arrayOfNames.length));
    const email = `${username}@gmail.com`;
    const thoughts = [];
    const friends = [];

    users.push({
      username,
      email,
      thoughts,
      friends,
    });
  }

  await User.collection.insertMany(users).catch((err)=>{console.log(err)});

  const messages = getMessages();
  for (let i = 0; i < 20; i++) {
    let result = await User.aggregate([{ $sample: { size: 1 } }]);
    const user = result[0];

    const thoughtText = messages[i];
    const username = user.username;

    const reactionBody = getReaction();
    result = await User.aggregate([
      { $match: { _id: { $ne: user._id } } },
      { $sample: { size: 1 } },
    ]);
    const reactionUsername = result[0];
    const reactions = [
      { reactionBody: reactionBody, username: reactionUsername.username },
    ];

    const thought = {
      thoughtText,
      username,
      reactions,
    };
    const newThought = await Thought.collection
      .insertOne(thought)
      .catch((err) => {
        console.log(err);
      });

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          thoughts: [newThought.insertedId],
          friends: [reactionUsername._id],
        },
      },
      { new: true }
    );
  }

  process.exit(0);
});