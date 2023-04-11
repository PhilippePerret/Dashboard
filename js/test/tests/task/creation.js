'use strict';
/**
* Test pour tester la création d'une tâche, jusqu'à son enregistrement
*/

Test.testCreationTask = function(){
  console.warn("Je peux commencer à créer la tâche.")
  // Passer au test suivant
  next()
}


/* - On clique sur le bouton '+' - */
clickOn(btnPlus)
/* - On attend que l'éditeur s'ouvre pour créer la tâche - */
waitFor(taskEditorOpened)
.then(Test.testCreationTask.bind(Test))
