const pool = require('../utils/pool');

module.exports = class Song {
  id;
  title;
  author;
  uri;
  data;
  guildId;

  constructor({ id, title, author, uri, data, guild_id }) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.uri = uri;
    this.data = data;
    this.guildId = guild_id;
  }

  static async getAll(guildId) {
    const { rows } = await pool.query('SELECT * FROM songs WHERE guild_id = $1;', [guildId]);
    return rows.map((row) => new Song(row));
  }

  static async getByTitle(title, guildId) {
    title = `%${title}%`;
    const { rows } = await pool.query(
      `SELECT * FROM songs
      WHERE title ILIKE $1 AND guild_id = $2`,
      [title, guildId]
    );
    if (rows.length == 0) return null;
    return rows.map((row) => new Song(row));
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM songs WHERE id=$1', [id]);
    if (!rows[0]) return null;
    return new Song(rows[0]);
  }

  static async insert(data, guildId, { title, author, uri }) {
    const {
      rows,
    } = await pool.query(
      'INSERT INTO songs (title, author, uri, data, guild_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [title, author, uri, data, guildId]
    );

    return new Song(rows[0]);
  }

  static async deleteById(id) {
    const {
      rows,
    } = await pool.query('DELETE FROM songs WHERE id=$1 RETURNING *;', [id]);
    if (!rows) return null;
    return new Song(rows[0]);
  }
};
