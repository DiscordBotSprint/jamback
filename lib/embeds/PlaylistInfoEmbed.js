const { EmbedBuilder } = require('discord.js');

module.exports = function createPlaylistInfoEmbed(playlist) {
  return new EmbedBuilder()
    .setColor(0xfb587b)
    .addFields(
      { name: 'Name', value: playlist.name },
      { name: 'Length', value: playlist.songs.length }
    );
};

const messageContentSupplier = (pageIndex) => {
  const playlist = returnedPlaylists[pageIndex];
  const embed = createPlaylistInfoEmbed();
};
