//if object has a transition_image change image then set its
//transition_image to null
for (var i = 0; i < updated_object_options[1].length; i++) {
    var transitionimage = updated_object_options[0][updated_object_options[1][i]].transition_image;
    var finalimage = updated_object_options[0][updated_object_options[1][i]].image;
    if (transitionimage != "undefined") {
        set_transition_images.push(setImage(updated_object_options[1][i], transitionimage));
        //set image to final image
        set_final_images.push(setImage(updated_object_options[1][i], finalimage));
        transitionimage = "undefined";
    }
}

//create anime for /\ locations
var keys = Object.keys(updated_stage_locations);
for (var key_index = 0; key_index < keys.length; key_index++) {
    var key = keys[key_index];
    var anime = "anime({" +
        "target: \"#" + key + "\"," +
        "bottom: " + updated_stage_locations[key][1] + "," +
        "left: " + updated_stage_locations[key][0] + "," +
        "loop: false" +
        "})";

    var anime_location_function = Function(anime);

    animation_function_list.push(anime_location_function);
    //create anime for custom css
    var anime_css_function = "anime({";
    for (var j = 0; j < updated_object_options[1].length; j++) {
        anime_css_function += "targets: \"#" + updated_object_options[1][j] + "\",";
        anime_css_function += updated_object_options[0][updated_object_options[1][j]].css;
    }
    anime_css_function += "})";
    var anime_function = Function(anime_css_function);
    animation_function_list.push(anime_function);
}
