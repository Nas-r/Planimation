# Planimation
A tool to animate plans generated from PDDL definitions.

Uses JISON generated parsers to extract relevant information from PDDL Domain, Problem and Plan descriptions.
Pixi.js is used for Animation

##Notes:
Objects and Constants are treated the same

Predicates must have animation annotations of the form
;;animate(<options>)

Options will include:
- relative positioning
- transformations and preprogrammed animations,
- sprite swaps (for arguments)
- appear as an image/text annotation on one or more of its arguments
- more?

Objects can be assigned images by name or as a group by type.

Layout is configured on a per object or per type basis, with object specific annotations taking precedence

Actions combine the predicate animations and can also have their own animation annotation to animate the group of objects acted upon also order the predicate animations

Objects and constants use the annotation to denote the image/s used to represent them, predicates should have the ability to change this image. There are also sizing options.

##TODO:

The parser has some rules that are right recursive. I should rewrite these to be left recursive since this better suits Jison's LALR parsing mechanism.
