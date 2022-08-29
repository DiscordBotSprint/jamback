const pool = require('../utils/pool');

module.exports = class SearchResult {
  id;
  title;
  author;
  uri;

  constructor({ id, title, author, uri }) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.uri = uri;
  }

  static async insert({ title, author, uri }) {
    const { rows } = await pool.query(
      `INSERT INTO search_results (title, author, uri)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [title, author, uri]
    );

    return new SearchResult(rows[0]);
  }
};