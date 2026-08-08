// ui.js - Language Generator UI Controller

const uiState = {
  activePresetId: "elven",
  config: null
};

function clonePreset(preset) {
  return JSON.parse(JSON.stringify(preset));
}

// Option labels for selects
const WORD_ORDER_OPTIONS = [
  { value: "svo", label: "SVO — subject–verb–object" },
  { value: "sov", label: "SOV — subject–object–verb" },
  { value: "vso", label: "VSO — verb–subject–object" },
  { value: "osv", label: "OSV — object–subject–verb" },
  { value: "ovs", label: "OVS — object–verb–subject" }
];

const WRITING_SYSTEM_OPTIONS = [
  { value: "alphabet", label: "Alphabet" },
  { value: "abjad", label: "Abjad" },
  { value: "abugida", label: "Abugida" },
  { value: "featural", label: "Featural" }
];

const SCRIPT_DIRECTION_OPTIONS = [
  { value: "ltr", label: "Left → Right" },
  { value: "rtl", label: "Right → Left" },
  { value: "ttb", label: "Top → Bottom" },
  { value: "btt", label: "Bottom → Top" }
];

const SYLLABLE_PATTERN_OPTIONS = [
  { value: "cv", label: "CV" },
  { value: "cvc", label: "CVC" },
  { value: "cv-cvc", label: "CV / CVC" },
  { value: "ccvc", label: "CCVC" },
  { value: "cvxl", label: "CVXL" },
  { value: "csv", label: "CSV" },
  { value: "csv-cvv", label: "CSV / CVV" },
  { value: "cxl", label: "CXL" },
  { value: "c-lv", label: "C–LV" }
];

// DOM references
const dom = {
  presetButtons: document.getElementById("preset-buttons"),
  wordOrderSelect: document.getElementById("word-order-select"),
  syllablePatternSelect: document.getElementById("syllable-pattern-select"),
  maxSyllablesSelect: document.getElementById("max-syllables-select"),
  consonantInput: document.getElementById("consonants-input"),
  vowelInput: document.getElementById("vowels-input"),
  writingSystemSelect: document.getElementById("writing-system-select"),
  scriptDirectionSelect: document.getElementById("script-direction-select"),
  resetToPresetButton: document.getElementById("reset-to-preset"),
  sendToGeneratorButton: document.getElementById("send-to-generator"),
  rerollLexiconButton: document.getElementById("reroll-lexicon"),
  rerollSentencesButton: document.getElementById("reroll-sentences"),
  languageName: document.getElementById("language-name"),
  languageTagline: document.getElementById("language-tagline"),
  metaPhonology: document.getElementById("meta-phonology"),
  metaMorphology: document.getElementById("meta-morphology"),
  metaLexicon: document.getElementById("meta-lexicon"),
  metaWriting: document.getElementById("meta-writing")
};

function splitPhonemeString(str) {
  if (!str) return [];
  return str.trim().split(/\s+/).filter(function (p) { return p.length > 0; });
}

function refreshSummary() {
  if (!uiState.config) return;
  
  const cfg = uiState.config;
  
  // Phonology
  if (dom.metaPhonology) {
    const consonantList = Array.isArray(cfg.phonology?.consonants) 
      ? cfg.phonology.consonants.join(" ")
      : cfg.phonology?.consonants || "";
    const vowelList = Array.isArray(cfg.phonology?.vowels)
      ? cfg.phonology.vowels.join(" ")
      : cfg.phonology?.vowels || "";
    
    dom.metaPhonology.innerHTML = [
      `<div class="meta-line">${cfg.grammar?.wordOrder || "svo"} — verb–subject–object</div>`,
      `<div class="meta-line">Syllables: ${cfg.grammar?.syllablePattern || "cvc"}</div>`,
      `<div class="meta-line">max syllables per word: ${cfg.grammar?.maxSyllables || 4}.</div>`
    ].join("");
  }

  // Morphology
  if (dom.metaMorphology) {
    dom.metaMorphology.innerHTML = [
      `<div class="meta-line">nouns: rich,</div>`,
      `<div class="meta-line">verbs: rich,</div>`,
      `<div class="meta-line">derivation: suffixing.</div>`
    ].join("");
  }

  // Lexicon
  if (dom.metaLexicon) {
    dom.metaLexicon.innerHTML = [
      `<div class="meta-line">size: medium,</div>`,
      `<div class="meta-line">proper names: rich,</div>`,
      `<div class="meta-line">etymology: layered.</div>`
    ].join("");
  }

  // Writing
  if (dom.metaWriting) {
    const scriptText = cfg.writing?.system || "alphabet";
    const dirText = {
      "ltr": "left → right",
      "rtl": "right → left",
      "ttb": "top → bottom",
      "btt": "bottom → top"
    }[cfg.writing?.direction] || "left → right";
    
    dom.metaWriting.innerHTML = [
      `<div class="meta-line">${scriptText}: symbols represent individual sounds.</div>`,
      `<div class="meta-line">direction: ${dirText}.</div>`
    ].join("");
  }
}

