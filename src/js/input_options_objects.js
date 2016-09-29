var globalOptions;
//Creating assosciative arrays to store option inputs for simple,
//fast name based ulookup.
var typeOptions = {};
var objectOptions = {};
var predicateOptions = {};

function TypeOption(typeName, visible, image ,zplane) {
  this.name=typeName;
  this.visible=visible;
  this.defaultImageURL=image;
  this.zplane=zplane;
}

function GlobalOption(spatialLayout) {
    this.spatialLayout = spatialLayout;
}

function ObjectOption(name, type, visible, image, location, zplane) {
    this.name=name;
    this.type=type;
    this.visible=visible;
    this.image=image;
    this.location=location;
    this.zplane;
}

//NOTE: If constants and objects don't share the same namespace
//I'll have to create a separate type and store for constants.
//: Usually you use either constants or objects depending if you want them
//in the problem def or domain file.
//predicate options apply on conditionals consisting of at most two arguments,
//as well as a (truth)value
function PredicateOption(name, value, argument1, argument2, argumentValue, animation) {
  this.name = name;
  this.value = value;
  this.argument1 = argument1;
  this.argument2 = argument2;
  this.argumentValue = argumentValue;
  this.animation = animation;
}

//parameterS ?
function ActionOption(name, parameter){
  this.name=name;
  this.parameter=parameter;
  //hmm, how do I handle an arbitrary number of parameters?
  //do I treat action rules the same as predicate rules?
}
