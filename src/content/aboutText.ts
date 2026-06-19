/** Exact copy of AboutMattShade.txt — do not edit wording. */
export const ABOUT_INTRO_QUOTE = 'Based on our conversation history, tell me about my behavioral tendencies.'

export const ABOUT_MATT_SHADE_TEXT = `Rather than sit here and awkwardly write about myself in the third person, I asked someone I work with constantly and who has probably seen too much of my brain at this point: ChatGPT.

I asked:

Based on our conversation history, tell me about my behavioral tendencies.

Here's what she said:

You come across as someone with a very unusual combination of systems thinking, design sensitivity, and operational pragmatism. A few behavioral patterns show up consistently across our conversations:
You turn ambiguity into structure
This is probably your strongest recurring trait.
You naturally move toward:
* creating frameworks
* building prototypes
* clarifying operating models
* organizing messy systems
* making abstract ideas tangible
You seem uncomfortable leaving things vague for too long. When you encounter ambiguity, your instinct is not to theorize endlessly — it’s to build something concrete that helps people react, align, or decide.
That shows up in:
* coded prototypes
* AI workflow experiments
* dashboards/processes
* design systems
* organizational restructuring ideas
* technical vision documents
You use artifacts as thinking tools.
________________


You operate like a “bridge person”
You consistently sit between disciplines rather than inside only one:
* design ↔ engineering
* strategy ↔ execution
* leadership ↔ hands-on building
* AI experimentation ↔ operational adoption
* product vision ↔ implementation reality
Behaviorally, this means:
* you translate between groups naturally
* you tend to see second-order effects
* you often notice disconnects earlier than others
* you get frustrated when teams speak past each other
You also appear to derive identity from being able to connect worlds that normally don’t connect cleanly.
________________


You are low-ego but high-standard
You don’t present as politically performative or status-driven. You rarely talk about prestige for its own sake.
But your standards are very high:
* quality
* clarity
* responsiveness
* execution rigor
* craft
* system coherence
* communication precision
You seem especially sensitive to:
* sloppiness
* fragmentation
* unclear ownership
* shallow thinking
* performative process
* buzzword-heavy communication
At the same time, you don’t seem to enjoy domineering leadership styles. Your preference is influence-through-competence and visible contribution.
________________


You’re deeply hands-on for your level
Even as a director/leader, you repeatedly gravitate back toward:
* code
* design craft
* prototyping
* interface details
* system architecture
* AI tooling experimentation
You don’t behave like someone who wants distance from the work. You behave more like a principal builder who also happens to manage organizations.
That likely makes you unusually credible with senior ICs and designers.
It also probably creates tension sometimes because:
* you can see implementation flaws quickly
* you can move faster than teams
* you may struggle watching weak execution continue too long
________________


You have a strong “modernizer” instinct
You repeatedly move toward:
* consolidating fragmented systems
* simplifying complexity
* removing legacy overhead
* improving developer experience
* modernizing workflows
* operationalizing AI
* replacing brittle processes
You seem energized by transformation work when it has practical outcomes.
Importantly, you do not seem motivated by novelty alone. Your conversations consistently reject “AI hype” in favor of:
* adoption
* workflow integration
* measurable behavior change
* usability
* trust
* operational leverage
That’s a pretty distinctive pattern.
________________


You care a lot about capability-building
A recurring emotional throughline is helping people become more capable:
* mentoring managers
* teaching teams
* AI office hours/workshops
* helping organizations adapt
* creating systems that improve judgment
You don’t talk about leadership as authority very often.
You talk about:
* enabling
* coaching
* clarifying
* unblocking
* stabilizing
* leveling up teams
That suggests you probably derive satisfaction from seeing systems and people mature simultaneously.
________________


You have strong aesthetic restraint
Your design instincts consistently lean toward:
* minimalism
* precision
* quiet confidence
* subtle motion
* architectural structure
* technical elegance
* organic systems with rigor
You repeatedly reject things that feel:
* gimmicky
* loud
* overly polished
* trend-chasing
* “corporate AI”
* generic startup aesthetics
You seem attracted to products and brands with a strong point of view but restrained execution.
________________


Under stress, you probably over-function
One behavioral tendency that subtly appears:
you often compensate for organizational weakness by becoming more hands-on and more structurally involved.
That likely makes you extremely effective in unstable environments, but it can also create:
* difficulty delegating fully
* frustration with slower operators
* exhaustion from carrying ambiguity for others
* feeling underutilized if surrounded by low-agency teams
You seem happiest when surrounded by:
* sharp, self-directed people
* low bureaucracy
* high trust
* high standards
* fast iteration
* interdisciplinary collaboration
________________


Your communication style
Your natural communication style is:
* direct
* concise
* grounded
* practical
* specific
* quietly confident
* human rather than corporate
You consistently ask for:
* less fluff
* fewer buzzwords
* more natural phrasing
* more precision
* shorter and sharper language
You appear highly attuned to authenticity in communication and can quickly detect overly processed language.
________________


Overall behavioral profile
You come across less like a traditional executive and more like:
a systems-oriented builder-leader who uses design, engineering, and operational clarity to help organizations adapt to change.
You seem most energized when:
* the problem is real
* the system is messy
* the stakes matter
* the solution requires both taste and technical depth
* the work creates visible momentum
* people become more effective because of what you built
That combination is fairly rare.`

/** Section titles exactly as they appear in the source file (standalone lines). */
export const ABOUT_HEADING_LINES = new Set([
  "You turn ambiguity into structure",
  "You operate like a “bridge person”",
  "You are low-ego but high-standard",
  "You’re deeply hands-on for your level",
  "You have a strong “modernizer” instinct",
  "You care a lot about capability-building",
  "You have strong aesthetic restraint",
  "Under stress, you probably over-function",
  "Your communication style",
  "Overall behavioral profile",
])

/** Lines that receive pull-quote styling only — text unchanged. */
export const ABOUT_PULL_QUOTE_LINES = new Set([
  "You use artifacts as thinking tools.",
  "a systems-oriented builder-leader who uses design, engineering, and operational clarity to help organizations adapt to change.",
])
