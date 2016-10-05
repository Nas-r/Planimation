/*Deserialize the saved objects from txt file and repopulate based on whether
the objects/predicates/etc exist in the newly parsed problem. Should
provide some feedback on things that are no longer found.*/

function parseSavedFile(file){
  readFile(file, function(e) {
    try{
    var objects = JSON.parse(e.target.result);
  } catch(x){
    console.log(x);
  } finally {
    var typekeys = Object.keys(objects[0]);
    var objectkeys = Object.keys(objects[1]);
    var predicatekeys = Object.keys(objects[2]);
    console.log(objectkeys);
    for(var i =0;i<typekeys.length;i++){
      console.log(objects[0][typekeys[i]]);
      typeOptions[typekeys[i]] = objects[0][typekeys[i]];
      writeTypeOption(typekeys[i]);
    }
    for(var i =0;i<objectkeys.length;i++){
      console.log(objects[1][objectkeys[i]]);
      objectOptions[objectkeys[i]] = objects[1][objectkeys[i]];
      writeObjectOption(objectkeys[i]);
    }
    for(var i =0;i<predicatekeys.length;i++){
      console.log(objects[2][predicatekeys[i]]);
      predicateOptions[predicatekeys[i]] = objects[2][predicatekeys[i]];
      //writePredicateOption??
    }
  }
  console.log(objects);
  });
}
