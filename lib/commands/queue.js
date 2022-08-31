module.exports = function queue(client, interaction) {
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
      subcommandClear(client, interaction, player);
      break;
    case 'pause':
      subcommandPause(client, interaction, player);
      break;
    case 'play':
      subcommandPlay(client, interaction, player);
      break;
    case 'skip':
      subcommandSkip(client, interaction, player);
      break;
    case 'shuffle':
      subcommandShuffle(client, interaction, player);
      break;
    case 'view':
      subcommandView(client, interaction, player);
      break;
    default:
      throw new Error('unrecognized subcommand on command queue');
  }
};

function subcommandClear(client, interaction, player) {
  player.queue.clear();
  interaction.reply('The queue has been cleared!');
}

function subcommandPause(client, interaction, player) {
  player.pause(true);

  interaction.reply('⏸');
}

function subcommandPlay(client, interaction, player) {
  player.pause(false);

  interaction.reply('▶️');
}

function subcommandSkip(client, interaction, player) {
  player.stop();

  interaction.reply('⏭');
}

function subcommandShuffle(client, interaction, player) {
  player.queue.shuffle();

  interaction.reply('🔀');
}

function subcommandView(client, interaction, player) {
  let queueString = 'Current Queue:\n';
  player.queue.forEach((track) => {
    queueString += `title: **${track.title}** --- author: **${track.author}**\n`;
  });

  interaction.reply(queueString);
}
