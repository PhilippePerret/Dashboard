'use strict';
/**
* Classe permettant d'isoler le traitement des liaisons entre tâches
*/
class TaskLinker {

  constructor(task){
    this.task = task
  }

  treatLinking(){
    const task = this.task
    /*
    |  Si la tâche est déjà liée, il faut demander s'il faut délier
    |  ou ajouter une liaison
    */
    if ( task.isLinked ) {
      confirmer("Veux-tu délier la tâche ou ajouter une liaison ?", {
        buttonOk:     {name: 'Délier', poursuivre: this.delinker.bind(this)},
        buttonCancel: {name:'Ajouter liaison', poursuivre: this.addLink.bind(this)}
      })
    } else {
      this.addLink()
    }
  }
  addLink(doit){
    const task = this.task
    if ( undefined === doit ) {
      /*
      |  On garde la trace de la clé de filtrage actuelle pour pouvoir
      |  la remettre à la fin.
      */
      this.currentFilterKey = String(TaskFilter.filterKey)
      confirmer("Choisis la tâche précédente (celle que doit suivre la tâche sélectionnée) puis clique sur OK",{poursuivre:this.addLink.bind(this)})
    } else if ( doit === false ) {
      /*
      |  Renoncement
      */
      return
    } else {
      /*
      |  La tâche actuellement sélectionnée
      */
      const newPrevTask = Todo.selectedTask
      /*
      |  On remet la tâche courante comme tâche sélectionnée
      */
      Todo.selectedTask = task
      /*
      |  On réaffiche sa liste si nécessaire
      */
      TaskFilter.applyFilter(this.currentFilterKey)
      /*
      |  La tâche ne peut pas être liée à elle-même
      */
      if ( newPrevTask == this ) {
        return erreur("Une tâche ne peut se suivre elle-même, voyons !")
      }
      /*
      |  L'utilisateur a peut-être afficher une autre liste de 
      |  tâche et il a en tout cas sélectionner une autre tâche. Il
      |  faut donc :
      |     - remettre la liste de la tâche initiale (celle-ci)
      |     - resélectionner cette tâche-ci
      */
      const prevs = task.prev || []
      prevs.push(newPrevTask.id)
      task.prev = prevs
      task.setLinkState(true)
      /*
      |  
      */
      /*
      |  On finit par enregistrer la tâche
      */
      task.save()
    }
  }

  delinker(delier){
    const task = this.task
    /*
    |  S'il y a une seule tâche précédente, pas besoin de demander,
    |  on supprime la liaison
    */
    if ( task.prev.length == 1 ) {
      task.prevTasks[0].unlink(task)
      task.prev = null
      task.setLinkState()
      task.save()
      return
    }
    if ( undefined === delier ) {
      /*
      |  Quand on arrive la première fois dans le delinker
      */
      this.prevDup = JSON.parse(JSON.stringify(task.prev))
      this.newPrev = []
    }
    if ( delier === false ) {
      /*
      |  On doit la garder
      */
      this.newPrev.push(this.currentPrev)
    } else if ( this.prevDup.length /* tant qu'il y a des liens */) {
      this.currentPrev = this.prevDup.pop()
      confirmer(`Veux-tu la délier de la tâche « ${Todo.get(this.currentPrev).resume} »`, {poursuivre:this.delinker.bind(this)})
    } else {
      /*
      |  Quand on a fini
      |     - On délie chaque tâche précédente
      |     - On relie celles qu'on a gardées
      */
      task.prevTasks.forEach(tk => tk.unlink(task))
      task.prev = this.newPrev
      task.prevTasks.forEach(tk => tk.link(task))
      task.setLinkState()
    }
  }
}
