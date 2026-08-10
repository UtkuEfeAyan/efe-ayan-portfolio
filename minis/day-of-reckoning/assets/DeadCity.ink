// settlement_sim.ink - zombie survival base management game

// r11: system 1 - survival/resource management system
// world state: foodsupply, cleanwater, medicinesupply, materialsupply, infestationpressure
// agent state: health, fatigue, hunger, scavengingskill
// agent actions: scavenge (gather resources), farm (produce food/water), rest (recover fatigue)
// authored events: food shortage crisis, water contamination

// r12: system 2 - threat/defense system  
// world state: infestationpressure, clearedrooms, total_guard_score, guard_required
// agent state: combatskill, guardskill, fear
// agent actions: guard (defend at night), clear (reduce zombie pressure and clear rooms)
// authored events: zombie breach, night attack (insufficient guards)

// r32: constants for all values, including at least one "jitter" constant adding randomization to the utility functions
// constants
CONST UTILITY_JITTER_MAX = 15
CONST STARTING_FOOD = 45
CONST STARTING_WATER = 50
CONST STARTING_MEDICINE = 20
CONST STARTING_MATERIALS = 30
CONST STARTING_CLEARED_ROOMS = 8

CONST FOOD_CONSUMPTION_PER_PERSON = 3
CONST WATER_CONSUMPTION_PER_PERSON = 3
CONST FATIGUE_GAIN_PER_ACTION = 15
CONST FATIGUE_RECOVERY_FROM_REST = 40
CONST HUNGER_INCREASE_PER_DAY = 20
CONST MORALE_DECAY_PER_DAY = 3

CONST CRITICAL_FOOD_THRESHOLD = 20
CONST CRITICAL_WATER_THRESHOLD = 20
CONST CRITICAL_MEDICINE_THRESHOLD = 10
CONST HIGH_INFESTATION_THRESHOLD = 70
CONST LOW_MORALE_THRESHOLD = 30
CONST LOW_TRUST_THRESHOLD = 25

CONST MAX_CLEARED_ROOMS = 50
CONST MAX_FATIGUE = 50
CONST MAX_HEALTH = 100

// building costs and caps
CONST COST_FARMHOUSE = 15
CONST COST_WATERWELL = 15
CONST COST_GUARDTOWER = 30
CONST COST_MEDICTENT = 30
CONST MAX_FARMHOUSE = 10
CONST MAX_WATERWELL = 10
CONST MAX_GUARDTOWER = 5
CONST MAX_MEDICTENT = 5

// jobs
CONST JOB_GUARD = 1
CONST JOB_FARMER = 2
CONST JOB_SCAVENGER = 3
CONST JOB_CLEARER = 4
CONST JOB_DOCTOR = 5
CONST JOB_REST = 6

// fatigue costs by tier (tier 1 = 30, tier 2 = 25, tier 3 = 20, tier 4 = 15, tier 5 = 10)
CONST FATIGUE_TIER_1 = 30
CONST FATIGUE_TIER_2 = 25
CONST FATIGUE_TIER_3 = 20
CONST FATIGUE_TIER_4 = 15
CONST FATIGUE_TIER_5 = 10

// doctor fatigue (starts at 50, -5 per tier)
CONST DOCTOR_FATIGUE_TIER_1 = 50
CONST DOCTOR_FATIGUE_TIER_2 = 45
CONST DOCTOR_FATIGUE_TIER_3 = 40
CONST DOCTOR_FATIGUE_TIER_4 = 35
CONST DOCTOR_FATIGUE_TIER_5 = 30

// guard thresholds by infestation level
CONST GUARD_THRESHOLD_LOW = 5
CONST GUARD_THRESHOLD_MEDIUM = 15
CONST GUARD_THRESHOLD_HIGH = 25
CONST GUARD_THRESHOLD_VERY_HIGH = 35
CONST GUARD_THRESHOLD_CRITICAL = 50

// r21: use at least 2 world state variables in total
VAR day = 1
VAR foodSupply = 0
VAR cleanWater = 0
VAR medicineSupply = 0
VAR materialSupply = 0
VAR clearedRooms = 0
VAR noiseLevel = 0
VAR infestationPressure = 30
VAR moraleAverage = 0
VAR groupCohesion = 50
VAR leadershipStrength = 60
VAR total_guard_score = 0
VAR guard_required = 0

// buildings (passive resource generators & defense)
VAR buildings_farmhouse = 0
VAR buildings_waterwell = 0
VAR buildings_guardtower = 0
VAR buildings_medictent = 0

// job assignments
VAR haley_job = 0
VAR marcus_job = 0
VAR chen_job = 0
VAR sofia_job = 0
VAR rodriguez_job = 0
VAR elena_job = 0
VAR jackson_job = 0
VAR maya_job = 0
VAR alex_job = 0
VAR kim_job = 0

// guard duty tracking (locked for next day if true)
VAR haley_on_guard = false
VAR marcus_on_guard = false
VAR chen_on_guard = false
VAR sofia_on_guard = false
VAR rodriguez_on_guard = false
VAR elena_on_guard = false
VAR jackson_on_guard = false
VAR maya_on_guard = false
VAR alex_on_guard = false
VAR kim_on_guard = false

// tracking
VAR jackson_rescued = false
VAR maya_rescued = false
VAR alex_rescued = false
VAR kim_rescued = false

VAR event_food_crisis_triggered = false
VAR event_zombie_breach_triggered = false
VAR event_argument_triggered = false
VAR event_haley_sick_triggered = false
VAR event_elena_steals_triggered = false
VAR event_water_contamination_triggered = false
VAR event_outsiders_triggered = false
VAR event_generator_triggered = false

// r22: use at least 4 agent state variables in total
// agent state variables

// player character
VAR player_health = 85
VAR player_fatigue = 20
VAR player_hunger = 30
VAR player_morale = 70

// haley - balanced survivor
VAR haley_health = 100
VAR haley_fatigue = 0
VAR haley_hunger = 35
VAR haley_morale = 65
VAR haley_trustPlayer = 90
VAR haley_loyalty = 95
VAR haley_fear = 40
VAR haley_grief = 50
VAR haley_scavengingTier = 3
VAR haley_farmingTier = 3
VAR haley_clearingTier = 2
VAR haley_doctorTier = 2
VAR haley_guardSkill = 10

// marcus - teacher/medic
VAR marcus_health = 100
VAR marcus_fatigue = 0
VAR marcus_hunger = 40
VAR marcus_morale = 70
VAR marcus_trustPlayer = 75
VAR marcus_loyalty = 80
VAR marcus_fear = 35
VAR marcus_grief = 60
VAR marcus_scavengingTier = 2
VAR marcus_farmingTier = 3
VAR marcus_clearingTier = 1
VAR marcus_doctorTier = 5
VAR marcus_guardSkill = 5

// chen - builder/engineer
VAR chen_health = 100
VAR chen_fatigue = 0
VAR chen_hunger = 30
VAR chen_morale = 75
VAR chen_trustPlayer = 70
VAR chen_loyalty = 75
VAR chen_fear = 30
VAR chen_grief = 35
VAR chen_scavengingTier = 3
VAR chen_farmingTier = 4
VAR chen_clearingTier = 3
VAR chen_doctorTier = 1
VAR chen_guardSkill = 10

// sofia - scavenger/runner
VAR sofia_health = 100
VAR sofia_fatigue = 0
VAR sofia_hunger = 25
VAR sofia_morale = 80
VAR sofia_trustPlayer = 80
VAR sofia_loyalty = 85
VAR sofia_fear = 25
VAR sofia_grief = 40
VAR sofia_scavengingTier = 5
VAR sofia_farmingTier = 2
VAR sofia_clearingTier = 4
VAR sofia_doctorTier = 2
VAR sofia_guardSkill = 10

// rodriguez - security guard
VAR rodriguez_health = 100
VAR rodriguez_fatigue = 0
VAR rodriguez_hunger = 40
VAR rodriguez_morale = 65
VAR rodriguez_trustPlayer = 70
VAR rodriguez_loyalty = 70
VAR rodriguez_fear = 20
VAR rodriguez_grief = 55
VAR rodriguez_scavengingTier = 3
VAR rodriguez_farmingTier = 2
VAR rodriguez_clearingTier = 5
VAR rodriguez_doctorTier = 2
VAR rodriguez_guardSkill = 20

// elena - unstable/selfish
VAR elena_health = 100
VAR elena_fatigue = 0
VAR elena_hunger = 50
VAR elena_morale = 45
VAR elena_trustPlayer = 40
VAR elena_loyalty = 35
VAR elena_fear = 70
VAR elena_grief = 75
VAR elena_resentment = 60
VAR elena_scavengingTier = 3
VAR elena_farmingTier = 1
VAR elena_clearingTier = 1
VAR elena_doctorTier = 1
VAR elena_guardSkill = 5

// jackson - rescuable elite guard
VAR jackson_health = 100
VAR jackson_fatigue = 0
VAR jackson_hunger = 35
VAR jackson_morale = 70
VAR jackson_trustPlayer = 50
VAR jackson_loyalty = 60
VAR jackson_fear = 10
VAR jackson_grief = 40
VAR jackson_scavengingTier = 4
VAR jackson_farmingTier = 3
VAR jackson_clearingTier = 5
VAR jackson_doctorTier = 3
VAR jackson_guardSkill = 15

// maya - rescuable survivor
VAR maya_health = 100
VAR maya_fatigue = 0
VAR maya_hunger = 30
VAR maya_morale = 65
VAR maya_trustPlayer = 50
VAR maya_loyalty = 55
VAR maya_fear = 30
VAR maya_grief = 50
VAR maya_scavengingTier = 3
VAR maya_farmingTier = 3
VAR maya_clearingTier = 4
VAR maya_doctorTier = 2
VAR maya_guardSkill = 15

// alex - rescuable elite scavenger (discovered at room 15)
VAR alex_health = 100
VAR alex_fatigue = 0
VAR alex_hunger = 30
VAR alex_morale = 70
VAR alex_trustPlayer = 50
VAR alex_loyalty = 60
VAR alex_fear = 15
VAR alex_grief = 45
VAR alex_scavengingTier = 5
VAR alex_farmingTier = 3
VAR alex_clearingTier = 4
VAR alex_doctorTier = 3
VAR alex_guardSkill = 15

// kim - rescuable elite guard (discovered at room 10)
VAR kim_health = 100
VAR kim_fatigue = 0
VAR kim_hunger = 30
VAR kim_morale = 70
VAR kim_trustPlayer = 50
VAR kim_loyalty = 60
VAR kim_fear = 5
VAR kim_grief = 40
VAR kim_scavengingTier = 3
VAR kim_farmingTier = 2
VAR kim_clearingTier = 5
VAR kim_doctorTier = 2
VAR kim_guardSkill = 25

// temp tracking
VAR current_agent = ""
VAR actions_this_turn = 0
VAR doctor_assigned = false
VAR doctor_tier = 0
VAR doctor_name = ""

-> intro

=== intro ===
the zombie apocalypse started a week ago.

you and a small group of survivors found shelter in an abandoned school.

together, you cleared the east wing. barricaded doors. stacked furniture. made it... safe enough.

the others look to you now. someone has to lead. someone has to decide.

this is about survival. making it through tomorrow. and the day after that.

the school is your base now. a fragile sanctuary in a dead world.

+ [continue]
    -> intro_settlement

=== intro_settlement ===
your group (6 people total, goal: 10):
- you (the leader)
- haley (determined, reliable, good at everything)
- marcus (calm, elite doctor, heals everyone)
- chen (good with tools, strong farmer, builds efficiently)
- sofia (fast, brave, elite scavenger, finds tons of supplies)
- rodriguez (tough security guard, elite room clearer)
- elena (paranoid, difficult, selfish... problematic)

