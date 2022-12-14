const { ButtonBuilder, ButtonStyle } = require('discord.js');
const Song = require('../models/Song');
const { PagedReply } = require('../utils/PagedReply');
const handleAddToPlaylist = require('../utils/playlistDropdown');
const { serializeTrack } = require('../utils/tracks');
const createSongInfoEmbed = require('../embeds/SongInfoEmbed');

module.exports = async function search(interaction) {
  const query = interaction.options.getString('query');

  const response = await interaction.client.manager.search(query, interaction.user);
  const tracks = response.tracks.slice(0, 5);

  const messageContentSupplier = (pageIndex) => {
    const track = tracks[pageIndex];
    const embed = createSongInfoEmbed(track);
    embed.setFooter({ text: `Result ${pageIndex + 1} of ${tracks.length}` });
    return { embeds: [embed] };
  };

  const buttonRow = [
    new ButtonBuilder()
      .setCustomId('play')
      .setLabel('Play')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('save')
      .setLabel('Save')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('add-to-playlist')
      .setLabel('Add to Playlist')
      .setStyle(ButtonStyle.Primary),
  ];

  const onButtonPressed = async (interaction, pageIndex) => {
    switch (interaction.customId) {
      case 'play':
        return handlePlay(tracks[pageIndex], interaction);
      case 'save':
        return await handleSave(tracks[pageIndex], interaction);
      case 'add-to-playlist':
        return await handleAddToPlaylist(tracks[pageIndex], interaction, true);
    }
  };

  const pagedReply = new PagedReply()
    .setNumberOfPages(tracks.length)
    .messageContentSupplier(messageContentSupplier)
    .setButtons(buttonRow)
    .onButtonPressed(onButtonPressed)
    .setEphemeral(true)
    .setIdleTimeout(45_000);

  await pagedReply.reply(interaction);
};

function handlePlay(track, interaction) {
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

  return false;
}

async function handleSave(track, interaction) {
  try {
    const data = serializeTrack(track);
    const guildId = interaction.guild.id;
    const addedSong = await Song.insert(data, guildId, track);
    interaction.reply({
      content: `${addedSong.title} has been added to the library.`,
      ephemeral: true,
    });
  } catch {
    interaction.reply({
      content: 'This song has already been added to the library.',
      ephemeral: true,
    });
  }
  return false;
}
