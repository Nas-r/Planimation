/* Lambda calculus grammar by Zach Carter */

%lex
%%

[;;].*			{/* comments (ignored for now, may be used as a 
				start condition to parse animation annotations)*/}
"("       		{ return '('; }
")"       		{ return ')'; }
":objects" 		{ return 'OBJECTS'; }
":types"  		{ return 'TYPES'; }
":predicates"	{ return 'PREDICATES'; }
":actions" 		{ return 'ACTION'; }
[_a-zA-Z0-9]*	{ return 'IDENTIFIER'; }
[ \t\n]			{/* ignore whitespace */}
<<EOF>>   		{ return 'EOF'; }
/lex

/*
%right LAMBDA
%left SEP
*/

%%


var_objects 
	:	( OBJECTS IDENTIFIER obj )
	|	( OBJECTS IDENTIFIER )
		{ return $expr; }
	;
	
obj
	:	IDENTIFIER obj
	|	IDENTIFIER
		{ }
	;
	

expr
  : LAMBDA var_list '.' expr
    %{
      var temp = ["LambdaExpr", $var_list.shift(), $expr];
      $var_list.forEach(function (v) {
        temp = ["LambdaExpr", v, temp];
      });
      $$ = temp;
    %}
  | expr SEP expr
    { $$ = ["ApplyExpr", $expr1, $expr2]; }
  | var
    { $$ = ["VarExpr", $var]; }
  | '(' expr ')'
    { $$ = $expr; }
  ;

var_list
  : var_list var
    { $$ = $var_list; $$.unshift($var); }
  | var
    { $$ = [$var]; }
  ;

var
  : VAR
    { $$ = yytext; }
  ;
