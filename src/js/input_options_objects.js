var globalOptions;
//Creating assosciative arrays to store option inputs for simple,
//fast name based ulookup.
var typeOptions = {};
var objectOptions = {};
var predicateOptions = {};

function createAnimationObjects(domain,problem,plan){
  var types = domain[0];
  var constants = domain[1];
  var predicates = domain[2];
  var objects = problem[0];
  var actions = plan;

  //types objects and constants
  if (types.length>0){
    for (var i =0; i<types.length;i++) {
      typeOptions[types[i]] = new TypeOption(types[i]);
    }
    var typeCounter = 0;
    var type = "";
    for (var i=0;i<constants.names.length;i++) {
      if(i<constants.typeIndex[typeCounter]) {
        type=constants.types[typeCounter];
      } else {
        typeCounter++;
        type=constants.types[typeCounter];
      }
      var name = constants.names[i];
      objectOptions[name] = new ObjectOption(name, type);
    }
    typeCounter=0;
    for (var i=0;i<objects.names.length;i++) {
      if(i<objects.typeIndex[typeCounter]) {
        type=objects.types[typeCounter];
      } else {
        typeCounter++;
        type=objects.types[typeCounter];
      }
      var name = objects.names[i];
      objectOptions[name] = new ObjectOption(name, type);
    }
  } else {
    for (var i=0;i<constants.names.length;i++) {
      objectOptions[constants.names[i]] = new ObjectOption(constants.names[i]);
    }
    for (var i=0;i<objects.names.length;i++) {
      objectOptions[objects.names[i]] = new ObjectOption(objects.names[i]);
    }
  }

//I won't do this prepopulation for predicate and action options because
//they need to be created upon input submission. In fact this was probably
//entirely unnecessary except for allowing me to attach the types easily

  console.log(typeOptions);
  console.log(objectOptions);
}

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
