# Planimation
A tool to animate plans generated from PDDL definitions.

Uses JISON generated parsers to extract relevant information from PDDL Domain, Problem and Plan descriptions.

##Notes:
Objects and Constants are treated the same

Inputs applied to Types, Objects and Constants are applied when the stage is created.

Inputs applied to Types apply to all object's of that type. If the object has its
own inputs and there is a conflict, the object's inputs will override those
inferred from its type.

Inputs applied to predicates are applied when the scenario is matched and the
target objects properties are updated. This occurs from loosest match to the
tightest match (i.e options specified for a specific object override conflicts
  with those specified using the catchall **ANY**)

Postconditions can be animated all together based on the action, or in
sequence (this is configurable in Global Options).

These options are exportable/importable via JSON.

Using typed objects is recommended as it makes creating the initial stage much
quicker, particularly when a problem has more than 10 or so objects/constants.

##TODO
Still need to implement optional postcondition grouping/ordering

global css options are not being applied properly. For example,
disabling label's doesn't seem to work, nor does setting a background-image.
