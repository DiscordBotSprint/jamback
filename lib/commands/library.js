const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { createSongListEmbed } = require('../embeds/SongListEmbed');
const Song = require('../models/Song');
const { PagedReply } = require('../utils/PagedReply');
const handleAddToPlaylist = require('../utils/playlistDropdown');
const playTrack = require('../utils/playTrack');
const { deserializeTrack } = require('../utils/tracks');
const createSongInfoEmbed = require('../embeds/SongInfoEmbed');

module.exports = async function library(interaction) {
  switch (interaction.options.getSubcommand()) {
    case 'search':
      await subcommandSearch(interaction);
      break;
    case 'view':
      await subcommandView(interaction);
      break;
    default:
      throw new Error('unrecognized subcommand on command library');
  }
};

async function subcommandSearch(interaction) {
  const query = interaction.options.getString('query');

  const returnedSongs = await Song.getByTitle(query);
  if (!returnedSongs) {
    interaction.reply(`Could not find the song "${query}" in library.`);
    return;
  }

  const messageContentSupplier = (pageIndex) => {
    const song = returnedSongs[pageIndex];
    const embed = createSongInfoEmbed(song);
    embed.setFooter({ text: `Result ${pageIndex + 1} of ${returnedSongs.length}` });
    return { embeds: [embed] };
  };

  const buttons = [
    new ButtonBuilder()
      .setCustomId('play')
      .setLabel('Play')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('remove')
      .setLabel('Remove')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('add-to-playlist')
      .setLabel('Add to Playlist')
      .setStyle(ButtonStyle.Primary),
  ];

  const onButtonPressed = async (interaction, pageIndex) => {
    switch (interaction.customId) {
      case 'play': {
        const song = returnedSongs[pageIndex];
        const track = deserializeTrack(song.data);
        const success = await playTrack(track, interaction);
        return success;
      }
      case 'remove': {
        const song = returnedSongs[pageIndex];
        await removeTrack(song);
        interaction.reply({
          content: `Song ${song.title} has been removed`,
          ephemeral: true,
        });
        return true;
      }
      case 'add-to-playlist': {
        const song = returnedSongs[pageIndex];

        await handleAddToPlaylist(song, interaction, false);
        return true;
      }
    }
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(returnedSongs.length)
    .messageContentSupplier(messageContentSupplier)
    .setButtons(buttons)
    .onButtonPressed(onButtonPressed)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);
}

async function removeTrack(song) {
  await Song.deleteById(song.id);
}

async function subcommandView(interaction) {
  const returnedSongs = await Song.getAll();
  const pageSize = 8;
  const totalPages = Math.ceil(returnedSongs.length / pageSize);

  const messageContentSupplier = (pageIndex) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    const songs = returnedSongs.slice(start, end);

    const embed = createSongListEmbed(songs);
    embed.setTitle('JamBot Library');
    embed.setFooter({ text: `Page ${pageIndex + 1} of ${totalPages}` });
    return { embeds: [embed] };
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(totalPages)
    .messageContentSupplier(messageContentSupplier)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);
}
