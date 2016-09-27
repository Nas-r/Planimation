
function createAnimationObjects(domain,problem,plan){

  globalOptions = new GlobalOptions();


}
/*Create interface for setting up the animation
Each object, constant and predicate should be listed with the following options
General Options:
- spatial layout (grid, network, free)
*/

function TypeOption(typeName, visible, defaultImageURL) {
  this.typeName=typeName;
  this.visible=visible;
  this.defaultImageURL=defaultImageURL;
}

function GlobalOptions(spatialLayout) {
    this.spatialLayout = spatialLayout;
}

/*
For objects/constants
- Visible?
- Set Image
- Set initial position
- relative positioning options (above ?x, etc)
(maybe whether or not the relative positioning is persistant throughout
the animation)
- relative ordering (could probably use a z-property for this)
*/

function AnimatedObject(object, visible, imageURL, location, z) {

}

/*
for predicates:
- set image?
- set position
- sprite swap arguments when true/false and/or when value changes
- animate argument/s when true/false
- translate argument/s when true/false
- set relative position of argument/s when true/false
- set z-property of argument/s
*/

function AnimatedPredicate(predicate, animatedArgument, isTrue) {

}

/*all setX arguments are arrays with the first value corresponding to
when the predicate evaluates to true and the second when it's false.
*/
function animatedArgument(argument, type, setImage, setTransitionImage,
  setAnimation, setTranslation, setZ, setRelativePosition){
    this.argument = argument;
}

function relativePosition(object, relativePosition) {

}
