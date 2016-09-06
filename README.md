# Planimation
A tool to animate plans generated from PDDL definitions

##Notes to self:
Objects and Constants are treated the same

predicates must have animation annotations of the form
;;animate(<options>)

options include: relative positioning, transformations and transitions,
sprite swaps, more?

actions combine the predicate animations and can also have their
own animation annotation to animate the group of objects acted upon
also the ordering of the animation of predicates

objects and constants use the annotation to denote the image/s
used to represent them, predicates should have the ability to change
this image. there are also sizing options.

##TODO (stared, see: PDDL.jison):
REDO the lexer/parser. Currently I throw away what I don't want by
getting the lexer to ignore it using start conditions in a way I'm guessing
they were never intended to be used.

This is stupid, error prone and confusing.

It also makes it annoying if I want to extend it in the future. I 'SHOULD'
write a complete lexer and ignore what I don't want using empty actions during
parsing.

also, while my shitty parser has a mostly left recursive grammar, the
complete parser has some rules that are right recursive. I should rewrite these
to be left recursive since this better suits Jison's LALR parsing mechanism.
