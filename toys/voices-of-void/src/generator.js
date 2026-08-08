// generator.js
// handles vocab loading, lexicon building, and sample sentences

(function () {
  const state = {
    config: null,
    vocab: null,
    sentenceBank: null,
    customLexicon: [],
    lexicon: {
      nouns: [],
      verbs: [],
      prepositions: [],
      articles: [],
      pronouns: [],
      conjunctions: [],
      descriptors: []
    }
  };

  // Helper functions (define early so they're available everywhere)
  function pickRandom(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getMorphChance(nounMorph, verbMorph) {
    if (nounMorph === "rich" || verbMorph === "rich") return 0.5;
    if (nounMorph === "moderate" || verbMorph === "moderate") return 0.25;
    return 0.1;
  }

  function init() {
    Promise.all([
      loadVocabulary(),
      loadSentenceBank()
    ])
      .then(function () {
        rebuildIfReady();
      })
      .catch(function (err) {
        console.error("failed to load data:", err);
      });
  }

  async function loadSentenceBank() {
    try {
      const res = await fetch("data/sentenceBank.json");
      if (!res.ok) throw new Error("Failed to load sentenceBank.json");
      state.sentenceBank = await res.json();
    } catch (err) {
      console.warn("Could not load sentenceBank.json, using fallback:", err.message);
      state.sentenceBank = {
        svo: ["the hunter see the wolf"],
        sov: ["the hunter the wolf see"],
        vso: ["see the hunter the wolf"],
        vos: ["see the wolf the hunter"],
        osv: ["the wolf the hunter see"],
        ovs: ["the wolf see the hunter"],
        free: ["in the forest the hunter see the wolf"]
      };
    }
  }

  function receiveConfig(cfg) {
    if (!cfg) {
      console.error("No config received");
      return;
    }
    state.config = cfg;
    console.log("Config received:", state.config);
    rebuildIfReady();
  }

  function rerollSentences() {
    if (!hasLexicon()) {
      console.error("Cannot reroll sentences: no lexicon");
      return;
    }
    renderSentences();
  }

  function rerollLexicon() {
    if (!state.vocab || !state.config) {
      console.error("Cannot reroll: vocab or config missing");
      return;
    }
    buildLexicon();
    renderLexicon();
    renderAlphabetMap();
    renderSentences();
  }

  function translateSentence(englishSentence) {
    const direction = state.config?.writing?.direction || "ltr";
    const container = document.getElementById("custom-sentence-output");
    if (!container) return;

    // Translate the sentence
    const conlang = translateTemplateToConlang(englishSentence);

    // Create and show the output card
    const card = document.createElement("div");
    card.className = "output-sentence-card";

    const conlangLine = document.createElement("div");
    conlangLine.className = "output-sent-conlang";
    conlangLine.textContent = conlang;
    applyDirectionStyle(conlangLine, direction);

    const englishLine = document.createElement("div");
    englishLine.className = "output-sent-english";
    englishLine.textContent = englishSentence;

    card.appendChild(conlangLine);
    card.appendChild(englishLine);
    container.innerHTML = "";
    container.appendChild(card);
    container.classList.add("active");
  }

  async function loadVocabulary() {
    try {
      const res = await fetch("data/vocabulary.json");
      if (!res.ok) throw new Error("Failed to load vocabulary.json");
      state.vocab = await res.json();
    } catch (err) {
      console.error("Could not load vocabulary.json:", err.message);
      state.vocab = {
        nouns: [],
        verbs: [],
        prepositions: [],
        articles: [],
        pronouns: [],
        conjunctions: [],
        descriptors: []
      };
    }
  }

  function rebuildIfReady() {
    if (!state.vocab || !state.config) {
      console.warn("rebuildIfReady: vocab or config missing", { vocab: !!state.vocab, config: !!state.config });
      return;
    }
    console.log("rebuildIfReady: building lexicon...");
    buildLexicon();
    console.log("rebuildIfReady: rendering lexicon...");
    renderLexicon();
    console.log("rebuildIfReady: rendering alphabet...");
    renderAlphabetMap();
    console.log("rebuildIfReady: rendering sentences...");
    renderSentences();
    console.log("rebuildIfReady: complete");
  }

  function hasLexicon() {
    return state.lexicon && 
           state.lexicon.nouns && 
           state.lexicon.nouns.length > 0;
  }

  function buildLexicon() {
    function buildEntries(list, pos) {
      return list.map(function (englishWord) {
        const conlangWord = generateWord(
          state.config.phonology,
          state.config.writing,
          state.config.grammar,
          state.config.lexicon
        );
        return {
          gloss: englishWord,
          native: conlangWord,
          pos: pos
        };
      });
    }

    state.lexicon.nouns = buildEntries(state.vocab.nouns || [], "noun");
    state.lexicon.verbs = buildEntries(state.vocab.verbs || [], "verb");
    state.lexicon.prepositions = buildEntries(state.vocab.prepositions || [], "preposition");
    state.lexicon.articles = buildEntries(state.vocab.articles || [], "article");
    state.lexicon.pronouns = buildEntries(state.vocab.pronouns || [], "pronoun");
    state.lexicon.conjunctions = buildEntries(state.vocab.conjunctions || [], "conjunction");
    state.lexicon.descriptors = buildEntries(state.vocab.descriptors || [], "descriptor");
  }

  function shouldBeProperName(pos, properNameSetting) {
    if (!properNameSetting || properNameSetting === "none") return false;
    if (properNameSetting === "light") return pos === "noun" && Math.random() < 0.15;
    if (properNameSetting === "rich") return pos === "noun" && Math.random() < 0.4;
    if (properNameSetting === "very rich") return (pos === "noun" || pos === "descriptor") && Math.random() < 0.6;
    return false;
  }



  function renderLexicon() {
    renderWordCategorySummary();

    // Render all word categories
    renderLexiconTable(state.lexicon.nouns, "lexicon-nouns-body");
    renderLexiconTable(state.lexicon.verbs, "lexicon-verbs-body");
    renderLexiconTable(state.lexicon.descriptors, "lexicon-descriptors-body");
    renderLexiconTable(state.lexicon.prepositions, "lexicon-prepositions-body");
    renderLexiconTable(state.lexicon.pronouns, "lexicon-pronouns-body");
    renderLexiconTable(state.lexicon.conjunctions, "lexicon-conjunctions-body");
    renderLexiconTable(state.lexicon.articles, "lexicon-articles-body");
  }

  function renderWordCategorySummary() {
    const el = document.getElementById("word-category-summary");
    if (!el) return;

    const summary = [
      `nouns: ${state.lexicon.nouns.length}`,
      `verbs: ${state.lexicon.verbs.length}`,
      `descriptors: ${state.lexicon.descriptors.length}`,
      `prepositions: ${state.lexicon.prepositions.length}`,
      `articles: ${state.lexicon.articles.length}`,
      `pronouns: ${state.lexicon.pronouns.length}`,
      `conjunctions: ${state.lexicon.conjunctions.length}`
    ];

    el.innerHTML = summary.map(function (line) {
      return `<div class="meta-line">${line}</div>`;
    }).join("");
  }

  function renderLexiconTable(entries, targetIds) {
    const ids = Array.isArray(targetIds) ? targetIds : [targetIds];

    let body = null;
    for (let i = 0; i < ids.length; i++) {
      body = document.getElementById(ids[i]);
      if (body) break;
    }
    if (!body) return;

    body.innerHTML = "";

    entries.forEach(function (entry) {
      const row = document.createElement("div");
      row.className = "lex-row";

      const nativeCol = document.createElement("div");
      nativeCol.className = "lex-col lex-col-native";
      nativeCol.textContent = entry.native;

      const glossCol = document.createElement("div");
      glossCol.className = "lex-col lex-col-gloss";
      glossCol.textContent = entry.gloss;

      row.appendChild(nativeCol);
      row.appendChild(glossCol);
      body.appendChild(row);
    });
  }

  function capitalizeWord(word) {
    if (!word || word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function renderSentences() {
    const container = document.getElementById("sentence-list");
    if (!container) {
      console.warn("sentence-list container not found");
      return;
    }

    container.innerHTML = "";
    if (!hasLexicon() || !state.sentenceBank) {
      console.warn("Cannot render sentences: no lexicon or sentenceBank");
      return;
    }

    const direction = state.config?.writing?.direction || "ltr";
    const wordOrder = state.config?.grammar?.wordOrder || "svo";
    
    // Add vertical-sentences class for top-to-bottom and bottom-to-top directions
    if (direction === "ttb" || direction === "btt") {
      container.classList.add("vertical-sentences");
    } else {
      container.classList.remove("vertical-sentences");
    }
    
    const sentences = [];
    for (let i = 0; i < 3; i++) {
      const sent = generateSentenceFromBank(wordOrder);
      if (sent) {
        sentences.push(sent);
      }
    }

    if (sentences.length === 0) {
      console.warn("No sentences generated");
      return;
    }

    sentences.forEach(function (s) {
      const card = document.createElement("article");
      card.className = "sentence-card";
      
      // Add vertical-mode class for top-to-bottom and bottom-to-top
      if (direction === "ttb" || direction === "btt") {
        card.classList.add("vertical-mode");
      }
      
      // Apply direction-specific styling
      applyDirectionStyle(card, direction);

      const line1 = document.createElement("div");
      line1.className = "sent-line sent-conlang";
      line1.textContent = s.conlang;
      applyDirectionStyle(line1, direction);

      const line2 = document.createElement("div");
      line2.className = "sent-line sent-english";
      line2.textContent = s.english;
      applyDirectionStyle(line2, direction);

      card.appendChild(line1);
      card.appendChild(line2);
      container.appendChild(card);
    });
  }

  function applyDirectionStyle(element, direction) {
    if (direction === "rtl") {
      element.style.direction = "rtl";
      element.style.textAlign = "right";
    } else if (direction === "ttb") {
      // Top-to-bottom: stack characters vertically
      element.style.writingMode = "vertical-rl";
      element.style.textOrientation = "upright";
      element.style.display = "flex";
      element.style.justifyContent = "flex-start";
    } else if (direction === "btt") {
      // Bottom-to-top: stack characters vertically in reverse
      element.style.writingMode = "vertical-lr";
      element.style.textOrientation = "upright";
      element.style.display = "flex";
      element.style.justifyContent = "flex-start";
    } else {
      // LTR (default)
      element.style.direction = "ltr";
      element.style.textAlign = "left";
    }
  }

  function wordOrderToSequence(order) {
    const orders = {
      "sov": ["S", "O", "V"],
      "vso": ["V", "S", "O"],
      "osv": ["O", "S", "V"],
      "ovs": ["O", "V", "S"]
    };
    return orders[(order || "").toLowerCase()] || ["S", "V", "O"];
  }

  function makeSentence() {
    const order = (state.config?.grammar?.wordOrder) || "svo";
    const nounMorph = state.config?.grammar?.nounMorph || "moderate";
    const verbMorph = state.config?.grammar?.verbMorph || "moderate";
    const derivation = state.config?.grammar?.derivation || "suffixing";

    const subj = pickRandom(state.lexicon.nouns);
    const obj = pickRandom(state.lexicon.nouns);
    const verb = pickRandom(state.lexicon.verbs);
    const descAdj = pickRandom(state.lexicon.descriptors);
    const descAdv = pickRandom(state.lexicon.descriptors);

    // Apply morphological complexity to words
    const subjForm = applyNounMorphology(subj.native, nounMorph, derivation);
    const objForm = applyNounMorphology(obj.native, nounMorph, derivation);
    const verbForm = applyVerbMorphology(verb.native, verbMorph, derivation);

    const slotsConlang = {
      S_adj: descAdj?.native,
      S: subjForm,
      V: verbForm,
      V_adv: descAdv?.native,
      O: objForm
    };

    const slotsGloss = {
      S_adj: descAdj?.gloss,
      S: subj.gloss,
      V: verb.gloss,
      V_adv: descAdv?.gloss,
      O: obj.gloss
    };

    const seq = wordOrderToSequence(order);
    const conlangTokens = [];
    const glossTokens = [];

    seq.forEach(function (code) {
      if (code === "S") {
        if (slotsConlang.S_adj) conlangTokens.push(slotsConlang.S_adj);
        conlangTokens.push(slotsConlang.S);
        if (slotsGloss.S_adj) glossTokens.push(slotsGloss.S_adj);
        glossTokens.push(slotsGloss.S);
      } else if (code === "V") {
        conlangTokens.push(slotsConlang.V);
        glossTokens.push(slotsGloss.V);
        if (slotsConlang.V_adv) conlangTokens.push(slotsConlang.V_adv);
        if (slotsGloss.V_adv) glossTokens.push(slotsGloss.V_adv);
      } else if (code === "O") {
        conlangTokens.push(slotsConlang.O);
        glossTokens.push(slotsGloss.O);
      }
    });

    const conlang = conlangTokens.join(" ");
    const english = generateEnglishSentence(slotsGloss);

    return { conlang, english };
  }

  function applyNounMorphology(base, nounMorph, derivation) {
    // Apply case endings or other nominal morphology based on complexity level
    if (nounMorph === "rich") {
      // Rich morphology: multiple cases, more variety
      const caseMorphemes = [
        { marker: "", gloss: "nominative" },
        { marker: "-em", gloss: "ergative" },
        { marker: "-el", gloss: "genitive" },
        { marker: "-ur", gloss: "locative" },
        { marker: "-is", gloss: "accusative" }
      ];
      if (Math.random() < 0.6) {
        const morph = caseMorphemes[Math.floor(Math.random() * caseMorphemes.length)];
        return base + morph.marker;
      }
      return base;
    } else if (nounMorph === "moderate") {
      // Moderate morphology: occasional endings
      if (Math.random() < 0.35) {
        const endings = ["-em", "-el", "-ur"];
        return base + endings[Math.floor(Math.random() * endings.length)];
      }
      return base;
    } else {
      // Light morphology: minimal endings
      if (Math.random() < 0.1) {
        return base + "-a";
      }
      return base;
    }
  }

  function applyVerbMorphology(base, verbMorph, derivation) {
    // Apply tense/aspect/mood markers to verbs based on complexity level
    if (verbMorph === "rich") {
      // Rich morphology: multiple TAM categories
      const affixesByType = {
        prefixing: ["ta-", "si-", "vel-", ""],
        suffixing: ["-ta", "-sin", "-vel", "-sa", ""],
        compounding: ["", "-ta", "-sin"]
      };
      
      const affixes = affixesByType[derivation] || affixesByType.suffixing;
      if (Math.random() < 0.65) {
        const affix = affixes[Math.floor(Math.random() * affixes.length)];
        if (derivation === "prefixing" && affix) {
          return affix + base;
        } else if (affix) {
          return base + affix;
        }
      }
      return base;
    } else if (verbMorph === "moderate") {
      // Moderate morphology: occasional tense markers
      if (Math.random() < 0.4) {
        return base + "-ta";
      }
      return base;
    } else {
      // Light morphology: minimal verb marking
      if (Math.random() < 0.15) {
        return base + "-a";
      }
      return base;
    }
  }

  function generateEnglishSentence(gloss) {
    const hasAdj = gloss.S_adj && gloss.S_adj.length > 0;
    const hasAdv = gloss.V_adv && gloss.V_adv.length > 0;
    const verbForm = conjugateVerb(gloss.V, "present", "3sg");

    let engSentence;
    if (hasAdj && hasAdv) {
      engSentence = `${gloss.S_adj} ${gloss.S} ${verbForm} ${gloss.O} ${gloss.V_adv}.`;
    } else if (hasAdj) {
      engSentence = `${gloss.S_adj} ${gloss.S} ${verbForm} ${gloss.O}.`;
    } else if (hasAdv) {
      engSentence = `${gloss.S} ${verbForm} ${gloss.O} ${gloss.V_adv}.`;
    } else {
      engSentence = `${gloss.S} ${verbForm} ${gloss.O}.`;
    }

    return engSentence;
  }

  function conjugateVerb(verbGloss, tense, person) {
    if (tense === "past") {
      if (verbGloss.endsWith("e")) return verbGloss + "d";
      if (verbGloss.endsWith("y")) return verbGloss.slice(0, -1) + "ied";
      return verbGloss + "ed";
    } else if (tense === "progressive") {
      return "is " + verbGloss + "ing";
    } else {
      // present
      if (person === "3sg" && !verbGloss.endsWith("s")) {
        return verbGloss + "s";
      }
      return verbGloss;
    }
  }

  function wordOrderToSequence(order) {
    const orders = {
      "sov": ["S", "O", "V"],
      "vso": ["V", "S", "O"],
      "osv": ["O", "S", "V"],
      "ovs": ["O", "V", "S"]
    };
    return orders[(order || "").toLowerCase()] || ["S", "V", "O"];
  }

  function generateWord(phonology, writing, grammar, lexicon) {
    if (!phonology || !phonology.consonants || !phonology.vowels) {
      console.warn("Invalid phonology config:", phonology);
      return "word";
    }

    const consonants = Array.isArray(phonology.consonants) ? phonology.consonants : phonology.consonants.split(/\s+/);
    const vowels = Array.isArray(phonology.vowels) ? phonology.vowels : phonology.vowels.split(/\s+/);
    
    if (consonants.length === 0 || vowels.length === 0) {
      return "word";
    }

    const maxSyl = parseInt(phonology.maxSyllables) || 3;
    const syllableCount = Math.floor(Math.random() * Math.max(1, maxSyl - 1)) + 1;
    const pattern = phonology.syllablePattern || "cvc";
    const patternParts = pattern.includes("-") ? pattern.split("-") : [pattern];
    const syllables = [];

    for (let s = 0; s < syllableCount; s++) {
      const selectedPattern = patternParts[s % patternParts.length];
      const syl = generateSyllable(selectedPattern, { consonants, vowels });
      if (syl.length > 0) {
        syllables.push(syl);
      }
    }

    let result = syllables.join("");
    result = result.length > 0 ? result : "word";

    return result;
  }

  function generateSyllable(pattern, phonology) {
    if (!pattern || !phonology) return "";
    
    const consonants = Array.isArray(phonology.consonants) ? phonology.consonants : phonology.consonants.split(/\s+/);
    const vowels = Array.isArray(phonology.vowels) ? phonology.vowels : phonology.vowels.split(/\s+/);
    
    const syllable = [];

    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i].toUpperCase();

      if (char === "C") {
        syllable.push(pickRandom(consonants));
      } else if (char === "V") {
        syllable.push(pickRandom(vowels));
      } else if (char === "X") {
        // Consonant or glide
        const combined = consonants.concat(vowels);
        syllable.push(pickRandom(combined));
      } else if (char === "L") {
        // Liquid/approximant (use first consonant or 'l')
        syllable.push(consonants.length > 0 ? consonants[0] : "l");
      } else if (char === "S") {
        // Sibilant (use first consonant)
        syllable.push(consonants.length > 0 ? consonants[0] : "s");
      }
    }

    return syllable.join("");
  }

  function applyRandomSoundChange(word, phonology) {
    // Simple sound change: replace a consonant with another
    if (word.length < 2) return word;
    const idx = Math.floor(Math.random() * word.length);
    const oldChar = word[idx];
    if (phonology.consonants.includes(oldChar)) {
      const newChar = pickRandom(phonology.consonants);
      return word.slice(0, idx) + newChar + word.slice(idx + 1);
    }
    return word;
  }

  function renderAlphabetMap() {
    const container = document.getElementById("alphabet-grid");
    if (!container || !state.config?.phonology) return;

    container.innerHTML = "";

    const consonants = Array.isArray(state.config.phonology.consonants) 
      ? state.config.phonology.consonants 
      : (state.config.phonology.consonants || "").split(/\s+/);
    const vowels = Array.isArray(state.config.phonology.vowels)
      ? state.config.phonology.vowels
      : (state.config.phonology.vowels || "").split(/\s+/);
    
    const mapping = buildSeparateMapping(consonants, vowels);

    // English consonant inventory for display
    const englishConsonants = [
      "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z",
      "ch", "sh", "th", "gh", "ph", "ng", "zh", "ts", "dj", "kh", "tr", "dr", "br", "gr", "fr", "pr", "kr", "wr", "wh", "qu",
      "sch", "tch", "dge", "igh", "ough", "tion", "sion", "chr", "thr", "str", "spr", "scr", "ç", "ğ", "ş"
    ];
    
    // English vowel inventory for display
    const englishVowels = [
      "a", "e", "i", "o", "u",
      "ai", "au", "ei", "oi", "ou", "aa", "ee", "ii", "oo", "uu"
    ];

    // CONSONANTS section (main title)
    const consonantMainSection = document.createElement("div");
    consonantMainSection.className = "alphabet-main-section";
    
    const consonantMainTitle = document.createElement("h3");
    consonantMainTitle.className = "alphabet-main-title";
    consonantMainTitle.textContent = "consonants";
    consonantMainSection.appendChild(consonantMainTitle);

    const consonantGrid = document.createElement("div");
    consonantGrid.className = "alphabet-mapping-grid";
    
    englishConsonants.forEach(function (letter) {
      const chip = document.createElement("div");
      chip.className = "alphabet-mapping";
      
      const english = document.createElement("div");
      english.className = "alphabet-mapping-english";
      english.textContent = letter.toUpperCase();
      
      const conlang = document.createElement("div");
      conlang.className = "alphabet-mapping-conlang";
      conlang.textContent = mapping.consonants[letter] || "—";
      
      chip.appendChild(english);
      chip.appendChild(conlang);
      consonantGrid.appendChild(chip);
    });
    
    consonantMainSection.appendChild(consonantGrid);
    container.appendChild(consonantMainSection);

    // VOWELS section (main title)
    const vowelMainSection = document.createElement("div");
    vowelMainSection.className = "alphabet-main-section";
    
    const vowelMainTitle = document.createElement("h3");
    vowelMainTitle.className = "alphabet-main-title";
    vowelMainTitle.textContent = "vowels";
    vowelMainSection.appendChild(vowelMainTitle);

    const vowelGrid = document.createElement("div");
    vowelGrid.className = "alphabet-mapping-grid";
    
    englishVowels.forEach(function (letter) {
      const chip = document.createElement("div");
      chip.className = "alphabet-mapping";
      
      const english = document.createElement("div");
      english.className = "alphabet-mapping-english";
      english.textContent = letter.toUpperCase();
      
      const conlang = document.createElement("div");
      conlang.className = "alphabet-mapping-conlang";
      conlang.textContent = mapping.vowels[letter] || "—";
      
      chip.appendChild(english);
      chip.appendChild(conlang);
      vowelGrid.appendChild(chip);
    });
    
    vowelMainSection.appendChild(vowelGrid);
    container.appendChild(vowelMainSection);
  }

  function buildMapping(conlangPhonemes, englishSlots) {
    const mapping = {};
    // Expanded English alphabet with 2-letter, 3-letter combinations and special characters
    const fullEnglishAlphabet = [
      // Single letters (26)
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
      // 2-letter consonant combinations (20)
      "ch", "sh", "th", "gh", "ph", "ng", "zh", "ts", "dj", "kh", "tr", "dr", "br", "gr", "fr", "pr", "kr", "wr", "wh", "qu",
      // 2-letter vowel/diphthong combinations (15)
      "ai", "au", "ei", "eu", "oi", "ou", "aa", "ee", "ii", "oo", "uu", "ae", "oe", "ue", "aw",
      // 3-letter combinations (12)
      "sch", "tch", "dge", "igh", "ough", "tion", "sion", "chr", "thr", "str", "spr", "scr",
      // Turkish special characters (8)
      "ç", "ğ", "ş", "ı", "ü", "ö", "c", "g"
    ];
    
    conlangPhonemes.forEach(function (phoneme, idx) {
      // Cycle through expanded alphabet if we have more conlang phonemes than slots
      const englishIdx = idx % fullEnglishAlphabet.length;
      mapping[fullEnglishAlphabet[englishIdx]] = phoneme;
    });
    return mapping;
  }

  function buildSeparateMapping(consonants, vowels) {
    const mapping = { consonants: {}, vowels: {} };
    
    // English consonant mappings - complete list of single, 2-letter, and 3-letter consonants
    const englishConsonants = [
      // Single letters (21)
      "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z",
      // 2-letter consonant combinations (20)
      "ch", "sh", "th", "gh", "ph", "ng", "zh", "ts", "dj", "kh", "tr", "dr", "br", "gr", "fr", "pr", "kr", "wr", "wh", "qu",
      // 3-letter combinations (12)
      "sch", "tch", "dge", "igh", "ough", "tion", "sion", "chr", "thr", "str", "spr", "scr",
      // Special characters (3)
      "ç", "ğ", "ş"
    ];
    
    // English vowel mappings (simplified)
    const englishVowels = [
      // Single letters (5)
      "a", "e", "i", "o", "u",
      // 2-letter vowel/diphthong combinations (10)
      "ai", "au", "ei", "oi", "ou", "aa", "ee", "ii", "oo", "uu"
    ];
    
    // Map consonants - all conlang consonants get mapped to English consonants
    consonants.forEach(function (phoneme, idx) {
      const englishIdx = idx % englishConsonants.length;
      mapping.consonants[englishConsonants[englishIdx]] = phoneme;
    });
    
    // Map vowels - all conlang vowels get mapped to English vowels
    vowels.forEach(function (phoneme, idx) {
      const englishIdx = idx % englishVowels.length;
      mapping.vowels[englishVowels[englishIdx]] = phoneme;
    });
    
    return mapping;
  }

  function generateSentenceFromBank(wordOrder) {
    if (!state.sentenceBank || !hasLexicon()) {
      // Fallback to structured generation if no bank
      return makeSentence();
    }

    // Select bucket based on word order, or use free bucket sometimes
    let bucket = state.sentenceBank[wordOrder] || state.sentenceBank.svo;
    
    // Occasionally pick a free/poetic sentence
    if (Math.random() < 0.2 && state.sentenceBank.free && state.sentenceBank.free.length > 0) {
      bucket = state.sentenceBank.free;
    }

    if (!bucket || bucket.length === 0) {
      return makeSentence();
    }

    // Pick a random template sentence
    const template = pickRandom(bucket);
    
    // Map English words in template to conlang words
    const conlang = translateTemplateToConlang(template);
    const english = template;

    return { conlang, english };
  }

  function translateTemplateToConlang(template) {
    if (!template) return "";
    
    const words = template.split(/\s+/);
    const conlangWords = [];

    words.forEach(function (englishWord) {
      if (englishWord.length === 0) return;
      
      // Remove punctuation for lookup
      const cleanWord = englishWord.replace(/[.,!?;:—–-]+$/g, "").toLowerCase();
      const trailing = englishWord.substring(cleanWord.length);
      
      const conlangWord = findOrGenerateWord(cleanWord);
      conlangWords.push(conlangWord + trailing);
    });

    return conlangWords.join(" ");
  }

  function findOrGenerateWord(englishWord) {
    if (!englishWord || englishWord.length === 0) return "";
    
    // Try to find the word in the lexicon
    const lowerWord = englishWord.toLowerCase().trim();
    
    // Check all lexicon categories
    const allEntries = state.lexicon.nouns
      .concat(state.lexicon.verbs)
      .concat(state.lexicon.descriptors)
      .concat(state.lexicon.prepositions)
      .concat(state.lexicon.articles)
      .concat(state.lexicon.pronouns)
      .concat(state.lexicon.conjunctions);

    const entry = allEntries.find(function (e) {
      return e.gloss && e.gloss.toLowerCase() === lowerWord;
    });

    if (entry) {
      return entry.native;
    }

    // Check custom lexicon
    const customEntry = state.customLexicon.find(function (e) {
      return e.gloss && e.gloss.toLowerCase() === lowerWord;
    });

    if (customEntry) {
      return customEntry.native;
    }

    // If not found, generate a word and add to custom lexicon
    const generated = generateWord(state.config.phonology, state.config.writing, state.config.grammar, state.config.lexicon);
    addToCustomLexicon(englishWord, generated);
    return generated;
  }

  function addToCustomLexicon(englishWord, conlangWord) {
    // Check if already exists
    const exists = state.customLexicon.some(function (entry) {
      return entry.gloss === englishWord;
    });

    if (!exists) {
      state.customLexicon.push({
        gloss: englishWord,
        native: conlangWord,
        pos: "custom"
      });
    }

    renderCustomLexicon();
  }

  function renderCustomLexicon() {
    const body = document.getElementById("lexicon-custom-body");
    if (!body) return;

    body.innerHTML = "";
    state.customLexicon.forEach(function (entry) {
      const row = document.createElement("div");
      row.className = "lex-row";

      const nativeCol = document.createElement("div");
      nativeCol.className = "lex-col lex-col-native";
      nativeCol.textContent = entry.native;

      const glossCol = document.createElement("div");
      glossCol.className = "lex-col lex-col-gloss";
      glossCol.textContent = entry.gloss;

      row.appendChild(nativeCol);
      row.appendChild(glossCol);
      body.appendChild(row);
    });
  }

  function generateCustomWord(englishWord) {
    if (!englishWord || englishWord.length === 0) return "";
    if (!state.config?.phonology) return englishWord;
    
    const consonants = Array.isArray(state.config.phonology.consonants) 
      ? state.config.phonology.consonants 
      : (state.config.phonology.consonants || "").split(/\s+/);
    const vowels = Array.isArray(state.config.phonology.vowels)
      ? state.config.phonology.vowels
      : (state.config.phonology.vowels || "").split(/\s+/);
    
    const mapping = buildSeparateMapping(consonants, vowels);
    
    // English vowel and consonant sets for identification
    const englishConsonantSet = new Set([
      "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z",
      "ch", "sh", "th", "gh", "ph", "ng", "zh", "ts", "dj", "kh", "tr", "dr", "br", "gr", "fr", "pr", "kr", "wr", "wh", "qu",
      "sch", "tch", "dge", "igh", "ough", "tion", "sion", "chr", "thr", "str", "spr", "scr", "ç", "ğ", "ş"
    ]);
    
    const englishVowelSet = new Set([
      "a", "e", "i", "o", "u",
      "ai", "au", "ei", "oi", "ou", "aa", "ee", "ii", "oo", "uu"
    ]);
    
    let result = "";
    let i = 0;
    
    while (i < englishWord.length) {
      let matched = false;
      
      // Try 3-character sequences first
      if (i + 2 < englishWord.length) {
        const threeChar = englishWord.substring(i, i + 3).toLowerCase();
        if (englishConsonantSet.has(threeChar) && mapping.consonants[threeChar]) {
          result += mapping.consonants[threeChar];
          i += 3;
          matched = true;
        } else if (englishVowelSet.has(threeChar) && mapping.vowels[threeChar]) {
          result += mapping.vowels[threeChar];
          i += 3;
          matched = true;
        }
      }
      
      // Try two-character sequences
      if (!matched && i + 1 < englishWord.length) {
        const twoChar = englishWord.substring(i, i + 2).toLowerCase();
        if (englishConsonantSet.has(twoChar) && mapping.consonants[twoChar]) {
          result += mapping.consonants[twoChar];
          i += 2;
          matched = true;
        } else if (englishVowelSet.has(twoChar) && mapping.vowels[twoChar]) {
          result += mapping.vowels[twoChar];
          i += 2;
          matched = true;
        }
      }
      
      // Fall back to single character
      if (!matched) {
        const char = englishWord[i].toLowerCase();
        if (englishConsonantSet.has(char) && mapping.consonants[char]) {
          result += mapping.consonants[char];
        } else if (englishVowelSet.has(char) && mapping.vowels[char]) {
          result += mapping.vowels[char];
        } else if (char === " ") {
          result += " ";
        }
        // Skip unmapped characters
        i++;
      }
    }
    
    return result.length > 0 ? result : englishWord;
  }

  function renderCustomWordOutput(englishWord, conlangWord) {
    const container = document.getElementById("custom-word-output");
    if (!container) return;

    container.innerHTML = "";
    const card = document.createElement("div");
    card.className = "custom-word-result";

    const englishLine = document.createElement("div");
    englishLine.className = "custom-word-result-english";
    englishLine.textContent = englishWord;

    const conlangLine = document.createElement("div");
    conlangLine.className = "custom-word-result-conlang";
    conlangLine.textContent = conlangWord;

    card.appendChild(englishLine);
    card.appendChild(conlangLine);
    container.appendChild(card);
    container.classList.add("active");
  }

  window.LanguageGenerator = {
    init,
    receiveConfig,
    rerollLexicon,
    rerollSentences,
    translateSentence,
    generateCustomWord,
    renderCustomWordOutput
  };
})();


