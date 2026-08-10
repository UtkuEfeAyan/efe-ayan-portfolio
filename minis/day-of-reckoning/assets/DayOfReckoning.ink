// You are trying to reach Haley in Room 203 before time runs out, zombie survival and saving your sister. cardinal event and other requiremtns are listed below in the comments events/locatiosn ahve comments above them in big letters for convenience

//R11 Cardinal Event 1 i think i the "CLASS SELECTION" becaue eahc clas ecourges a differnt kind of play style and is apivotal moment for the whole game as tehy do chang some dialouges (however little) as well as some differnt choices and action sequences.
//R11 Cardinal Event 2 is Fire bridgeblocade/foot bridge road choice casue those both have a chance fo casusing multiple injuries killing the player acroding to your choices so. 
//R12 Catalyzer Event is Haley's phone call because it is the moment that triggers the entire mission and gives the player a clear goal which is to reach Room 203 and save Haley
//R21 Subject seeking an object is YOU the player and the object is rescuing Haley your sister from the school before time runs out
//R22 Sender is Haley because her phone call sends you into action and gives meaning and urgency to the events that follow
//R23 I think both  Haley and also the player is the Receiver because both of you receive the outcome of success or failure depending on whether she is rescued or not like both are affected by your actions.
//R24 Helper is items and class perks such as the ladder fire extinguisher weapons gun and parkour because they directly help the player survive obstacles and reach Haley
//R25 Opponent is zombies, fire blockage or dangerous environments like the footbridge because they block progress increase danger and can injure or kill the player if you are not carefull or dont read teh text carefully
//R31 Link structure of 10 plus nodes is the main narrative path which includes start haley_call class_select first_encounter hardstone_street scavenging routes pawn shop fire bridg footbridge school_gate hallway and ending states a lot longer than 10 to be honest
//R32 Nested link structure of 5 plus nodes is the pawn shop sequence which includes pawn_front pawn_counter pawn_cases pawn_back_hall and pawn_back_room and this structure exists inside the larger main narrative path an is connected to the hub hardstone_street
//R41 Loop Knot A Knot B Knot A exists in hardstone_street where the player can go to scavenging areas like cars, pawn shops or firetruck to gain esential/ optional items that can keep you alive and get teh importnat ladder item and then return back to hardstone_street to actually go thorugh the burning obstacle or get lie guns/wepons for extra damge resistance
//R42 Loop with a sticky choice and a once only choice exists in scavenging because continue searching is a sticky choice and item pickup choices are once only using flags
//R43 Loop with alternatives exists because from hardstone_street the player can choose between multiple routes such as scavenging pawn shop or heading toward the school and can repeat or change paths or the foot bridge wher tehere are multiple options ot chose from on how to cross or teh multiple endings also works i think
//R44 Loop with conditional text exists because multiple locations display different text and options depending on role flags items owned injuries and danger values also teh healing sytems i also conditional look that lets you heal if you have a healing item  and injuries. the  injury, the danger and the time sytems probalby can also work for this one as well




// classes (so liek i rated them indise the setting as weel for what i thoguht and how i felt when i was planing and playing the classes and their abilities i think firefighter is op so easy and civilian is hard but dont really know fully whcih is better between police and gymnast cause gymnast i like,  a weaker fire fighter so it still op but weak to zombies and police is very good against zombies so its good at scavanging so it can threoticellly do a cleaner run but still beign able to get through the fire easily and have shorter path o the footbridge for less chance of injury is as good as ectra gurantee i think so they are equal dificulty they are medium)
// classes
VAR role = "civilian"
VAR isFirefighter = false
VAR isPolice = false
VAR isRunner = false
VAR isCivilian = false


////////I wen t abit overboard on writing in teh beginnings and really wanted to like make teh text apear one paragraph after another but was too much works and also couldnt decdei whcih one was better  so i decide to spend most of my time in making my comlicated sytesm work so dint have the time to make taht style for all of them triednint eh start one
//VAR haley_call_step = 0 // not yet used wasnt sure which one is better as well
VAR start_step = 0

// VARIABLES
VAR time = 0
VAR danger = 1
VAR injury = 0


