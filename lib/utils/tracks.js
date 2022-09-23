const { TrackUtils } = require('erela.js');

// you might consider destructuring here
function serializeTrack({track, title, identifier, author, duration, isSeekable, isStream, uri, requester}) {
  const data = {
    track: track,
    info: {
      title: title,
      identifier: identifier,
      author: author,
      length: duration,
      isSeekable: isSeekable,
      isStream: isStream,
      uri: uri,
    },
    requester: requester,
  };

  return JSON.stringify(data);
}

function deserializeTrack(serializedData) {
  const data = JSON.parse(serializedData);
  const track = TrackUtils.build(data, data.requester);

  return track;
}

module.exports = { serializeTrack, deserializeTrack };
