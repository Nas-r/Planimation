/**Serialize and output the animation options objects,
I should add a call to updateInputOptionEntity to ensure the last option input
is not lost in case the user forgets to click save & apply
@param {text} text - the JSON string containing all applied options
@param {string} name - default name of the saved text file
@param {string} type - the output text file's type
*/
function downloadOptionsInput(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}


/**
 * Stringifies the animation input and runs the download function.
 */
function downloadAnimationOptions() {
  var saveFile  = JSON.stringify([typeOptions,objectOptions,predicateOptions,globalOptions]);
  downloadOptionsInput(saveFile, 'animation_options.txt', 'text/plain');
}
