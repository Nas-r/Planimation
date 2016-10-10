var animationTimeline = [];

function generateAnimationTimeline(domain,problem,plan){
  initialPredicates = problem[1];
  animationTimeline.push(new animationEntity("heading","Initial State"));
  for(var i = 0; i<initialPredicates.length;i++){
    animationTimeline.push(new animationEntity("predicate",initialPredicates[i]));
  }
  for(var i = 0; i<plan.length;i++) {
    animationTimeline.push(new animationEntity("action",plan[i]));

  }
}

/**
 *
 */
function animationEntity(type, content) {
  this.type=type;
  this.content=content;
}
/**
 * Store predicate description
  @param {string} name - The name of the predicate
  @param {boolean} truthiness - Does this apply when the predicate eveluates to true or false
  @param {string} arguments - Collection of argument objects
* @constructor
 */
function Predicate(name, arguments, truthiness) {
  this.name = name;
  this.truthiness = truthiness;
  this.arguments = arguments;
}

function Argument(name, type){
  this.name = name;
  this.type = type;
};