// perks/stats
VAR hasParkour = false
CONST baseThreshold = 5
VAR dangerResist = 0

// loot/items
VAR hasWeapon = false
VAR hasGun = false
VAR hasFireExtinguisher = false
VAR hasLadder = false
VAR hasHeal = 0

// scavenge probability system
VAR baseFindChance = 45
VAR civilianFindBonus = 0
VAR findChanceMax = 85

// Time limit
CONST TIME_LIMIT = 25

// one-time loot flags
VAR cars_lootedWeapon = false
VAR cars_lootedHeal = false
VAR truck_lootedExt = false
VAR truck_lootedHeal = false

VAR pawn_lootedGun = false
VAR pawn_lootedHeal = false
VAR pawn_lootedLadder = false

// footbridge / different paths and their flags
VAR footbridgeHasPlank = false
VAR pawnBackAccessible = false

// fire obstacle flags
VAR bridgeFireSuppressed = false
VAR bridgeFirePassed = false

// return control for heal (NEW)
VAR return_knot = -> hardstone_street


/////////////////////////////  START
-> start

=== start ===

{ start_step == 0:
You are inside your car, driving from/to work, the radio still talking about the recent violent accidents hapening all around the country you beene hearing abotu the same news for teh last week in an increasing frequency, especially recently.People getting jumped in the streets, domestic vilonce, more "violent gang activities" than has been in teh last few years.

+ [Continue]
        ~ start_step = 1
        -> start
}

{ start_step == 1:
Your commute road today seems especailly busy and not jsut the cars alot fo people in ahury as well it seems, you feel slightly tense for some reason. You just think its irrrational fear from watching/hearing such violent news fro long and strees of a very bussy work week just nerves
.
+ [Continue]
        ~ start_step = 2
        -> start
}

{ start_step == 2:
Then the whole traffic stops, not that going 10 miles below sped not hat just slowed completely stopped.Thats not normal, thre shoudln't be a trafic light for a long while, as you look outide you cr viwnow you see people frantically runnign around, not jsut one or two many of them all of them something is definetly wrong, your eyes catches some somke rising as well onthe rear view mirror, you lower the volume of the radio and you heard the spdun cars crashing, people screaming , fire burning windows shateeing some wher then you hear a lodu bang... a gunshot this not jsut some "gang activity" or mass hysteria this the apocalypse, a zombie apocalypse.

+ [Continue]
        ~ start_step = 3
        -> start
}

{ start_step == 3:
Your phone vibrates, some one is calling.

 + [Answer]
        -> haley_call
}


=== haley_call ===
It’s your sister, Haley, you cant imagine whats going through her head right all in this chaos.
"Brother, where are you?" echoes Haley's desperate voice through the crackling connection. Panic and fear visible in her tone, her words coming throu,gh the sobs as she pleads for help.
"Haley, I'm here," you reply, the chaos of the city serving as a chilling backdrop to your conversation. "Stay calm. I'm on my way. Tell me your exact location, and I'll find you."
“I’m at school, Room 203, me my teacher and some of my friedsn were able to lock the door.Please hurry.”
You check the time, you know that you cant wait for the chaos to stop, who knwos what can happen in this chaos, you know you ned to get to your sister as soon as possible, hopefully in one piece. You will figure out the rest when you are together.

+ [Get out of the car]
    ~ time += 1
    -> class_select


///////////////////////////////////// CLASS SELECTION
=== class_select ===
You look outside as you search for an oportunity to make it out of the car, you firct chek for any suplies inisde the car.
You check the glovebox, under the seaat, back seats, you then go outside at an oportune moment look at your trunk.
You gather what you can what you find usefull in your situation, you werent really prreapred for an apocalypse but you find some usefull stuff.
What did you find(who were you before this whole ting started)?

