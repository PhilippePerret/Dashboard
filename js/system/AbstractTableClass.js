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
    console.info("item.index = ", item.index, item)
    this.items.push(item)
    Object.assign(this.table, {[item.id]: item})
    if ( Number(item.id) > this.lastId ) { this.lastId = Number(item.id) }
    return item
  }

  static get count(){
    return this.items.length
  }

  static each(methode){
    this.items.forEach(methode)
  }

  static map(methode){
    var res = []
    this.items.forEach( item => {
      res.push(methode(item))
    })
    return res
  }

}
