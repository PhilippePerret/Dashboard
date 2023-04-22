/**
* Pour les classes qui vont utiliser this.items et this.table (par
* id) pour conserver leurs éléments.
* 
* Offre des méthodes utiles et raccourcis comme #each et #map
*/
class AbstractTableClass {

  static reset(){
    this.items  = []
    this.table  = {}
    this.lastId = 0
  }

  static get(item_id){
    return this.table[item_id]
  }

  static getNewId(){ return ++ this.lastId }

  /**
  * Ajoute l'item +item+
  * @return [AnyClass] l'item ajouté
  */
  static add(item) {
    item.index = this.items.length
    this.items.push(item)
    Object.assign(this.table, {[item.id]: item})
    if ( Number(item.id) > this.lastId ) { this.lastId = Number(item.id) }
    return item
  }

  static remove(item){
    this.table[item.id] = undefined
    delete this.table[item.id]
    this.items[item.index] = undefined // il faut le laisser dedans pour ne pas modifier les index
  }

  static get count(){
    return Object.keys(this.table).length
  }

  /**
  * @note
  *   Penser que certains items peuvent être undefined (suite à leur
  *   suppression)
  */
  static each(methode){
    this.items.forEach(item => {
      if ( ! item ) return /* item détruit */
      methode(item)
    })
  }

  static map(methode){
    var res = []
    this.items.forEach( item => {
      if ( ! item ) return /* item détruit */
      res.push(methode(item))
    })
    return res
  }

}
