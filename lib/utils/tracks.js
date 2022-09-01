const { TrackUtils } = require('erela.js');

function serializeTrack(track) {
  const data = {
    track: track.track,
    info: {
      title: track.title,
      identifier: track.identifier,
      author: track.author,
      length: track.duration,
      isSeekable: track.isSeekable,
      isStream: track.isStream,
      uri: track.uri,
    },
    requester: track.requester,
  };

  return JSON.stringify(data);
}

function deserializeTrack(serializedData) {
  const data = JSON.parse(serializedData);
  const track = TrackUtils.build(data, data.requester);

  return track;
}

module.exports = { serializeTrack, deserializeTrack };
