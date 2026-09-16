(function () {
  const textInput = document.getElementById("textInput");
  const wpmInput = document.getElementById("wpmInput");
  const startBtn = document.getElementById("startBtn");

  const inputSection = document.getElementById("inputSection");
  const readerSection = document.getElementById("readerSection");

  const progressFill = document.getElementById("progressFill");
  const wordText = document.getElementById("wordText");
  const wordCounter = document.getElementById("wordCounter");

  const restartBtn = document.getElementById("restartBtn");
  const backBtn = document.getElementById("backBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const fwdBtn = document.getElementById("fwdBtn");
  const editBtn = document.getElementById("editBtn");

  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  const presetButtons = document.querySelectorAll(".preset-btn");

  let words = [];
  let currentIndex = 0;
  let wpm = 300;
  let playing = false;
  let timerId = null;

  function splitWords(text) {
    return text.trim().split(/\s+/).filter(Boolean);
  }

  function getPivotIndex(word) {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  }

  function renderWord(index) {
    const word = words[index];
    if (!word) {
      wordText.innerHTML = "&nbsp;";
      return;
    }
    const pivot = getPivotIndex(word);
    const before = word.slice(0, pivot);
    const pivotChar = word.charAt(pivot);
    const after = word.slice(pivot + 1);
    wordText.innerHTML =
      escapeHtml(before) +
      '<span class="pivot">' + escapeHtml(pivotChar) + "</span>" +
      escapeHtml(after);
    wordCounter.textContent = (index + 1) + " / " + words.length;
    progressFill.style.width = (((index + 1) / words.length) * 100) + "%";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function delayForWord(word) {
    const base = 60000 / wpm;
    let multiplier = 1;
    if (/[,;:]$/.test(word)) multiplier = 1.4;
    if (/[.!?]$/.test(word)) multiplier = 1.8;
    if (word.length > 8) multiplier += 0.2;
    return base * multiplier;
  }

  function scheduleNext() {
    clearTimeout(timerId);
    if (!playing) return;
    if (currentIndex >= words.length - 1) {
      pause();
      return;
    }
    const delay = delayForWord(words[currentIndex]);
    timerId = setTimeout(function () {
      currentIndex++;
      renderWord(currentIndex);
      scheduleNext();
    }, delay);
  }

  function play() {
    if (words.length === 0) return;
    if (currentIndex >= words.length - 1) currentIndex = 0;
    playing = true;
    playPauseBtn.innerHTML = "&#10074;&#10074;";
    scheduleNext();
  }

  function pause() {
    playing = false;
    clearTimeout(timerId);
    playPauseBtn.innerHTML = "&#9654;";
  }

  function togglePlayPause() {
    if (playing) {
      pause();
    } else {
      play();
    }
  }

  function jump(offset) {
    currentIndex = Math.min(Math.max(currentIndex + offset, 0), words.length - 1);
    renderWord(currentIndex);
    if (playing) scheduleNext();
  }

  function restart() {
    currentIndex = 0;
    renderWord(currentIndex);
    if (playing) scheduleNext();
  }

  function setWpm(value) {
    wpm = Math.min(Math.max(parseInt(value, 10) || 300, 60), 1000);
    speedSlider.value = wpm;
    speedValue.textContent = wpm;
    wpmInput.value = wpm;
  }

  startBtn.addEventListener("click", function () {
    words = splitWords(textInput.value);
    if (words.length === 0) {
      textInput.focus();
      return;
    }
    setWpm(wpmInput.value);
    currentIndex = 0;
    inputSection.hidden = true;
    readerSection.hidden = false;
    renderWord(currentIndex);
    play();
  });

  editBtn.addEventListener("click", function () {
    pause();
    readerSection.hidden = true;
    inputSection.hidden = false;
    textInput.focus();
  });

  playPauseBtn.addEventListener("click", togglePlayPause);
  restartBtn.addEventListener("click", restart);
  backBtn.addEventListener("click", function () { jump(-10); });
  fwdBtn.addEventListener("click", function () { jump(10); });

  speedSlider.addEventListener("input", function () {
    setWpm(speedSlider.value);
  });

  wpmInput.addEventListener("change", function () {
    setWpm(wpmInput.value);
  });

  presetButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setWpm(btn.dataset.wpm);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (readerSection.hidden) return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === "ArrowLeft") {
      jump(-10);
    } else if (e.code === "ArrowRight") {
      jump(10);
    }
  });
})();
