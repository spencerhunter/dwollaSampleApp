Getting Started
---------------

Clone the repository:

```bash
$ git clone https://github.com/spencerhunter/dwollaSampleApp.git myproject
$ cd myproject

# Install NPM dependencies
$ npm install

$ node app.js
```

##### Generate API Credentials
Navigate [Here](https://developers.dwolla.com/dev/pages/guides/create_application)

##### Set values to secrets.js



Deploying
----------
#### Deployment with Heroku
This assumes you have a free Heroku account, and that you have Node.js and npm installed.

- Download and install [Heroku Toolbelt](https://toolbelt.heroku.com/)
- In terminal, run `heroku login` and enter your Heroku credentials
- From your *myproject* directory run `heroku create myappname`
- Deploy your code `git push heroku master`. 
- Define and set config vars from secrets.js Example: `heroku config:set HOST=https://myappname.herokuapp.com`

**Other:** heroku logs --tail

**Later - To-do:** Add support for mongodb