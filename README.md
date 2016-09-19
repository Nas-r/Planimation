# Planimation
A tool to animate plans generated from PDDL definitions.

Uses JISON generated parsers to extract relevant information from PDDL Domain, Problem and Plan descriptions.

Pixi.js is used for Animation

##Notes:
Objects and Constants are treated the same

Each object, constant and predicate should be listed with the following options
General Options:
- Objects/constants Inherit Image from type?
- spatial layout (grid, network, free)


For objects/constants
- Visible?
- Set Image
- Set initial position
- relative positioning options (above ?x, etc)
- relative ordering (could probably use a z-property for this)
(maybe whether or not the relative positioning is persistent throughout
  the animation)


For predicates:
- set image?
- set position
- sprite swap arguments when true/false
- animate argument/s when true/false
- translate argument/s when true/false
- set relative position of argument/s when true/false
- set z-property of argument/s

These options should be exportable via JSON.

Layout is configured on a per object or per type basis, with object specific annotations taking precedence

Actions combine the predicate animations and can also have their own animation annotation to animate the group of objects acted upon also order the predicate animation.

Using typed objects is recommended.

##For Future Me:

The parser has some rules that are right recursive. I should rewrite these to be left recursive since this better suits Jison's LALR parsing mechanism. Honestly haven't noticed any performance issues so this is pretty low on the priorities list ATM.

Using typed objects is recommended. Animating is tedious without types. I should write something to apply general or default settings using regex on object/constant names.
