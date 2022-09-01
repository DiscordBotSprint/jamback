const pool = require('../utils/pool');

module.exports = class Playlist {
  id;
  name;

  constructor({ id, name, songs = [] }) {
    this.id = id;
    this.name = name;
    this.songs = songs;
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT playlists.*,
      COALESCE(
        json_agg(to_jsonb(songs))
        FILTER (WHERE songs.id IS NOT NULL), '[]'
        ) as songs from playlists
      LEFT JOIN playlists_songs on playlists.id = playlists_songs.playlist_id
      LEFT JOIN songs on playlists_songs.song_id = songs.id
      GROUP BY playlists.id;`
    );

    return rows.map(row => new Playlist(row));
  }

  static async insert(name) {
    const { rows } = await pool.query(
      'INSERT into playlists (name) VALUES ($1) RETURNING *;',
      [name]
    );

    return new Playlist(rows[0]);
  }

  static async delete(name) {
    const { rows } = await pool.query(
      'DELETE from playlists WHERE name = $1 RETURNING *;',
      [name]
    );

    return new Playlist(rows[0]);
  }

  static async getByName(name) {
    const { rows } = await pool.query(
      `SELECT playlists.*,
      COALESCE(
        json_agg(to_jsonb(songs))
        FILTER (WHERE songs.id IS NOT NULL), '[]'
        ) as songs from playlists
          LEFT JOIN playlists_songs on playlists.id = playlists_songs.playlist_id
          LEFT JOIN songs on playlists_songs.song_id = songs.id
          WHERE playlists.name ILIKE $1
          GROUP BY playlists.id`,
      [name]
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
