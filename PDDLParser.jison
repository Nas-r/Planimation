%lex
%s objects predicates animation predicate
%%

<objects>[_-a-zA-Z0-9]+				{ return 'IDENTIFIER';}
<objects>"- "[_-a-zA-Z0-9]+ 	{	return 'TYPE';}
<objects>[)]									{ this.begin('INITIAL'); return 'RPAREN';}

<predicates>[(] 							{ this.begin('predicate');}
<predicates>[)]								{ this.begin('INITIAL'); return 'RPAREN';}

<predicate>[_-a-zA-Z0-9]+			{ return 'IDENTIFIER';}
<predicate>[?][_-a-zA-Z0-9]+ 	{ return 'ARGUMENT';}
<predicate>[- ][_-a-zA-Z0-9]+ {	return 'TYPE';}
<predicate>[)]								{ this.begin('predicates'); return 'RPAREN'}

"(define" 				{ return 'BEGIN';}

[;;animation]			{ this.begin('animation'); return 'ANIMATION';}
[;;].*						{ /* ignore non animation comments */}

"(:objects" 			{ this.begin('objects'); return 'OBJECTS';}
"(:constants"			{ this.begin('objects'); return 'OBJECTS';}
"(:types"  				{ return 'TYPES';}
"(:predicates"		{ this.begin('predicates');	return 'PREDICATES';}
"(:action" 				{ return 'ACTION';}

/*Ignore*/
[:]								{}
[(]								{}
[)]								{}
[_\-a-zA-Z0-9]+		{}
[ \t\n]+					{}

/lex

%%

begin
	: BEGIN blocks
	{};

blocks
	: blocks block
	| block
	{};

block
	: objects
	| predicates
	| animations
	{};

objects
	: OBJECTS object RPAREN
	{};

object
	: object IDENTIFIER
	{console.log($2);}
	| IDENTIFIER
	{console.log($1);}
	;

predicates
	: PREDICATES predicatelist RPAREN
	{}
	;

predicatelist
	: predicate predicate
	| predicate RPAREN
	{}
		;
predicate
	: IDENTIFIER arguments
	| IDENTIFIER
	{}
	;

arguments
	: arguments ARGUMENT TYPE
	| ARGUMENT TYPE
	| arguments ARGUMENT
	| ARGUMENT
	{}
	;
