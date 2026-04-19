const tracks = [
    {
        title: "Neon Horizon",
        artist: "Digital Dreams",
        cover: "assets/images/cover1.png",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        category: "english"
    },
    // ... other english songs ...
    {
        title: "Coastal Breeze",
        artist: "Solace Waves",
        cover: "assets/images/cover2.png",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        category: "english"
    },
    {
        title: "Thunder Strike",
        artist: "Volt Catalyst",
        cover: "assets/images/cover3.png",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        category: "english"
    },
    {
        title: "Arabic Kuthu",
        artist: "Anirudh Ravichander",
        cover: "assets/images/cover1.png",
        url: "assets/music/arabic_kuthu.mp3",
        category: "tamil"
    },
    {
        title: "Enjoy Enjaami",
        artist: "Dhee ft. Arivu",
        cover: "assets/images/cover2.png",
        url: "assets/music/enjoy_enjaami.mp3",
        category: "tamil"
    },
    {
        title: "Tum Tum",
        artist: "Thaman S",
        cover: "assets/images/cover3.png",
        url: "assets/music/tum_tum.mp3",
        category: "tamil"
    }
];

let currentTrackIndex = 0;
let activeCategory = "english";
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
const tabBtns = document.querySelectorAll('.tab-btn');
const addLocalBtn = document.getElementById('add-local-track');
const localInput = document.getElementById('local-file-input');
const themeToggleBtn = document.getElementById('theme-toggle');

function init() {
    loadTrack(currentTrackIndex);
    renderPlaylist();
    updateVolume();
    initTheme();
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function loadTrack(index) {
    const track = tracks[index];
    trackTitle.innerText = track.title;
    trackArtist.innerText = track.artist;
    albumArt.style.backgroundImage = `url(${track.cover})`;
    audio.src = track.url;
    
    // Sync Category Tab
    if (activeCategory !== track.category) {
        activeCategory = track.category;
        syncTabUI();
    }
    
    // Reset progress
    progressSlider.value = 0;
    progressFill.style.width = '0%';
    currentTimeEl.innerText = "0:00";
    durationEl.innerText = "Loading...";
    
    updateActiveTrack();
}

function syncTabUI() {
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-category') === activeCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
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
    audio.play().catch(err => {
        console.error("Playback failed:", err);
        durationEl.innerText = "Error Loading";
    });
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
    const filteredTracks = tracks.map((t, i) => ({...t, originalIndex: i}))
                                 .filter(t => t.category === activeCategory);
    
    let currentFilteredIndex = filteredTracks.findIndex(t => t.originalIndex === currentTrackIndex);
    
    if (currentFilteredIndex === -1) {
        currentTrackIndex = filteredTracks[0].originalIndex;
    } else if (isShuffle) {
        let newFilteredIndex;
        do {
            newFilteredIndex = Math.floor(Math.random() * filteredTracks.length);
        } while (newFilteredIndex === currentFilteredIndex && filteredTracks.length > 1);
        currentTrackIndex = filteredTracks[newFilteredIndex].originalIndex;
    } else {
        let nextFilteredIndex = (currentFilteredIndex + 1) % filteredTracks.length;
        currentTrackIndex = filteredTracks[nextFilteredIndex].originalIndex;
    }
    
    loadTrack(currentTrackIndex);
    playTrack();
}

function playPrev() {
    const filteredTracks = tracks.map((t, i) => ({...t, originalIndex: i}))
                                 .filter(t => t.category === activeCategory);
    
    let currentFilteredIndex = filteredTracks.findIndex(t => t.originalIndex === currentTrackIndex);
    
    if (currentFilteredIndex === -1) {
        currentTrackIndex = filteredTracks[0].originalIndex;
    } else {
        let prevFilteredIndex = (currentFilteredIndex - 1 + filteredTracks.length) % filteredTracks.length;
        currentTrackIndex = filteredTracks[prevFilteredIndex].originalIndex;
    }
    
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
        if (track.category !== activeCategory) return;
        
        const item = document.createElement('div');
        item.className = `track-item ${index === currentTrackIndex ? 'active' : ''}`;
        
        const isCurrentAndPlaying = (index === currentTrackIndex && isPlaying);
        const statusIcon = isCurrentAndPlaying ? 'fa-pause' : 'fa-play';
        const volumeIcon = isCurrentAndPlaying ? '<i class="fas fa-volume-up"></i>' : '';

        item.innerHTML = `
            <div class="item-thumb" style="background-image: url(${track.cover})"></div>
            <div class="item-info">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="item-status">
                ${volumeIcon}
                <i class="fas ${statusIcon} list-play-btn"></i>
            </div>
        `;
        item.onclick = () => {
            if (index === currentTrackIndex) {
                togglePlay();
            } else {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                playTrack();
            }
        };
        playlistItems.appendChild(item);
    });
}

function updateActiveTrack() {
    renderPlaylist();
}

function handleLocalFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name.split('.').slice(0, -1).join('.') || file.name;

    // Add new local track to playlist
    const newTrack = {
        title: fileName,
        artist: "Local File",
        cover: "assets/images/cover1.png", // Default cover
        url: fileUrl,
        category: "local"
    };

    tracks.push(newTrack);
    currentTrackIndex = tracks.length - 1;
    
    // Add "Local" tab if it doesn't exist
    if (!document.querySelector('[data-category="local"]')) {
        const localTab = document.createElement('button');
        localTab.className = 'tab-btn';
        localTab.setAttribute('data-category', 'local');
        localTab.innerText = 'Local';
        localTab.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            localTab.classList.add('active');
            activeCategory = 'local';
            renderPlaylist();
        };
        document.querySelector('.playlist-tabs').appendChild(localTab);
        
        // Re-query tabBtns to include the new one
        // Wait, better to just switch category and render
    }

    activeCategory = "local";
    loadTrack(currentTrackIndex);
    // Removed playTrack() to prevent auto-play as requested
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('error', (e) => {
    durationEl.innerText = "File Missing";
    // For local paths, this often happens if user hasn't put the file in assets/music yet
});
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

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderPlaylist();
    });
});

themeToggleBtn.addEventListener('click', toggleTheme);

addLocalBtn.addEventListener('click', () => localInput.click());
localInput.addEventListener('change', handleLocalFileUpload);

// Initialize
init();

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

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-category');
        renderPlaylist();
    });
});

// Initialize
init();
