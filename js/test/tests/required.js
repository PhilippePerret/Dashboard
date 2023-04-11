'use strict';
/**
* Module contenant les éléments requis
*/

/* - Bouton pour créer une nouvelle tâche - */
const btnPlus = DGet('div#container-tasks-main footer button.btn-add')


/**
* Pour utiliser :
*   waitFor(taskEditorOpened).then(<action>)
* pour attendre que l'éditeur soit ouvert
*/
function taskEditorOpened(){
  return not(DGet('div#task-editor').classList.contains('hidden'))
}
