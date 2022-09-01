/* eslint-disable no-console */
const { Client, GatewayIntentBits } = require('discord.js');
const { Manager } = require('erela.js');
const play = require('./lib/commands/play');
const search = require('./lib/commands/search');
const playlist = require('./lib/commands/playlist');
const queue = require('./lib/commands/queue');
const library = require('./lib/commands/library');

if (!process.env.DISCORD_BOT_TOKEN) {
  console.log('Please remember to add your token to the .env file');
  return;
}

// Initialize the Discord.JS Client.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Initiate the Manager with some options and listen to some events.
client.manager = new Manager({
  nodes: [
    {
      host: process.env.LL_HOST,
      port: Number(process.env.LL_PORT),
      password: process.env.LL_PASSWORD,
      secure: Boolean(process.env.LL_SECURE),
    },
  ],
  // A send method to send data to the Discord WebSocket using your library.
  // Getting the shard for the guild and sending the data to the WebSocket.
  send(id, payload) {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  },
});

client.manager.on('nodeConnect', (node) =>
  console.log(`Node ${node.options.identifier} connected`)
);

client.manager.on('nodeError', (node, error) =>
  console.log(`Node ${node.options.identifier} had an error: ${error.message}`)
);

client.manager.on('trackStart', (player, track) => {
  client.channels.cache
    .get(player.textChannel)
    .send(`Now playing: ${track.title}`);
});

client.manager.on('queueEnd', (player) => {
  client.channels.cache.get(player.textChannel).send('Queue has ended.');

  player.destroy();
});

// Ready event fires when the Discord.JS client is ready.
// Use EventEmitter#once() so it only fires once.
client.once('ready', () => {
  console.log('I am ready!');
  // Initiate the manager.
  client.manager.init(client.user.id);
});

// Here we send voice data to lavalink whenever the bot joins a voice channel to play audio in the channel.
client.on('raw', (d) => client.manager.updateVoiceState(d));

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'play':
        await play(interaction);
        break;
      case 'search':
        await search(interaction);
        break;
      case 'playlist':
        await playlist(interaction);
        break;
      case 'queue':
        await queue(interaction);
        break;
      case 'library':
        await library(interaction);
        break;
    }
  } catch (error) {
    console.error(error);
    interaction.reply({
      content: 'An unexpected error occurred. Please try again.',
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Heroku expects us to bind $PORT on a web dyno, or else it kills our process after 60 seconds.
// This just fills that expectation. // FIXME: in the future we should use a custom Procfile that
// specifies a worker dyno instead.
const express = require('express');
const app = express();
app.listen(process.env.PORT || 7890);
