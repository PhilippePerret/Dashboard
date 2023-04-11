'use strict';

class TaskSearch {

  static prepare(){
    listen(this.field,'keyup',this.onKeyUp.bind(this))
  }

  /**
  * Méthode appelée dès qu'on entre une touche (ou la supprime) dans le
  * champ de recherche.
  */
  static onKeyUp(ev){
    ev.stopPropagation()
    // ev.preventDefault()
    // - Filtrage -
    // console.log("Valeur de la recherche : ", this.value)
    const value = this.value
    if ( value == "" ) {
      TaskFilter.applyCurrentFilter()
    } else {
      const regexp = new RegExp(`${value}`,'i')
      Task.each(tk => {
        const ok = regexp.exec(tk.resume)
        // const ok = tk.resume.match(regexp)
        tk[ok?'show':'hide']()
      })
    }
    return true
  }

  static get value(){return this.field.value}

  static get field(){
    return this._obj || (this._obj = DGet('header input#task-filter-search'))
  }
}
