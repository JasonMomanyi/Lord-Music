const API_KEY = 'AIzaSyB8u15oeNn6udP6KgDPOQvWMCliTr4FOY0';
const API_URL = 'https://www.googleapis.com/youtube/v3/search';
const searchQuery = 'song name artist';
let currentSongIndex = 0;
let playlist = [];

fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&key=${API_KEY}`)
  .then(response => response.json())
  .then(data => {
    playlist = data.items;
    loadPlaylist(playlist);
    if (playlist.length > 0) {
      playSong(playlist[0].id.videoId);
    }
  })
  .catch(error => console.error('Error fetching YouTube data:', error));

function playSong(videoId) {
  if (player && player.loadVideoById) {
    player.loadVideoById(videoId);
  } else {
    console.error('Player is not ready.');
  }
}

function nextSong() {
  if (playlist.length > 0) {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(playlist[currentSongIndex].id.videoId);
  }
}

function previousSong() {
  if (playlist.length > 0) {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[currentSongIndex].id.videoId);
  }
}

function loadPlaylist(data) {
  const playlistElement = document.getElementById('playlist');
  playlistElement.innerHTML = ''; // Clear existing playlist items
  data.forEach((item, index) => {
    const songData = item.snippet;
    const videoId = item.id.videoId;
    const title = songData.title;
    const artist = songData.channelTitle;
    const thumbnail = songData.thumbnails.default.url;

    const playlistItem = document.createElement('div');
    playlistItem.className = 'playlist-item';
    playlistItem.innerHTML = `
      <img src="${thumbnail}" alt="${title}">
      <div>
        <p>${title}</p>
        <p>${artist}</p>
      </div>
    `;
    playlistItem.onclick = () => {
      currentSongIndex = index;
      playSong(videoId);
    };
    playlistElement.appendChild(playlistItem);
  });
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '', // This will be dynamically set
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    nextSong();
  }
}