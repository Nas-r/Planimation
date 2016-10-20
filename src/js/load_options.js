/**Deserialize the saved objects from txt file and repopulate based on whether
the objects/predicates/etc exist in the newly parsed problem.
TODO: Should provide some feedback on things that are no longer found.
@param {file} file - the text file output from a previous save*/
function parseSavedFile(file) {
    readFile(file, function(e) {
        try {
            var objects = JSON.parse(e.target.result);
        } catch (x) {
            console.log(x);
        } finally {
            var typekeys = Object.keys(objects[0]);
            var objectkeys = Object.keys(objects[1]);
            var predicatekeys = Object.keys(objects[2]);

            for (var i = 0; i < typekeys.length; i++) {
              typekeys[i] = typekeys[i].toLowerCase();
                typeOptions[typekeys[i]] = objects[0][typekeys[i]];
                writeTypeOption(typekeys[i]);
            }
            for (var i = 0; i < objectkeys.length; i++) {
              objectkeys[i] = objectkeys[i].toLowerCase();
                objectOptions[objectkeys[i]] = objects[1][objectkeys[i]];
                writeObjectOption(objectkeys[i]);
            }
            for (var i = 0; i < predicatekeys.length; i++) {
              predicatekeys[i] = predicatekeys[i].toLowerCase();
                predicateOptions[predicatekeys[i]] = objects[2][predicatekeys[i]];
                //writePredicateOption??
            }
            if (typeof(objects[3]) != "undefined") {
                globalOptions = objects[3];
            }
        }
        console.log(objects);
    });
}
