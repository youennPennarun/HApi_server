var google = require('googleapis'),
    OAuth2Client = google.auth.OAuth2;
var GoogleIds={
    CLIENT_ID : '585409898471-446ka7i3uu1n67rcvpglmc22rpjo0rul.apps.googleusercontent.com',
    CLIENT_SECRET : 'zjO81hUD9zjn0ildKRsLDEin',
    REDIRECT_URL : 'http://localhost:3000/oauth/oauth2callback',
},
    GAuth = {
        oauth2Client : new OAuth2Client(GoogleIds.CLIENT_ID, GoogleIds.CLIENT_SECRET, GoogleIds.REDIRECT_URL),
        isAuthorized : function(){
            return (GAuth.oauth2Client.credentials.access_token != null);
        },
        isExpired: function(){
            return (GAuth.oauth2Client.credentials.expiry_date < Date.now);
        }
    }
module.exports = GAuth;