as you clear rooms, you'll find 4 more survivors to join your group:
- 15 rooms: find maya (tier 4 clearer, guard 15)
- 25 rooms: find kim (best guard 25!, elite tier 5 clearer) 
- 35 rooms: find alex (elite tier 5 scavenger, finds 15-25 supplies!)
- 45 rooms: find jackson (elite tier 5 clearer, tier 4 scavenger)

the east wing is secure. eight rooms cleared. some food. some water. not enough.

the rest of the school is still overrun. the cafeteria. the gym. the other buildings. all still theirs.

50 rooms total must be cleared to secure the entire school and win.

you must also build all 30 buildings: 10 farms, 10 wells, 5 towers, 5 tents.

but it won't stay theirs forever.

+ [begin day 1]
    -> guard_system_explanation

=== guard_system_explanation ===
<> defense & survival basics <>

// r31: implementation of at least the core simulation architecture (game loop, choices, agent turn, do highest-utility action, utility functions, action functions, and drama management)
// this file implements: game loop (main_loop), choices (player_decisions), agent turn (execute_jobs), 
// utility functions (calculate_utility_*), action functions (execute_*), and drama management (check_drama_events)

zombie pressure: builds daily. the more zombies gather, the more dangerous it becomes.

guards: people on watch duty. they DON'T reduce zombies - they just keep you alive through the night.
- infestation 0-9: no guards needed (safe)
- infestation 10-24: need 5+ guard score (1 decent guard)
- infestation 25-49: need 10+ guard score (1-2 guards)
- infestation 50-69: need 20+ guard score (2-3 guards or 1 elite)
- infestation 70-89: need 30+ guard score (2 guards minimum)
- infestation 90-99: need 50+ guard score (2 elite guards or 3 good ones)
- infestation 100+: need 70+ guard score (3 elite guards)

clearing areas: the only way to reduce zombie pressure and WIN the game. clear all 50 rooms to secure the school!
- best clearers: rodriguez (tier 5 elite), sofia (tier 4), chen (tier 3)
- clearing also discovers new survivors at rooms 15, 25, 35, and 45!

scavenging: find food and materials. critical for survival.
- best scavengers: sofia (tier 5 elite), chen (tier 3), haley (tier 3)

farming: generate food and water daily. build farms and wells for passive income.
- best farmers: chen (tier 4 strong), haley (tier 3), marcus (tier 3)

doctor: heal injuries. marcus is elite (tier 5) and heals everyone at once.

balance: too many guards = wasted labor. too few = deadly nights.

best guards: kim (25), rodriguez (20), jackson (15), maya (15), alex (15)
note: kim, jackson, maya, alex are rescuable survivors found while clearing rooms.

+ [understood - start day 1]
    ~ foodSupply = STARTING_FOOD
    ~ cleanWater = STARTING_WATER
    ~ medicineSupply = STARTING_MEDICINE
    ~ materialSupply = STARTING_MATERIALS
    ~ clearedRooms = STARTING_CLEARED_ROOMS
    -> calculate_morale -> main_loop

// main game loop

=== main_loop ===
~ day += 1

// Reset guard duty flags at start of new day (they were locked from previous day)
~ haley_on_guard = false
~ marcus_on_guard = false
~ chen_on_guard = false
~ sofia_on_guard = false
~ rodriguez_on_guard = false
~ elena_on_guard = false
~ jackson_on_guard = false
~ maya_on_guard = false
~ kim_on_guard = false
~ alex_on_guard = false

// check end conditions
-> check_end_conditions ->

// daily resource consumption (3 food, 3 water per person)
~ temp population = 6
{jackson_rescued: 
    ~ population += 1
}
{maya_rescued: 
    ~ population += 1
}
{kim_rescued: 
    ~ population += 1
}
{alex_rescued: 
    ~ population += 1
}
~ foodSupply -= (population * FOOD_CONSUMPTION_PER_PERSON)
~ cleanWater -= (population * WATER_CONSUMPTION_PER_PERSON)

// passive building resource generation (+3 per building)
~ foodSupply += (buildings_farmhouse * 3)
~ cleanWater += (buildings_waterwell * 3)
~ medicineSupply += buildings_medictent

// daily state changes
~ infestationPressure += 5
~ noiseLevel = 0

// increase hunger for all agents
~ haley_hunger += HUNGER_INCREASE_PER_DAY
~ marcus_hunger += HUNGER_INCREASE_PER_DAY
~ chen_hunger += HUNGER_INCREASE_PER_DAY
~ sofia_hunger += HUNGER_INCREASE_PER_DAY
~ rodriguez_hunger += HUNGER_INCREASE_PER_DAY
~ elena_hunger += HUNGER_INCREASE_PER_DAY

{jackson_rescued:
    ~ jackson_hunger += HUNGER_INCREASE_PER_DAY
}
{maya_rescued:
    ~ maya_hunger += HUNGER_INCREASE_PER_DAY
}
{kim_rescued:
    ~ kim_hunger += HUNGER_INCREASE_PER_DAY
}
{alex_rescued:
    ~ alex_hunger += HUNGER_INCREASE_PER_DAY
}

// feed survivors if possible
-> feed_survivors -> calculate_morale -> status_report

=== feed_survivors ===
// reduce hunger if food is available
{foodSupply > 0:
    ~ haley_hunger -= 25
    ~ marcus_hunger -= 25
    ~ chen_hunger -= 25
    ~ sofia_hunger -= 25
    ~ rodriguez_hunger -= 25
    ~ elena_hunger -= 25
    
    {jackson_rescued:
        ~ jackson_hunger -= 25
    }
    {maya_rescued:
        ~ maya_hunger -= 25
    }
    {kim_rescued:
        ~ kim_hunger -= 25
    }
    {alex_rescued:
        ~ alex_hunger -= 25
    }
    
    {haley_hunger < 0: 
        ~ haley_hunger = 0
    }
    {marcus_hunger < 0: 
        ~ marcus_hunger = 0
    }
    {chen_hunger < 0: 
        ~ chen_hunger = 0
    }
    {sofia_hunger < 0: 
        ~ sofia_hunger = 0
    }
    {rodriguez_hunger < 0: 
        ~ rodriguez_hunger = 0
    }
    {elena_hunger < 0: 
        ~ elena_hunger = 0
    }
    {jackson_rescued && jackson_hunger < 0:
        ~ jackson_hunger = 0
    }
    {maya_rescued && maya_hunger < 0:
        ~ maya_hunger = 0
    }
    {kim_rescued && kim_hunger < 0:
        ~ kim_hunger = 0
    }
    {alex_rescued && alex_hunger < 0:
        ~ alex_hunger = 0
    }
- else:
    // starvation morale penalty
    ~ haley_morale -= 15
    ~ marcus_morale -= 15
    ~ chen_morale -= 15
    ~ sofia_morale -= 15
    ~ rodriguez_morale -= 15
    ~ elena_morale -= 15
    {jackson_rescued:
        ~ jackson_morale -= 15
    }
    {maya_rescued:
        ~ maya_morale -= 15
    }
    {kim_rescued:
        ~ kim_morale -= 15
    }
    {alex_rescued:
        ~ alex_morale -= 15
    }
}
->->

=== status_report ===

day {day}

resources: food {foodSupply} - water {cleanWater} - meds {medicineSupply} - materials {materialSupply}
base: rooms {clearedRooms}/{MAX_CLEARED_ROOMS} - guards {total_guard_score}
buildings: farms {buildings_farmhouse}/10 - wells {buildings_waterwell}/10 - towers {buildings_guardtower}/5 - tents {buildings_medictent}/5
threat: zombies {infestationPressure}% - morale {moraleAverage}%

haley: hp {haley_health} - tired {haley_fatigue} - trust {haley_trustPlayer}
marcus: hp {marcus_health} - tired {marcus_fatigue} - trust {marcus_trustPlayer}
chen: hp {chen_health} - tired {chen_fatigue} - trust {chen_trustPlayer}
sofia: hp {sofia_health} - tired {sofia_fatigue} - trust {sofia_trustPlayer}
rodriguez: hp {rodriguez_health} - tired {rodriguez_fatigue} - trust {rodriguez_trustPlayer}
elena: hp {elena_health} - tired {elena_fatigue} - trust {elena_trustPlayer}
{jackson_rescued:jackson: hp {jackson_health} - tired {jackson_fatigue} - trust {jackson_trustPlayer}}
{maya_rescued:maya: hp {maya_health} - tired {maya_fatigue} - trust {maya_trustPlayer}}
{kim_rescued:kim: hp {kim_health} - tired {kim_fatigue} - trust {kim_trustPlayer}}
{alex_rescued:alex: hp {alex_health} - tired {alex_fatigue} - trust {alex_trustPlayer}}

{foodSupply < CRITICAL_FOOD_THRESHOLD: ⚠️ food low}
{cleanWater < CRITICAL_WATER_THRESHOLD: ⚠️ water low}
{moraleAverage < LOW_MORALE_THRESHOLD: ⚠️ morale low}
{infestationPressure > HIGH_INFESTATION_THRESHOLD: ⚠️ zombie pressure high}

+ [continue]
    -> player_decisions

+ [view character details]
    -> character_selection_menu

+ [📖 view tooltips]
    -> tooltips_menu

=== character_selection_menu ===
select a character to view detailed stats:

* [haley]
    -> view_haley_stats
* [marcus]
    -> view_marcus_stats
* [chen]
    -> view_chen_stats
* [sofia]
    -> view_sofia_stats
* [rodriguez]
    -> view_rodriguez_stats
* [elena]
    -> view_elena_stats
{jackson_rescued:
    * [jackson]
        -> view_jackson_stats
}
{maya_rescued:
    * [maya]
        -> view_maya_stats
}
{kim_rescued:
    * [kim]
        -> view_kim_stats
}
{alex_rescued:
    * [alex]
        -> view_alex_stats
}
* [back to status]
    -> status_report

=== tooltips_menu ===
<> === game guide & tooltips === <>

select a topic to learn more:

* [jobs overview]
    -> tooltips_jobs
* [best characters for each job]
    -> tooltips_best_characters
* [guard system explained]
    -> tooltips_guards
* [buildings & upgrades]
    -> tooltips_buildings
* [survivor rescue system]
    -> tooltips_rescues
* [win & lose conditions]
    -> tooltips_conditions
* [back to status]
    -> status_report

=== tooltips_jobs ===
<> === jobs overview === <>

guard: stand watch at night. prevents zombie attacks. guards are locked for the next day (must rest).

farmer: gather food and water. tier affects yield. passive income from farmhouses and wells.

scavenger: find food, medicine, and materials. higher tier = more supplies found.

clear rooms: push back zombies and secure new areas. only way to reduce infestation and win. rescues survivors at rooms 15, 25, 35, 45.

doctor: heal injuries. higher tier heals more people and more hp. costs medicine.

rest: recover 40 fatigue. critical for keeping people working. guards must rest after duty.

+ [back]
    -> tooltips_menu

=== tooltips_best_characters ===
<> === best characters by job === <>

guards (night watch):
★★★ kim (25) - best guard, found at room 25
★★ rodriguez (20) - security guard, available now
★ jackson (15), maya (15), alex (15) - all rescuable
★ chen (10), sofia (10), haley (10) - decent backups

scavengers (find supplies):
★★★ sofia (tier 5) & alex (tier 5) - elite, 15-25 supplies each!
★★ jackson (tier 4) - strong, 8-15 supplies
★ chen (tier 3), haley (tier 3), others (tier 3)

farmers (food/water):
★★★ chen (tier 4) - strong farmer, 5-7 per run
★★ haley (tier 3), marcus (tier 3), maya (tier 3), alex (tier 3), jackson (tier 3) - 4-6 per run

room clearers (win condition):
★★★ rodriguez (tier 5), jackson (tier 5), kim (tier 5) - elite
★★ sofia (tier 4), maya (tier 4), alex (tier 4) - strong
★ chen (tier 3) - decent

