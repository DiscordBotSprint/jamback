const { EmbedBuilder } = require('discord.js');

module.exports =  function createSongInfoEmbed(song) {
  return new EmbedBuilder()
    .setColor(0x72db39)
    .addFields(
      { name: 'Title', value: song.title },
      { name: 'Author', value: song.author }
    );
};
