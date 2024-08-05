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

    this.playIcon = /*html*/`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" color="currentColor">
        <path d="M13.9405 6.337C15.5735 7.26468 16.8567 7.99369 17.7709 8.66148C18.6913 9.33386 19.3721 10.0366 19.6159 10.9632C19.7947 11.6426 19.7947 12.3574 19.6159 13.0368C19.3721 13.9634 18.6913 14.6661 17.7709 15.3385C16.8567 16.0063 15.5735 16.7353 13.9406 17.663L13.9406 17.663C12.3632 18.5591 11.033 19.3148 10.0232 19.7444C9.0053 20.1773 8.07729 20.3968 7.17536 20.1412C6.51252 19.9533 5.90941 19.5968 5.42356 19.1066C4.76419 18.4414 4.49951 17.5219 4.37429 16.4154C4.24998 15.3169 4.24999 13.879 4.25 12.0501V12.0501V11.9499V11.9499C4.24999 10.121 4.24998 8.68309 4.37429 7.58464C4.49951 6.4781 4.76419 5.55861 5.42356 4.89335C5.90941 4.40317 6.51252 4.04666 7.17536 3.85883C8.07729 3.60325 9.0053 3.82269 10.0232 4.25565C11.033 4.68516 12.3632 5.44084 13.9405 6.337Z" fill="currentColor"></path>
      </svg>
    `;

    this.pauseIcon = /*html*/`
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" color="currentColor">
        <path d="M16.9506 3.25L17 3.25L17.0494 3.25H17.0494C17.7143 3.24996 18.2871 3.24993 18.7458 3.31161C19.2375 3.37771 19.7087 3.52677 20.091 3.90901C20.4732 4.29126 20.6223 4.76252 20.6884 5.25416C20.7501 5.71291 20.75 6.28577 20.75 6.95064V17.0494C20.75 17.7142 20.7501 18.2871 20.6884 18.7458C20.6223 19.2375 20.4732 19.7087 20.091 20.091C19.7087 20.4732 19.2375 20.6223 18.7458 20.6884C18.2871 20.7501 17.7142 20.75 17.0494 20.75H16.9506C16.2858 20.75 15.7129 20.7501 15.2542 20.6884C14.7625 20.6223 14.2913 20.4732 13.909 20.091C13.5268 19.7087 13.3777 19.2375 13.3116 18.7458C13.2499 18.2871 13.25 17.7143 13.25 17.0494V17.0494V6.95063V6.95058C13.25 6.28574 13.2499 5.71289 13.3116 5.25416C13.3777 4.76252 13.5268 4.29126 13.909 3.90901C14.2913 3.52677 14.7625 3.37771 15.2542 3.31161C15.7129 3.24993 16.2857 3.24996 16.9506 3.25H16.9506Z" fill="currentColor"></path>
        <path d="M6.95072 3.25L7.00009 3.25L7.04947 3.25H7.04952C7.71436 3.24996 8.28721 3.24993 8.74594 3.31161C9.23758 3.37771 9.70884 3.52677 10.0911 3.90901C10.4733 4.29126 10.6224 4.76252 10.6885 5.25416C10.7502 5.71291 10.7501 6.28577 10.7501 6.95064V17.0494C10.7501 17.7142 10.7502 18.2871 10.6885 18.7458C10.6224 19.2375 10.4733 19.7087 10.0911 20.091C9.70884 20.4732 9.23758 20.6223 8.74594 20.6884C8.28719 20.7501 7.71433 20.75 7.04946 20.75H6.95073C6.28586 20.75 5.713 20.7501 5.25425 20.6884C4.76261 20.6223 4.29135 20.4732 3.9091 20.091C3.52686 19.7087 3.3778 19.2375 3.3117 18.7458C3.25003 18.2871 3.25006 17.7143 3.25009 17.0494V17.0494V6.95063V6.95058C3.25006 6.28574 3.25003 5.71289 3.3117 5.25416C3.3778 4.76252 3.52686 4.29126 3.9091 3.90901C4.29135 3.52677 4.76261 3.37771 5.25425 3.31161C5.71298 3.24993 6.28583 3.24996 6.95067 3.25H6.95072Z" fill="currentColor"></path>
      </svg>
    `;

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