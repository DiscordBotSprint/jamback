const { EmbedBuilder } = require('discord.js');

module.exports = function createQueueEmbed(songs, currentSong, pageIndex) {
  // another good use case for reduce
  const fields = songs.reduce((acc, song)=>{
    return [...acc, 
      { name: 'Title', value: song.title, inline: true },
      { name: 'Author', value: song.author, inline: true },
      { name: '\u200B', value: '\u200B' }
    ]
  });
  
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
