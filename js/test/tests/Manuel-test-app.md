# Manuel tests application



Pour ouvrir la boite d’édition de la tâche et faire un test

~~~javascript

// Définition du test qui servira plus tard
Test.monTest = function(){
 // ... opérations-vérifications
 
  // Requis - pour passer au test suivant
  next()
}

/* --- Le test commence ici --- */
// Si création (mais ça pourrait être aussi de sélectionner
// une tâche et de cliquer sur le bouton "éditer"
clickOn(btnPlus)
// On attend que l'éditeur soit ouvert et préparé et on
// fait le test
waitFor(taskEditorOpened)
.then(Test.monTest.bind(Test))

~~~

