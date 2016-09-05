%lex
%s objects predicate predicates animation actions parameters effects effectslist
%%

<objects>[_\-a-zA-Z0-9]+				{ return 'IDENTIFIER';}
<objects>"- "[_\-a-zA-Z0-9]+ 		{	return 'TYPE';}
<objects>[)]										{ this.begin('INITIAL'); return 'RPAREN';}

<predicates>[(] 								{ this.begin('predicate');}
<predicates>[)]									{ this.begin('INITIAL'); return 'RPAREN';}

<predicate>[?][_\-a-zA-Z0-9]+ 	{ return 'ARGUMENT';}
<predicate>"- "[_\-a-zA-Z0-9]+ 	{	return 'TYPE';}
<predicate>[_\-a-zA-Z0-9]+			{ return 'IDENTIFIER';}
<predicate>[)]+									{ this.popState(); return 'RPAREN'}
<predicate>[(]									{}

<actions>[_\-a-zA-Z0-9]+				{ return 'IDENTIFIER';}
<actions>":parameters"					{	this.begin('parameters'); return 'PARAMETERS';}
<actions>":effect"							{ this.begin('effects'); return 'EFFECTS';}
<actions>[:].*									{}
<actions>[)]										{ this.begin('INITIAL'); return 'RPAREN';}

<parameters>[(]									{ return 'LPAREN';}
<parameters>[?][_\-a-zA-Z0-9]+ 	{ return 'PARAMETER';}
<parameters>"- "[_\-a-zA-Z0-9]+ {	return 'TYPE';}
<parameters>[)]									{ this.begin('actions'); return 'RPAREN';}

<effects>[(]										{ return 'LPAREN';}
<effects>"and" 									{ this.begin('effectslist'); return 'AND';}
<effects>"not"									{ return 'NOT';}
<effects>[?][_\-a-zA-Z0-9]+ 		{ return 'ARGUMENT';}
<effects>"- "[_\-a-zA-Z0-9]+ 		{	return 'TYPE';}
<effects>[_\-a-zA-Z0-9]+				{ return 'IDENTIFIER';}
<effects>[)]										{ this.popState(); return 'RPAREN';}


<effectslist>"(not" {this.begin('predicate'); return'NOT';}
<effectslist>"("		{this.begin('predicate'); }
<effectslist>")"		{this.begin('actions'); return 'RPAREN';}

"(define" 				{ return 'BEGIN';}

[;;animation]			{ this.begin('animation'); return 'ANIMATION';}
[;;].*						{ /* ignore non animation comments */}

"(:objects" 			{ this.begin('objects'); return 'OBJECTS';}
"(:constants"			{ this.begin('objects'); return 'OBJECTS';}
"(:types"  				{ return 'TYPES';}
"(:predicates"		{ this.begin('predicates');	return 'PREDICATES';}
"(:action" 				{ this.begin('actions'); return 'ACTION';}
"(:INIT"					{ return 'INIT';}

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
	|	actions
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
	: predicatelist predicate
	| predicate
	{}
		;
predicate
	: IDENTIFIER arguments RPAREN
	| IDENTIFIER RPAREN
	{}
	;

actions
	:	ACTION IDENTIFIER action_body RPAREN
	{};

action_body
	: PARAMETERS LPAREN parameters RPAREN
	| EFFECTS
	{};

parameters
	: parameteres PARAMETER TYPE
	| parameter PARAMETER
	| PARAMETER TYPE
	| PARAMETER
	{};



arguments
	: arguments ARGUMENT TYPE
	| ARGUMENT TYPE
	| arguments ARGUMENT
	| ARGUMENT
	{}
	;
