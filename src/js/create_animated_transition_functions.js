var timeouts = [];

function scheduleAnimations(index) {
    var delay_between_states = 500;
    var delay = 500;
    for (var i = index; i < animationTimeline.length; i++) {
        timeouts.push(setTimeout(executeAnimationFunction.bind(null, i), delay));
        if (typeof(animationTimeline[i].duration) == "string") {
            var duration = parseInt(animationTimeline[i].duration);
            delay += (duration + delay_between_states);
            console.log(delay);
        }
    }
}

/**
 * iterates over animation timeline
 If there are stack overflows, it's happening here in the recursive call to this
 function. I only did this because javascript has no sleep method so in order to
temporally space the animations I need to use settimeout.
 */
/*EDIT: REMOVED RECURSIVE CALL*/


function executeAnimationFunction(index) {
    console.log("iterating: " + index + " : " + animationTimeline.length);
    if (index > animationTimeline.length) {
        return;
    }
    var animation_function;
    switch (animationTimeline[index].type) {
        case "predicate":
            var log = animationTimeline[index].content.name + " , ";
            if (typeof(animationTimeline[index].content.parameters) != "undefined") {
                for (var i = 0; i < animationTimeline[index].content.parameters.length; i++) {
                    log += animationTimeline[index].content.parameters[i].value + " , ";
                }
                console.log(log);
            }
            if (animationTimeline[index].object_options &&
                animationTimeline[index].duration &&
                animationTimeline[index].stage_location) {

                animation_function = generateAnimationFunction(animationTimeline[index].object_options,
                    animationTimeline[index].duration,
                    animationTimeline[index].stage_location);
                if (typeof(animation_function) != "undefined") {
                    // setTimeout(iterateOverTimeline(index + 1), animationTimeline[index].duration + delay_between_states);
                    // setTimeout(animation_function[1], animationTimeline[index].duration);

                    animation_function[0]();
                    if (animation_function.length > 1) {
                      console.log(animationTimeline[index].duration);
                        setTimeout(animation_function[1](), animationTimeline[index].duration);
                    }
                    objectOptions = animationTimeline[index].object_options;
                    stageLocation = animationTimeline[index].stage_location;
                }
            }
            case 'heading' : console.log(animationTimeline[index].content);
            break;
        default:
            // iterateOverTimeline(index + 1);
    }
}


/**
 * I'll need a function that will take an animation entity and create
 and execute the animation function
 */
function generateAnimationFunction(object_options, duration, stage_location) {
    var funcdef = "";
    var set_final_images = "";
    var objects = Object.keys(object_options);
    objects.forEach(function(x, index) {
        var item = object_options[x];
        //if there's a transition image, apply it.
        if (typeof(item.transition_image) != "undefined" && item.transition_image != "") {
            funcdef += "$(\'#" + item.name + " > img\').attr(\'src\',\'" + item.transition_image + "\'); ";
            // console.log(funcdef);
            item.transition_image = "";
        }
        if ((typeof(item.transition_image) != "undefined" && item.transition_image != "") ||
            (item.image != "")) {
            if (typeof(item.image) != "undefined") {
              set_final_images += "$(\'#" + item.name + " > img\').attr(\'src\',\'" + item.image + "\'); ";
            } else {
              set_final_images += "$(\'#" + item.name + " > img\').attr(\'src\',\'" + objectOptions[item.name].image + "\'); ";
            }
        }
        //add /\ location translations and duration to animation
        funcdef += "anime({targets: \"#" + item.name + "\",";
        funcdef += "duration: " + duration + ", ";
        if (stage_location[item.name] != stageLocation[item.name]) {
            funcdef += "left: [\'" + stageLocation[item.name][0] + globalOptions.units + "\',\'" + stage_location[item.name][0] + globalOptions.units + "\'],";
            funcdef += "bottom: [\'" + stageLocation[item.name][1] + globalOptions.units + "\',\'" + stage_location[item.name][1] + globalOptions.units + "\'],";
        }
        //add content of custom_js property
        if (typeof(item.custom_js) != "undefined") {
            funcdef += item.custom_js;
            item.custom_js = "";
        }
        funcdef += "});";
    });

    //set Globals to match new state.
    // console.log(object_options);
    // console.log(stage_location);
    // console.log(funcdef);
    var result = [Function(funcdef)];
    if (set_final_images.length != "") {
        result.push(Function(set_final_images));
    }
    return result;
}

function addStatesToAnimationEntities() {
    //Creates a deep copy
    var object_options = JSON.parse(JSON.stringify(objectOptions));
    var stage_location = JSON.parse(JSON.stringify(stageLocation));
    animationTimeline.forEach(function(item, index) {
        if (item.type == "predicate") {
            var temp = generateNewState(item, object_options, stage_location);
            if (typeof(temp) != "undefined") {
                object_options = temp[0][0];
                stage_location = temp[1];
                duration = temp[0][1];
                item.object_options = object_options;
                item.stage_location = stage_location;
                item.duration = duration;
            }
        }
    });
}
/**
 * Take the current object states, the current stage locations,
 and the next predicate or action animation entity. If it's a predicate, return an object
 containing the updated object_options and the updated stage_locations
 This should then be attached to the animationEntity*/
