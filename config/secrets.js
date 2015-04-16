
module.exports = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || 'Session Secret',

  sendgrid: {
    user: process.env.SENDGRID_USER || '',
    password: process.env.SENDGRID_PASSWORD || ''
  },

  dwolla: {
    clientID: process.env.DWOLLA_ID || '',
    clientSecret: process.env.DWOLLA_SECRET || '',
    callbackURL: '/auth/dwolla/callback',
    authorizationURL: 'https://uat.dwolla.com/oauth/v2/authenticate',
    tokenURL: 'https://uat.dwolla.com/oauth/v2/token',
    host: process.env.HOST || 'http://localhost:3000',
    destinationId: process.env.DESTINATION_ID || '812-229-9995'
  }
};