doctors (healing):
★★★ marcus (tier 5) - elite! heals everyone at once!
★★ jackson (tier 3), alex (tier 3) - good, heal 3-4 people
★ haley (tier 2), sofia (tier 2) - basic, heal 2-3 people

+ [back]
    -> tooltips_menu

=== tooltips_guards ===
<> === guard system explained === <>

guards don't fight zombies - they keep watch at night so zombies don't breach your base.

infestation vs guards needed:
• 0-9%: no guards needed (0)
• 10-24%: need 5+ guard score
• 25-49%: need 10+ guard score
• 50-69%: need 20+ guard score
• 70-89%: need 30+ guard score
• 90-99%: need 50+ guard score
• 100%+: need 70+ guard score (game over if you fail)

important: guards are locked after duty and must rest the next day!

guard towers add +5 guard power each (max 5 towers = +25 power).

strategy: rotate guards! don't use the same person every night or they'll be exhausted.

+ [back]
    -> tooltips_menu

=== tooltips_buildings ===
<> === buildings & upgrades === <>

farm house (15 materials, max 10): +3 food per day passive income

water well (15 materials, max 10): +3 water per day passive income

guard tower (30 materials, max 5): +5 guard power always active (no fatigue!)

medical tent (30 materials, max 5): +1 medicine per day passive income

strategy: build farms and wells early for passive food and water. guard towers save labor late game when infestation is high.

resource consumption: each person eats 3 food and drinks 3 water per day. with 10 survivors, you need 30 food and 30 water daily!

victory requires ALL 30 buildings built (10 farms, 10 wells, 5 towers, 5 tents) plus all 50 rooms cleared!

+ [Back]
    -> tooltips_menu

=== tooltips_rescues ===
<> === survivor rescue system === <>

you start with 6 survivors. rescue 4 more as you clear rooms:

📍 15 rooms cleared: rescue maya
- good room clearer (tier 4)
- guard score: 15
- balanced survivor

📍 25 rooms cleared: rescue kim
- best guard in game (25!)
- elite room clearer (tier 5)
- game changer for defense

📍 35 rooms cleared: rescue alex
- elite scavenger (tier 5)
- finds 15-25 supplies per run!
- guard score: 15

📍 45 rooms cleared: rescue jackson
- elite room clearer (tier 5)
- strong scavenger (tier 4)
- guard score: 15

final group: 10 survivors total

+ [back]
    -> tooltips_menu

=== tooltips_conditions ===
<> === win & lose conditions === <>

🏆 victory:
clear all 50 rooms and build all 30 buildings (10 farms, 10 wells, 5 towers, 5 tents)! secure the entire school and you win!

💀 defeat conditions:

starvation: food and water both drop below -20
prevention: build farms/wells, assign scavengers

overrun: infestation reaches 100%+
prevention: clear rooms regularly, manage zombie pressure

group collapse: morale ≤10 and cohesion ≤5
prevention: keep people fed, rested, and healthy

total loss: all 6 starting survivors die
prevention: use doctor, don't overwork people, maintain guard coverage

strategy: balance clearing rooms (win condition) with gathering supplies (survival). don't rush clearing if you can't feed your people!

+ [back]
    -> tooltips_menu

=== view_haley_stats ===
<> === haley - detailed stats === <>

role: balanced survivor
health: {haley_health}/100
fatigue: {haley_fatigue}/50
hunger: {haley_hunger}/100
morale: {haley_morale}/100

trust in player: {haley_trustPlayer}/100
loyalty: {haley_loyalty}/100
fear: {haley_fear}/100
grief: {haley_grief}/100

skills:
- scavenger (tier {haley_scavengingTier})
- farmer (tier {haley_farmingTier})
- room clearer (tier {haley_clearingTier})
- doctor (tier {haley_doctorTier})
- guard score: {haley_guardSkill}

