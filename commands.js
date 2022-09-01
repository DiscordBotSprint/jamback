/* eslint-disable no-console */
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const playCommand = new SlashCommandBuilder()
  .setName('play')
  .setDescription('plays a song')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('lucky')
      .setDescription('searches for a song and plays the first result')
      .addStringOption((option) =>
        option
          .setName('query')
          .setDescription('song title and/or artist')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('song')
      .setDescription('plays a song from the library')
      .addStringOption((option) =>
        option.setName('title').setDescription('song title').setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('playlist')
      .setDescription('plays a playlist')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('name of the playlist')
          .setRequired(true)
      )
  );

const searchCommand = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Searches for your song and gives the list of results')
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('song title and/or artist')
      .setRequired(true)
  );

const playlistCommand = new SlashCommandBuilder()
  .setName('playlist')
  .setDescription('interact with saved playlists')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create')
      .setDescription('creates a new playlist')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('the name of your new playlist')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('deletes a playlist by name')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('name of the playlist you want deleted')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('remove-song')
      .setDescription('remove a song from a playlist by id')
      .addStringOption((option) =>
        option
          .setName('playlist_name')
          .setDescription('name of playlist')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('song_title')
          .setDescription('title of song to be removed')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('view')
      .setDescription('view a saved playlist')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('name of playlist to be viewed')
          .setRequired(true)
      )
  );

const queueCommand = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('interact with the queue')
  .addSubcommand((subcommand) =>
    subcommand.setName('clear').setDescription('clear the queue')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('pause').setDescription('pauses current song')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('play').setDescription('resumes playback')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('skip').setDescription('skips the current song')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('shuffle').setDescription('shuffles queue')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('view').setDescription('displays the current queue')
  );

const libraryCommand = new SlashCommandBuilder()
  .setName('library')
  .setDescription('interact with your saved songs')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('search')
      .setDescription('search the library for a song')
      .addStringOption((option) =>
        option
          .setName('query')
          .setDescription('song title and/or artist')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('view').setDescription('view all songs in library')
  );

const commands = [
  playCommand,
  searchCommand,
  playlistCommand,
  queueCommand,
  libraryCommand,
];

const rest = new REST({ version: '10' }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
