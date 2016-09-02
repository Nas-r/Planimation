%lex
%s objects predicates animation
%%

<objects>[_-a-zA-Z0-9]+				{ return 'IDENTIFIER';}
<objects>[)]									{this.begin('INITIAL'); return 'RPAREN';}

<predicates>[_-a-zA-Z0-9]+		{ return 'IDENTIFIER';}
<predicates>[)]								{this.begin('INITIAL'); return 'RPAREN';}

"(define" 				{return 'BEGIN';}

[;;animation]			{this.begin('animation'); return 'ANIMATION';}
[;;].*						{/* ignore non animation comments */}

"(:objects" 			{this.begin('objects'); return 'OBJECTS';}
"(:constants"			{this.begin('objects'); return 'OBJECTS';}
"(:types"  				{ return 'TYPES';}
"(:predicates"		{this.begin('predicates');	return 'PREDICATES';}
"(:actions" 			{ return 'ACTIONS';}

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
	| constants
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