* [Firefighter(easy)]
    ~ role = "firefighter"
    ~ isFirefighter = true
    ~ hasFireExtinguisher = true
    ~ dangerResist = 1
    You trained for fire, chaos, and rescue so you feelll readier than most others thoguh nothing prepares a person for teh zombie apocalypse.
    You coudlnt find much of your fire fighter stuff as its inthe station However luclty you alsways keeep a fire extinguisher in the car comes witht eh job you know.
    You go dont o feel and the extinguisher feels heavy, its full, good news finally.
    You start with a fireextinguisher (very effective against firey obstacles taht blook loot and the ways)
    -> apply_class_find_rules -> first_encounter

* [Police Officer(medium)]
    ~ role = "police"
    ~ isPolice = true
    ~ hasWeapon = true
    ~ hasGun = true
    ~ dangerResist = 3
    You been a police officer for a while now you have expricne in bad situations, nothing worse than this but bad enough that you can confidenlty handle yourself under stress you check for your trusty side arm whcih you alwasy carry.
    You are armed and considerably more protected and lucky than many others in your situation especially handy in dfending yourself agaisnt eh ravenous hordes of deads
    You start with a pistol (a ditional danger resitance agaisnt zombies).
    -> apply_class_find_rules -> first_encounter

* [Runner / Gymnast(medium)]
    ~ role = "runner"
    ~ isRunner = true
    ~ hasParkour = true
    ~ dangerResist = 0
    As a previous Gymnast, you thrive on agility and speed, teaching others the art of fluid and controlled movement. Your love for running and navigating obstacles and incredible hand eye coordiantion and fit body becomes a crucial advantage in this new world. Quick thinking and nimble actions define your character
    You are athlethic (you are faster than some and can get throguh some obstacles in more "uniuge" ways even thoguh it might be mroe risky, speed is king right?)
    -> apply_class_find_rules -> first_encounter

* [Civilian(hard)]
    ~ role = "civilian"
    ~ isCivilian = true
    ~ dangerResist = 0
    You are just a normal office worker, no special training, no usefull perks, no readly avaliable fire extinguisher just a normal office worker.
    But you evne being able to have job in this economy while being perfectly average shows just how luck youre so maybe its not so bad.
    You have better luck than others (+10%) you notice thigns other sdont when searching/scavanging  (upper limit +10% as well)
    -> apply_class_find_rules -> first_encounter


////////////////////////// FIRST ENCOUNTER
=== first_encounter ===
~ danger += 1
~ time += 1
-> check_time ->
-> check_death ->

As you step away from the car you see somthgin fromteh corner of your eyes.
Something lunges towards you, well at least tries to.
A zombie.
Your first encounter.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> first_encounter
    -> use_heal

+ [Fight]
    { hasGun:
        You remember your traning and the movies you watch,
        One shot to the head and they drop.
        But it was loud jus tso you know
        ~ danger -= 1
        ~ time += 1
    - else:
        { hasWeapon:
            You strike fast with your weapon and push it away.
            ~ time += 1
        - else:
            You struggle without a wepon you are very vulnurable
            Teeth snap inches from your face.
            You get scratched, luckly not bitten.
            ~ injury += 1
        }
    }
    -> check_death ->
    -> hardstone_street

+ [Run]
    You sprint.
    Your lungs burn.
    ~ time += 2
    -> check_time ->
    -> hardstone_street


////////////////////// HUB: HARDSTONE STREET
=== hardstone_street ===
~ time += 1
-> check_time ->
-> check_death ->

You reach Hardstone Street.
Once a marketplace.
Now it’s smoke, broken glass, and alarms that won’t shut up.

Zombies nearby: {danger}
Injuries: {injury}
Time: {time}/{TIME_LIMIT}

{ isFirefighter: Your gear smells like ash. }
{ isPolice: Your grip stays steady, even when your mind doesn’t. }
{ isRunner: Your legs want to go. Your brain wants to plan. }
{ isCivilian: You keep scanning. Quiet details. Small chances. }

You spot scavenging angles… and routes out.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> hardstone_street
    -> use_heal

+ [Search abandoned cars (weapons / supplies)]
    -> scavenge_cars

+ [Search emergency truck (fire gear / medical)]
    -> scavenge_firetruck

+ [Go toward the pawn shop]
    -> pawn_front

+ [Head toward the school]
    -> bridge_fire_intro


