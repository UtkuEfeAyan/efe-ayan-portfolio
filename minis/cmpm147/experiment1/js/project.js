// project.js - It will creates a scenario about my home country Turkiye
// Author: Utku Efe Ayan
// Date: April, 2025

// NOTE: This is how we might start a basic JavaaScript OOP project
const turkeyFillers = {
  adventurer: ["Guest", "My Friend", "Traveler", "Brother/Sister", "Comrade", "Explorer", "Dear Visitor", "Tourist", "Wanderer"],
  city: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Trabzon", "Gaziantep", "Konya", "Mardin", "Bodrum", "Canakkale"],
  prefix: ["noisy", "crowded", "bustling", "historic", "cosmopolitan", "chaotic", "vibrant", "sleepy", "picturesque", "welcoming"],
  suffix: ["of minarets", "by the Bosphorus", "with endless markets", "of thermal baths", "where continents meet", "of ancient ruins", "with golden beaches", "of spices", "where history lives"],
  people: ["hospitable", "generous", "street-smart", "hardworking", "passionate", "resilient", "curious", "loud but kind", "tea-obsessed"],
  item: ["bagel (simit)", "tea glass", "evil eye charm", "kebab plate", "Turkish delight box", "coffee pot", "handwoven rug", "traditional lute"],
  num: ["countless", "generous amounts of", "more than enough", "endless", "a lifetime supply of", "mountains of"],
  treasure: ["delicious", "famous", "mouth-watering", "legendary", "divine", "unforgettable", "to-die-for"],
  foods: ["appetizers (mezes)", "kebabs", "baklavas", "Turkish delights", "teas", "Turkish coffees", "bagels (simits)", "pastries (böreks)"],
  problems: ["overenthusiastic shopkeepers", "stray cats demanding attention", "tea addiction", "football mania", "traffic chaos", "too many Instagram spots", "evil eye curses"],
  message: ["call", "invitation", "news", "request", "announcement", "letter", "message", "notice"]
};


const turkeyTemplate = `Hey $adventurer, $message!

I've visited $city and $prefix $city $suffix, where $people locals need attention. The city suffers from $problems. Come quickly, bring your $item, and lend your aid!

Those who help will be rewarded with $num $treasure $foods. For $city's sake, I love it, don't refuse!
`;

const boxElement = $("#box");
const clickerButton = $("#clicker");

const slotPattern = /\$(\w+)/;

function replacer(match, name) {
  let options = turkeyFillers[name];
  if (options) {
    return options[Math.floor(Math.random() * options.length)];
  } else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = turkeyTemplate;
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }

  /* global box */
  box.innerText = story;
}
clicker.onclick = generate;

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
    return generate();
  }
}

function main() {
  // create an instance of the class
  let myInstance = new MyProjectClass("value1", "value2");

  // call a method on the instance
  myInstance.myMethod();

  if (clickerButton.length) {
    clickerButton.click(() => {
      const newMessage = myInstance.createTurkeyCallToAction();
      if (boxElement.length) {
        boxElement.text(newMessage);
      }
    });
  }

  if (boxElement.length) {
    boxElement.text(message);
  }

}



// let's get this party started - uncomment me
main();