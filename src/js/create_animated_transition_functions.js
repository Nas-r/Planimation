function generateAnimation(animation_entity, object_options){

    if(animation_entity.type=="predicate"){
      var predicate = animation_entity.content;
      var animations = findMatchingPredicateAnimations(predicate);
      var updated_object_options = get_updated_objectOptions(animations, object_options);
      var updated_stage_locations = get_updated_stageLocations(updated_object_options[0]);

        function animation_function() {
          var set_transition_images = [];
          var animation_function_list = [];
          var set_final_images = [];

            //if object has a transition_image change image then set its
            //transition_image to null
            for(var i = 0; i<updated_object_options[1].length;i++) {
              var transitionimage = updated_object_options[0][updated_object_options[1][i]].transition_image;
              var finalimage = updated_object_options[0][updated_object_options[1][i]].image;
              if(transitionimage!="undefined") {
                set_transition_images.push(setImage(updated_object_options[1][i], transitionimage));
                //set image to final image
                set_final_images.push(setImage(updated_object_options[1][i], finalimage));
                transitionimage = "undefined";
              }
            }

            //create anime for /\ locations
            for(key in Object.keys(updated_stage_locations)){
              animation_function_list.push(new Function(
                "anime({"
                +  "target: #" + key + ","
                +  "bottom: " + updated_stage_locations[key][1] + ","
                +  "left: " + updated_stage_locations[key][0] + ","
                +  "loop: false"
                + "});"
              ));
            //create anime for custom css
            var anime_css_function = "anime({"
            for(var i = 0; i<updated_object_options[1].length;i++) {
              anime_css_function += "targets: \"#" + updated_object_options[1][i] + "\",";
              anime_css_function += updated_object_options[0][updated_object_options[1][i]].css;
            }
            anime_css_function += "});";
            animation_function_list.push(new Function(anime_css_function));
            }

            console.log(set_transition_images);
            console.log(set_final_images);
            console.log(animation_function_list);
        }

        animation_function();
    }
  /*find the matching predicate animations
  apply them all to objectOptions
  keep track of all effected objects

  iterate over this list
  */

}

function setImage(object, image){
  $("#"+object +" > img" ).attr("src", image);
}

/**
 * takes a predicate with arguments populated from the calling action and
 returns a list of all applicable animations and which argument they target.
 @param {Object} predicate - A predicate object generated from an input plan action
 */

function findMatchingPredicateAnimations(predicate) {
  var options = predicateOptions[predicate.name];
  var result = []; //will have worst options at the front of the array.
    for(var i = 0; i<options.length;i++){
      if(options[i].truthiness==predicate.truthiness){
        //If it's an exact match, add to end of array
        if(options[i].argument1_value ==
                      predicate.parameters[options[i].argument1].value){
                        //add the option and target object
                        result.push([options[i].animation, options[i].argument2]);
        //if its a catchall match add it to the start
        } else if(options[i].argument1_value == "any"){
            for(var parameter = 0; paramater<predicate.parameters.length; parameter++) {
              if(options[i].argument2==predicate.parameters[parameter].name){
                        result.unshift([options[i].animation, predicate.parameters[parameter]]);
        }
      }
    }
    return result;
}

/**This function should be iteratively run over the results of the findMatchingPredicateAnimations
function with the exception of updated location, which will come from get_updated_stageLocations
 *
 */
function get_updated_objectOptions(animations, object_options) {
  var changed = [];
  var result = JSON.parse(JSON.stringify(object_options));
  for(var i = 0; i<animations.length; i++){
    var target = animations[i][1];
    //if there's a transition image, apply it here
    if(typeof(animations[i][0].transition_image)!="undefined"){
      result[target.value].transition_image = animations[i][0].transition_image;
      changed.push(target);
    }
    //update location

    if(typeof(animations[i][0].location)!="undefined"){
      result[target.value].location = animations[i][0].location;
      changed.push(target);
    }
    //update css
    if(typeof(animations[i][0].css)!="undefined"){
      result[target.value].css = animations[i][0].css;
      changed.push(target);
    }
    if(typeof(animations[i][0].image)!="undefined"){
      result[target.value].image = animations[i][0].image;
      changed.push(target);
    }
  }
  //apply final image

  return [result, changed];
}

/**
 * return coordinates of all objects whose location has changed due to an
    updated objectOption property
 */
function get_updated_stageLocations(object_options){
  var result = {};
  for(var key in Object.keys(stageLocation)){
    var location = getStageLocation(object_options[key].location);
    //if the calculated location is not the same as its current stage locations
    //add it to the result
    if(location != stageLocation[key]){
      result[key] = location;
    }
  }
  return result;
}