/////////////////////////////// SCAVENGE: CARS
=== scavenge_cars ===
~ time += 1
~ danger += 1
-> check_time ->
-> check_death ->

{ cars_lootedWeapon && cars_lootedHeal:
    You already tore these cars apart.
    There’s nothing left but broken glass and bad memories.

    + [Go back]
        -> hardstone_street
}

You crouch by a wrecked car.
A purse spilled open like it got yanked mid-run.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> scavenge_cars
    -> use_heal

+ [Search]
    -> scavenge_cars_roll

+ [Go back]
    -> hardstone_street


=== scavenge_cars_roll ===
~ temp findChance = baseFindChance + civilianFindBonus
{ findChance > findChanceMax:
    ~ findChance = findChanceMax
}

~ temp roll = RANDOM(0, 100)

{ roll < findChance:
    -> scavenge_cars_take
- else:
    Nothing but blood and receipts.
    -> danger_injury_roll ->
    -> scavenge_cars_result
}


=== scavenge_cars_take ===
You find a tight bundle in the console insdie a small bag there is a.

{ cars_lootedWeapon && cars_lootedHeal:
    You already took everything useful here.
    -> scavenge_cars_result
}

* { not hasWeapon && not cars_lootedWeapon } [Take a knife]
    ~ hasWeapon = true
    ~ dangerResist += 1
    ~ cars_lootedWeapon = true
    The blade is small.
    Still better than empty hands.
    -> scavenge_cars_result

* { hasHeal == 0 && not cars_lootedHeal } [Take a small first-aid kit]
    ~ hasHeal += 1
    ~ cars_lootedHeal = true
    Bandages. AlcholWipes. A tiny mercy in these times.
    -> scavenge_cars_result

+ [Put it back]
    -> scavenge_cars_result


=== scavenge_cars_result ===
{ cars_lootedWeapon && cars_lootedHeal:
    There’s nothing left to find here now.
}

+ [Continue searching (riskier, better odds)]
    ~ time += 1
    ~ danger += 1
    ~ baseFindChance += 25
    { baseFindChance > findChanceMax:
        ~ baseFindChance = findChanceMax
    }
    -> check_time ->
    -> danger_injury_roll ->
    -> scavenge_cars_roll

+ [Go back]
    -> hardstone_street


//////////////////////// SCAVENGE: FIRETRUCK
=== scavenge_firetruck ===
~ time += 1
~ danger += 1
-> check_time ->
-> check_death ->

{ truck_lootedExt && truck_lootedHeal:
    You already scavenged everything useful here.
    Just ash and empty compartments now.

    + [Go back]
        -> hardstone_street
}

An emergency truck sits half-burned.
Doors hanging open.
Inside: shadows, soot, and supplies.

{ not hasWeapon:
    You don’t like doing this with bare hands.
    Too many angles.
}

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> scavenge_firetruck
    -> use_heal

+ [Search]
    -> scavenge_firetruck_roll

+ [Go back]
    -> hardstone_street


=== scavenge_firetruck_roll ===
~ temp findChance = baseFindChance + civilianFindBonus
{ findChance > findChanceMax:
    ~ findChance = findChanceMax
}

~ temp roll = RANDOM(0, 100)

{ roll < findChance:
    -> scavenge_firetruck_take
- else:
    Just ash and broken plastic.
    -> danger_injury_roll ->
    -> scavenge_firetruck_result
}


=== scavenge_firetruck_take ===
You tug a compartment open.

{ truck_lootedExt && truck_lootedHeal:
    You already took everything useful here.
    -> scavenge_firetruck_result
}

* { not hasFireExtinguisher && not truck_lootedExt } [Take a fire extinguisher]
    ~ hasFireExtinguisher = true
    ~ truck_lootedExt = true
    Cold metal. Heavy promise.
    -> scavenge_firetruck_result

* { hasHeal == 0 && not truck_lootedHeal } [Take medical supplies]
    ~ hasHeal += 1
    ~ truck_lootedHeal = true
    You take what you can carry without thinking.
    -> scavenge_firetruck_result

+ [Leave it]
    -> scavenge_firetruck_result