function initializeUI() {
  // Populate dropdowns
  if (dom.wordOrderSelect) {
    dom.wordOrderSelect.innerHTML = WORD_ORDER_OPTIONS.map(function (opt) {
      return `<option value="${opt.value}">${opt.label}</option>`;
    }).join("");
  }

  if (dom.writingSystemSelect) {
    dom.writingSystemSelect.innerHTML = WRITING_SYSTEM_OPTIONS.map(function (opt) {
      return `<option value="${opt.value}">${opt.label}</option>`;
    }).join("");
  }

  if (dom.scriptDirectionSelect) {
    dom.scriptDirectionSelect.innerHTML = SCRIPT_DIRECTION_OPTIONS.map(function (opt) {
      return `<option value="${opt.value}">${opt.label}</option>`;
    }).join("");
  }

  if (dom.syllablePatternSelect) {
    dom.syllablePatternSelect.innerHTML = SYLLABLE_PATTERN_OPTIONS.map(function (opt) {
      return `<option value="${opt.value}">${opt.label}</option>`;
    }).join("");
  }

  if (dom.maxSyllablesSelect) {
    dom.maxSyllablesSelect.innerHTML = [1, 2, 3, 4, 5, 6].map(function (n) {
      return `<option value="${n}">${n}</option>`;
    }).join("");
    dom.maxSyllablesSelect.value = "4";
  }

  // Load presets
  if (window.LANGUAGE_PRESETS && dom.presetButtons) {
    Object.keys(window.LANGUAGE_PRESETS).forEach(function (presetId) {
      const preset = window.LANGUAGE_PRESETS[presetId];
      const btn = document.createElement("button");
      btn.className = "preset-pill";
      if (presetId === uiState.activePresetId) {
        btn.classList.add("active");
      }
      btn.textContent = preset.name;
      btn.addEventListener("click", function () {
        loadPreset(presetId);
      });
      dom.presetButtons.appendChild(btn);
    });
  }

  // Event listeners
  if (dom.sendToGeneratorButton) {
    dom.sendToGeneratorButton.addEventListener("click", function () {
      const config = {
        grammar: {
          wordOrder: dom.wordOrderSelect.value || "svo",
          syllablePattern: dom.syllablePatternSelect.value || "cvc",
          maxSyllables: parseInt(dom.maxSyllablesSelect.value, 10) || 4
        },
        phonology: {
          consonants: splitPhonemeString(dom.consonantInput.value),
          vowels: splitPhonemeString(dom.vowelInput.value)
        },
        writing: {
          system: dom.writingSystemSelect.value || "alphabet",
          direction: dom.scriptDirectionSelect.value || "ltr"
        }
      };

      uiState.config = config;
      refreshSummary();

      if (window.LanguageGenerator && typeof window.LanguageGenerator.receiveConfig === "function") {
        window.LanguageGenerator.receiveConfig(config);
      }
    });
  }

  if (dom.rerollLexiconButton) {
    dom.rerollLexiconButton.addEventListener("click", function () {
      if (window.LanguageGenerator && typeof window.LanguageGenerator.rerollLexicon === "function") {
        window.LanguageGenerator.rerollLexicon();
      }
    });
  }

  if (dom.rerollSentencesButton) {
    dom.rerollSentencesButton.addEventListener("click", function () {
      if (window.LanguageGenerator && typeof window.LanguageGenerator.rerollSentences === "function") {
        window.LanguageGenerator.rerollSentences();
      }
    });
  }

  // Custom sentence translation
  const translateButton = document.getElementById("translate-sentence");
  const customInput = document.getElementById("custom-sentence-input");
  
  if (translateButton && customInput) {
    translateButton.addEventListener("click", function () {
      const englishSentence = customInput.value.trim();
      if (!englishSentence) {
        console.warn("Please enter a sentence to translate");
        return;
      }
      
      if (window.LanguageGenerator && typeof window.LanguageGenerator.translateSentence === "function") {
        window.LanguageGenerator.translateSentence(englishSentence);
      } else {
        console.warn("Translation function not available");
      }
    });
    
    // Allow Ctrl+Enter to trigger translation
    customInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.ctrlKey) {
        translateButton.click();
      }
    });
  }

  // Custom word generation using alphabet mapping
  const generateWordButton = document.getElementById("generate-custom-word");
  const customWordInput = document.getElementById("custom-word-english");
  
  if (generateWordButton && customWordInput) {
    generateWordButton.addEventListener("click", function () {
      const englishWord = customWordInput.value.trim();
      if (!englishWord) {
        console.warn("Please enter a word");
        return;
      }
      
      if (window.LanguageGenerator && typeof window.LanguageGenerator.generateCustomWord === "function") {
        const conlangWord = window.LanguageGenerator.generateCustomWord(englishWord);
        window.LanguageGenerator.renderCustomWordOutput(englishWord, conlangWord);
      } else {
        console.warn("Custom word generation not available");
      }
    });
    
    // Allow Enter to trigger generation
    customWordInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        generateWordButton.click();
      }
    });
  }
}

