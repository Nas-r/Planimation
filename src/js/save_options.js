/*Serialize and output the animation options objects*/

function download(text, name, type) {
    var a = document.createElement("a");
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function downloadAnimationOptions() {
  var saveFile  = JSON.stringify([typeOptions,objectOptions,predicateOptions]);
  download(saveFile, 'animation_options.txt', 'text/plain');
}
