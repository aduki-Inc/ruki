class AudioPlayer {
  constructor(audioUrl, controlBar) {
    this.audioUrl = audioUrl;
    this.controlBar = controlBar;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sourceNode = null;
    this.gainNode = null;
    this.audioBuffer = null;
    this.startedAt = 0;
    this.pausedAt = 0;
    this.isPlaying = false;

    this.playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
      <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>`;

    this.pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
      <path d="M4 7C4 5.58579 4 4.87868 4.43934 4.43934C4.87868 4 5.58579 4 7 4C8.41421 4 9.12132 4 9.56066 4.43934C10 4.87868 10 5.58579 10 7V17C10 18.4142 10 19.1213 9.56066 19.5607C9.12132 20 8.41421 20 7 20C5.58579 20 4.87868 20 4.43934 19.5607C4 19.1213 4 18.4142 4 17V7Z" stroke="currentColor" stroke-width="1.5" />
      <path d="M14 7C14 5.58579 14 4.87868 14.4393 4.43934C14.8787 4 15.5858 4 17 4C18.4142 4 19.1213 4 19.5607 4.43934C20 4.87868 20 5.58579 20 7V17C20 18.4142 20 19.1213 19.5607 19.5607C19.1213 20 18.4142 20 17 20C15.5858 20 14.8787 20 14.4393 19.5607C14 19.1213 14 18.4142 14 17V7Z" stroke="currentColor" stroke-width="1.5" />
    </svg>`;

    this.loadIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="currentColor" fill="none">
      <path d="M15.1667 0.999756L15.7646 2.11753C16.1689 2.87322 16.371 3.25107 16.2374 3.41289C16.1037 3.57471 15.6635 3.44402 14.7831 3.18264C13.9029 2.92131 12.9684 2.78071 12 2.78071C6.75329 2.78071 2.5 6.90822 2.5 11.9998C2.5 13.6789 2.96262 15.2533 3.77093 16.6093M8.83333 22.9998L8.23536 21.882C7.83108 21.1263 7.62894 20.7484 7.7626 20.5866C7.89627 20.4248 8.33649 20.5555 9.21689 20.8169C10.0971 21.0782 11.0316 21.2188 12 21.2188C17.2467 21.2188 21.5 17.0913 21.5 11.9998C21.5 10.3206 21.0374 8.74623 20.2291 7.39023" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;

    this.playPauseButton = controlBar.querySelector('.play-pause');
    this.progressBar = controlBar.querySelector('.progress-bar');
    this.progressPoint = controlBar.querySelector('.point');
    this.currentTimeSpan = controlBar.querySelector('.current-time');
    this.allTimeSpan = controlBar.querySelector('.all-time');

    this.isLoading = false;
    this.loadingIconStyle = document.createElement('style');
    document.head.appendChild(this.loadingIconStyle);

    this.forwardSeek = controlBar.querySelector('.seek.forward');
    this.backwardSeek = controlBar.querySelector('.seek.backward');
    this.volumeIndicator = controlBar.querySelector('.volume-indicator .percentage');
    
    this.isLoading = false;
    this.volume = 1; // Default volume is 100%

    this.setupEventListeners();
    this.loadAudio();
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  async loadAudio() {
    this.initAudioContext(); // Initialize AudioContext here
    const response = await fetch(this.audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.updateDuration();
    this.setVolume(this.volume); // Set initial volume
  }

  async loadAndPlayAudio() {
    if (this.isLoading || this.audioBuffer) return;

    this.isLoading = true;
    this.updatePlayPauseButton();

    try {
      const response = await fetch(this.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.updateDuration();
      this.setVolume(this.volume); // Set initial volume
      this.play();
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      this.isLoading = false;
      this.updatePlayPauseButton();
    }
  }

  togglePlayPause() {
    if (this.isLoading) return;

    if (this.isPlaying) {
      this.pause();
    } else if (this.audioBuffer) {
      this.play();
    } else {
      this.loadAndPlayAudio();
    }
  }

  setupEventListeners() {
    let firstInteraction = true;
    
    const handleFirstInteraction = () => {
      if (firstInteraction) {
        this.loadAudio();
        firstInteraction = false;
      }
    };
  
    this.playPauseButton.addEventListener('click', () => {
      handleFirstInteraction();
      this.togglePlayPause();
    });
    
    this.progressBar.addEventListener('click', (e) => {
      handleFirstInteraction();
      this.seek(e);
    });
    
    this.progressPoint.addEventListener('mousedown', (e) => {
      handleFirstInteraction();
      this.startDragging(e);
    });

    this.forwardSeek.addEventListener('click', () => this.seekRelative(10));
    this.backwardSeek.addEventListener('click', () => this.seekRelative(-10));
    
    // Add volume control (you'll need to implement a volume slider in your HTML)
    const volumeSlider = this.controlBar.querySelector('input.volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
      // Set initial slider value
      volumeSlider.value = this.volume * 100;
    }
  }

  updateVolumeSlider() {
    const volumeSlider = this.controlBar.querySelector('input.volume-slider');
    if (volumeSlider) {
      volumeSlider.value = this.volume * 100;
    }
  }

  seekRelative(seconds) {
    if (!this.audioBuffer) return;

    let newTime = (this.isPlaying ? this.audioContext.currentTime - this.startedAt : this.pausedAt) + seconds;
    newTime = Math.max(0, Math.min(newTime, this.audioBuffer.duration));

    if (this.isPlaying) {
      this.stop();
      this.pausedAt = newTime;
      this.play();
    } else {
      this.pausedAt = newTime;
      this.updateProgress();
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
    this.updateVolumeIndicator();
    this.updateVolumeSlider();
  }

  updateVolumeIndicator() {
    this.volumeIndicator.textContent = `${Math.round(this.volume * 100)}%`;
  }

  play() {
    if (!this.audioBuffer) return;

    this.initAudioContext();

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.connect(this.audioContext.destination);

    const offset = this.pausedAt;
    this.sourceNode.start(0, offset);
    this.startedAt = this.audioContext.currentTime - offset;
    this.pausedAt = 0;
    this.isPlaying = true;
    this.isFinished = false;

    this.sourceNode.onended = () => {
      if (this.audioContext.currentTime - this.startedAt >= this.audioBuffer.duration) {
        this.isFinished = true;
        this.isPlaying = false;
        this.updatePlayPauseButton();
        this.updateProgress();
      }
    };

    this.updatePlayPauseButton();
    this.startProgressUpdate();
    this.setVolume(this.volume); // Set initial volume
  }

  pause() {
    if (!this.isPlaying) return;

    const elapsed = this.audioContext.currentTime - this.startedAt;
    this.stop();
    this.pausedAt = elapsed;

    this.updatePlayPauseButton();
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  seek(e) {
    if (!this.audioBuffer) return;

    const rect = this.progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * this.audioBuffer.duration;

    this.pausedAt = seekTime;

    if (this.isPlaying) {
      this.stop();
      this.play();
    } else {
      this.updateProgress();
    }
  }

  startDragging(e) {
    const handleMouseMove = (moveEvent) => {
      this.seek(moveEvent);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  updateProgress() {
    if (!this.audioBuffer) return;

    let elapsed = this.isPlaying
      ? this.audioContext.currentTime - this.startedAt
      : this.pausedAt;
    
    if (elapsed >= this.audioBuffer.duration) {
      elapsed = this.audioBuffer.duration;
      if (this.isPlaying) {
        this.isFinished = true;
        this.isPlaying = false;
        this.updatePlayPauseButton();
      }
    }

    const percentage = (elapsed / this.audioBuffer.duration) * 100;

    this.progressBar.style.setProperty('--percentage', percentage);
    this.currentTimeSpan.textContent = this.formatTime(elapsed);
  }

  updatePlayPauseButton() {
    if (this.isLoading) {
      this.playPauseButton.innerHTML = this.loadIcon;
      this.loadingIconStyle.textContent = /*css*/`
        .play-pause svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
    } else {
      this.loadingIconStyle.textContent = '';
      this.playPauseButton.innerHTML = this.isPlaying ? this.pauseIcon : this.playIcon;
    }
  }

  startProgressUpdate() {
    if (!this.isPlaying) return;
  
    const update = () => {
      this.updateProgress();
      if (this.isPlaying && !this.isFinished) {
        requestAnimationFrame(update);
      }
    };
  
    requestAnimationFrame(update);
  }

  updateProgress() {
    if (!this.audioBuffer) return;

    const elapsed = this.isPlaying
      ? this.audioContext.currentTime - this.startedAt
      : this.pausedAt;
    const percentage = (elapsed / this.audioBuffer.duration) * 100;

    this.progressBar.style.setProperty('--percentage', percentage);
    this.currentTimeSpan.textContent = this.formatTime(elapsed);
  }

  updateDuration() {
    if (!this.audioBuffer) return;
    this.allTimeSpan.textContent = this.formatTime(this.audioBuffer.duration);
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Usage
const controlBar = document.querySelector('.control-bar');
const player = new AudioPlayer('/music/kota.mp3', controlBar);