=== scavenge_firetruck_result ===
{ truck_lootedExt && truck_lootedHeal:
    There’s nothing left to find here now.
}

+ [Continue searching (riskier, better odds)]
    ~ time += 1
    ~ danger += 1
    ~ baseFindChance += 25
    { baseFindChance > findChanceMax:
        ~ baseFindChance = findChanceMax
    }
    -> check_time ->
    -> danger_injury_roll ->
    -> scavenge_firetruck_roll

+ [Go back]
    -> hardstone_street


///////////////////////// FIRE BLOCK
=== bridge_fire_intro ===
~ time += 1
~ danger += 1
-> check_time ->
-> check_death ->

You head toward the school.

A crashed truck is on fire across the road.
Not a small fire.
A wall of heat and black smoke.

And it’s blocking the only clean path to the footbridge.

{ bridgeFirePassed:
    You’ve already pushed past this.
    + [Keep going]
        -> footbridge_intro
}

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> bridge_fire_intro
    -> use_heal

+ { hasFireExtinguisher } [Suppress the fire (safe)]
    ~ time += 1
    ~ bridgeFireSuppressed = true
    ~ bridgeFirePassed = true
    The foam hisses.
    The flames shrink.
    You make a narrow, safe path through.
    -> footbridge_intro

+ { hasParkour } [Parkour through the edge of it (risky)]
    ~ time += 2
    ~ injury += 1
    -> check_death ->
    ~ bridgeFirePassed = true
    You sprint the edge, jump the twisted frame
    heat bites your skin.
    You land coughing, but you’re through, not whiout some injuries though.
    -> footbridge_intro

+ [Back away]
    You can’t force this right now.
    -> hardstone_street


//////////////////////////////////////// PAWN SHOP
=== pawn_front ===
~ time += 1
-> check_time ->
-> check_death ->

Insidethe pawn shop you see overturned shelves.
A ticking sound from somewhere you can’t see.
Smoke clinging to everything.
You can search the front…
or push deeper.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> pawn_front
    -> use_heal

+ [Search the counter area]
    -> pawn_counter

+ [Search the display cases]
    -> pawn_cases

+ { pawnBackAccessible } [Go deeper (back rooms)]
    -> pawn_back_hall

+ [Leave the pawn shop]
    -> hardstone_street


=== pawn_counter ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

{ pawn_lootedHeal:
    You already cleaned this spot out.
    + [Go back]
        -> pawn_front
}

Behind the counter, drawers half-open.
Cash, some other junk.A torn receipt with “Dave” on it.
Poor soul probably one of the dead wandering in front of the shop now.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> pawn_counter
    -> use_heal

* [Take basic medical items]
    ~ hasHeal += 1
    ~ pawn_lootedHeal = true
    Not much, but it’s something.
    -> pawn_front

+ [Go back]
    -> pawn_front


=== pawn_cases ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

{ pawn_lootedGun:
    The good case is already empty.
    + [Go back]
        -> pawn_front
}

Display glass is shattered.
You step carefully and you see your price.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> pawn_cases
    -> use_heal

* [Take a shotgun]
    ~ hasGun = true
    ~ hasWeapon = true
    ~ pawn_lootedGun = true
    { not isPolice:
        ~ dangerResist += 2
    }
    Heavy. Serious.
    -> pawn_front

+ [Go back]
    -> pawn_front


=== pawn_back_hall ===
~ time += 1
~ danger += 1
-> check_time ->
-> check_death ->

The back hallway is darker. You smell Something weird soemthgin you smelled otuside but its heavier here.
Then you see them, a small horde, not huge not impossible but just enough.
Enough to make it stupid, maybe slightly insane.
They’re between you and the back room.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> pawn_back_hall
    -> use_heal

+ { hasParkour } [Slip through using parkour (guaranteed)]
    ~ time += 1
    You climb shelving, silent-foot it over broken counters,
    and drop behind them like you were never there.
    -> pawn_back_room

