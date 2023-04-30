'use strict';
/**
* Gestionnaire du filtre de tâches
* --------------------------------
* À commencer par le menu filtre
* 
*/
class TaskFilter {

  /**
  * @return [Array] la liste des clés de menu (OPTION) qui ne sont
  * utilisables que si une tâche est sélectionnée
  */
  static get KeysOptionsWithSelected(){
    return ['same-categorie', 'linked']
  }

  /**
  * Méthode principale qui applique le filtre, c'est-à-dire, 
  * concrètement, qui affiche les tâches voulues, par exemple toutes
  * les tâches futures ou toutes les tâches courantes
  * 
  * @param [String] key_filter La clé de filtre, par exemple 'current' ou 'linked'
  */
  static applyFilter(key_filter){
    this.filterKey = key_filter
    switch(key_filter){
    case 'current':
      Task.unselectTask()
      Task.each( tk => {tk[tk.isCurrent ? 'show' : 'hide'].call(tk) })
      break
    case 'outdated':
      Task.unselectTask()
      Task.each( tk => {tk[tk.isOutDated ? 'show' : 'hide'].call(tk) })
      break
    case 'same-categorie':
      console.warn("Je dois apprendre à filtrer les tâches de la même catégorie")
      break
    case 'future':
      Task.unselectTask()
      Task.each( tk => {tk[tk.isFuture ? 'show' : 'hide'].call(tk) })
      break
    case 'all':
      Task.unselectTask()
      Task.each(tk => tk.show.call(tk) )
      break
    case 'linked':
      this.displayLinkedTaskOfSelected()
      break
    case 'masked':
      Task.each( tk => {tk[tk.isMasked ? 'show' : 'hide'].call(tk) })
      break
    case 'undated': // sans échéances
      Task.each( tk => {tk[tk.hasNoDeadline ? 'show' : 'hide'].call(tk) })
      break
    default:
      console.error("Je ne connais pas la clé de filtre des tâches '%s'", key_filter)
    }
  }

  /**
  * Méthode qui actualise la liste des tâches
  * (utilisée par exemple après le changement d'une tâche)
  */
  static applyCurrentFilter(){
    return this.applyFilter(this.filterKey)
  }

  static disableOptionsWithSelected(){
    this.KeysOptionsWithSelected.forEach(key => this.option(key).disabled = true)
  }
  static enableOptionsWithSelected(){
    this.KeysOptionsWithSelected.forEach(key => this.option(key).disabled = false)
  }

  /**
  * Méthode appelée quand on choisit un filtre
  * 
  * @produit
  *   L'affichage des tâches correspondantes
  */
  static onFilterChange(ev){
    this.applyFilter(this.filterKey)
    return stopEvent(ev)
  }


  static prepare(){
    /*
    |  On remet toujours le menu des tâches affichées aux tâches
    |  courantes (rechargement forcé de la page)
    */
    this.menu.selectedIndex = 0
    /*
    |  Observers d'évènements
    */
    listen(this.menu,'change', this.onFilterChange.bind(this))
    /*
    |  Désactivation des items qui ne doivent être accessibles que
    |  lorsqu'une tâche est sélectionnée.
    */
    this.option('same-categorie').disabled = true
    this.option('linked').disabled = true
  }

  /**
  * @return L'item de menu (OPTIONS) de clé +key+
  * 
  */
  static option(key){
    this.options      || (this.options = {})
    this.options[key] || Object.assign(this.options, {[key]: DGet(`#task-filter-${key}`, this.menu)})
    return this.options[key]
  }

  static get filterKey(){
    return this._filterkey = this.menu.value
  }
  static set filterKey(v){ this._filterkey = v}

  static get menu(){
    return this._menu || (this._menu = DGet('select#task-filter'))
  }



  // @private

  /**
  * @private
  * 
  * Méthode affichant les tâches liées à la tâche sélectionnée
  */
  static displayLinkedTaskOfSelected(){
    const selected = Task.selectedTask
    if ( ! selected ) {
      return erreur("Il faut sélectionner la tâche dont il faut voir les tâches liées.")
    }
    if ( selected.prevTasks.length + selected.nextTasks.length == 0) {
      return erreur ("La tâche sélectionnée n'est liée à aucunee autre tâche.")
    }

    // TODO Noter qu'avec cette formule on ne traite pas les tâches
    // sur des branches différentes
    this.displayPrevTasksOf(selected)
    this.displayNextTasksOf(selected)

  }
  static displayPrevTasksOf(task){
    task.prevTasks.forEach( tk => {
      tk.show()
      if ( tk.prevTasks.length ) { this.displayPrevTasksOf(tk) }
    })
  }
  static displayNextTasksOf(task){
    task.nextTasks.forEach( tk => {
      tk.show()
      if ( tk.nextTasks.length ) { this.displayNextTasksOf(tk) }
    })
  }
}
