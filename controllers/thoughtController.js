const { Thought, User, Reaction } = require('../models');

module.exports = {

  getThoughts(req, res) {
    Thought.find()
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json(err));
  },

  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.id })
      .select('-__v')
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Sorry we have no matching thoughts!' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },

  createThought(req, res) {
    Thought.create(req.body)
      .then((thought) => {
        return User.findOneAndUpdate(
          { _id: req.body.userId },
          { $push: { thoughts: thought._id } },
          { new: true }
        )
      })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: 'Sorry, no user found!' })
        }
        res.json(user)
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },

 deleteThought(req, res) {
  Thought.findOneAndDelete({ _id: req.params.id })
    .then((thought) => {
      if (!thought) {
        return res.status(404).json({ message: 'Sorry, this thought has already been deleted or never existed!' });
      }
      if (!thought.reactions || thought.reactions.length === 0) {
        return res.json({ message: 'Your thought was deleted! But there were no reactions found.' });
      }
      return Reaction.deleteMany({ _id: { $in: thought.reactions } })
        .then(() => {
          return res.json({ message: 'Both your thought and reactions were deleted!' });
        });
    })
    .catch((err) => res.status(500).json(err));
},

 updateThought(req, res) {
  Thought.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { runValidators: true, new: true }
  )
    .then((thought) =>
      !user
        ? res.status(404).json({ message: 'Sorry we have no matching thoughts!' })
        : res.json(thought)
    )
    .catch((err) => res.status(500).json(err));
},

  addReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { reactions: req.body } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res
              .status(404)
              .json({ message: 'Sorry we have no matching reactions!' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },

  removeReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { reactions: { reactionId: req.params.reactionId } } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'Sorry we have no matching reactions!' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  }
};