{haley_on_guard: ⚠️ On guard duty - will rest tomorrow}
{haley_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{haley_health <= 30: ⚠️ CRITICALLY INJURED}
{haley_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_marcus_stats ===
<> === marcus - detailed stats === <>

role: teacher/medic
health: {marcus_health}/100
fatigue: {marcus_fatigue}/50
hunger: {marcus_hunger}/100
morale: {marcus_morale}/100

trust in player: {marcus_trustPlayer}/100
loyalty: {marcus_loyalty}/100
fear: {marcus_fear}/100
grief: {marcus_grief}/100

skills:
- scavenger (tier {marcus_scavengingTier})
- farmer (tier {marcus_farmingTier})
- room clearer (tier {marcus_clearingTier})
- doctor (tier {marcus_doctorTier}) ★ elite
- guard score: {marcus_guardSkill}

{marcus_on_guard: ⚠️ On guard duty - will rest tomorrow}
{marcus_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{marcus_health <= 30: ⚠️ CRITICALLY INJURED}
{marcus_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_chen_stats ===
<> === chen - detailed stats === <>

role: builder/engineer
health: {chen_health}/100
fatigue: {chen_fatigue}/50
hunger: {chen_hunger}/100
morale: {chen_morale}/100

trust in player: {chen_trustPlayer}/100
loyalty: {chen_loyalty}/100
fear: {chen_fear}/100
grief: {chen_grief}/100

skills:
- scavenger (tier {chen_scavengingTier})
- farmer (tier {chen_farmingTier}) ★ strong
- room clearer (tier {chen_clearingTier})
- doctor (tier {chen_doctorTier})
- guard score: {chen_guardSkill}

{chen_on_guard: ⚠️ On guard duty - will rest tomorrow}
{chen_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{chen_health <= 30: ⚠️ CRITICALLY INJURED}
{chen_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_sofia_stats ===
<> === sofia - detailed stats === <>

role: scavenger/runner
health: {sofia_health}/100
fatigue: {sofia_fatigue}/50
hunger: {sofia_hunger}/100
morale: {sofia_morale}/100

trust in player: {sofia_trustPlayer}/100
loyalty: {sofia_loyalty}/100
fear: {sofia_fear}/100
grief: {sofia_grief}/100

skills:
- scavenger (tier {sofia_scavengingTier}) ★★★ elite
- farmer (tier {sofia_farmingTier})
- room clearer (tier {sofia_clearingTier}) ★ strong
- doctor (tier {sofia_doctorTier})
- guard score: {sofia_guardSkill}

{sofia_on_guard: ⚠️ On guard duty - will rest tomorrow}
{sofia_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{sofia_health <= 30: ⚠️ CRITICALLY INJURED}
{sofia_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_rodriguez_stats ===
<> === rodriguez - detailed stats === <>

role: security guard
health: {rodriguez_health}/100
fatigue: {rodriguez_fatigue}/50
hunger: {rodriguez_hunger}/100
morale: {rodriguez_morale}/100

trust in player: {rodriguez_trustPlayer}/100
loyalty: {rodriguez_loyalty}/100
fear: {rodriguez_fear}/100
grief: {rodriguez_grief}/100

skills:
- scavenger (tier {rodriguez_scavengingTier})
- farmer (tier {rodriguez_farmingTier})
- room clearer (tier {rodriguez_clearingTier}) ★★★ elite
- doctor (tier {rodriguez_doctorTier})
- guard score: {rodriguez_guardSkill}

{rodriguez_on_guard: ⚠️ On guard duty - will rest tomorrow}
{rodriguez_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{rodriguez_health <= 30: ⚠️ CRITICALLY INJURED}
{rodriguez_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_elena_stats ===
<> === elena - detailed stats === <>

role: unstable/selfish
health: {elena_health}/100
fatigue: {elena_fatigue}/50
hunger: {elena_hunger}/100
morale: {elena_morale}/100

trust in player: {elena_trustPlayer}/100
loyalty: {elena_loyalty}/100
fear: {elena_fear}/100
grief: {elena_grief}/100
resentment: {elena_resentment}/100 ⚠️

skills:
- scavenger (tier {elena_scavengingTier})
- farmer (tier {elena_farmingTier})
- room clearer (tier {elena_clearingTier})
- doctor (tier {elena_doctorTier})
- guard score: {elena_guardSkill}

{elena_health <= 30: ⚠️ CRITICALLY INJURED}
{elena_morale <= 30: ⚠️ LOW MORALE}
{elena_resentment >= 70: ⚠️ HIGH RESENTMENT - MAY BETRAY}

+ [Back]
    -> character_selection_menu

=== view_jackson_stats ===
<> === jackson - detailed stats === <>

role: elite guard (rescued)
health: {jackson_health}/100
fatigue: {jackson_fatigue}/50
hunger: {jackson_hunger}/100
morale: {jackson_morale}/100

trust in player: {jackson_trustPlayer}/100
loyalty: {jackson_loyalty}/100
fear: {jackson_fear}/100
grief: {jackson_grief}/100

skills:
- scavenger (tier {jackson_scavengingTier}) ★ strong
- farmer (tier {jackson_farmingTier})
- room clearer (tier {jackson_clearingTier}) ★★★ elite
- doctor (tier {jackson_doctorTier})
- guard score: {jackson_guardSkill}

{jackson_on_guard: ⚠️ On guard duty - will rest tomorrow}
{jackson_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{jackson_health <= 30: ⚠️ CRITICALLY INJURED}
{jackson_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_maya_stats ===
<> === maya - detailed stats === <>

role: survivor (rescued)
health: {maya_health}/100
fatigue: {maya_fatigue}/50
hunger: {maya_hunger}/100
morale: {maya_morale}/100

trust in player: {maya_trustPlayer}/100
loyalty: {maya_loyalty}/100
fear: {maya_fear}/100
grief: {maya_grief}/100

skills:
- scavenger (tier {maya_scavengingTier})
- farmer (tier {maya_farmingTier})
- room clearer (tier {maya_clearingTier}) ★ strong
- doctor (tier {maya_doctorTier})
- guard score: {maya_guardSkill}

{maya_on_guard: ⚠️ On guard duty - will rest tomorrow}
{maya_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{maya_health <= 30: ⚠️ CRITICALLY INJURED}
{maya_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_kim_stats ===
<> === kim - detailed stats === <>

role: elite guard (rescued)
health: {kim_health}/100
fatigue: {kim_fatigue}/50
hunger: {kim_hunger}/100
morale: {kim_morale}/100

trust in player: {kim_trustPlayer}/100
loyalty: {kim_loyalty}/100
fear: {kim_fear}/100
grief: {kim_grief}/100

skills:
- scavenger (tier {kim_scavengingTier})
- farmer (tier {kim_farmingTier})
- room clearer (tier {kim_clearingTier}) ★★★ elite
- doctor (tier {kim_doctorTier})
- guard score: {kim_guardSkill} ★★★ best guard

{kim_on_guard: ⚠️ On guard duty - will rest tomorrow}
{kim_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{kim_health <= 30: ⚠️ CRITICALLY INJURED}
{kim_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== view_alex_stats ===
<> === alex - detailed stats === <>

role: elite scavenger (rescued)
health: {alex_health}/100
fatigue: {alex_fatigue}/50
hunger: {alex_hunger}/100
morale: {alex_morale}/100

trust in player: {alex_trustPlayer}/100
loyalty: {alex_loyalty}/100
fear: {alex_fear}/100
grief: {alex_grief}/100

skills:
- scavenger (tier {alex_scavengingTier}) ★★★ elite
- farmer (tier {alex_farmingTier})
- room clearer (tier {alex_clearingTier}) ★ strong
- doctor (tier {alex_doctorTier})
- guard score: {alex_guardSkill}

{alex_on_guard: ⚠️ On guard duty - will rest tomorrow}
{alex_fatigue >= MAX_FATIGUE: ⚠️ EXHAUSTED}
{alex_health <= 30: ⚠️ CRITICALLY INJURED}
{alex_morale <= 30: ⚠️ LOW MORALE}

+ [Back]
    -> character_selection_menu

=== calculate_morale ===
~ temp total = haley_morale + marcus_morale + chen_morale + sofia_morale + rodriguez_morale + elena_morale
~ temp count = 6

{jackson_rescued:
    ~ total += jackson_morale
    ~ count += 1
}
{maya_rescued:
    ~ total += maya_morale
    ~ count += 1
}
{kim_rescued:
    ~ total += kim_morale
    ~ count += 1
}
{alex_rescued:
    ~ total += alex_morale
    ~ count += 1
}

~ moraleAverage = total / count

{moraleAverage < LOW_MORALE_THRESHOLD:
    ~ haley_loyalty -= 1
    ~ marcus_loyalty -= 1
    ~ chen_loyalty -= 1
    ~ sofia_loyalty -= 1
    ~ rodriguez_loyalty -= 1
    ~ elena_loyalty -= 2
}

// clamp morale values
{haley_morale > 100: 
    ~ haley_morale = 100
}
{marcus_morale > 100: 
    ~ marcus_morale = 100
}
{chen_morale > 100: 
    ~ chen_morale = 100
}
{sofia_morale > 100: 
    ~ sofia_morale = 100
}
{rodriguez_morale > 100: 
    ~ rodriguez_morale = 100
}
{elena_morale > 100: 
    ~ elena_morale = 100
}
{jackson_rescued && jackson_morale > 100: 
    ~ jackson_morale = 100
}
{maya_rescued && maya_morale > 100: 
    ~ maya_morale = 100
}
{kim_rescued && kim_morale > 100: 
    ~ kim_morale = 100
}
{alex_rescued && alex_morale > 100: 
    ~ alex_morale = 100
}

{haley_morale < 0: 
    ~ haley_morale = 0
}
{marcus_morale < 0: 
    ~ marcus_morale = 0
}
{chen_morale < 0: 
    ~ chen_morale = 0
}
{sofia_morale < 0: 
    ~ sofia_morale = 0
}
{rodriguez_morale < 0: 
    ~ rodriguez_morale = 0
}
{elena_morale < 0: 
    ~ elena_morale = 0
}
{jackson_rescued && jackson_morale < 0: 
    ~ jackson_morale = 0
}
{maya_rescued && maya_morale < 0: 
    ~ maya_morale = 0
}
{kim_rescued && kim_morale < 0: 
    ~ kim_morale = 0
}
{alex_rescued && alex_morale < 0: 
    ~ alex_morale = 0
}

->->

=== check_end_conditions ===
// victory condition - cleared all 50 rooms AND built all 30 buildings!
{clearedRooms >= MAX_CLEARED_ROOMS && buildings_farmhouse >= MAX_FARMHOUSE && buildings_waterwell >= MAX_WATERWELL && buildings_guardtower >= MAX_GUARDTOWER && buildings_medictent >= MAX_MEDICTENT:
    -> ending_victory
}

// defeat conditions
{foodSupply <= -20 && cleanWater <= -20:
    -> ending_starvation
}

{infestationPressure >= 100:
    -> ending_overrun
}

{groupCohesion <= 5 && moraleAverage <= 10:
    -> ending_collapse
}

{haley_health <= 0 && marcus_health <= 0 && chen_health <= 0 && sofia_health <= 0 && rodriguez_health <= 0 && elena_health <= 0:
    -> ending_everyone_dead
}

->->

// === doctor job execution functions ===

// haley doctor
=== execute_haley_doctor ===
~ doctor_assigned = true
~ doctor_tier = haley_doctorTier
~ doctor_name = "Haley"
Haley prepares to provide medical care.
~ haley_fatigue += DOCTOR_FATIGUE_TIER_2
->->

// marcus doctor (elite)
=== execute_marcus_doctor ===
~ doctor_assigned = true
~ doctor_tier = marcus_doctorTier
~ doctor_name = "Marcus"
Marcus prepares to provide expert medical treatment.
~ marcus_fatigue += DOCTOR_FATIGUE_TIER_5
->->

// chen doctor
=== execute_chen_doctor ===
~ doctor_assigned = true
~ doctor_tier = chen_doctorTier
~ doctor_name = "Chen"
Chen prepares basic first aid.
~ chen_fatigue += DOCTOR_FATIGUE_TIER_1
->->

// sofia doctor
=== execute_sofia_doctor ===
~ doctor_assigned = true
~ doctor_tier = sofia_doctorTier
~ doctor_name = "Sofia"
Sofia prepares to treat wounds.
~ sofia_fatigue += DOCTOR_FATIGUE_TIER_2
->->

// rodriguez doctor
=== execute_rodriguez_doctor ===
~ doctor_assigned = true
~ doctor_tier = rodriguez_doctorTier
~ doctor_name = "Rodriguez"
Rodriguez prepares military-style first aid.
~ rodriguez_fatigue += DOCTOR_FATIGUE_TIER_2
->->

// elena doctor
=== execute_elena_doctor ===
~ doctor_assigned = true
~ doctor_tier = elena_doctorTier
~ doctor_name = "Elena"
Elena prepares basic first aid (reluctantly).
~ elena_fatigue += DOCTOR_FATIGUE_TIER_1
->->

// jackson doctor
=== execute_jackson_doctor ===
~ doctor_assigned = true
~ doctor_tier = jackson_doctorTier
~ doctor_name = "Jackson"
Jackson prepares medical treatment.
~ jackson_fatigue += DOCTOR_FATIGUE_TIER_3
->->

// maya doctor
=== execute_maya_doctor ===
~ doctor_assigned = true
~ doctor_tier = maya_doctorTier
~ doctor_name = "Maya"
Maya prepares to treat wounds.
~ maya_fatigue += DOCTOR_FATIGUE_TIER_2
->->

// kim doctor
=== execute_kim_doctor ===
~ doctor_assigned = true
~ doctor_tier = kim_doctorTier
~ doctor_name = "Kim"
Kim prepares military first aid.
~ kim_fatigue += DOCTOR_FATIGUE_TIER_2
->->

// alex doctor
=== execute_alex_doctor ===
~ doctor_assigned = true
~ doctor_tier = alex_doctorTier
~ doctor_name = "Alex"
Alex prepares medical care.
~ alex_fatigue += DOCTOR_FATIGUE_TIER_3
->->

// === GUARD JOB STUBS ===
=== execute_haley_guard ===
~ total_guard_score += haley_guardSkill
~ haley_on_guard = true
~ haley_fatigue += FATIGUE_TIER_3
Haley stands watch.
->->

=== execute_marcus_guard ===
~ total_guard_score += marcus_guardSkill
~ marcus_on_guard = true
~ marcus_fatigue += FATIGUE_TIER_3
Marcus guards the perimeter.
->->

=== execute_chen_guard ===
~ total_guard_score += chen_guardSkill
~ chen_on_guard = true
~ chen_fatigue += FATIGUE_TIER_3
Chen patrols the base.
->->

=== execute_sofia_guard ===
~ total_guard_score += sofia_guardSkill
~ sofia_on_guard = true
~ sofia_fatigue += FATIGUE_TIER_4
Sofia keeps watch.
->->

=== execute_rodriguez_guard ===
~ total_guard_score += rodriguez_guardSkill
~ rodriguez_on_guard = true
~ rodriguez_fatigue += FATIGUE_TIER_4
Rodriguez secures the area.
->->

=== execute_elena_guard ===
~ total_guard_score += elena_guardSkill
~ elena_on_guard = true
~ elena_fatigue += FATIGUE_TIER_1
Elena reluctantly guards.
->->

=== execute_jackson_guard ===
~ total_guard_score += jackson_guardSkill
~ jackson_on_guard = true
~ jackson_fatigue += FATIGUE_TIER_4
Jackson stands watch.
->->

=== execute_maya_guard ===
~ total_guard_score += maya_guardSkill
~ maya_on_guard = true
~ maya_fatigue += FATIGUE_TIER_3
Maya patrols.
->->

=== execute_kim_guard ===
~ total_guard_score += kim_guardSkill
~ kim_on_guard = true
~ kim_fatigue += FATIGUE_TIER_5
Kim secures the perimeter.
->->

=== execute_alex_guard ===
~ total_guard_score += alex_guardSkill
~ alex_on_guard = true
~ alex_fatigue += FATIGUE_TIER_3
Alex keeps watch.
->->

// === FARMER JOB STUBS ===
=== execute_haley_farmer ===
~ foodSupply += RANDOM(4, 6)
~ cleanWater += RANDOM(4, 6)
~ haley_fatigue += FATIGUE_TIER_3
Haley tends the farm.
->->

=== execute_marcus_farmer ===
~ foodSupply += RANDOM(4, 6)
~ cleanWater += RANDOM(4, 6)
~ marcus_fatigue += FATIGUE_TIER_3
Marcus works the farm.
->->

=== execute_chen_farmer ===
~ foodSupply += RANDOM(5, 7)
~ cleanWater += RANDOM(5, 7)
~ chen_fatigue += FATIGUE_TIER_4
Chen farms efficiently.
->->

=== execute_sofia_farmer ===
~ foodSupply += RANDOM(3, 5)
~ cleanWater += RANDOM(3, 5)
~ sofia_fatigue += FATIGUE_TIER_2
Sofia helps with farming.
->->

=== execute_rodriguez_farmer ===
~ foodSupply += RANDOM(3, 5)
~ cleanWater += RANDOM(3, 5)
~ rodriguez_fatigue += FATIGUE_TIER_2
Rodriguez tends crops.
->->

=== execute_elena_farmer ===
~ foodSupply += RANDOM(2, 4)
~ cleanWater += RANDOM(2, 4)
~ elena_fatigue += FATIGUE_TIER_1
Elena does minimal farming.
->->

=== execute_jackson_farmer ===
~ foodSupply += RANDOM(4, 6)
~ cleanWater += RANDOM(4, 6)
~ jackson_fatigue += FATIGUE_TIER_3
Jackson works the farm.
->->

=== execute_maya_farmer ===
~ foodSupply += RANDOM(4, 6)
~ cleanWater += RANDOM(4, 6)
~ maya_fatigue += FATIGUE_TIER_3
Maya tends crops.
->->

=== execute_kim_farmer ===
~ foodSupply += RANDOM(3, 5)
~ cleanWater += RANDOM(3, 5)
~ kim_fatigue += FATIGUE_TIER_2
Kim works the farm.
->->

=== execute_alex_farmer ===
~ foodSupply += RANDOM(4, 6)
~ cleanWater += RANDOM(4, 6)
~ alex_fatigue += FATIGUE_TIER_3
Alex tends the farm.
->->

// === SCAVENGER JOB STUBS ===
=== execute_haley_scavenger ===
~ foodSupply += RANDOM(8, 18)
~ materialSupply += RANDOM(8, 18)
~ haley_fatigue += FATIGUE_TIER_3
~ scavenge_damage_check(haley_scavengingTier, "haley")
Haley scavenges supplies.
->->

=== execute_marcus_scavenger ===
~ foodSupply += RANDOM(5, 12)
~ materialSupply += RANDOM(5, 12)
~ marcus_fatigue += FATIGUE_TIER_2
~ scavenge_damage_check(marcus_scavengingTier, "marcus")
Marcus finds supplies.
->->

=== execute_chen_scavenger ===
~ foodSupply += RANDOM(8, 18)
~ materialSupply += RANDOM(8, 18)
~ chen_fatigue += FATIGUE_TIER_3
~ scavenge_damage_check(chen_scavengingTier, "chen")
Chen scavenges efficiently.
->->

=== execute_sofia_scavenger ===
~ foodSupply += RANDOM(20, 35)
~ materialSupply += RANDOM(20, 35)
~ sofia_fatigue += FATIGUE_TIER_5
~ scavenge_damage_check(sofia_scavengingTier, "sofia")
Sofia finds excellent supplies!
->->

=== execute_rodriguez_scavenger ===
~ foodSupply += RANDOM(8, 18)
~ materialSupply += RANDOM(8, 18)
~ rodriguez_fatigue += FATIGUE_TIER_3
~ scavenge_damage_check(rodriguez_scavengingTier, "rodriguez")
Rodriguez scavenges supplies.
->->

=== execute_elena_scavenger ===
~ foodSupply += RANDOM(8, 18)
~ materialSupply += RANDOM(8, 18)
~ elena_fatigue += FATIGUE_TIER_3
~ scavenge_damage_check(elena_scavengingTier, "elena")
Elena scavenges (and hoards some).
->->

=== execute_jackson_scavenger ===
~ foodSupply += RANDOM(12, 22)
~ materialSupply += RANDOM(12, 22)
~ jackson_fatigue += FATIGUE_TIER_4
~ scavenge_damage_check(jackson_scavengingTier, "jackson")
Jackson finds good supplies.
->->

=== execute_maya_scavenger ===
~ foodSupply += RANDOM(8, 18)
~ materialSupply += RANDOM(8, 18)
~ maya_fatigue += FATIGUE_TIER_3
~ scavenge_damage_check(maya_scavengingTier, "maya")
Maya scavenges supplies.
->->

=== execute_kim_scavenger ===
~ foodSupply += RANDOM(8, 18)
~ materialSupply += RANDOM(8, 18)
~ kim_fatigue += FATIGUE_TIER_3
~ scavenge_damage_check(kim_scavengingTier, "kim")
Kim scavenges supplies.
->->

=== execute_alex_scavenger ===
~ foodSupply += RANDOM(20, 35)
~ materialSupply += RANDOM(20, 35)
~ alex_fatigue += FATIGUE_TIER_5
~ scavenge_damage_check(alex_scavengingTier, "alex")
Alex finds excellent supplies!
->->

// DAMAGE CHECK FOR SCAVENGING (less dangerous than clearing, -10 damage per tier)
=== function scavenge_damage_check(tier, name)
~ temp damage_roll = RANDOM(1, 100)
~ temp damage = 0

// Tier 5 (ELITE): 90% no damage, 5% 5dmg, 4% 10dmg, 1% 15dmg
{tier == 5:
    {damage_roll <= 90:
        ~ damage = 0
    }
    {damage_roll > 90 && damage_roll <= 95:
        ~ damage = 5
    }
    {damage_roll > 95 && damage_roll <= 99:
        ~ damage = 10
    }
    {damage_roll == 100:
        ~ damage = 15
    }
}

// Tier 4: 80% no damage, 10% 10dmg, 5% 15dmg, 4% 20dmg, 1% 25dmg  
{tier == 4:
    {damage_roll <= 80:
        ~ damage = 0
    }
    {damage_roll > 80 && damage_roll <= 90:
        ~ damage = 10
    }
    {damage_roll > 90 && damage_roll <= 95:
        ~ damage = 15
    }
    {damage_roll > 95 && damage_roll <= 99:
        ~ damage = 20
    }
    {damage_roll == 100:
        ~ damage = 25
    }
}

// Tier 3: 70% no damage, 15% 10dmg, 8% 15dmg, 5% 20dmg, 2% 25dmg
{tier == 3:
    {damage_roll <= 70:
        ~ damage = 0
    }
    {damage_roll > 70 && damage_roll <= 85:
        ~ damage = 10
    }
    {damage_roll > 85 && damage_roll <= 93:
        ~ damage = 15
    }
    {damage_roll > 93 && damage_roll <= 98:
        ~ damage = 20
    }
    {damage_roll > 98:
        ~ damage = 25
    }
}

// Tier 2: 55% no damage, 25% 10dmg, 12% 15dmg, 6% 20dmg, 2% 25dmg
{tier == 2:
    {damage_roll <= 55:
        ~ damage = 0
    }
    {damage_roll > 55 && damage_roll <= 80:
        ~ damage = 10
    }
    {damage_roll > 80 && damage_roll <= 92:
        ~ damage = 15
    }
    {damage_roll > 92 && damage_roll <= 98:
        ~ damage = 20
    }
    {damage_roll > 98:
        ~ damage = 25
    }
}

// Tier 1: 40% no damage, 35% 15dmg, 15% 20dmg, 7% 25dmg, 3% 30dmg
{tier == 1:
    {damage_roll <= 40:
        ~ damage = 0
    }
    {damage_roll > 40 && damage_roll <= 75:
        ~ damage = 15
    }
    {damage_roll > 75 && damage_roll <= 90:
        ~ damage = 20
    }
    {damage_roll > 90 && damage_roll <= 97:
        ~ damage = 25
    }
    {damage_roll > 97:
        ~ damage = 30
    }
}

// Apply damage
{name == "haley":
    ~ haley_health -= damage
    {damage > 0: Haley took {damage} damage while scavenging!}
}
{name == "marcus":
    ~ marcus_health -= damage
    {damage > 0: Marcus took {damage} damage while scavenging!}
}
{name == "chen":
    ~ chen_health -= damage
    {damage > 0: Chen took {damage} damage while scavenging!}
}
{name == "sofia":
    ~ sofia_health -= damage
    {damage > 0: Sofia took {damage} damage while scavenging!}
}
{name == "rodriguez":
    ~ rodriguez_health -= damage
    {damage > 0: Rodriguez took {damage} damage while scavenging!}
}
{name == "elena":
    ~ elena_health -= damage
    {damage > 0: Elena took {damage} damage while scavenging!}
}
{name == "jackson":
    ~ jackson_health -= damage
    {damage > 0: Jackson took {damage} damage while scavenging!}
}
{name == "maya":
    ~ maya_health -= damage
    {damage > 0: Maya took {damage} damage while scavenging!}
}
{name == "kim":
    ~ kim_health -= damage
    {damage > 0: Kim took {damage} damage while scavenging!}
}
{name == "alex":
    ~ alex_health -= damage
    {damage > 0: Alex took {damage} damage while scavenging!}
}

// === CLEARER JOB STUBS ===
=== execute_haley_clearer ===
~ clearedRooms += 1
~ infestationPressure -= 8
~ haley_fatigue += FATIGUE_TIER_2
~ clear_damage_check(haley_clearingTier, "haley")
Haley clears a room.
-> check_survivor_rescue ->
->->

=== execute_marcus_clearer ===
~ clearedRooms += 1
~ infestationPressure -= 5
~ marcus_fatigue += FATIGUE_TIER_1
~ clear_damage_check(marcus_clearingTier, "marcus")
Marcus clears a room carefully.
-> check_survivor_rescue ->
->->

=== execute_chen_clearer ===
~ clearedRooms += 1
~ infestationPressure -= 10
~ chen_fatigue += FATIGUE_TIER_3
~ clear_damage_check(chen_clearingTier, "chen")
Chen clears a room.
-> check_survivor_rescue ->
->->

=== execute_sofia_clearer ===
~ clearedRooms += RANDOM(1, 2)
~ infestationPressure -= 10
~ sofia_fatigue += FATIGUE_TIER_4
~ clear_damage_check(sofia_clearingTier, "sofia")
Sofia clears efficiently!
-> check_survivor_rescue ->
->->

=== execute_rodriguez_clearer ===
~ clearedRooms += RANDOM(1, 2)
~ infestationPressure -= 15
~ rodriguez_fatigue += FATIGUE_TIER_5
~ clear_damage_check(rodriguez_clearingTier, "rodriguez")
Rodriguez clears rooms expertly!
-> check_survivor_rescue ->
->->

=== execute_elena_clearer ===
~ clearedRooms += 1
~ infestationPressure -= 5
~ elena_fatigue += FATIGUE_TIER_1
~ clear_damage_check(elena_clearingTier, "elena")
Elena barely clears a room.
-> check_survivor_rescue ->
->->

=== execute_jackson_clearer ===
~ clearedRooms += RANDOM(1, 2)
~ infestationPressure -= 15
~ jackson_fatigue += FATIGUE_TIER_5
~ clear_damage_check(jackson_clearingTier, "jackson")
Jackson clears rooms expertly!
-> check_survivor_rescue ->
->->

=== execute_maya_clearer ===
~ clearedRooms += RANDOM(1, 2)
~ infestationPressure -= 10
~ maya_fatigue += FATIGUE_TIER_4
~ clear_damage_check(maya_clearingTier, "maya")
Maya clears rooms well.
-> check_survivor_rescue ->
->->

=== execute_kim_clearer ===
~ clearedRooms += RANDOM(1, 2)
~ infestationPressure -= 15
~ kim_fatigue += FATIGUE_TIER_5
~ clear_damage_check(kim_clearingTier, "kim")
Kim clears rooms expertly!
-> check_survivor_rescue ->
->->

=== execute_alex_clearer ===
~ clearedRooms += RANDOM(1, 2)
~ infestationPressure -= 10
~ alex_fatigue += FATIGUE_TIER_4
~ clear_damage_check(alex_clearingTier, "alex")
Alex clears rooms well.
-> check_survivor_rescue ->
->->

// DAMAGE CHECK FOR CLEARING (dangerous!)
=== function clear_damage_check(tier, name)
~ temp damage_roll = RANDOM(1, 100)
~ temp damage = 0

// Tier 5 (ELITE): 80% no damage, 10% 5dmg, 5% 10dmg, 4% 15dmg, 1% 20dmg
{tier == 5:
    {damage_roll <= 80:
        ~ damage = 0
    }
    {damage_roll > 80 && damage_roll <= 90:
        ~ damage = 5
    }
    {damage_roll > 90 && damage_roll <= 95:
        ~ damage = 10
    }
    {damage_roll > 95 && damage_roll <= 99:
        ~ damage = 15
    }
    {damage_roll == 100:
        ~ damage = 20
    }
}

// Tier 4: 70% no damage, 15% 10dmg, 8% 15dmg, 5% 20dmg, 2% 25dmg
{tier == 4:
    {damage_roll <= 70:
        ~ damage = 0
    }
    {damage_roll > 70 && damage_roll <= 85:
        ~ damage = 10
    }
    {damage_roll > 85 && damage_roll <= 93:
        ~ damage = 15
    }
    {damage_roll > 93 && damage_roll <= 98:
        ~ damage = 20
    }
    {damage_roll > 98:
        ~ damage = 25
    }
}

// Tier 3: 60% no damage, 20% 15dmg, 10% 20dmg, 7% 25dmg, 3% 30dmg
{tier == 3:
    {damage_roll <= 60:
        ~ damage = 0
    }
    {damage_roll > 60 && damage_roll <= 80:
        ~ damage = 15
    }
    {damage_roll > 80 && damage_roll <= 90:
        ~ damage = 20
    }
    {damage_roll > 90 && damage_roll <= 97:
        ~ damage = 25
    }
    {damage_roll > 97:
        ~ damage = 30
    }
}

// Tier 2: 45% no damage, 30% 20dmg, 13% 25dmg, 9% 30dmg, 3% 35dmg
{tier == 2:
    {damage_roll <= 45:
        ~ damage = 0
    }
    {damage_roll > 45 && damage_roll <= 75:
        ~ damage = 20
    }
    {damage_roll > 75 && damage_roll <= 88:
        ~ damage = 25
    }
    {damage_roll > 88 && damage_roll <= 97:
        ~ damage = 30
    }
    {damage_roll > 97:
        ~ damage = 35
    }
}

// Tier 1: 30% no damage, 40% 25dmg, 15% 30dmg, 10% 35dmg, 5% 40dmg
{tier == 1:
    {damage_roll <= 30:
        ~ damage = 0
    }
    {damage_roll > 30 && damage_roll <= 70:
        ~ damage = 25
    }
    {damage_roll > 70 && damage_roll <= 85:
        ~ damage = 30
    }
    {damage_roll > 85 && damage_roll <= 95:
        ~ damage = 35
    }
    {damage_roll > 95:
        ~ damage = 40
    }
}

// Apply damage
{name == "haley":
    ~ haley_health -= damage
    {damage > 0: Haley took {damage} damage while clearing!}
}
{name == "marcus":
    ~ marcus_health -= damage
    {damage > 0: Marcus took {damage} damage while clearing!}
}
{name == "chen":
    ~ chen_health -= damage
    {damage > 0: Chen took {damage} damage while clearing!}
}
{name == "sofia":
    ~ sofia_health -= damage
    {damage > 0: Sofia took {damage} damage while clearing!}
}
{name == "rodriguez":
    ~ rodriguez_health -= damage
    {damage > 0: Rodriguez took {damage} damage while clearing!}
}
{name == "elena":
    ~ elena_health -= damage
    {damage > 0: Elena took {damage} damage while clearing!}
}
{name == "jackson":
    ~ jackson_health -= damage
    {damage > 0: Jackson took {damage} damage while clearing!}
}
{name == "maya":
    ~ maya_health -= damage
    {damage > 0: Maya took {damage} damage while clearing!}
}
{name == "kim":
    ~ kim_health -= damage
    {damage > 0: Kim took {damage} damage while clearing!}
}
{name == "alex":
    ~ alex_health -= damage
    {damage > 0: Alex took {damage} damage while clearing!}
}

=== check_survivor_rescue ===
{clearedRooms >= 15 && not maya_rescued:
    ~ maya_rescued = true
    
    🎉 survivor found! 
    
    while clearing the gymnasium, you find maya trapped in the equipment room!
    
    maya joins your group.
    balanced survivor with room clearer tier 4, guard score 15, scavenger tier 3.
    
    your group is now stronger!
}

{clearedRooms >= 25 && not kim_rescued:
    ~ kim_rescued = true
    
    🎉 elite survivor found! 
    
    in the school's security office, you find kim, a trained security specialist!
    
    kim joins your group.
    best guard in the game with 25 guard score! room clearer tier 5 elite.
    
    kim is a game changer!
}

{clearedRooms >= 35 && not alex_rescued:
    ~ alex_rescued = true
    
    🎉 elite scavenger found! 
    
    hidden in the school's storage basement, you find alex with a massive supply cache!
    
    alex joins your group.
    scavenger tier 5 elite (finds 15-25 supplies), room clearer tier 4, guard score 15, doctor tier 3.
    
    your supply problems are over!
}

{clearedRooms >= 45 && not jackson_rescued:
    ~ jackson_rescued = true
    
    🎉 elite guard found! 
    
    barricaded in the school's armory, you find jackson, an ex-military survivor!
    
    jackson joins your group.
    room clearer tier 5 elite, scavenger tier 4, guard score 15, doctor tier 3.
    
    victory is in sight!
}
->->

// === REST JOB STUBS ===
=== execute_haley_rest ===
~ haley_fatigue -= FATIGUE_RECOVERY_FROM_REST
{haley_fatigue < 0:
    ~ haley_fatigue = 0
}
Haley rests and recovers.
->->

=== execute_marcus_rest ===
~ marcus_fatigue -= FATIGUE_RECOVERY_FROM_REST
{marcus_fatigue < 0:
    ~ marcus_fatigue = 0
}
Marcus rests and recovers.
->->

=== execute_chen_rest ===
~ chen_fatigue -= FATIGUE_RECOVERY_FROM_REST
{chen_fatigue < 0:
    ~ chen_fatigue = 0
}
Chen rests and recovers.
->->

=== execute_sofia_rest ===
~ sofia_fatigue -= FATIGUE_RECOVERY_FROM_REST
{sofia_fatigue < 0:
    ~ sofia_fatigue = 0
}
Sofia rests and recovers.
->->

=== execute_rodriguez_rest ===
~ rodriguez_fatigue -= FATIGUE_RECOVERY_FROM_REST
{rodriguez_fatigue < 0:
    ~ rodriguez_fatigue = 0
}
Rodriguez rests and recovers.
->->

=== execute_elena_rest ===
~ elena_fatigue -= FATIGUE_RECOVERY_FROM_REST
{elena_fatigue < 0:
    ~ elena_fatigue = 0
}
Elena rests and recovers.
->->

=== execute_jackson_rest ===
~ jackson_fatigue -= FATIGUE_RECOVERY_FROM_REST
{jackson_fatigue < 0:
    ~ jackson_fatigue = 0
}
Jackson rests and recovers.
->->

=== execute_maya_rest ===
~ maya_fatigue -= FATIGUE_RECOVERY_FROM_REST
{maya_fatigue < 0:
    ~ maya_fatigue = 0
}
Maya rests and recovers.
->->

=== execute_kim_rest ===
~ kim_fatigue -= FATIGUE_RECOVERY_FROM_REST
{kim_fatigue < 0:
    ~ kim_fatigue = 0
}
Kim rests and recovers.
->->

=== execute_alex_rest ===
~ alex_fatigue -= FATIGUE_RECOVERY_FROM_REST
{alex_fatigue < 0:
    ~ alex_fatigue = 0
}
Alex rests and recovers.
->->

// === JOB EXECUTION MAIN ===

=== execute_jobs ===

~ total_guard_score = 0

// Add guard tower bonus to base guard power
~ total_guard_score += buildings_guardtower * 5

// execute haley's job
{haley_health > 0:
    {haley_job == JOB_GUARD:
        -> execute_haley_guard ->
    }
    {haley_job == JOB_FARMER:
        -> execute_haley_farmer ->
    }
    {haley_job == JOB_SCAVENGER:
        -> execute_haley_scavenger ->
    }
    {haley_job == JOB_CLEARER:
        -> execute_haley_clearer ->
    }
    {haley_job == JOB_DOCTOR:
        -> execute_haley_doctor ->
    }
    {haley_job == JOB_REST:
        -> execute_haley_rest ->
    }
}

// Execute Marcus's job
{marcus_health > 0:
    {marcus_job == JOB_GUARD:
        -> execute_marcus_guard ->
    }
    {marcus_job == JOB_FARMER:
        -> execute_marcus_farmer ->
    }
    {marcus_job == JOB_SCAVENGER:
        -> execute_marcus_scavenger ->
    }
    {marcus_job == JOB_CLEARER:
        -> execute_marcus_clearer ->
    }
    {marcus_job == JOB_DOCTOR:
        -> execute_marcus_doctor ->
    }
    {marcus_job == JOB_REST:
        -> execute_marcus_rest ->
    }
}

// execute chen's job
{chen_health > 0:
    {chen_job == JOB_GUARD:
        -> execute_chen_guard ->
    }
    {chen_job == JOB_FARMER:
        -> execute_chen_farmer ->
    }
    {chen_job == JOB_SCAVENGER:
        -> execute_chen_scavenger ->
    }
    {chen_job == JOB_CLEARER:
        -> execute_chen_clearer ->
    }
    {chen_job == JOB_DOCTOR:
        -> execute_chen_doctor ->
    }
    {chen_job == JOB_REST:
        -> execute_chen_rest ->
    }
}

// Execute Sofia's job
{sofia_health > 0:
    {sofia_job == JOB_GUARD:
        -> execute_sofia_guard ->
    }
    {sofia_job == JOB_FARMER:
        -> execute_sofia_farmer ->
    }
    {sofia_job == JOB_SCAVENGER:
        -> execute_sofia_scavenger ->
    }
    {sofia_job == JOB_CLEARER:
        -> execute_sofia_clearer ->
    }
    {sofia_job == JOB_DOCTOR:
        -> execute_sofia_doctor ->
    }
    {sofia_job == JOB_REST:
        -> execute_sofia_rest ->
    }
}

// Execute Rodriguez's job
{rodriguez_health > 0:
    {rodriguez_job == JOB_GUARD:
        -> execute_rodriguez_guard ->
    }
    {rodriguez_job == JOB_FARMER:
        -> execute_rodriguez_farmer ->
    }
    {rodriguez_job == JOB_SCAVENGER:
        -> execute_rodriguez_scavenger ->
    }
    {rodriguez_job == JOB_CLEARER:
        -> execute_rodriguez_clearer ->
    }
    {rodriguez_job == JOB_DOCTOR:
        -> execute_rodriguez_doctor ->
    }
    {rodriguez_job == JOB_REST:
        -> execute_rodriguez_rest ->
    }
}

// Execute Elena's job
{elena_health > 0:
    {elena_job == JOB_GUARD:
        -> execute_elena_guard ->
    }
    {elena_job == JOB_FARMER:
        -> execute_elena_farmer ->
    }
    {elena_job == JOB_SCAVENGER:
        -> execute_elena_scavenger ->
    }
    {elena_job == JOB_CLEARER:
        -> execute_elena_clearer ->
    }
    {elena_job == JOB_DOCTOR:
        -> execute_elena_doctor ->
    }
    {elena_job == JOB_REST:
        -> execute_elena_rest ->
    }
}

// Execute Jackson's job
{jackson_rescued && jackson_health > 0:
    {jackson_job == JOB_GUARD:
        -> execute_jackson_guard ->
    }
    {jackson_job == JOB_FARMER:
        -> execute_jackson_farmer ->
    }
    {jackson_job == JOB_SCAVENGER:
        -> execute_jackson_scavenger ->
    }
    {jackson_job == JOB_CLEARER:
        -> execute_jackson_clearer ->
    }
    {jackson_job == JOB_DOCTOR:
        -> execute_jackson_doctor ->
    }
    {jackson_job == JOB_REST:
        -> execute_jackson_rest ->
    }
}

// Execute Maya's job
{maya_rescued && maya_health > 0:
    {maya_job == JOB_GUARD:
        -> execute_maya_guard ->
    }
    {maya_job == JOB_FARMER:
        -> execute_maya_farmer ->
    }
    {maya_job == JOB_SCAVENGER:
        -> execute_maya_scavenger ->
    }
    {maya_job == JOB_CLEARER:
        -> execute_maya_clearer ->
    }
    {maya_job == JOB_DOCTOR:
        -> execute_maya_doctor ->
    }
    {maya_job == JOB_REST:
        -> execute_maya_rest ->
    }
}

// Execute Kim's job
{kim_rescued && kim_health > 0:
    {kim_job == JOB_GUARD:
        -> execute_kim_guard ->
    }
    {kim_job == JOB_FARMER:
        -> execute_kim_farmer ->
    }
    {kim_job == JOB_SCAVENGER:
        -> execute_kim_scavenger ->
    }
    {kim_job == JOB_CLEARER:
        -> execute_kim_clearer ->
    }
    {kim_job == JOB_DOCTOR:
        -> execute_kim_doctor ->
    }
    {kim_job == JOB_REST:
        -> execute_kim_rest ->
    }
}

// Execute Alex's job
{alex_rescued && alex_health > 0:
    {alex_job == JOB_GUARD:
        -> execute_alex_guard ->
    }
    {alex_job == JOB_FARMER:
        -> execute_alex_farmer ->
    }
    {alex_job == JOB_SCAVENGER:
        -> execute_alex_scavenger ->
    }
    {alex_job == JOB_CLEARER:
        -> execute_alex_clearer ->
    }
    {alex_job == JOB_DOCTOR:
        -> execute_alex_doctor ->
    }
    {alex_job == JOB_REST:
        -> execute_alex_rest ->
    }
}

// Check for crisis events after all jobs execute
-> crisis_defense_breach ->
-> check_starvation_damage ->

// elena selfishly heals herself
{elena_health < MAX_HEALTH && medicineSupply > 0:
    ~ elena_health += 10
    ~ medicineSupply -= 1
    {elena_health > MAX_HEALTH:
        ~ elena_health = MAX_HEALTH
    }
    ~ elena_morale += 5
    ~ elena_resentment += 1
    ~ groupCohesion -= 3
    ~ haley_trustPlayer -= 1
    ~ marcus_trustPlayer -= 1
    ~ chen_trustPlayer -= 1
    ~ sofia_trustPlayer -= 1
    ~ rodriguez_trustPlayer -= 1
    
    Elena sneaks medicine and treats only herself. +10 HP. She feels better about looking out for herself, but the others notice her selfishness and trust you less for allowing it.
}

// doctor healing menu
{doctor_assigned:
    -> doctor_healing_menu ->
}

// end of day
-> end_of_day

=== end_of_day ===
<> end of day {day} <>

jobs completed. resources updated. another day survived.

+ [continue to next day]
    -> main_loop

=== player_decisions ===
assign jobs for today.

-> assign_haley_job

// === CHARACTER JOB ASSIGNMENTS ===

=== assign_haley_job ===
{haley_health <= 0: 
    ~ haley_job = JOB_REST
    haley is incapacitated. she must rest.
    -> assign_marcus_job
}

{haley_fatigue >= MAX_FATIGUE:
    ~ haley_job = JOB_REST
    haley is too exhausted to work. she needs rest.
    -> assign_marcus_job
}

{haley_on_guard:
    haley was on guard duty last night. she must rest today.
    ~ haley_job = JOB_REST
    -> assign_marcus_job
}

haley - what should she do?
* [guard the base]
    ~ haley_job = JOB_GUARD
    -> assign_marcus_job
* [farm (food/water)]
    ~ haley_job = JOB_FARMER
    -> assign_marcus_job
* [scavenge resources]
    ~ haley_job = JOB_SCAVENGER
    -> assign_marcus_job
* [clear rooms]
    ~ haley_job = JOB_CLEARER
    -> assign_marcus_job
* [doctor (heal injured)]
    ~ haley_job = JOB_DOCTOR
    -> assign_marcus_job
* [rest]
    ~ haley_job = JOB_REST
    -> assign_marcus_job

=== assign_marcus_job ===
{marcus_health <= 0: 
    ~ marcus_job = JOB_REST
    marcus is incapacitated. he must rest.
    -> assign_chen_job
}

{marcus_fatigue >= MAX_FATIGUE:
    ~ marcus_job = JOB_REST
    marcus is too exhausted to work. he needs rest.
    -> assign_chen_job
}

{marcus_on_guard:
    marcus was on guard duty last night. he must rest today.
    ~ marcus_job = JOB_REST
    -> assign_chen_job
}

marcus - what should he do?
* [guard the base]
    ~ marcus_job = JOB_GUARD
    -> assign_chen_job
* [farm (food/water)]
    ~ marcus_job = JOB_FARMER
    -> assign_chen_job
* [scavenge resources]
    ~ marcus_job = JOB_SCAVENGER
    -> assign_chen_job
* [clear rooms]
    ~ marcus_job = JOB_CLEARER
    -> assign_chen_job
* [doctor (heal injured)]
    ~ marcus_job = JOB_DOCTOR
    -> assign_chen_job
* [rest]
    ~ marcus_job = JOB_REST
    -> assign_chen_job

=== assign_chen_job ===
{chen_health <= 0: 
    ~ chen_job = JOB_REST
    chen is incapacitated. he must rest.
    -> assign_sofia_job
}

{chen_fatigue >= MAX_FATIGUE:
    ~ chen_job = JOB_REST
    chen is too exhausted to work. he needs rest.
    -> assign_sofia_job
}

{chen_on_guard:
    chen was on guard duty last night. he must rest today.
    ~ chen_job = JOB_REST
    -> assign_sofia_job
}

chen - what should he do?
* [guard the base]
    ~ chen_job = JOB_GUARD
    -> assign_sofia_job
* [farm (food/water)]
    ~ chen_job = JOB_FARMER
    -> assign_sofia_job
* [scavenge resources]
    ~ chen_job = JOB_SCAVENGER
    -> assign_sofia_job
* [clear rooms]
    ~ chen_job = JOB_CLEARER
    -> assign_sofia_job
* [doctor (heal injured)]
    ~ chen_job = JOB_DOCTOR
    -> assign_sofia_job
* [rest]
    ~ chen_job = JOB_REST
    -> assign_sofia_job

=== assign_sofia_job ===
{sofia_health <= 0: 
    ~ sofia_job = JOB_REST
    sofia is incapacitated. she must rest.
    -> assign_rodriguez_job
}

{sofia_fatigue >= MAX_FATIGUE:
    ~ sofia_job = JOB_REST
    sofia is too exhausted to work. she needs rest.
    -> assign_rodriguez_job
}

{sofia_on_guard:
    sofia was on guard duty last night. she must rest today.
    ~ sofia_job = JOB_REST
    -> assign_rodriguez_job
}

sofia - what should she do?
* [guard the base]
    ~ sofia_job = JOB_GUARD
    -> assign_rodriguez_job
* [farm (food/water)]
    ~ sofia_job = JOB_FARMER
    -> assign_rodriguez_job
* [scavenge resources]
    ~ sofia_job = JOB_SCAVENGER
    -> assign_rodriguez_job
* [clear rooms]
    ~ sofia_job = JOB_CLEARER
    -> assign_rodriguez_job
* [doctor (heal injured)]
    ~ sofia_job = JOB_DOCTOR
    -> assign_rodriguez_job
* [rest]
    ~ sofia_job = JOB_REST
    -> assign_rodriguez_job

=== assign_rodriguez_job ===
{rodriguez_health <= 0: 
    ~ rodriguez_job = JOB_REST
    rodriguez is incapacitated. he must rest.
    -> assign_elena_job
}

{rodriguez_fatigue >= MAX_FATIGUE:
    ~ rodriguez_job = JOB_REST
    rodriguez is too exhausted to work. he needs rest.
    -> assign_elena_job
}

{rodriguez_on_guard:
    rodriguez was on guard duty last night. he must rest today.
    ~ rodriguez_job = JOB_REST
    -> assign_elena_job
}

rodriguez - what should he do?
* [guard the base]
    ~ rodriguez_job = JOB_GUARD
    -> assign_elena_job
* [farm (food/water)]
    ~ rodriguez_job = JOB_FARMER
    -> assign_elena_job
* [scavenge resources]
    ~ rodriguez_job = JOB_SCAVENGER
    -> assign_elena_job
* [clear rooms]
    ~ rodriguez_job = JOB_CLEARER
    -> assign_elena_job
* [doctor (heal injured)]
    ~ rodriguez_job = JOB_DOCTOR
    -> assign_elena_job
* [rest]
    ~ rodriguez_job = JOB_REST
    -> assign_elena_job

=== assign_elena_job ===
{elena_health <= 0: 
    ~ elena_job = JOB_REST
    elena is incapacitated. she must rest.
    -> assign_jackson_job
}

{elena_fatigue >= MAX_FATIGUE:
    ~ elena_job = JOB_REST
    elena is too exhausted to work. she needs rest.
    -> assign_jackson_job
}

{elena_on_guard:
    elena was on guard duty last night. she must rest today.
    ~ elena_job = JOB_REST
    -> assign_jackson_job
}

elena - what should she do?
* [guard the base]
    ~ elena_job = JOB_GUARD
    -> assign_jackson_job
* [farm (food/water)]
    ~ elena_job = JOB_FARMER
    -> assign_jackson_job
* [scavenge resources]
    ~ elena_job = JOB_SCAVENGER
    -> assign_jackson_job
* [clear rooms]
    ~ elena_job = JOB_CLEARER
    -> assign_jackson_job
* [doctor (heal injured)]
    ~ elena_job = JOB_DOCTOR
    -> assign_jackson_job
* [rest]
    ~ elena_job = JOB_REST
    -> assign_jackson_job

=== assign_jackson_job ===
{not jackson_rescued:
    ~ jackson_job = JOB_REST
    -> assign_maya_job
}

{jackson_health <= 0:
    ~ jackson_job = JOB_REST
    jackson is incapacitated. he must rest.
    -> assign_maya_job
}

{jackson_fatigue >= MAX_FATIGUE:
    ~ jackson_job = JOB_REST
    jackson is too exhausted to work. he needs rest.
    -> assign_maya_job
}

{jackson_on_guard:
    jackson was on guard duty last night. he must rest today.
    ~ jackson_job = JOB_REST
    -> assign_maya_job
}

jackson - what should he do?
* [guard the base]
    ~ jackson_job = JOB_GUARD
    -> assign_maya_job
* [farm (food/water)]
    ~ jackson_job = JOB_FARMER
    -> assign_maya_job
* [scavenge resources]
    ~ jackson_job = JOB_SCAVENGER
    -> assign_maya_job
* [clear rooms]
    ~ jackson_job = JOB_CLEARER
    -> assign_maya_job
* [doctor (heal injured)]
    ~ jackson_job = JOB_DOCTOR
    -> assign_maya_job
* [rest]
    ~ jackson_job = JOB_REST
    -> assign_maya_job

=== assign_maya_job ===
{not maya_rescued:
    ~ maya_job = JOB_REST
    -> assign_alex_job
}

{maya_health <= 0:
    ~ maya_job = JOB_REST
    maya is incapacitated. she must rest.
    -> assign_alex_job
}

{maya_fatigue >= MAX_FATIGUE:
    ~ maya_job = JOB_REST
    maya is too exhausted to work. she needs rest.
    -> assign_alex_job
}

{maya_on_guard:
    maya was on guard duty last night. she must rest today.
    ~ maya_job = JOB_REST
    -> assign_alex_job
}

maya - what should she do?
* [guard the base]
    ~ maya_job = JOB_GUARD
    -> assign_alex_job
* [farm (food/water)]
    ~ maya_job = JOB_FARMER
    -> assign_alex_job
* [scavenge resources]
    ~ maya_job = JOB_SCAVENGER
    -> assign_alex_job
* [clear rooms]
    ~ maya_job = JOB_CLEARER
    -> assign_alex_job
* [doctor (heal injured)]
    ~ maya_job = JOB_DOCTOR
    -> assign_alex_job
* [rest]
    ~ maya_job = JOB_REST
    -> assign_alex_job

=== assign_alex_job ===
{not alex_rescued:
    ~ alex_job = JOB_REST
    -> assign_kim_job
}

{alex_health <= 0:
    ~ alex_job = JOB_REST
    alex is incapacitated. he must rest.
    -> assign_kim_job
}

{alex_fatigue >= MAX_FATIGUE:
    ~ alex_job = JOB_REST
    alex is too exhausted to work. he needs rest.
    -> assign_kim_job
}

{alex_on_guard:
    alex was on guard duty last night. he must rest today.
    ~ alex_job = JOB_REST
    -> assign_kim_job
}

alex - what should he do?
* [guard the base]
    ~ alex_job = JOB_GUARD
    -> assign_kim_job
* [farm (food/water)]
    ~ alex_job = JOB_FARMER
    -> assign_kim_job
* [scavenge resources]
    ~ alex_job = JOB_SCAVENGER
    -> assign_kim_job
* [clear rooms]
    ~ alex_job = JOB_CLEARER
    -> assign_kim_job
* [doctor (heal injured)]
    ~ alex_job = JOB_DOCTOR
    -> assign_kim_job
* [rest]
    ~ alex_job = JOB_REST
    -> assign_kim_job

=== assign_kim_job ===
{not kim_rescued:
    ~ kim_job = JOB_REST
    -> building_menu
}

{kim_health <= 0:
    ~ kim_job = JOB_REST
    kim is incapacitated. she must rest.
    -> building_menu
}

{kim_fatigue >= MAX_FATIGUE:
    ~ kim_job = JOB_REST
    kim is too exhausted to work. she needs rest.
    -> building_menu
}

{kim_on_guard:
    kim was on guard duty last night. she must rest today.
    ~ kim_job = JOB_REST
    -> building_menu
}

kim - what should she do?
* [guard the base]
    ~ kim_job = JOB_GUARD
    -> building_menu
* [farm (food/water)]
    ~ kim_job = JOB_FARMER
    -> building_menu
* [scavenge resources]
    ~ kim_job = JOB_SCAVENGER
    -> building_menu
* [clear rooms]
    ~ kim_job = JOB_CLEARER
    -> building_menu
* [doctor (heal injured)]
    ~ kim_job = JOB_DOCTOR
    -> building_menu
* [rest]
    ~ kim_job = JOB_REST
    -> building_menu

=== building_menu ===
<> construction projects <>

materials available: {materialSupply}

current buildings:
- farm houses: {buildings_farmhouse}/10 (+{buildings_farmhouse * 3} food/day)
- water wells: {buildings_waterwell}/10 (+{buildings_waterwell * 3} water/day)
- guard towers: {buildings_guardtower}/5 (+{buildings_guardtower * 5} guard power)
- medical tents: {buildings_medictent}/5 (+{buildings_medictent} medicine/day)

what do you want to build today? (you can build multiple buildings)

* {materialSupply >= COST_FARMHOUSE && buildings_farmhouse < MAX_FARMHOUSE} [build farm house ({COST_FARMHOUSE} materials)]
    ~ materialSupply -= COST_FARMHOUSE
    ~ buildings_farmhouse += 1
    farm house constructed! +3 food per day.
    -> building_menu

* {materialSupply < COST_FARMHOUSE && buildings_farmhouse < MAX_FARMHOUSE} [farm house ({COST_FARMHOUSE} materials) - not enough materials]
    -> building_menu

* {buildings_farmhouse >= MAX_FARMHOUSE} [farm house - max built (10/10)]
    -> building_menu
    
* {materialSupply >= COST_WATERWELL && buildings_waterwell < MAX_WATERWELL} [build water well ({COST_WATERWELL} materials)]
    ~ materialSupply -= COST_WATERWELL
    ~ buildings_waterwell += 1
    water well constructed! +3 water per day.
    -> building_menu

* {materialSupply < COST_WATERWELL && buildings_waterwell < MAX_WATERWELL} [water well ({COST_WATERWELL} materials) - not enough materials]
    -> building_menu

* {buildings_waterwell >= MAX_WATERWELL} [water well - max built (10/10)]
    -> building_menu
    
* {materialSupply >= COST_GUARDTOWER && buildings_guardtower < MAX_GUARDTOWER} [build guard tower ({COST_GUARDTOWER} materials)]
    ~ materialSupply -= COST_GUARDTOWER
    ~ buildings_guardtower += 1
    guard tower constructed! +5 guard power.
    -> building_menu

* {materialSupply < COST_GUARDTOWER && buildings_guardtower < MAX_GUARDTOWER} [guard tower ({COST_GUARDTOWER} materials) - not enough materials]
    -> building_menu

* {buildings_guardtower >= MAX_GUARDTOWER} [guard tower - max built (5/5)]
    -> building_menu
    
* {materialSupply >= COST_MEDICTENT && buildings_medictent < MAX_MEDICTENT} [build medical tent ({COST_MEDICTENT} materials)]
    ~ materialSupply -= COST_MEDICTENT
    ~ buildings_medictent += 1
    medical tent constructed! +1 medicine per day.
    -> building_menu

* {materialSupply < COST_MEDICTENT && buildings_medictent < MAX_MEDICTENT} [medical tent ({COST_MEDICTENT} materials) - not enough materials]
    -> building_menu

* {buildings_medictent >= MAX_MEDICTENT} [medical tent - max built (5/5)]
    -> building_menu

* [done building - start day]
    -> execute_jobs

// === CRISIS EVENTS & INJURY SYSTEM ===

=== crisis_defense_breach ===
{infestationPressure > 50 && total_guard_score < guard_required:
    ~ temp victim1 = RANDOM(0, 5)
    ~ temp victim2 = RANDOM(0, 5)
    ~ temp damage = RANDOM(20, 40)
    
    ⚠️ DEFENSE BREACH! Zombies broke through!
    
    {victim1 == 0:
        ~ haley_health -= damage
        Haley took {damage} damage!
    }
    {victim1 == 1:
        ~ marcus_health -= damage
        Marcus took {damage} damage!
    }
    {victim1 == 2:
        ~ chen_health -= damage
        Chen took {damage} damage!
    }
    {victim1 == 3:
        ~ sofia_health -= damage
        Sofia took {damage} damage!
    }
    {victim1 == 4:
        ~ rodriguez_health -= damage
        Rodriguez took {damage} damage!
    }
    {victim1 == 5:
        ~ elena_health -= damage
        Elena took {damage} damage!
    }
    
    {victim2 == 0 && victim1 != 0:
        ~ haley_health -= damage
        Haley took {damage} damage!
    }
    {victim2 == 1 && victim1 != 1:
        ~ marcus_health -= damage
        Marcus took {damage} damage!
    }
    {victim2 == 2 && victim1 != 2:
        ~ chen_health -= damage
        Chen took {damage} damage!
    }
    {victim2 == 3 && victim1 != 3:
        ~ sofia_health -= damage
        Sofia took {damage} damage!
    }
    {victim2 == 4 && victim1 != 4:
        ~ rodriguez_health -= damage
        Rodriguez took {damage} damage!
    }
    {victim2 == 5 && victim1 != 5:
        ~ elena_health -= damage
        Elena took {damage} damage!
    }
    
    ~ groupCohesion -= 10
    ~ haley_fear += 15
    ~ marcus_fear += 15
    ~ elena_fear += 25
}
->->

=== check_starvation_damage ===
{foodSupply <= 0:
    ~ temp damage = 5
    
    {foodSupply < -10: 
        ~ damage = 10
    }
    {foodSupply < -20: 
        ~ damage = 15
    }
    
    ⚠️ STARVATION! Everyone is starving!
    
    ~ haley_health -= damage
    ~ marcus_health -= damage
    ~ chen_health -= damage
    ~ sofia_health -= damage
    ~ rodriguez_health -= damage
    ~ elena_health -= damage
    
    {jackson_rescued:
        ~ jackson_health -= damage
    }
    {maya_rescued:
        ~ maya_health -= damage
    }
    {kim_rescued:
        ~ kim_health -= damage
    }
    {alex_rescued:
        ~ alex_health -= damage
    }
    
    Everyone took {damage} starvation damage!
    ~ groupCohesion -= 10
}
->->

=== ending_victory ===
<> === victory! === <>

after {day} days of struggle, you've done it.

all 50 rooms of the school are cleared. secured. made safe.

every building stands strong: 10 farms, 10 wells, 5 towers, 5 medical tents.

the zombies are gone. the supplies are stable. your people survived.

it wasn't easy. some were lost. others scarred. but you led them through it.

this place is yours now. a true sanctuary in a dead world.

the fight isn't over. but for today... you won.

-> END

=== ending_starvation ===
<> === defeat: starvation === <>

day {day}. the food ran out days ago. the water shortly after.

you tried rationing. scavenging. hoping for a miracle.

it never came.

one by one, they grew too weak to move. to fight. to survive.

leadership means making hard choices. but some choices... there's no coming back from.

the school claimed you all in the end.

-> END

=== ending_overrun ===
<> === defeat: overrun === <>

day {day}. the pressure was too much.

too many zombies. not enough guards. not enough cleared rooms.

they came in waves. relentless. hungry.

your group fought. but there were too many.

the school fell. and everyone in it.

sometimes, survival isn't enough.

-> END

=== ending_collapse ===
<> === defeat: group collapse === <>

day {day}. the group fell apart from within.

no cohesion. no trust. no hope.

people stopped listening. stopped caring. started fighting each other instead of the dead.

you can survive zombies. you can't survive each other.

the school stands empty now. a tomb for what could have been.

-> END

=== ending_everyone_dead ===
<> === defeat: total loss === <>

day {day}. the last survivor fell today.

injuries. exhaustion. bad luck.

one by one, they died. until there was no one left.

the school is quiet now. just you and the bodies.

you tried. you really did.

but sometimes, trying isn't enough.

-> END

// === DOCTOR HEALING MENU ===

=== doctor_healing_menu ===
<> === end of day medical treatment === <>

{doctor_name} is ready to provide medical care.
doctor tier: {doctor_tier} (healing bonus: +{doctor_tier * 10} hp per person)
medicine available: {medicineSupply}

select survivors to heal (costs 1 medicine per person):

* {haley_health < MAX_HEALTH && medicineSupply > 0} [heal haley (hp: {haley_health}/100)]
    ~ temp healing = 15 + (doctor_tier * 10)
    ~ haley_health += healing
    {haley_health > MAX_HEALTH:
        ~ haley_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Haley for {healing} HP!
    -> doctor_healing_menu

* {marcus_health < MAX_HEALTH && medicineSupply > 0} [heal marcus (hp: {marcus_health}/100)]
    ~ temp healing2 = 15 + (doctor_tier * 10)
    ~ marcus_health += healing2
    {marcus_health > MAX_HEALTH:
        ~ marcus_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Marcus for {healing2} HP!
    -> doctor_healing_menu

* {chen_health < MAX_HEALTH && medicineSupply > 0} [heal chen (hp: {chen_health}/100)]
    ~ temp healing3 = 15 + (doctor_tier * 10)
    ~ chen_health += healing3
    {chen_health > MAX_HEALTH:
        ~ chen_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Chen for {healing3} HP!
    -> doctor_healing_menu

* {sofia_health < MAX_HEALTH && medicineSupply > 0} [heal sofia (hp: {sofia_health}/100)]
    ~ temp healing4 = 15 + (doctor_tier * 10)
    ~ sofia_health += healing4
    {sofia_health > MAX_HEALTH:
        ~ sofia_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Sofia for {healing4} HP!
    -> doctor_healing_menu

* {rodriguez_health < MAX_HEALTH && medicineSupply > 0} [heal rodriguez (hp: {rodriguez_health}/100)]
    ~ temp healing5 = 15 + (doctor_tier * 10)
    ~ rodriguez_health += healing5
    {rodriguez_health > MAX_HEALTH:
        ~ rodriguez_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Rodriguez for {healing5} HP!
    -> doctor_healing_menu

* {elena_health < MAX_HEALTH && medicineSupply > 0} [heal elena (hp: {elena_health}/100)]
    ~ temp healing6 = 15 + (doctor_tier * 10)
    ~ elena_health += healing6
    {elena_health > MAX_HEALTH:
        ~ elena_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Elena for {healing6} HP!
    -> doctor_healing_menu

* {jackson_rescued && jackson_health < MAX_HEALTH && medicineSupply > 0} [heal jackson (hp: {jackson_health}/100)]
    ~ temp healing7 = 15 + (doctor_tier * 10)
    ~ jackson_health += healing7
    {jackson_health > MAX_HEALTH:
        ~ jackson_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Jackson for {healing7} HP!
    -> doctor_healing_menu

* {maya_rescued && maya_health < MAX_HEALTH && medicineSupply > 0} [heal maya (hp: {maya_health}/100)]
    ~ temp healing8 = 15 + (doctor_tier * 10)
    ~ maya_health += healing8
    {maya_health > MAX_HEALTH:
        ~ maya_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Maya for {healing8} HP!
    -> doctor_healing_menu

* {kim_rescued && kim_health < MAX_HEALTH && medicineSupply > 0} [heal kim (hp: {kim_health}/100)]
    ~ temp healing9 = 15 + (doctor_tier * 10)
    ~ kim_health += healing9
    {kim_health > MAX_HEALTH:
        ~ kim_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Kim for {healing9} HP!
    -> doctor_healing_menu

* {alex_rescued && alex_health < MAX_HEALTH && medicineSupply > 0} [heal alex (hp: {alex_health}/100)]
    ~ temp healing10 = 15 + (doctor_tier * 10)
    ~ alex_health += healing10
    {alex_health > MAX_HEALTH:
        ~ alex_health = MAX_HEALTH
    }
    ~ medicineSupply -= 1
    {doctor_name} heals Alex for {healing10} HP!
    -> doctor_healing_menu

* [done healing]
    ~ doctor_assigned = false
    ~ doctor_tier = 0
    ~ doctor_name = ""
    medical treatment complete.
    ->->
