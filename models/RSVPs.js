const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
});

const RSVP = mongoose.model('RSVP', rsvpSchema);
module.exports = RSVP;

