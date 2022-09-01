const { EmbedBuilder } = require('discord.js');

module.exports =  function createSongInfoEmbed(song) {
  return new EmbedBuilder()
    .setColor(0xFB587B)
    .addFields(
      { name: 'Title', value: song.title },
      { name: 'Author', value: song.author }
    );
};
