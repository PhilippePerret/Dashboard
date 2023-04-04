'use strict';
/**
* Gestionnaire du filtre de tâches
* --------------------------------
* À commencer par le menu filtre
* 
*/
class TaskFilter {

  /**
  * Méthode principale qui applique le filtre, c'est-à-dire, 
  * concrètement, qui affiche les tâches voulues, par exemple toutes
  * les tâches futures ou toutes les tâches courantes
  * 
  * @param [String] key_filter La clé de filtre, par exemple 'current' ou 'linked'
  */
  static applyFilter(key_filter){
    switch(key_filter){
    case 'current':
      Todo.each( task => {task[task.isCurrent ? 'show' : 'hide'].call(task) })
      break
    case 'same-categorie':
      console.warn("Je dois apprendre à filtrer les tâches de la même catégorie")
      break
    case 'future':
      Todo.each( task => {task[task.isFuture ? 'show' : 'hide'].call(task) })
      break
    case 'linked':
      console.warn("Je dois apprendre à filtrer les tâches liées à la courante")
      break
    default:
      console.error("Je ne connais pas la clé de filtre des tâches '%s'", key_filter)
    }
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
    listen(this.menu,'change', this.onFilterChange.bind(this))
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

  static get menu(){
    return this._menu || (this._menu = DGet('select#task-filter'))
  }
}
