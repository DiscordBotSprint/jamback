const { EmbedBuilder } = require('discord.js');

module.exports = function createQueueEmbed(songs, currentSong, pageIndex) {
  const fields = [];
  for (const song of songs) {
    fields.push({ name: 'Title', value: song.title, inline: true });
    fields.push({ name: 'Author', value: song.author, inline: true });
    fields.push({ name: '\u200B', value: '\u200B' });
  }
  if (pageIndex === 0) {
    return new EmbedBuilder()
      .setColor(0xFB587B)
      .setTitle(`Now Playing: ${currentSong.title}`)
      .addFields(...fields);
  }
  else {
    return new EmbedBuilder()
      .setColor(0xFB587B)
      .addFields(...fields);
  }
};
