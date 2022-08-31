const pool = require('../utils/pool');

module.exports = class Song {
  id;
  title;
  author;
  uri;
  data;

  constructor({ id, title, author, uri, data }) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.uri = uri;
    this.data = data;
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM songs;');
    return rows.map((row) => new Song(row));
  }

  static async getByTitle(title) {
    title = `%${title}%`;
    const { rows } = await pool.query(
      `SELECT * FROM songs
      WHERE title ILIKE $1`,
      [title]
    );
    if (rows.length == 0) return null;
    return rows.map((row) => new Song(row));
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM songs WHERE id=$1', [id]);
    if (!rows[0]) return null;
    return new Song(rows[0]);
  }

  static async insert(data, { title, author, uri }) {
    const {
      rows,
    } = await pool.query(
      'INSERT INTO songs (title, author, uri, data) VALUES ($1, $2, $3, $4) RETURNING *;',
      [title, author, uri, data]
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
