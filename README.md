# WyzeBots

Models
- WyzeBots
- Squads
- Tribes

## Features

- NodeJs
- ExpressJs v4
- Mongoose and MongoDB
- Mutler Gridfs Storage
- Dotenv
- Nodemon

## Quick Start

1. Get the latest version

```shell
git clone https://github.com/Ijisrael42/wyzebot_server.git WyzeBots_server
cd WyzeBots_server
```

2. Run

```shell
npm install
```

3. Run

Create an .env

Add Variables:

1. MONGODB_CONNECTIONSTRING: e.g mongodb+srv://<username>:<password>@<mongo_cluster>/wyzebots?retryWrites=true&w=majority
- This variable points to Mongo database

2. SECRET: e.g F6505213-19EC-4A7D-8C6C-29982505AE4FC2058156-23EF-46C8-94D5-671836AF4909E78EAFBF-9212-4D94-91BD-7449BEA10171A180A8D6
Go to https://www.guidgenerator.com/ to generate secret string

Check the .env.example format
```

4. Run

```shell
npm start
```

5. Run in development mode

```shell
npm run dev
```
