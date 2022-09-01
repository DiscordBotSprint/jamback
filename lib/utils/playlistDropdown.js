const { ActionRowBuilder, SelectMenuBuilder, ComponentType } = require('discord.js');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const { serializeTrack } = require('./tracks');


async function handleAddToPlaylist(song, interaction, isTrack) {
  const guildId = interaction.guild.id;
  const playlists = await Playlist.getAll(guildId);
  
  const options = [];
  for(let i = 0; i < playlists.length; ++i) {
    const playlist = playlists[i];
    options.push({
      label: playlist.name,
      value: String(i)
    });
  }
  
  const row = new ActionRowBuilder()
    .addComponents(
      new SelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Nothing selected')
        .addOptions(...options)
    );
  
  const reply = await interaction.reply({
    content: 'Please pick a playlist.',
    components: [row],
    ephemeral: true,
    fetchReply: true
  });
  
  let selectMenuInteraction;
  try {
    selectMenuInteraction = await reply.awaitMessageComponent({
      componentType: ComponentType.SelectMenu
    });
  } catch {
    return;
  }

  if (isTrack) {
    const data = serializeTrack(song);
    song = await Song.insert(data, guildId, song);
  }
  
  const playlistIndex = Number(selectMenuInteraction.values[0]);
  const playlist = playlists[playlistIndex];
  
  await playlist.addSongById(song.id);
  
  selectMenuInteraction.reply({
    content: `Successfully added ${song.title} to playlist ${playlist.name}`,
    ephemeral: true
  });
}

module.exports = handleAddToPlaylist;