function generateNewState(animation_entity, object_options, stage_locations) {
    if (animation_entity.type == "predicate") {
        var predicate = animation_entity.content;
        var animations = findMatchingAnimationOptions(predicate, predicateOptions);
        // console.log(animations);
        if (animations != false && typeof(animations) != "undefined" && animations[0].length > 0) {
            var updated_object_options = get_updated_objectOptions(animations, object_options);
            var duration = updated_object_options[1];
            // console.log(updated_object_options);
            var updated_stage_locations = get_updated_stageLocations(updated_object_options[0], stage_locations);
            // console.log(updated_stage_locations);
            return [updated_object_options, updated_stage_locations];
        }
    }
}

function setImage(object, image) {
    $("#" + object + " > img").attr("src", image);
}

/**
 * takes a predicate with arguments populated from the calling action and
 returns a list of all applicable animations and which argument they target.
 @param {Object} predicate - A predicate object generated from an input plan action
 */

function findMatchingAnimationOptions(predicate, defined_options) {
    var options = defined_options[predicate.name];
    // console.log(options);
    // console.log(predicate);
    if (typeof(options) != "undefined" && options.length > 0) {
        var result = []; //will have least specific options at the front of the array.
        for (var i = 0; i < options.length; i++) {
            var arg1 = null;
            var arg2 = null;
            if (options[i].truthiness == predicate.truthiness) {
                //If it's an exact match, add to end of array
                for (var j = 0; j < predicate.parameters.length; j++) {
                    // console.log("option: " + options[i].argument1 + " parameter: " + predicate.parameters[j].name);
                    if (options[i].argument1 === predicate.parameters[j].name) {
                        arg1 = predicate.parameters[j];
                    }
                    if (options[i].argument2 === predicate.parameters[j].name) {
                        arg2 = predicate.parameters[j];
                    }
                }
                // console.log([arg1, arg2]);
                if (options[i].argument1_value == arg1.value) {
                    //add the option and target object
                    result.push([options[i].animation, arg2]);

                    // console.log("Matching Predicate Option (exact):");
                    // console.log(options[i]);
                    // console.log(predicate);

                    //if its a catchall match add it to the start
                } else if (options[i].argument1_value == "anything") {
                    result.unshift([options[i].animation, arg2]);
                    // console.log("Matching Predicate Option (catchall):");
                    // console.log(options[i]);
                    // console.log(predicate);
                }
            }
        }
        return [result, predicate];
    } else {
        return;
    }

}

/**This function should be iteratively run over the results of the findMatchingPredicateAnimations
function with the exception of updated location, which will come from get_updated_stageLocations
 *'changed' is returned for debugging
 */
function get_updated_objectOptions(animation, object_options) {

    var animations = animation[0];
    var predicate = animation[1];
    var duration = 0;
    var result = JSON.parse(JSON.stringify(object_options));
    for (var i = 0; i < animations.length; i++) {
        var target = animations[i][1];
        // console.log(target);
        //if there's a transition image, apply it here
        if (typeof(animations[i][0].transition_image) != "undefined") {
            result[target.value].transition_image = animations[i][0].transition_image;
        }
        //update location

        if (typeof(animations[i][0].location) != "undefined") {
            if (typeof(animations[i][0].location) == "string" &&
                animations[i][0].location.indexOf("?") > -1) {
                //resolve the parameter to an object name and get it's updated stage location
                var temp = animations[i][0].location.split(":");
                var target_object;
                for (var j = 0; j < predicate.parameters.length; j++) {
                    if (predicate.parameters[j].name == temp[1]) {
                        target_object = predicate.parameters[j].value;
                    }
                    result[target.value].location = temp[0] + ":" + target_object;
                }
            } else {
                result[target.value].location = animations[i][0].location;
            }
        }
        //update css
        if (typeof(animations[i][0].custom_js) != "undefined" && animations[i][0].custom_js != "") {
            result[target.value].custom_js = animations[i][0].custom_js;
        }
        if (typeof(animations[i][0].image) != "undefined" && animations[i][0].image != "") {
            result[target.value].image = animations[i][0].image;
        }
        //updtae duration
        duration = animations[i][0].duration;
    }
    return [result, duration];
}

/**
 * return coordinates of all objects whose location has changed due to an
    updated objectOption property
 */
function get_updated_stageLocations(object_options, stage_locations) {
    // console.log(object_options);
    var result = JSON.parse(JSON.stringify(stage_locations));
    var keys = Object.keys(stage_locations);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var location;
        if (typeof(object_options[key].location) != "undefined") {
            location = getStageLocation(key, object_options, result);
        }
        result[key] = location;
    }
    return result;
}
