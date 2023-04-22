'use strict';
/**
* Classe permettant d'isoler le traitement des liaisons entre tâches
*/
class TaskLinker {

  /**
  * Une instance TaskLinker permet de gérer les liens d'une tâche.
  * 
  */
  constructor(task){
    this.task = task
  }

  /**
  * Pour traiter la liaison avec une tâche
  */
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
      |  Première entrée dans la méthode, lorsque l'on doit choisir 
      |  la tâche précédente.
      |  Mais avant ça, il faut s'assurer que la tâche est valide
      */
      if ( ! task.data.duree ) {
        task.edit()
        return erreur("Il faut absolument définir la durée d'une tâche, pour pouvoir la lier.")
      }
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
      |  On passe ici pour définir la tâche précédente de la tâche
      |
      */
      /*
      |  La tâche actuellement sélectionnée
      */
      const newPrevTask = Task.selectedTask
      /*
      |  On remet la tâche courante comme tâche sélectionnée
      */
      Task.selectedTask = task
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
      |  Autres modifications de la tâche
      */
      task.data.start = null
      task.data.end   = null
      /*
      |  On définit la tâche suivante de la tâche précédente
      */
      newPrevTask.addNext(task)
      /*
      |  On finit par enregistrer la tâche
      */
      task.save()
      /*
      |  On réaffiche la liste (qui doit normalement faire disparaitre
      |  la tâche liée, sauf si c'est l'affichage des tâches liées à
      |  la précédente ou la courante)
      */
      TaskFilter.applyFilter(this.currentFilterKey)
    }
  }

  /**
  * Traitement de la déliaison. Pour une raison ou pour une autre
  * la tâche courante ne doit plus suivre la tâche +tkprev+
  * 
  */
  unlinkWithNext(tknext){
    const tkprev = this.task
    /*
    |  On doit retirer tkprev des prev de la tâche courante
    */
    tknext.removePrev(tkprev)
    // console.log("Nouveau prev pour la suivante : ", tknext.prev, tknext)
    /*
    |  On doit retirer la tâche courante des nextTasks de la tâche
    |  tkprev
    */
    tkprev.removeNext(tknext)
    // console.log("Nouveau nextTask pour la précédente : ", tkprev.nextTasks, tkprev)
    /*
    |  Si la tâche suivante (tknext) n'a plus de tâche précédente, 
    |  elle doit être démarrée. On doit dont régler ses dates en 
    |  fonction de sa durée.
    */
    if ( tknext.prev.length == 0 ) {
      // console.log("La tâche #%s n'a plus de tâche précédente", tknext.id)
      const now = DateUtils.now()
      const newData = {}
      Object.assign(newData, {
          start: now.asRevdate()
        , end:   new DateUtils(now.plus(...tknext.data.duree.split(':'))).asRevdate()
      })
      // console.log("Nouvelles données pour #%s", tknext.id, newData)
      tknext.update(newData, true) // sauvera la tâche et gèrera son affichage
    } else {
      tknext.save()
    }
    if ( ! tkprev.beingDeleted ) {    
      /*
      |  On doit enregistrer les deux tâches
      */
      tkprev.save()
      /*
      |  Vérifier l'état de la tâche précédente
      */
      tkprev.setLinkState()
    }
  }


  delinker(delier){
    const task = this.task
    /*
    |  S'il y a une seule tâche précédente, pas besoin de demander,
    |  on supprime la liaison
    */
    if ( task.prev.length == 1 ) {
      task.prevTasks[0].removeNext(task)
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
      confirmer(`Veux-tu la délier de la tâche « ${Task.get(this.currentPrev).resume} »`, {poursuivre:this.delinker.bind(this)})
    } else {
      /*
      |  Quand on a fini
      |     - On délie chaque tâche précédente
      |     - On relie celles qu'on a gardées
      */
      task.prevTasks.forEach(tk => tk.removeNext(task))
      task.prev = this.newPrev
      task.prevTasks.forEach(tk => tk.addNext(task))
      task.setLinkState()
    }
  }
}
