module.exports = function queue(interaction) {
  if (!interaction.member.voice.channel) {
    interaction.reply({
      content: 'Please join a voice channel to interact with the queue.',
      ephemeral: true,
    });
    return;
  }

  const player = interaction.client.manager.create({
    guild: interaction.guildId,
    voiceChannel: interaction.member.voice.channel.id,
    textChannel: interaction.channelId,
  });
  player.connect();

  switch (interaction.options.getSubcommand()) {
    case 'clear':
      subcommandClear(interaction, player);
      break;
    case 'pause':
      subcommandPause(interaction, player);
      break;
    case 'play':
      subcommandPlay(interaction, player);
      break;
    case 'skip':
      subcommandSkip(interaction, player);
      break;
    case 'shuffle':
      subcommandShuffle(interaction, player);
      break;
    case 'view':
      subcommandView(interaction, player);
      break;
    default:
      throw new Error('unrecognized subcommand on command queue');
  }
};

function subcommandClear(interaction, player) {
  player.queue.clear();
  interaction.reply('The queue has been cleared!');
}

function subcommandPause(interaction, player) {
  player.pause(true);

  interaction.reply('⏸');
}

function subcommandPlay(interaction, player) {
  player.pause(false);

  interaction.reply('▶️');
}

function subcommandSkip(interaction, player) {
  player.stop();

  interaction.reply('⏭');
}

function subcommandShuffle(interaction, player) {
  player.queue.shuffle();

  interaction.reply('🔀');
}

function subcommandView(interaction, player) {
  let queueString = 'Current Queue:\n';
  player.queue.forEach((track) => {
    queueString += `title: **${track.title}** --- author: **${track.author}**\n`;
  });

  interaction.reply(queueString);
}
