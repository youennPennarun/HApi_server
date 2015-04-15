/*global module*/
/*global require*/
module.exports = function () {
    "use strict";
    var mongoose = require("mongoose"),
        bcrypt   = require('bcrypt-nodejs'),

        Schema = mongoose.Schema,
        alarmSchema = new Schema({
            time: Date,
            enable: Boolean,
            repeat: Boolean
        }),
        GTokenShema = new Schema({
            access_token: String,
            token_type: String,
            expiry_date: Number,
            refresh_token: String
        }),
        SoundcloudTokenShema = new Schema({
            access_token: String,
            scope: String,
            expires_in: Number,
            refresh_token: String
        }),
        SpotifyTokenShema = new Schema({
            access_token: String,
            scope: String,
            expires_date: Number,
            refresh_token: String
        }),
        userSchema = new Schema({
            username: String,
            password: String
        }),
        artistSchema = new Schema({
            userId: String,
            name: String,
            spotifyId: String,
            musicgraphId: String,
            useItAsAlarm: Boolean
        });

    userSchema.methods.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function (password) {
        return bcrypt.compareSync(password, this.password);
    };

    mongoose.model('Alarm', alarmSchema);
    mongoose.model('GToken', GTokenShema);
    mongoose.model('SoundcloudToken', SoundcloudTokenShema);
    mongoose.model('SpotifyToken', SpotifyTokenShema);
    mongoose.model('User', userSchema);
    mongoose.model('Artist', artistSchema);
    return Schema;
};