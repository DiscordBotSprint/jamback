const { EmbedBuilder } = require('discord.js');

module.exports = function createPlaylistInfoEmbed(playlists) {
  const fields = [];
  playlists.forEach((playlist) => {
    fields.push({ name: 'Name', value: playlist.name, inline: true });
    fields.push({
      name: 'Length',
      value: String(playlist.songs.length),
      inline: true,
    });
    fields.push({ name: '\u200b', value: '\u200b' });
  });
  return new EmbedBuilder().setColor(0xfb587b).addFields(...fields);
};
