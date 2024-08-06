export default class LyricsManager {
  constructor(lyricsContainer, audioPlayer) {
    this.lyricsContainer = lyricsContainer;
    this.audioPlayer = audioPlayer;
    this.lyrics = [];
    this.currentLineIndex = -1;
  }

  async loadLyrics(path, format = 'lrc') {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      
      if (format === 'srt') {
        this.parseSRT(content);
      } else if (format === 'lrc') {
        this.parseLRC(content);
      } else {
        throw new Error('Unsupported lyrics format');
      }

      this.renderLyrics();
    } catch (error) {
      console.error('Error loading lyrics:', error);
      this.lyricsContainer.innerHTML = '<p>Error loading lyrics</p>';
    }
  }

  parseSRT(srtContent) {
    const srtLines = srtContent.trim().split('\n\n');
    this.lyrics = srtLines.map(block => {
      const [, timing, ...textLines] = block.split('\n');
      const [start] = timing.split(' --> ');
      return {
        time: this.parseTime(start),
        text: textLines.join(' ')
      };
    });
  }

  parseLRC(lrcContent) {
    const lines = lrcContent.trim().split('\n');
    this.lyrics = lines
      .map(line => {
        const match = line.match(/\[(\d{2}:\d{2}.\d{2})\](.*)/);
        if (match) {
          return {
            time: this.parseTime(match[1]),
            text: match[2].trim()
          };
        }
        return null;
      })
      .filter(line => line !== null);
  }

  parseTime(timeString) {
    const [minutes, secondsAndMs] = timeString.split(':');
    const [seconds, milliseconds] = secondsAndMs.split('.');
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
  }

  renderLyrics() {
    this.lyricsContainer.innerHTML = '';
    this.lyrics.forEach((line, index) => {
      const span = document.createElement('span');
      span.textContent = line.text;
      span.classList.add('line');
      if (index === 0) span.classList.add('next');
      this.lyricsContainer.appendChild(span);
    });
  }

  sync(currentTime) {
    // console.log('Syncing lyrics at time:', currentTime); // Debug log
    const newLineIndex = this.lyrics.findIndex(
      (line, index) => currentTime >= line.time && 
        (index === this.lyrics.length - 1 || currentTime < this.lyrics[index + 1].time)
    );

    if (newLineIndex !== this.currentLineIndex) {
      // console.log('Updating to line index:', newLineIndex); // Debug log
      this.updateLyricsDisplay(newLineIndex);
      this.currentLineIndex = newLineIndex;
    }
  }

  updateLyricsDisplay(currentIndex) {
    const lines = this.lyricsContainer.querySelectorAll('.line');
    lines.forEach((line, index) => {
      line.classList.remove('current', 'next');
      if (index === currentIndex) {
        line.classList.add('current');
      } else if (index === currentIndex + 1) {
        line.classList.add('next');
      }
    });

    if (currentIndex >= 0) {
      lines[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}