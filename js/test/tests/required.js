'use strict';
/**
* Module contenant les éléments requis
*/

/* - Bouton pour créer une nouvelle tâche - */
const btnPlus = DGet('div#container-tasks-main footer button.btn-add')

/* - La boite de l'éditeur - */
const editor = DGet('div#task-editor')

/**
* @async
* 
* Pour recharger la base de l'application en mode test (c'est-à-dire
* les 5 tâches de test)
* 
* @usage
* 
*   Test.reloadAppInTestMode()
*   .then(Test.<methode du test>.bind(Test))
*/
Test.reloadAppInTestMode = function(retour){
  if ( undefined == retour ) { return AppLoader.load() }
  else {
    // Chargement des tâches en essai dans le dossier
    Task.loadAndDisplayAllTasks()
    // On attend que l'application soit prête pour commencer
    waitFor(function(){return App.isReady == true}).then(AppLoader.onOk)
  }
}

class AppLoader {
  static load(){
    return new Promise((ok,ko) => {
      this.onOk = ok
      this.onKo = ko
      WAA.send({class:'WAATest', method:'customInit', data:{poursuivre:'reloadAppInTestMode'}})
    })
  }
}

/**
* Simulation de la sélection du menu "Autre…" des catégories
* (pour en créer une nouvelle)
* 
* Il faut ensuite entrer la nouvelle catégorie avec :
*     const divMsg = DGet('div.inter-conteneur')
*     DGet('input.prompt-field[value="Nouvelle catégorie"]').value = "<nom catégorie>"
* Puis valider avec : 
*     clickOn(DGet('button.btn-ok', divMsg))
* 
*/
function simulateNewCategorie(){
  DGet('select#task-cat').selectedIndex = DGetAll('select#task-cat option').length - 1
  DGet('select#task-cat').dispatchEvent(new Event('change'))
  return wait(1)
}

/**
* Retourne la liste des tâches affichées
* 
* @note
*   Il s'agit des objets DOM
*/
function displayedTaskObjects(){
  return DGetAll('div#container-tasks-main div.task-list div.task:not(.hidden)')
}

/**
 * Attente de l'ouverture de l'éditeur de tâche
 * 
* Pour utiliser :
*   waitFor(taskEditorOpened).then(<action>)
* pour attendre que l'éditeur soit ouvert
*/
function taskEditorOpened(){
  return not(DGet('div#task-editor').classList.contains('hidden'))
}
