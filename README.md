## JamBot app

`Jam out to your favorite beats from inside any Discord server with JamBot.`

## How It Works

1. Login to your Discord account like normal.
1. Invite JamBot to your server

## Slash Commands

1. /play - play music or add to queue

   - lucky - plays first song from search result according to title/author
   - song - plays song from saved library by name
   - playlist - queues entire playlist by name

1. /search - search music through lavalink

   - prev/next - page through results
   - save - add current song to the saved library
   - play - play this current song
   - add-to-playlist - add current song to a playlist by name

1. /playlist - interact with saved playlists

   - create - add new playlist
   - delete - delete playlist by name
   - add-song - adds song to playlist by name
   - remove-song - removes song from playlist
   - view - view a single playlist by name
   - view-all - view all saved playlists

1. /library - interact with saved songs library
   - search - searches in library for song by name
   * prev/next - page through results
   * play - play current song from library
   * remove - deletes current song from library

- view - displays entire library of saved songs

1. /queue - interact with the existing queue

- pause - pause current track
- play - resume playing current track
- clear - reset queue to zero
- skip - skip currently playing song
- view - view all currently queued songs
- shuffle - shuffle order for current queue

## JamBot Team

1. Allison Ause
1. Dillon Brock
1. David Quennoz
1. Chad Stabler

## View Our Planning Board

[Miro Board](https://miro.com/app/board/uXjVPcbOsVQ=/?share_link_id=699587777489)

## Scripts

| command                | description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `npm start`            | starts the app - should only be used in production as changes will not get reloaded |
| `npm run start:watch`  | runs the app using `nodemon` which watches for changes and reloads the app          |
| `npm command`          | seed slash commands                                                                 |
| `npm run test:watch`   | continually watches and runs the tests when files are updated                       |
| `npm run setup-db`     | sets up the database locally                                                        |
| `npm run setup-heroku` | sets up the database on heroku                                                      |
