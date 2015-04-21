
module.exports = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || 'Session Secret',

  sendgrid: {
    user: process.env.SENDGRID_USER || '',
    password: process.env.SENDGRID_PASSWORD || ''
  },
// Generate API credentials guide here: https://developers.dwolla.com/dev/pages/guides/create_application
  dwolla: {
    clientID: process.env.DWOLLA_ID || 'YOUR CLIENT ID HERE',
    clientSecret: process.env.DWOLLA_SECRET || 'YOUR CLIENT SECRET HERE',
    callbackURL: '/auth/dwolla/callback',
    authorizationURL: 'https://uat.dwolla.com/oauth/v2/authenticate',
    tokenURL: 'https://uat.dwolla.com/oauth/v2/token',
    host: process.env.HOST || 'YOUR HOST HERE',
    destinationId: process.env.DESTINATION_ID || 'YOUR UAT DWOLLA ID HERE'
  }
};