+ [Try to sneak through (25% chance)]
    ~ temp roll = RANDOM(0, 100)
    { roll < 25:
        You move slow.
        You breathe shallow.
        You make it.
        -> pawn_back_room
    - else:
        A zombie turns.
        Then another.
        You back out hard, run teh way you came.
        ~ time += 1
        ~ danger += 1
        -> check_time ->
        -> danger_injury_roll ->
        -> pawn_front
    }

+ { hasWeapon } [Fight your way in]
    You go loud.
    You go fast.
    ~ danger += 1
    -> danger_injury_roll ->
    -> pawn_back_room

+ [Back out]
    -> pawn_front


=== pawn_back_room ===
~ time += 1
-> check_time ->
-> check_death ->

Back room, you see some storage shelves and a metal rack.
And it is you see an expendable ladder maybe the best thgin you found yet.
A stupidly simple item that suddenly feels like a lifeline.

{ pawn_lootedLadder:
    The rack is empty now.
    You already took the good stuff.
    + [Go back]
        -> pawn_front
}

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> pawn_back_room
    -> use_heal

* [Take the ladder]
    ~ hasLadder = true
    ~ pawn_lootedLadder = true
    You grab it and don’t look back, now on we need to go to haley you already scavanged long enough.
    -> pawn_front

+ [Leave the back room]
    -> pawn_front


////////////////////////////// FOOTBRIDGE
=== footbridge_intro ===
~ time += 1
-> check_time ->
-> check_death ->

The footbridge is ahead, looking a lot worse than you remamber nearly collapsed.
The shortest path already in the water below, rubble hanging over open air.
Wind moves through the gaps like the bridge is breathing, water sloching bellow like an agry beast hoping to swallow anything or anyone.
It looks long and dangerous.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> footbridge_intro
    -> use_heal

+ { hasLadder } [Use your ladder (fastest)]
    ~ time += 1
    You set your expandable lader over the large hole in the bridge taht was blocking you from going ove rthe brokedn donw shortets pathway to haleys school. Done.
    -> school_gate

+ { hasParkour } [Take the risky parkour line (2 segments)]
    -> footbridge_parkour_1

+ [Start the long way (3 segments)]
    -> footbridge_long_1

+ [Go back]
    -> hardstone_street


// /////////////////////////////////////////////////// LONG WAY (3 segments)
=== footbridge_long_1 ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

You step onto cracked concrete, the last obstacle before you and your sister a long trek to school.
Somewhere below, water—or air—doesn’t matter, it’s looking very far.

+ [Move forward]
    -> footbridge_long_2

+ [Back off]
    -> footbridge_intro


=== footbridge_long_2 ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

Halfway there, the wind feels louder here maybe because all the chaos of teh city is behind your or maybe because evryone is dead you dont know you continue.
You can feel the old footbridge shift under your weight you dont know how long has it been since this thing has been maintained.
Good thing your knees really really love this long walk.

+ [Move forward]
    -> footbridge_long_3

+ [Back off]
    -> footbridge_intro


=== footbridge_long_3 ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

Come on you have come a long way its the last stretch, the last hurray.
You observe some loose rubble hangin on the sides of the bridge be carefull one bad step and it’s over.

+ [Finish crossing]
    -> school_gate


///////////////////////////////////////////////////// PARKOUR WAY (2 segments)
=== footbridge_parkour_1 ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

You spot a narrow route along the railing.
Not safe.
Just "possible" becasue of your long training.

You jump to a tilted support beam.
Your shoes scrape metal.

+ [Keep going]
    -> footbridge_parkour_2

+ [Back off]
    -> footbridge_intro


=== footbridge_parkour_2 ===
~ time += 1
~ danger += 1
-> check_time ->
-> danger_injury_roll ->

One last gap.
Shorter than that long way but looks compariteely more dangerous.
As there is a small gap.
So you run.
You jump.
You land hard but succesfully.

+ [Cross to the other side]
    -> school_gate


////////////////////////////////////////SCHOOL GATE
=== school_gate ===
~ time += 1
-> check_time ->
-> check_death ->

The school stands ahead, very quiet more than usual you observe some smeared signs, already  sligthly weathered walls.
A place that should be loud with kids, laughter an dhappy memories, now it’s just… still like a picture taken in time, still and lifeless, except teh bacground groans of the dead.
You reach the entrance.

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> school_gate
    -> use_heal

