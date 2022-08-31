module.exports = function playTrack(track, interaction) {
  if (!interaction.member.voice.channel) {
    interaction.reply({
      content: 'Please join a voice channel to play music.',
      ephemeral: true,
    });
    return false;
  }

  const player = interaction.client.manager.create({
    guild: interaction.guildId,
    voiceChannel: interaction.member.voice.channel.id,
    textChannel: interaction.channelId,
  });

  player.connect();

  player.queue.add(track);
  interaction.reply(`Enqueuing track ${track.title}.`);

  if (!player.playing && !player.paused && !player.queue.size) player.play();
  return true;
};
