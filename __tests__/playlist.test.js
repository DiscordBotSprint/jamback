const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const Playlist = require('../lib/models/Playlist');
// const request = require('supertest');
// const app = require('../lib/app');

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('Playlist.insert should insert a new playlist by name', async () => {
    const playlist = await Playlist.insert('A new playlist', 'test_guild');
    expect(playlist).toEqual({
      id: expect.any(String),
      ...playlist,
    });
  });
  it('Playlist.delete should delete a playlist by name', async () => {
    const playlistToDelete = 'Rainy Mix';
    const resp = await Playlist.delete(playlistToDelete, '');

    expect(resp).toEqual({
      id: expect.any(String),
      name: playlistToDelete,
      guildId: expect.any(String),
      songs: expect.any(Array),
    });
  });
  it('Playlist.getByName should get a playlist by name', async () => {
    const playlist = await Playlist.getByName('Rainy Mix', '');
    expect(playlist).toEqual({
      id: expect.any(String),
      name: 'Rainy Mix',
      guildId: expect.any(String),
      songs: expect.any(Array),
    });
  });
  it('playlist.addSongById should add a song to the playlist', async () => {
    let playlist = await Playlist.getByName('Rainy Mix', '');
    await playlist.addSongById(1);
    playlist = await Playlist.getByName('Rainy Mix', '');

    expect(playlist.songs).toContainEqual({
      id: 1,
      title: 'Good Times',
      author: expect.any(String),
      uri: expect.any(String),
      data: expect.any(String),
      guild_id: expect.any(String),
    });
  });
  it('Playlist.getAll() should get all playlists', async () => {
    const playlists = await Playlist.getAll('');
    expect(playlists).toBeInstanceOf(Array);
    expect(playlists[0]).toEqual({
      id: expect.any(String),
      guildId: expect.any(String),
      name: expect.any(String),
      songs: expect.any(Array),
    });
  });
  afterAll(() => {
    pool.end();
  });
});
