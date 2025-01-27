const API_KEY = 'AIzaSyB8u15oeNn6udP6KgDPOQvWMCliTr4FOY0';
const PLAYLIST_ID = 'RDEM-WYNGIdEFjn8H41ugynh2w'; // Only the playlist ID part
let currentSongIndex = 0;
let playlist = [];
let isPlaying = false;

fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&key=${API_KEY}&maxResults=25`)
  .then(response => response.json())
  .then(data => {
    playlist = data.items;
    loadPlaylist(playlist);
    if (playlist.length > 0) {
      playSong(playlist[0].snippet.resourceId.videoId);
    }
  })
  .catch(error => console.error('Error fetching YouTube data:', error));

function playSong(videoId) {
  if (player && player.loadVideoById) {
    player.loadVideoById(videoId);
    isPlaying = true;
  } else {
    console.error('Player is not ready.');
  }
}

function nextSong() {
  if (playlist.length > 0) {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    playSong(playlist[currentSongIndex].snippet.resourceId.videoId);
  }
}

function previousSong() {
  if (playlist.length > 0) {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[currentSongIndex].snippet.resourceId.videoId);
  }
}

function loadPlaylist(data) {
  const playlistElement = document.getElementById('playlist');
  playlistElement.innerHTML = ''; // Clear existing playlist items
  data.forEach((item, index) => {
    const songData = item.snippet;
    const videoId = songData.resourceId.videoId;
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
  isPlaying = true;
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    nextSong();
  }
}

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (isPlaying) {
      player.pauseVideo();
    }
  } else {
    if (isPlaying) {
      player.playVideo();
    }
  }
});
