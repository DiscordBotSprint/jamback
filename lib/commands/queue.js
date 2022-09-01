const createQueueEmbed = require('../embeds/QueueEmbed');
const { PagedReply } = require('../utils/PagedReply');

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

async function subcommandView(interaction, player) {
  
  const pageSize = 8;
  const totalPages = Math.ceil(player.queue.totalSize / pageSize);

  const messageContentSupplier = (pageIndex) => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    const songs = player.queue.slice(start, end);
    const currentSong = player.queue.current;

    const embed = createQueueEmbed(songs, currentSong, pageIndex);
    embed.setFooter({ text: `Page ${pageIndex + 1} of ${totalPages}` });
    return { embeds: [embed] };
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(totalPages)
    .messageContentSupplier(messageContentSupplier)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);

}
