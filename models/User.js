const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        },
        thoughts: [{
            type: Schema.Types.ObjectId,
            ref: 'Thought'
        }],
        friends: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        toJSON: {
            virtuals: true,
        },
        id: false,
    }
)

friendCount
    .virtual('friends')
    //   A getter, following three different activity models
    .get(function () {
        return `${this.friends}`;
    })
    //   A setter, I don't fully understand this part
    .set(function (v) {
        const friends = v.split(' ')[0];
        this.set({ friends });
    });

// Initializing the model
const User = model('user', userSchema);

// Exporting
module.exports = User;