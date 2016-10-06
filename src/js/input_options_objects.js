/**
 * Options for the entire animation.
 * used to store the stage dimensions.
 * @global
 */
var globalOptions = {};

/**
 * Used to store options specified on types as an assosciative array
 * for fast lookup.
 * @global
 */
var typeOptions = {};
/**
 * Used to store options specified on objects as an assosciative array
 * for fast lookup.
 * @global
 */
var objectOptions = {};
/**
 * Used to store options specified on predicates as an assosciative array
 * for fast lookup. For predicates, each key points to a list of objects of
 * type predicateOption.
 * @global
 */
var predicateOptions = {};

/**
 * Store options that will be applied as default to all objects of the
 * corresponding type.
 *  @constructor
 */
function TypeOption(name, image ,css, layout) {
  this.name=name;
  this.image=image;
  this.css=css;
  this.layout = layout;
}

/**
 * Store options that define global parameters such as the stage dimensions
 * @param {array} stageDimensions - The dimensions of the animation stage in pixels
 *  @constructor
 */
function GlobalOption(stageDimensions) {
    this.dimensions = stageDimensions;
}


/**
 * Store options that will be applied to an object
 *  @constructor
    @param {string} name - The object's name
    @param {string} type - If typed, the type, else undefined
    @param {string} image - URL of the image to use to represent the object on stage
    @param {array} location - The current coordinates of the object on the stage
    @param {string} css - The transformations to apply by default to the input image
 */
function ObjectOption(name, type, image, location, css) {
    this.name=name;
    this.type=type;
    this.image=image;
    this.location=location;
    this.css = css;
}

//NOTE: If constants and objects don't share the same namespace
//I'll have to create a separate type and store for constants.
//: Usually you use either constants or objects depending if you want them
//in the problem def or domain file.
//predicate options apply on conditionals consisting of at most two arguments,
//as well as a (truth)value


/**
 * Store options that will be applied to an object given a defined predicate outcome
 @param {string} name - The name of the predicate
 @param {boolean} truthiness - Does this apply when the predicate eveluates to true or false
@param {string} argument1 - The first argument to the predicate
@param {string} argument1 - The second argument to the predicate
@param {string} argumentValue - The value taken by the first argument
@param {AnimeationOption} animation - {image,location,css, transition_image}
 *  @constructor
 */
function PredicateOption(name, truthiness, argument1, argument2, argumentValue, animation) {
  this.name = name; //predicate name
  this.truthiness = truthiness;
  this.argument1 = argument1;
  this.argument2 = argument2;
  this.argument1_value = argumentValue;
  this.animation = animation;
}

function ActionOption(name, parameter){
  this.name=name;
  this.parameter=parameter;
  //hmm, how do I handle an arbitrary number of parameters?
  //do I treat action rules the same as predicate rules?
}


function AnimationOption(image, location, css, transition_image){
    this.image=image;
    this.location = location;
    this.css = css;
    this.transition_image = transition_image;
}

function createAnimationObjects(){
  if (predicates.length>0){
    for(var i=0;i<predicates.length;i++){
      predicateOptions[predicates[i].name] = [];
    }
  }
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
      objectOptions[name].location = [0,0];
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
      objectOptions[name].location = [0,0];
    }
  } else {
    for (var i=0;i<constants.names.length;i++) {
      var name = constants.names[i];
      objectOptions[name] = new ObjectOption(name);
      objectOptions[name].location = [0,0];
    }
    for (var i=0;i<objects.names.length;i++) {
      var name = objects.names[i];
      objectOptions[name] = new ObjectOption(name);
      objectOptions[name].location = [0,0];
    }
  }

  console.log(objectOptions);
//I won't do this prepopulation for predicate and action options because
//they need to be created upon input submission. In fact this was probably
//entirely unnecessary except for allowing me to attach the types easily

}
