# jkt48sr-discord-notif
Live notif Showroom Live to Discord Channel

### Installation

A step by step guide that will tell you how to get the development environment up and running.

```
$ git clone https://github.com/crstlnz/jkt48sr-discord-notif.git
$ cd jkt48sr-discord-notif
$ npm i
$ npm build
```

## Environtment Variables
Create .env file on root folder and add your discord bot token
```properties
DISCORD_TOKEN=your_bot_token
SR_ID=showroom_token #for watch premium live
NODE_ENV=development #for using random live if no jkt48 members are live
```

## Config
```
$ Modify config for custom message and discord channel name on /src/config.ts
$ npm start
```

## Development
Use ```npm run dev``` for development

## Preview
![alt text](https://res.cloudinary.com/haymzm4wp/image/upload/s--D6eLNEF3--/v1695312989/assets/img/srembed_ggdojf.jpg)