const tracks = [
    {
        title: "Neon Horizon",
        artist: "Digital Dreams",
        cover: "assets/images/cover1.png",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Coastal Breeze",
        artist: "Solace Waves",
        cover: "assets/images/cover2.png",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Thunder Strike",
        artist: "Volt Catalyst",
        cover: "assets/images/cover3.png",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
let isRepeat = false;
let isShuffle = false;

const audio = new Audio();
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const albumArt = document.getElementById('album-art');
const progressSlider = document.getElementById('progress-slider');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const volumeFill = document.getElementById('volume-fill');
const toggleListBtn = document.getElementById('toggle-list');
const playlistSide = document.getElementById('playlist-side');
const closePlaylistBtn = document.getElementById('close-playlist');
const playlistItems = document.getElementById('playlist-items');
const repeatBtn = document.getElementById('repeat');
const shuffleBtn = document.getElementById('shuffle');

function init() {
    loadTrack(currentTrackIndex);
    renderPlaylist();
    updateVolume();
}

function loadTrack(index) {
    const track = tracks[index];
    trackTitle.innerText = track.title;
    trackArtist.innerText = track.artist;
    albumArt.style.backgroundImage = `url(${track.cover})`;
    audio.src = track.url;
    
    // Reset progress
    progressSlider.value = 0;
    progressFill.style.width = '0%';
    currentTimeEl.innerText = "0:00";
    
    updateActiveTrack();
}

function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function playTrack() {
    isPlaying = true;
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    document.body.classList.add('playing');
}

function pauseTrack() {
    isPlaying = false;
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    document.body.classList.remove('playing');
}

function playNext() {
    if (isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * tracks.length);
        } while (newIndex === currentTrackIndex);
        currentTrackIndex = newIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }
    loadTrack(currentTrackIndex);
    playTrack();
}

function playPrev() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function updateProgress() {
    const { duration, currentTime } = audio;
    if (isNaN(duration)) return;
    
    const progressPercent = (currentTime / duration) * 100;
    progressSlider.value = progressPercent;
    progressFill.style.width = `${progressPercent}%`;
    
    currentTimeEl.innerText = formatTime(currentTime);
    durationEl.innerText = formatTime(duration);
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (progressSlider.value / 100) * duration;
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateVolume() {
    audio.volume = volumeSlider.value / 100;
    volumeFill.style.width = `${volumeSlider.value}%`;
}

function renderPlaylist() {
    playlistItems.innerHTML = '';
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = `track-item ${index === currentTrackIndex ? 'active' : ''}`;
        item.innerHTML = `
            <div class="item-thumb" style="background-image: url(${track.cover})"></div>
            <div class="item-info">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="item-status"><i class="fas fa-volume-up"></i></div>
        `;
        item.onclick = () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            playTrack();
            playlistSide.classList.add('hidden');
        };
        playlistItems.appendChild(item);
    });
}

function updateActiveTrack() {
    const items = document.querySelectorAll('.track-item');
    items.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playTrack();
    } else {
        playNext();
    }
});

progressSlider.addEventListener('input', () => {
    const duration = audio.duration;
    if (isNaN(duration)) return;
    audio.currentTime = (progressSlider.value / 100) * duration;
    progressFill.style.width = `${progressSlider.value}%`;
});

volumeSlider.addEventListener('input', updateVolume);

toggleListBtn.addEventListener('click', () => {
    playlistSide.classList.remove('hidden');
});

closePlaylistBtn.addEventListener('click', () => {
    playlistSide.classList.add('hidden');
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
});

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

// Initialize
init();
