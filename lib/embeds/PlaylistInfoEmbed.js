const { EmbedBuilder } = require('discord.js');

module.exports = function createPlaylistInfoEmbed(playlists) {
  // good use case for reduce!
  const fields = playlists.reduce((acc, playlist) => {
    return [...acc, { name: 'Name', value: playlist.name, inline: true },
      {
        name: 'Length',
        value: String(playlist.songs.length),
        inline: true,
      },
      { name: '\u200b', value: '\u200b' }
    ];
  }, []);
  return new EmbedBuilder().setColor(0xfb587b).addFields(...fields);
};
