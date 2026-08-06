/* Procedural Language Generator — in-browser conlang toy */
(function () {
  const root = document.getElementById('lang-lab');
  if (!root) return;

  const complexity = root.querySelector('#complexity');
  const vowelRatio = root.querySelector('#vowel-ratio');
  const theme = root.querySelector('#theme');
  const complexityVal = root.querySelector('#complexity-val');
  const vowelVal = root.querySelector('#vowel-val');
  const themeVal = root.querySelector('#theme-val');
  const generateBtn = root.querySelector('#generate-words');
  const output = root.querySelector('#word-output');

  const vowelsByTheme = {
    0: ['a', 'e', 'i', 'o', 'u'],
    1: ['a', 'e', 'i', 'o', 'u', 'ae', 'ei'],
    2: ['a', 'e', 'i', 'o', 'u', 'y', 'ae', 'ou', 'ia'],
  };

  const consonantsByTheme = {
    0: ['b', 'd', 'f', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z'],
    1: ['br', 'cl', 'dr', 'th', 'sh', 'kh', 'vr', 'n', 'l', 's', 't', 'm', 'q', 'x'],
    2: ['zh', 'kx', 'qr', 'tl', 'sk', 'vr', 'ny', 'xh', 'ps', 'gzh', 'kr', 'th'],
  };

  const meanings = [
    'the soft edge of night',
    'a machine that remembers rain',
    'forbidden orchard code',
    'signal between two stars',
    'glass that dreams of oceans',
    'ritual for broken clocks',
    'cartographer of lost rooms',
    'ember that refuses gravity',
    'archive of unfinished games',
    'whisper encoded in static',
    'bridge made of decisions',
    'glyph for unfinished longing',
    'hunter of recursive echoes',
    'seed of a parallel meadow',
    'crown worn by silent AIs',
  ];

  function themeKey() {
    return Math.min(2, Math.max(0, Math.round(Number(theme.value))));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function updateLabels() {
    complexityVal.textContent = complexity.value;
    vowelVal.textContent = `${vowelRatio.value}%`;
    const labels = ['Earthlike', 'Fantasy', 'Alien'];
    themeVal.textContent = labels[themeKey()];
  }

  function syllable(vowelChance, themeIdx) {
    const vowels = vowelsByTheme[themeIdx];
    const consonants = consonantsByTheme[themeIdx];
    const useVowelLead = Math.random() * 100 < vowelChance * 0.35;
    if (useVowelLead) return pick(vowels) + (Math.random() > 0.55 ? pick(consonants) : '');
    const onset = pick(consonants);
    const nucleus = pick(vowels);
    const coda = Math.random() * 100 < 100 - vowelChance ? pick(consonants) : '';
    return onset + nucleus + coda;
  }

  function makeWord() {
    const themeIdx = themeKey();
    const sylCount = Number(complexity.value);
    const vowelChance = Number(vowelRatio.value);
    let word = '';
    for (let i = 0; i < sylCount; i++) word += syllable(vowelChance, themeIdx);
    word = word.replace(/(.)\1{2,}/g, '$1$1');
    return word;
  }

  function toPhonetic(word) {
    return `/${word.replace(/ae/g, 'æ').replace(/zh/g, 'ʒ').replace(/kh/g, 'x').replace(/th/g, 'θ')}/`;
  }

  function renderWords() {
    const cards = Array.from({ length: 5 }, () => {
      const lexeme = makeWord();
      return {
        lexeme,
        phonetic: toPhonetic(lexeme),
        meaning: pick(meanings),
      };
    });

    output.innerHTML = cards
      .map(
        (w) => `
      <article class="word-card" title="Click to copy">
        <div class="lexeme">${w.lexeme}</div>
        <div class="phonetic">${w.phonetic}</div>
        <div class="meaning">“${w.meaning}”</div>
      </article>`
      )
      .join('');

    output.querySelectorAll('.word-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const text = card.querySelector('.lexeme')?.textContent || '';
        try {
          await navigator.clipboard.writeText(text);
          card.querySelector('.meaning').textContent = 'Copied to clipboard.';
        } catch {
          /* ignore */
        }
      });
    });
  }

  [complexity, vowelRatio, theme].forEach((el) => el.addEventListener('input', updateLabels));
  generateBtn.addEventListener('click', renderWords);
  updateLabels();
  renderWords();

  /* Lab tabs */
  const tabButtons = document.querySelectorAll('[data-lab-tab]');
  const tabPanels = document.querySelectorAll('[data-lab-panel]');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-lab-tab');
      tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
      tabPanels.forEach((p) => {
        p.hidden = p.getAttribute('data-lab-panel') !== id;
      });
    });
  });
})();
