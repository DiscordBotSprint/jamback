const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { createSongListEmbed } = require('../embeds/SongListEmbed');
const Playlist = require('../models/Playlist');
const { PagedReply } = require('../utils/PagedReply');
const createPlaylistInfoEmbed = require('../embeds/PlaylistInfoEmbed');

module.exports = async function playlist(interaction) {
  switch (interaction.options.getSubcommand()) {
    case 'create':
      await subcommandCreate(interaction);
      break;
    case 'delete':
      await subcommandDelete(interaction);
      break;
    case 'remove-song':
      await subcommandRemoveSong(interaction);
      break;
    case 'view':
      await subcommandView(interaction);
      break;
    case 'view-all':
      await subcommandViewAll(interaction);
      break;
    default:
      throw new Error('unrecognized subcommand on command playlist');
  }
};

async function subcommandCreate(interaction) {
  const name = interaction.options.getString('name');
  try {
    const newPlaylist = await Playlist.insert(name);

    interaction.reply(
      `New playlist ${newPlaylist.name} was successfully created.`
    );
  } catch (e) {
    interaction.reply('Something went wrong. Please try again.');
  }
}

async function subcommandDelete(interaction) {
  const name = interaction.options.getString('name');

  try {
    const deletePlaylist = await Playlist.delete(name);

    interaction.reply(
      `The playlist ${deletePlaylist.name} has been successfully deleted.`
    );
  } catch (e) {
    interaction.reply(
      `Something went wrong attempting to delete playlist ${name}.`
    );
  }
}

async function subcommandView(interaction) {
  const playlistName = interaction.options.getString('name');
  const playlist = await Playlist.getByName(playlistName);
  if (!playlist) {
    interaction.reply(`Could not find any playlists called ${playlistName}.`);
    return;
  }

  const playlistSongs = playlist.songs;

  const pageSize = 8;
  const totalPages = Math.ceil(playlistSongs.length / pageSize);

  const messageContentSupplier = (pageIndex) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    const songs = playlistSongs.slice(start, end);

    const embed = createSongListEmbed(songs);
    embed.setTitle(`${playlistName}`);
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

async function subcommandRemoveSong(interaction) {
  const playlistName = interaction.options.getString('playlist_name');
  const playlist = await Playlist.getByName(playlistName);
  if (!playlist) {
    interaction.reply('No playlist found with provided name.');
    return;
  }
  const songTitle = interaction.options.getString('song_title');
  const playlistWithSongs = await playlist.searchSongs(songTitle);
  if (!playlistWithSongs) {
    interaction.reply('No songs found with provided title.');
    return;
  }

  const songs = playlistWithSongs.songs;

  const messageContentSupplier = (index) => {
    const song = songs[index];

    let message = '';
    message += '**title:**\n';
    message += `    ${song.title}\n`;
    message += '**author:**\n';
    message += `    ${song.author}\n`;

    return message;
  };

  const buttonRow = [
    new ButtonBuilder()
      .setCustomId('remove')
      .setLabel('Remove')
      .setStyle(ButtonStyle.Primary),
  ];

  const onButtonPressed = async (interaction, pageIndex) => {
    switch (interaction.customId) {
      case 'remove':
        return handleRemoveSong(playlist, songs[pageIndex], interaction);
    }
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(songs.length)
    .messageContentSupplier(messageContentSupplier)
    .setButtons(buttonRow)
    .onButtonPressed(onButtonPressed)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);
}

async function subcommandViewAll(interaction) {
  const playlists = await Playlist.getAll();
  const pageSize = 8;
  const totalPages = Math.ceil(playlists.length / pageSize);

  if (!playlists) {
    interaction.reply('No playlists to view at the moment');
    return;
  }

  const messageContentSupplier = (pageIndex) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    const playlistPage = playlists.slice(start, end);

    const embed = createPlaylistInfoEmbed(playlistPage);
    embed.setTitle('Available playlists:\n');
    embed.setFooter({ text: `Page ${pageIndex + 1} of ${totalPages}` });
    return { embeds: [embed] };
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(playlists.length / 8)
    .messageContentSupplier(messageContentSupplier)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);
}

function handleRemoveSong(playlist, song, interaction) {
  try {
    playlist.removeSongById(song.id);
    interaction.reply(
      `${song.title} was successfully removed from playlist ${playlist.name}`
    );
  } catch (e) {
    interaction.reply('Could not remove song, please try again');
  }
}
