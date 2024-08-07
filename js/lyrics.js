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
    const dots = /*html*/`
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `
    this.lyricsContainer.innerHTML = '';
    this.lyrics.forEach((line, index) => {
      // check if the line is empty or is --- (add dots)
      if (line.text === '' || line.text === '---') {
        const span = document.createElement('span');
        span.innerHTML = dots;
        span.classList.add('line');
        span.classList.add('dots');
        this.lyricsContainer.appendChild(span);
        // span.addEventListener('click', () => this.seekToLine(index));
        return;
      }

      const span = document.createElement('span');
      span.textContent = line.text;
      span.classList.add('line');
      span.addEventListener('click', () => this.seekToLine(index));
      this.lyricsContainer.appendChild(span);
    });
  }

  seekToLine(index) {
    const time = this.lyrics[index].time;
    this.audioPlayer.seekTo(time);
  }

  sync(currentTime) {
    const newLineIndex = this.lyrics.findIndex(
      (line, index) => currentTime >= line.time && 
        (index === this.lyrics.length - 1 || currentTime < this.lyrics[index + 1].time)
    );

    if (newLineIndex !== this.currentLineIndex) {
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
      this.smoothScrollToLine(lines[currentIndex]);
    }
  }

  smoothScrollToLine(element) {
    const containerHeight = this.lyricsContainer.clientHeight;
    const elementTop = element.offsetTop;
    const targetScrollTop = elementTop - containerHeight / 2 + element.clientHeight / 2;

    this.lyricsContainer.style.scrollBehavior = 'smooth';
    this.lyricsContainer.scrollTop = targetScrollTop + 50;

    // Reset scroll behavior after animation
    setTimeout(() => {
      this.lyricsContainer.style.scrollBehavior = 'auto';
    }, 1000);
  }
}