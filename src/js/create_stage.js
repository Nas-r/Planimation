var stageLocation = {};

function getWidthAndHeight(object) {
    return objectOptions[object].size.split(",");
}

function createInitialStage() {
    $("#Window3").html("<input id=\"gotoWindow2\" type=\"button\" " +
        " value=\"Return to Options Input Screen\"" +
        " onclick=\"switchToOptions();\" style=\"position:absolute;\">" +
        "<div id=\"stage\">" +
        "</div>");
    //apply typeOptions
    var typekeys = Object.keys(typeOptions);
    for (var i = 0; i < typekeys.length; i++) {
        var object_type = typekeys[i];
        var targets = getObjectListFromType(object_type);
        for (var j = 0; j < targets.length; j++) {
            var object_name = targets[j];
            if (!objectOptions[object_name].css) {
                objectOptions[object_name].css = typeOptions[object_type].css;
            }
            if (!objectOptions[object_name].image) {
                objectOptions[object_name].image = typeOptions[object_type].image;
            }
            if (!objectOptions[object_name].size) {
                objectOptions[object_name].size = typeOptions[object_type].size;
            }
        }
    }
    //apply regex options

    //apply objectOptions
    //1. Place them on the stage
    var object_keys = Object.keys(objectOptions);
    var objectshtml = "";
    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        var object = objectOptions[key];
        var objectcontainer = "";
        objectcontainer += "<div id=\"" + object.name + "\" style=\"position:absolute\"><img src=\"" + object.image +
            "\" style=\"max-width:100%;max-height:100%\"></img>";
        if (globalOptions.labelled == "true") {
            objectcontainer += "<p>" + key + "</p>";
        }
        objectcontainer += "</div>";
        objectshtml += objectcontainer;
    }

    $("#stage").html(objectshtml);


    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        stageLocation[key] = objectOptions[key].location;
    }

    for (var i = 0; i < object_keys.length; i++) {
        var key = object_keys[i];
        //2. set their size
        var size = getWidthAndHeight(key);
        // console.log("Size of "+key+" :" + size[0] +" , "+ size[1]);
        $("#" + key).css("width", "" + size[0] + globalOptions.units);
        //NOTE: Height is currently useless. object-fit doesnt work. need to fix
        $("#" + key).css("max-height", "" + size[1] + globalOptions.units);

        //3. set their location
        stageLocation[key] = getStageLocation(key);
        var x = stageLocation[key][0] - 0.5 * parseFloat(size[0]);
        var y = stageLocation[key][1] - 0.5 * parseFloat(size[1]);

        // console.log("Location of "+key+" :" + location[0] +" , "+ location[1]);
        // location[0] -= 0.5*parseFloat(size[0]);
        // location[1] -= 0.5*parseFloat(size[1]);
        // console.log("margins of "+key+" :" + location[0] +" , "+ location[1]);
        var mleft = x.toString() + globalOptions.units;
        var mtop = y.toString() + globalOptions.units;
        $("#" + key).css("left", mleft);
        $("#" + key).css("bottom", mtop);
        //4. apply any custom CSS
        applyCSS(objectOptions[key].css, key);
    }


    //NOTE: I need to copy object.locations to stageLocation after each
    //location change and then resolve all stageLocations to coordinates
    //to get new coordinates.
}

/**
 * Applies css to target objects instance in the DOMAIN
 @param {string} css - the string of css options
 @param {string} targetName - the name of the target object
 */
function applyCSS(css, targetName) {
    // console.log("applyCSS("+targetName+")");
    var css_statements = css.split(/[\n\r]/g);
    if (css_statements != false) {
        for (var i = 0; i < css_statements.length; i++) {
            var item = css_statements[i];
            var property = item.split(":");
            console.log("#" + targetName);
            console.log(property);
            $("#" + targetName).css(property[0].trim(), property[1].trim());
        }
    }
}
//use the objectOptions objects as paramater stores.
//NOTE: ObjectOptions.location always has to be a string
function getStageLocation(objectName) {
    var location = stageLocation[objectName]
    if (typeof(location) == "string") {
        location = stageLocation[objectName].split(",");
        //Either they're coordinates
        if (location.length == 2) {
            return [parseFloat(location[0]), parseFloat(location[1])];
        }
        //or a relative position
        else {
            return resolveRelativeLocation(objectName);
        }
    } else {
        //Either they're coordinates
        if (location.length == 2) {
            return [location[0], location[1]];
        }
    }
}

function resolveRelativeLocation(objectName) {
    var location = stageLocation[objectName].split(":");
    var position = location[0].trim();
    var relative_to_object = location[1].trim();
    // var dimensions  = getWidthAndHeight(object);
    var dimensions_of_relative_object = getWidthAndHeight(relative_to_object);
    var relative_to_position = getStageLocation(relative_to_object);

    // console.log(position + " : " + relative_to_object);
    // console.log(dimensions_of_relative_object);
    // console.log(relative_to_position);
    switch (position) {
        case "on":
            return relative_to_position;
            break;
        case "left":
            //translate it by half(width of object + width of relative_to_object) from relative_to_position
            var x = relative_to_position[0] - parseFloat(dimensions_of_relative_object[0]);
            var y = relative_to_position[1];
            return [x, y];
            break;
        case "right":
            var x = relative_to_position[0] + parseFloat(dimensions_of_relative_object[0]);
            var y = relative_to_position[1];
            return [x, y];
            break;
        case "above":
            var y = relative_to_position[1] + parseFloat(dimensions_of_relative_object[1]);
            var x = relative_to_position[0];
            console.log([x, y]);
            return [x, y];
            break;
        case "below":
            var y = relative_to_position[1] - parseFloat(dimensions_of_relative_object[1]);
            var x = relative_to_position[0];
            return [x, y];
            break;
    }
}
