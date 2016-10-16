# Planimation
A tool to animate plans generated from PDDL definitions.

Uses JISON generated parsers to extract relevant information from PDDL Domain, Problem and Plan descriptions.

Pixi.js is used for Animation

##Notes:
This is terribly written. All functions are global, basically no use of OO principles. Also, I should have named attributes of option ReadWrite functions the same as their div IDs (so I can iterate over them and don't need to change >three functions every time I want to add an option parameter)...

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
Using typed objects is recommended. Animating is tedious without types. I should write something to apply general or default settings using regex on object/constant names.

Replace table based input with a form with a dropdown selector and then the options on that input based on its type (predicate, object, type, constant, etc). Might make it a little less intimidating to look at. - done


Objects, constants and predicate need unique names for this to work, does PDDL require this? If not, I'll need to attach the items type to its animation object so that they're all uniquely identifiable. I should probably do this anyway.
See: http://stackoverflow.com/questions/1735230/can-i-add-custom-attribute-to-html-tag
- done, attached file types to objects

Allow location extraction via regex on constant or objects name. e.g loc_1_2 is point (1,2)

##Add action based options

walk(from,to) effect: staright line
Pre: at(robot, from)
Add: at(robot, to)
del: at(robot, from)

jump(from,to) effect: bezier curve
Pre: at(robot, from),
Add: at(robot, to)
del: at(robot, from)

predicate animation should be defined based on the predicate int he context of the calling action;
Figure out how to do this nicely

Animations should be action dependant because it intuitively imparts more about the movement or
state change of the requisite objects

use predicates to propogate animation options down to their instance in an action!

this just gives you a bit more power.

Mention reason for choosing anime.js over popmotion and pixi. pixi is 800kb! all other js combines is ~150kb, not worth tripling the size of the page as a whole.
