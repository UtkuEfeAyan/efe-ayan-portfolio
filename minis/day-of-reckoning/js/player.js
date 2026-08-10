"use strict";

const STORY_SOURCES = {
  reckoning: { label: "The Day of Reckoning", file: "assets/DayOfReckoning.ink" },
  deadcity: { label: "Dead City", file: "assets/DeadCity.ink" },
};

let currentStory = null;
let currentKey = null;

const outputEl = document.getElementById("story-output");
const choicesEl = document.getElementById("story-choices");
const selectEl = document.getElementById("story-select");
const restartBtn = document.getElementById("story-restart");
const statusEl = document.getElementById("story-status");

async function loadStory(key) {
  currentKey = key;
  currentStory = null;
  statusEl.textContent = "Compiling story...";
  outputEl.innerHTML = "";
  choicesEl.innerHTML = "";

  try {
    const res = await fetch(STORY_SOURCES[key].file);
    if (!res.ok) throw new Error("Could not load " + STORY_SOURCES[key].file);
    const inkSource = await res.text();

    const authorWarnings = [];
    const compiler = new inkjs.Compiler(inkSource, {
      errorHandler: (message, errorType) => {
        authorWarnings.push(errorType + ": " + message);
      },
    });
    const story = compiler.Compile();

    if (!story) {
      throw new Error(
        "Ink compile failed.\n" + authorWarnings.slice(0, 10).join("\n")
      );
    }

    currentStory = story;
    statusEl.textContent = "";
    continueStory();
  } catch (err) {
    statusEl.textContent = "";
    const p = document.createElement("p");
    p.className = "story-error";
    p.textContent = "Failed to load this story.\n" + err.message;
    outputEl.appendChild(p);
    console.error(err);
  }
}

function continueStory() {
  if (!currentStory) return;
  while (currentStory.canContinue) {
    const text = currentStory.Continue();
    if (text && text.trim().length) {
      const p = document.createElement("p");
      p.textContent = text.trim();
      outputEl.appendChild(p);
    }
  }
  renderChoices();
  outputEl.scrollTop = outputEl.scrollHeight;
}

function renderChoices() {
  choicesEl.innerHTML = "";
  if (!currentStory || currentStory.currentChoices.length === 0) {
    const p = document.createElement("p");
    p.className = "story-end";
    p.textContent = "*** THE END ***";
    choicesEl.appendChild(p);
    return;
  }
  currentStory.currentChoices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.type = "button";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => {
      currentStory.ChooseChoiceIndex(index);
      continueStory();
    });
    choicesEl.appendChild(btn);
  });
}

selectEl.addEventListener("change", () => loadStory(selectEl.value));
restartBtn.addEventListener("click", () => loadStory(currentKey || selectEl.value));

loadStory(selectEl.value);