function loadPreset(presetId) {
  if (!window.LANGUAGE_PRESETS || !window.LANGUAGE_PRESETS[presetId]) {
    console.error("Preset not found:", presetId);
    return;
  }

  uiState.activePresetId = presetId;
  const preset = clonePreset(window.LANGUAGE_PRESETS[presetId]);

  // Update UI with preset values
  if (dom.languageName) dom.languageName.textContent = preset.name;
  if (dom.languageTagline) dom.languageTagline.textContent = preset.description;
  if (dom.wordOrderSelect) dom.wordOrderSelect.value = preset.grammar.wordOrder;
  if (dom.syllablePatternSelect) dom.syllablePatternSelect.value = preset.grammar.syllablePattern;
  if (dom.maxSyllablesSelect) dom.maxSyllablesSelect.value = preset.grammar.maxSyllables;
  
  const consonantStr = Array.isArray(preset.phonology.consonants) 
    ? preset.phonology.consonants.join(" ")
    : preset.phonology.consonants;
  const vowelStr = Array.isArray(preset.phonology.vowels)
    ? preset.phonology.vowels.join(" ")
    : preset.phonology.vowels;
    
  if (dom.consonantInput) dom.consonantInput.value = consonantStr;
  if (dom.vowelInput) dom.vowelInput.value = vowelStr;
  if (dom.writingSystemSelect) dom.writingSystemSelect.value = preset.writing.system;
  if (dom.scriptDirectionSelect) dom.scriptDirectionSelect.value = preset.writing.direction;

  uiState.config = {
    grammar: preset.grammar,
    phonology: {
      consonants: Array.isArray(preset.phonology.consonants) 
        ? preset.phonology.consonants 
        : splitPhonemeString(preset.phonology.consonants),
      vowels: Array.isArray(preset.phonology.vowels)
        ? preset.phonology.vowels
        : splitPhonemeString(preset.phonology.vowels),
      syllablePattern: preset.phonology.syllablePreset || "cvc",
      maxSyllables: preset.phonology.maxSyllables || 4
    },
    writing: preset.writing
  };

  refreshSummary();

  // Update active preset button
  document.querySelectorAll(".preset-pill").forEach(function (btn) {
    btn.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

  // Send config to generator
  if (window.LanguageGenerator && typeof window.LanguageGenerator.receiveConfig === "function") {
    window.LanguageGenerator.receiveConfig(uiState.config);
  }
}

// Tooltip information database
const TOOLTIP_INFO = {
  "word-order": {
    title: "Word Order",
    content: `
      <p>Word order defines how subject (S), verb (V), and object (O) are arranged in sentences.</p>
      <h3>Common Orders:</h3>
      <ul>
        <li><code>SVO</code> — Subject-Verb-Object (e.g., "hunter sees wolf")</li>
        <li><code>SOV</code> — Subject-Object-Verb (e.g., "hunter wolf sees")</li>
        <li><code>VSO</code> — Verb-Subject-Object (e.g., "sees hunter wolf")</li>
        <li><code>OSV</code> — Object-Subject-Verb (e.g., "wolf hunter sees")</li>
        <li><code>OVS</code> — Object-Verb-Subject (e.g., "wolf sees hunter")</li>
      </ul>
      <p><strong>Effect:</strong> Changes how your language structures basic sentences.</p>
    `
  },
  "syllable-pattern": {
    title: "Syllable Pattern",
    content: `
      <p>Syllable patterns define the structure of individual syllables in your language.</p>
      <h3>Pattern Components:</h3>
      <ul>
        <li><code>C</code> = Consonant</li>
        <li><code>V</code> = Vowel</li>
        <li><code>X</code> = Consonant or glide (flexible)</li>
        <li><code>L</code> = Liquid/Approximant (r, l)</li>
        <li><code>S</code> = Sibilant (s, z, sh)</li>
      </ul>
      <h3>Examples:</h3>
      <ul>
        <li><code>CV</code> = simple (ba, ki, mo)</li>
        <li><code>CVC</code> = balanced (bat, sun, ten)</li>
        <li><code>CCVC</code> = complex clusters (stra, pli)</li>
      </ul>
    `
  },
  "max-syllables": {
    title: "Maximum Syllables Per Word",
    content: `
      <p>Controls how long words can be in your language.</p>
      <h3>Effects:</h3>
      <ul>
        <li><code>1-2</code> = Isolating feel (short, punchy words)</li>
        <li><code>3-4</code> = Balanced complexity</li>
        <li><code>5+</code> = Complex, flowing language</li>
      </ul>
      <p><strong>Example:</strong> Setting to 2 creates words like "bat", "sun", "ki". Setting to 4 creates "sulaton", "brimoka".</p>
    `
  },
  "consonants": {
    title: "Consonant Inventory",
    content: `
      <p>Enter the consonant sounds available in your language, separated by spaces.</p>
      <h3>Tips:</h3>
      <ul>
        <li>Can use single letters (b, d, f) or multi-character clusters (ch, sh, th)</li>
        <li>Include IPA symbols for more exotic sounds (ʃ, ʒ, ŋ, θ, ð)</li>
        <li>More consonants = more phonetic variety</li>
        <li>Fewer consonants = simpler, more regular language</li>
      </ul>
      <p><strong>Example:</strong> "b d f g h k l m n p r s t" for a simple inventory.</p>
    `
  },
  "vowels": {
    title: "Vowel Inventory",
    content: `
      <p>Enter the vowel sounds available in your language, separated by spaces.</p>
      <h3>Tips:</h3>
      <ul>
        <li>Basic: a, e, i, o, u</li>
        <li>Can add long vowels (aa, ee, ii, oo, uu)</li>
        <li>Can add diphthongs (ai, au, oi, ae)</li>
        <li>Can use IPA symbols (æ, ø, ɔ, ə, ʊ)</li>
      </ul>
      <p><strong>Effect:</strong> Affects the "color" and flow of your language's pronunciation.</p>
    `
  },
  "writing-system": {
    title: "Writing System Type",
    content: `
      <p>Defines how sounds are represented in writing.</p>
      <h3>Systems:</h3>
      <ul>
        <li><code>Alphabet</code> — One symbol per sound (e.g., English)</li>
        <li><code>Abjad</code> — Mostly consonants written (e.g., Arabic)</li>
        <li><code>Abugida</code> — Consonant+vowel pairs (e.g., Devanagari)</li>
        <li><code>Featural</code> — Each symbol shows pronunciation features</li>
      </ul>
      <p><strong>Note:</strong> Currently displays alphabet mappings. Other systems shown for reference.</p>
    `
  },
  "script-direction": {
    title: "Script Direction",
    content: `
      <p>Determines how text flows on the page.</p>
      <h3>Directions:</h3>
      <ul>
        <li><code>Left → Right (LTR)</code> — Standard (English, most European)</li>
        <li><code>Right → Left (RTL)</code> — Reversed (Arabic, Hebrew)</li>
        <li><code>Top → Bottom (TTB)</code> — Vertical top-down (Classic Chinese)</li>
        <li><code>Bottom → Top (BTT)</code> — Vertical reverse (Rare)</li>
      </ul>
      <p><strong>Effect:</strong> Changes how sample sentences and words are displayed.</p>
    `
  },
  "translate-sentence": {
    title: "Translate Your Own Sentence",
    content: `
      <p>Convert English sentences into your constructed language.</p>
      <h3>How It Works:</h3>
      <ul>
        <li>Type an English sentence (e.g., "the hunter sees the wolf")</li>
        <li>The generator looks up each word in the current lexicon</li>
        <li>If a word isn't found, it creates a new one</li>
        <li>All new words are saved to your custom dictionary</li>
      </ul>
      <p><strong>Shortcut:</strong> Press <code>Ctrl+Enter</code> to translate quickly.</p>
    `
  },
  "custom-word": {
    title: "Create Custom Word",
    content: `
      <p>Generate conlang words based on English letters using the alphabet mapping.</p>
      <h3>How It Works:</h3>
      <ul>
        <li>Enter an English word (e.g., "hello")</li>
        <li>Each letter maps to a phoneme from your language</li>
        <li>Double-letter combinations (ch, th, sh, ai) are supported</li>
        <li>Unmapped characters are skipped</li>
      </ul>
      <p><strong>Example:</strong> "hello" might become "selmo" depending on your alphabet.</p>
      <p><strong>Shortcut:</strong> Press <code>Enter</code> to generate.</p>
    `
  },
  "reroll-lexicon": {
    title: "Reroll Lexicon",
    content: `
      <p>Generate a completely new set of words for all categories.</p>
      <h3>What Gets Regenerated:</h3>
      <ul>
        <li>All nouns, verbs, descriptors, prepositions, pronouns, conjunctions</li>
        <li>Sample sentences with new word combinations</li>
        <li>Alphabet mapping display refreshes</li>
      </ul>
      <p><strong>Note:</strong> Your custom translations stay in the dictionary.</p>
    `
  },
  "reroll-sentences": {
    title: "Reroll Sentences",
    content: `
      <p>Generate new sample sentences using the current lexicon.</p>
      <h3>Features:</h3>
      <ul>
        <li>Creates 3 new random sentences</li>
        <li>Respects your language's word order</li>
        <li>Uses different words from your lexicon each time</li>
        <li>Follows your script direction setting</li>
      </ul>
      <p><strong>Use For:</strong> Exploring different combinations and getting inspiration.</p>
    `
  },
  "alphabet-input": {
    title: "Alphabet Mapping Display",
    content: `
      <p>Shows how English letters map to your language's phonemes.</p>
      <h3>How to Read It:</h3>
      <ul>
        <li>Top row (uppercase) = English letter/combination</li>
        <li>Bottom row = Corresponding phoneme from your inventory</li>
        <li><code>—</code> (dash) = No phoneme available for that letter</li>
      </ul>
      <h3>Sections:</h3>
      <ul>
        <li><code>Consonants:</code> b, c, d, f...ch, ng, sh, th, zh</li>
        <li><code>Vowels:</code> a, e, i, o, u...aa, ee, oo, ai, au, etc.</li>
      </ul>
      <p><strong>Use For:</strong> Reference when creating custom words.</p>
    `
  }
};

function showTooltip(tooltipId) {
  const info = TOOLTIP_INFO[tooltipId];
  if (!info) return;

  const overlay = document.getElementById("tooltip-overlay");
  const title = document.getElementById("tooltip-title");
  const content = document.getElementById("tooltip-content");

  title.textContent = info.title;
  content.innerHTML = info.content;

  overlay.classList.add("active");
}

function closeTooltip() {
  const overlay = document.getElementById("tooltip-overlay");
  overlay.classList.remove("active");
}

// Initialize UI when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM ready, initializing UI...");
  initializeUI();
  
  // Set up tooltip system
  setupTooltips();
  
  // Initialize generator
  if (window.LanguageGenerator && typeof window.LanguageGenerator.init === "function") {
    console.log("Initializing generator...");
    window.LanguageGenerator.init();
  } else {
    console.error("LanguageGenerator not found!");
  }
  
  // Load default preset
  if (window.LANGUAGE_PRESETS) {
    console.log("LANGUAGE_PRESETS found:", Object.keys(window.LANGUAGE_PRESETS));
    if (window.LANGUAGE_PRESETS["elven"]) {
      console.log("Loading elven preset...");
      loadPreset("elven");
    }
  } else {
    console.error("LANGUAGE_PRESETS not found!");
  }
});

function setupTooltips() {
  // Add click listeners to all info buttons
  document.querySelectorAll(".info-button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const tooltipId = btn.getAttribute("data-info");
      showTooltip(tooltipId);
    });
  });

  // Add keyboard support (Enter/Space to open)
  document.querySelectorAll(".info-button").forEach(function (btn) {
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const tooltipId = btn.getAttribute("data-info");
        showTooltip(tooltipId);
      }
    });
  });

  // Close tooltip on close button
  const tooltipClose = document.querySelector(".tooltip-close");
  if (tooltipClose) {
    tooltipClose.addEventListener("click", closeTooltip);
  }

  // Close tooltip on overlay click (outside modal)
  const tooltipOverlay = document.getElementById("tooltip-overlay");
  if (tooltipOverlay) {
    tooltipOverlay.addEventListener("click", function (e) {
      if (e.target === tooltipOverlay) {
        closeTooltip();
      }
    });
  }

  // Close tooltip on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeTooltip();
    }
  });
}
