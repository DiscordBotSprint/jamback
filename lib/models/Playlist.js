const pool = require('../utils/pool');

module.exports = class Playlist {
  id;
  name;
  guildId;

  constructor({ id, name, guild_id, songs = [] }) {
    this.id = id;
    this.name = name;
    this.guildId = guild_id;
    this.songs = songs;
  }

  static async getAll(guildId) {
    const { rows } = await pool.query(
      `SELECT playlists.*,
      COALESCE(
        json_agg(to_jsonb(songs))
        FILTER (WHERE songs.id IS NOT NULL), '[]'
        ) as songs from playlists
      LEFT JOIN playlists_songs on playlists.id = playlists_songs.playlist_id
      LEFT JOIN songs on playlists_songs.song_id = songs.id
      WHERE playlists.guild_id = $1
      GROUP BY playlists.id;`,
      [guildId]
    );

    return rows.map(row => new Playlist(row));
  }

  static async insert(name, guildId) {
    const { rows } = await pool.query(
      'INSERT into playlists (name, guild_id) VALUES ($1, $2) RETURNING *;',
      [name, guildId]
    );

    return new Playlist(rows[0]);
  }

  static async delete(name, guildId) {
    const { rows } = await pool.query(
      `DELETE from playlists
      WHERE name = $1 AND guild_id = $2
      RETURNING *;`,
      [name, guildId]
    );

    return new Playlist(rows[0]);
  }

  static async getByName(name, guildId) {
    const { rows } = await pool.query(
      `SELECT playlists.*,
      COALESCE(
        json_agg(to_jsonb(songs))
        FILTER (WHERE songs.id IS NOT NULL), '[]'
        ) as songs from playlists
          LEFT JOIN playlists_songs on playlists.id = playlists_songs.playlist_id
          LEFT JOIN songs on playlists_songs.song_id = songs.id
          WHERE playlists.name ILIKE $1 AND playlists.guild_id = $2
          GROUP BY playlists.id`,
      [name, guildId]
    );
    if (!rows[0]) return null;
    return new Playlist(rows[0]);
  }

  async addSongById(songId) {
    await pool.query(
      'INSERT INTO playlists_songs (playlist_id, song_id) VALUES ($1, $2) RETURNING *',
      [this.id, songId]
    );
  }

  async removeSongById(songId) {
    await pool.query(
      'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2',
      [this.id, songId]
    );
  }

  async searchSongs(title) {
    // nice use of wildcard search in postgres
    title = `%${title}%`;
    const { rows } = await pool.query(
      `SELECT playlists.*,
      COALESCE(
        json_agg(to_jsonb(songs))
        FILTER (WHERE songs.id IS NOT NULL), '[]'
        ) as songs from playlists
          LEFT JOIN playlists_songs on playlists.id = playlists_songs.playlist_id
          LEFT JOIN songs on playlists_songs.song_id = songs.id
          WHERE playlists.id = $1 AND songs.title ILIKE $2
          GROUP BY playlists.id`,
      [this.id, title]
    );
    if (!rows[0]) return null;
    return new Playlist(rows[0]);
  }
};
