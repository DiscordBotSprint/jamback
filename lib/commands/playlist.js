const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

module.exports = async function playlist(interaction) {
  switch (interaction.options.getSubcommand()) {
    case 'create':
      await subcommandCreate(interaction);
      break;
    case 'delete':
      await subcommandDelete(interaction);
      break;
    case 'add-song':
      await subcommandAddSong(interaction);
      break;
    case 'remove-song':
      await subcommandRemoveSong(interaction);
      break;
    case 'view':
      await subcommandView(interaction);
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
      `Your playlist ${newPlaylist.name} was successfully created`
    );
  } catch (e) {
    interaction.reply('Something went wrong, please try again');
  }
}

async function subcommandDelete(interaction) {
  const name = interaction.options.getString('name');

  try {
    const deletePlaylist = await Playlist.delete(name);

    interaction.reply(`The playlist ${deletePlaylist.name} has been deleted`);
  } catch (e) {
    interaction.reply(
      `Something went wrong attempting to delete playlist ${name}`
    );
  }
}

async function subcommandAddSong(interaction) {
  try {
    const songId = interaction.options.getString('song_id');
    const song = await Song.getById(songId);
    if (!song) {
      interaction.reply('No song found with this id. Please try again.');
      return;
    }
    const playlistName = interaction.options.getString('playlist_name');
    const playlist = await Playlist.getByName(playlistName);
    playlist.addSongById(song.id);

    interaction.reply(`Successfully added ${song.title} to ${playlist.name}!`);
  } catch (e) {
    interaction.reply(
      'Something went wrong trying to add this song. Please try again.'
    );
  }
}

async function subcommandView(interaction) {
  const playlistName = interaction.options.getString('name');
  const playlist = await Playlist.getByName(playlistName);

  let playlistString = `Viewing playlist ${playlist.name}:\n`;
  playlist.songs.forEach((song) => {
    playlistString += `id: **${song.id}** -- title: **${song.title}** -- author: **${song.author}**\n`;
  });
  interaction.reply(playlistString);
}

async function subcommandRemoveSong(interaction) {
  try {
    const playlistName = interaction.options.getString('playlist_name');
    const playlist = await Playlist.getByName(playlistName);
    const songId = interaction.options.getString('song_id');
    const song = await Song.getById(songId);
    await playlist.removeSongById(songId);

    interaction.reply(
      `Successfully removed ${song.title} from playlist ${playlist.name}`
    );
  } catch (e) {
    interaction.reply('Could not delete song. Please try again.');
  }
}