{ injury >= 2:
    Your second injury slows you down.
    Everything costs more effort now.
    ~ time += 1
    -> check_time ->
}

+ [Continue to School Hallways]
    -> hallway


=== hallway ===
~ time += 1
-> check_time ->
-> check_death ->

Second floor.
Dim emergency lights flicker like they’re about to give up.
Room 203 is up ahead.
Three zombies claw at the barricaded door.
Haley screams inside.

Time: {time}/{TIME_LIMIT}
Danger: {danger}
Injuries: {injury}

+ { hasHeal > 0 && injury > 0 } [Use medical supplies]
    ~ return_knot = -> hallway
    -> use_heal

+ { hasGun } [Shoot them]
    ~ danger += 1
    -> hallway_resolve

+ { hasWeapon } [Fight up close]
    -> hallway_resolve

+ [Lure them away]
    ~ time += 1
    ~ danger += 1
    -> check_time ->
    -> danger_injury_roll ->
    -> hallway_resolve


=== hallway_resolve ===
{ hasGun:
    The shots are clean and fast.
    Too loud, probably.
    But you cant say anything about their effectiveness.
}
{ hasWeapon && not hasGun:
    You go close, but since its close quarter combat it takes a while to  get rid of however you still do do what you have to do.
    ~ time += 1
    ~ danger += 1
}
{ not hasWeapon && not hasGun:
    You shouldn’t be here like this.
    Not unarmed.
    ~ injury += 1
    ~ time += 1
    -> check_death ->
}

-> rescue


// /////////////////////////////////////////////////// ENDINGS
=== rescue ===
The door opens.
Haley runs into your arms like she’s been holding her breath for hours.
A teacher behind her. Two friends. Faces streaked with tears and grime.
You’re hurt.
You’re alive.
You saved your sister.

-> END


=== fail_time ===
You were too late. The hallway is silent.
The only thing you find in Room 203 is the blody stains of a massacre.  .
The apocalypse doesn’t wait.

-> END


=== death ===
Oof what a way to go.
You truly are dead.

-> END



// UTILS (tunnel-style so you can call them with -> check_time -> etc)
=== check_death ===
{ injury >= 3:
    You take one  more step and your body just says no.
    The world tilts.
    The apocalypse finishes the job.
    -> death
- else:
    ->->
}


=== check_time ===
{ time >= TIME_LIMIT:
    -> fail_time
- else:
    ->->
}


// danger → injury chance roll
// +20% chance for every danger level above (baseThreshold + dangerResist)
=== danger_injury_roll ===
~ temp over = danger - (baseThreshold + dangerResist)
~ temp chance = 0

{ over > 0:
    ~ chance = over * 20
}

{ chance > 95:
    ~ chance = 95
}

~ temp roll = RANDOM(0, 100)

{ roll < chance:
    You misstep. Something *grabs* you.
    ~ injury += 1
    { injury == 2:
        It’s worse now.
        Your breathing is loud.
        Your pace isn’t the same.
    }
    -> check_death ->
    ->->
- else:
    ->->
}


// Civilian special +10% base find chance, and cap can reach 95%
=== apply_class_find_rules ===
{ isCivilian:
    ~ civilianFindBonus = 10
    ~ findChanceMax = 95
- else:
    ~ civilianFindBonus = 0
    ~ findChanceMax = 85
}
->->


/////////////////////////////  HEAL RETURN ROUTER
=== return_after_heal ===
-> return_knot


///////////////////////////// NEW HEALTH SYSTEM 
=== use_heal ===
{ hasHeal <= 0:
    You dont have any medical supplies left.
+ [Back] -> return_after_heal
}

{ injury <= 0:
    You dont need to use medical supplies right now.
+ [Back] -> return_after_heal
}

~ time += 1
-> check_time ->

~ hasHeal -= 1
~ injury -= 1

{ injury < 0:
    ~ injury = 0
}

-> check_death ->

You healed yourself one less injury you currently have {injury} injuries left

+ [Continue]
    -> return_after_heal