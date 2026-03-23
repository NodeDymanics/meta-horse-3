// ============================================================
// Meta.Horse 2 — Commentary Phrase Pools
// ============================================================

export interface PhrasePool {
  earlyPosition:    string[];
  midPosition:      string[];
  stretchPosition:  string[];
  start:            string[];
  leadChange:       string[];
  surge:            string[];
  falter:           string[];
  neckAndNeck:      string[];
  breakingAway:     string[];
  finishDrive:      string[];
  winner:           string[];
  summary:          string[];
  observation:      string[];
}

export const PHRASES: PhrasePool = {
  start: [
    'And they\'re off! The gates spring open at {dist}m.',
    'The field breaks cleanly from the starting gates.',
    '{name} is first to stride away from the gates.',
    'A good clean break for the field.',
    '{name} shows early aggression, pushing to the front.',
    'All twelve runners away without incident.',
    'The race is underway — {name} immediately challenging for position.',
    '{name} stumbles slightly out of the gate but recovers.',
    'Sharp break from {name} in the early strides.',
    'The field fans out across the track after a clean start.',
  ],
  earlyPosition: [
    '{name} leads the field, setting a strong early tempo.',
    '{name} in front, with {name2} pressing hard on the outside.',
    'Early leader {name}, followed by {name2}.',
    '{name} dictating the pace so far.',
    '{name} has settled into third, just off the pace.',
    '{name} tucked in behind the lead pair, biding time.',
    'A compact field at {dist}m with {name} holding the rail.',
    '{name} already showing promise, travelling smoothly in the pack.',
    '{name} finds a comfortable rhythm in the early going.',
    '{name} the leader, with several lengths in hand.',
  ],
  midPosition: [
    'Halfway through the race — {name} in front with {name2} stalking.',
    '{name} still leads at the {dist}m mark.',
    '{name} making a move, advancing through the field.',
    'The field begins to string out as {name} applies pressure.',
    '{name} and {name2} locked together at the head of affairs.',
    'A trio fight for the lead: {name}, {name2}, and the remainder.',
    '{name} continues to set a solid, honest pace.',
    'The closers begin stirring — watch {name} in the middle of the field.',
    '{name} still travelling comfortably, {name2} under mild pressure.',
    '{name} at the {dist}m mark, with the field well spread.',
  ],
  stretchPosition: [
    '{name} turns for home in front — can anything catch them?',
    'Into the final stretch — {name} still in command.',
    'The closing stages, and {name} is pressing hard.',
    '{name} digging deep in the stretch.',
    'Only {dist}m to run — {name} still leads but {name2} looms.',
    'The field thunders down the home straight, {name} in front.',
    '{name} showing true heart in the run to the line.',
    'This is where the race will be won — {name} in the clear.',
    '{name} battling every step of the way.',
    'The wire is coming into view — {name} refuses to yield.',
  ],
  leadChange: [
    '{name} sweeps past {name2} and takes the lead!',
    'A change at the front — {name} drives through to take command.',
    '{name2} surrenders the lead as {name} surges forward.',
    'Dramatic change in leadership: {name} now in front.',
    '{name} finds another gear and blasts past {name2}.',
    'The lead is gone for {name2} — {name} there alongside and now ahead!',
    '{name} threads through on the inside to snatch the lead.',
    'Watch {name} — surging forward to take control of this race!',
    'Emphatic: {name} powers past {name2} mid-race.',
    '{name} assumes command and shows it wants to run.',
  ],
  surge: [
    '{name} has found a remarkable turn of foot!',
    'Suddenly, {name} is flying — picking off rivals one by one.',
    '{name} charging hard, producing a powerful surge.',
    'Where did that come from? {name} is cutting through the field!',
    '{name} moves with authority, advancing powerfully.',
    'A sensational move by {name}, striking for home.',
    '{name} sprinting hard, passing horse after horse.',
    'The crowd will be watching {name} — an electric burst of pace!',
    '{name} showing top form, travelling better than any.',
    'Like a locomotive, {name} gathers momentum and surges.',
  ],
  falter: [
    '{name} is starting to feel the pinch here.',
    '{name} comes off the pace — that early effort taking a toll.',
    'The tank is nearly empty for {name}, struggling to maintain.',
    '{name} retreats through the field, outpaced now.',
    'Was that too much too soon for {name}? Fading fast.',
    '{name} finds rivals now coming past — tiring markedly.',
    'The early exuberance of {name} is costing them now.',
    '{name} drops away — that promising position gone.',
    '{name} is treading water, unable to match the pace ahead.',
    'Unfortunately for {name}, the effort has taken its toll.',
  ],
  neckAndNeck: [
    '{name} and {name2} inseparable — two champions at war!',
    'A brilliant duel: {name} and {name2} stride for stride.',
    'Neither {name} nor {name2} will give an inch.',
    'Matching strides exactly — {name} and {name2} are one heartbeat apart.',
    'The roar of the crowd as {name} and {name2} battle it out!',
    '{name} upsides {name2} — nothing to separate them.',
    'What a race within a race — {name} and {name2} in lockstep.',
    'Brave {name} refuses to be beaten by {name2}.',
    'No daylight between {name} and {name2} — this is truly magnificent.',
    'Side by side, stride by stride — {name} vs {name2}!',
  ],
  breakingAway: [
    '{name} is asserting supremacy, drawing clear of the field.',
    '{name} with a commanding lead now — the race to finish second commences.',
    'Drawing clear with authority — this is {name}\'s race to lose.',
    '{name} has lit up the track, and the field cannot respond.',
    'The gap widens: {name} is in a different class today.',
    '{name} extends the lead with every bound — impressive.',
    'There is daylight, and then there is {name}.',
    '{name} in devastating form — dominating proceedings.',
    'Clear of the pack and pulling further away: {name} is majestic.',
    '{name} flying — this is a display of true thoroughbred power.',
  ],
  finishDrive: [
    'Everything on the line now as {name} drives to the wire!',
    '{name} giving everything in this final sprint!',
    'Into the last fifty metres — {name} digging deepest!',
    'The line is coming — {name} flat to the boards!',
    '{name} won\'t be denied — driving all the way to the wire.',
    'Desperate final strides from {name} and {name2}!',
    'The crowd is on its feet — {name} is nearly there!',
    'Everything is on the line, and {name} delivers!',
    '{name} hits top gear at exactly the right moment!',
    'Final metres — {name} heart and soul into this effort!',
  ],
  winner: [
    '{name} wins it! A commanding performance!',
    '{name} takes the honours — a superb run!',
    '{name} gets there — wins going away!',
    'It\'s {name}! A fine victory in {dist}!',
    '{name} the winner! What a race!',
    'Photo finish order: {name}, {name2}… a thrilling conclusion!',
    '{name} proves the talent with a winning performance!',
    'First past the post — {name}, an impressive winner!',
    '{name} holds on bravely — wins by a short margin!',
    '{name} prevails in a terrific contest!',
  ],
  summary: [
    'A strong run by {name}, whose early pace proved decisive.',
    '{name2} ran a fine race in second — should find more wins ahead.',
    'The race was well-run, the pace honest throughout.',
    'Connections of {name} will be delighted with that showing.',
    'A true test of stamina today, and {name} answered it emphatically.',
    'The complexion of this race changed decisively at the {dist}m mark.',
    '{name} produced exactly what the form suggested.',
    'A fine training run for several horses who will be sharper next time.',
    '{name2} battled gallantly but couldn\'t quite match {name}\'s finishing burst.',
    'Today\'s winner {name} ticked every box — a polished display.',
  ],
  observation: [
    'The pace is genuine — expect the closers to be tested.',
    'Positions are beginning to crystallise at {dist}m.',
    'This is a well-run race with no early dawdling.',
    'Hard to separate several horses at this stage.',
    'All eyes on the runners as they approach the crucial phase.',
    'The track is playing well, conditions suit every running style.',
    'A beautifully balanced field — the outcome is far from certain.',
    'Plenty of horse left in several runners — the race is alive.',
    '{name} travelling with notable ease here.',
    'The field is intact and the race hangs in the balance.',
  ],
};
