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

## Pour les tâches

### Choisir une liste 

~~~javascript
Task.display_list(type)
// ou type peut être :
// 'current' : les tâches en cours, 
// 'all' : toutes
// 'outdated' : les tâches dépassées seulement
// 'future'   : futures
// 'same-categorie' : même catégorie que sélectionnée
// 'linked' : liées à sélectionnée, dans l'ordre
~~~



### Simuler le clic sur une tâche

~~~javascript
clickOn_task(<id task>)
~~~

Par exemple, pour cliquer sur la tâche d’identifiant 12 :

~~~javascript
clickOn_task(12)
~~~



### Tester si une tâche est affichée (visible)

~~~javascript
Task.assert_isDisplayed(2)

// ou 

Task.assert_isDisplayed(<instance tâche>)

// Pour forcer la liste dans laquelle il faut regarder :

Task.assert_isDisplayed(2, 'main')
// ou 'done' (liste des achevée) ou 'pinned' (liste des épinglée)
~~~



### Tester le non affichage d’une tâche

~~~javascript
Task.refute_isDisplayed(2)
// Ou
Task.refute_isDisplayed(<instance tâche>)

// Pour forcer la liste dans laquelle il faut regarder :

Task.refute_isDisplayed(2, 'main')
// ou 'done' (liste des achevée) ou 'pinned' (liste des épinglée)
~~~



---

<a name="editor"></a>

## Class Editor

La class `Editor` permet de manipuler et tester la fenêtre de l’éditeur de tâche.

~~~javascript
// Pour définir le résumé
Editor.resume = "Résumé de la tâche"

// Pour définir les dates
Editor.start = "2023-04-12"
Editor.end   = "2023-04-15"
Editor.dureeNombre = 4
Editor.dureeUnite  = 'd' // ou 'jour', 'm'/'mois', 'w'/'semaine' 

// Pour définir la priorité
Editor.priority = 5

// Pour définir la catégorie (si elle existe déjà)
Editor.categorie = "La Catégorie"

// Pour définir le champ 'todo'
Editor.todo = "- 1re sous-tâche\n2e sous-tâche

Editor.ready() 
// retourne true si l'éditeur est ouvert
~~~

