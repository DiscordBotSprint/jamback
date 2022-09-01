const { ButtonBuilder, ButtonStyle } = require('discord.js');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const { PagedReply } = require('../utils/PagedReply');
const { deserializeTrack } = require('../utils/tracks');
const playTrack = require('../utils/playTrack');

module.exports = async function play(interaction) {
  switch (interaction.options.getSubcommand()) {
    case 'lucky':
      await subcommandLucky(interaction);
      break;
    case 'song':
      await subcommandSong(interaction);
      break;
    case 'playlist':
      await subcommandPlaylist(interaction);
      break;
    default:
      throw new Error('unrecognized subcommand on command play');
  }
};

async function subcommandLucky(interaction) {
  const query = interaction.options.getString('query');

  // Retrieves tracks with your query and the requester of the tracks.
  // Note: This retrieves tracks from youtube by default, to get from other sources you must enable them in application.yml and provide a link for the source.
  // Note: If you want to "search" for tracks you must provide an object with a "query" property being the query to use, and "source" being one of "youtube", "soundcloud".
  const response = await interaction.client.manager.search(query, interaction.user);
  const track = response.tracks[0];

  playTrack(track, interaction);
}

async function subcommandSong(interaction) {
  const songTitle = interaction.options.getString('title');

  let returnedSongs = await Song.getByTitle(songTitle);
  if (!returnedSongs) {
    interaction.reply(`Could not find the song "${songTitle}" in library.`);
    return;
  }
  returnedSongs = returnedSongs.slice(0, 5);

  const messageContentSupplier = (pageIndex) => {
    const track = returnedSongs[pageIndex];

    let message = '';
    message += '**title:**\n';
    message += `    ${track.title}\n`;
    message += '**author:**\n';
    message += `    ${track.author}\n`;

    return message;
  };

  const buttonRow = [
    new ButtonBuilder()
      .setCustomId('play')
      .setLabel('Play')
      .setStyle(ButtonStyle.Primary),
  ];

  const onButtonPressed = async (interaction, pageIndex) => {
    switch (interaction.customId) {
      case 'play': {
        const song = returnedSongs[pageIndex];
        const track = deserializeTrack(song.data);
        await playTrack(track, interaction);
        return true;
      }
    }
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(returnedSongs.length)
    .messageContentSupplier(messageContentSupplier)
    .setButtons(buttonRow)
    .onButtonPressed(onButtonPressed)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);
}

async function subcommandPlaylist(interaction) {
  if (!interaction.member.voice.channel) {
    interaction.reply({
      content: 'Please join a voice channel to interact with the queue.',
      ephemeral: true,
    });
    return;
  }
  const playlist = await Playlist.getByName(
    interaction.options.getString('name')
  );

  if (!playlist.songs || playlist.songs.length === 0) {
    interaction.reply('No songs in this playlist, please try another');
    return;
  }
  const player = interaction.client.manager.create({
    guild: interaction.guildId,
    voiceChannel: interaction.member.voice.channel.id,
    textChannel: interaction.channelId,
  });

  player.connect();
  playlist.songs.forEach((song) => {
    const track = deserializeTrack(song.data);
    player.queue.add(track);
  });

  if (
    !player.playing &&
    !player.paused &&
    player.queue.totalSize === playlist.songs.length
  ) {
    player.play();
  }
  interaction.reply(`Enqueued playlist ${playlist.name}`);
}
