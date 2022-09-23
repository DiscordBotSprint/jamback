const { EmbedBuilder } = require('discord.js');

function createSongListEmbed(songs) {
  // use reduce :)
  const fields = [];
  for (const song of songs) {
    fields.push({ name: 'Title', value: song.title, inline: true });
    fields.push({ name: 'Author', value: song.author, inline: true });
    fields.push({ name: '\u200B', value: '\u200B' });
  }

  return new EmbedBuilder()
    .setColor(0xfb587b)
    .addFields(...fields);
}

module.exports = { createSongListEmbed };
