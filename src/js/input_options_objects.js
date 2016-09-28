function createAnimationObjects(domain,problem,plan){
  globalOptions = new GlobalOptions();
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

function objectOption(name, visible, image, location, zplane) {
    this.name=name;
    this.visible=visible;
    this.image=image;
    this.location=location;
    this.zplane;
}

//NOTE: If constants and objects share the same namespace I'll get rid of this
function constantOption(name, visible, image, location, zplane) {
    this.name=name;
    this.visible=visible;
    this.image=image;
    this.location=location;
    this.zplane;
}

function predicateOption(name, value, argument1, argument2, argumentValue, animation) {
  this.name = name;
  this.value = value;
  this.argument1 = argument1;
  this.argument2 = argument2;
  this.argumentValue = argumentValue;
  this.animation = animation;
}
