/**
 * 
 *   class Categorie
 *   ---------------
 *   Gestion des catégories
 * 
**/
class Categorie extends AbstractTableClass {

  static init(){
    // console.log("-> Categorie.init")
    super.reset()
    // - Ce que ne fait pas reset() de AbstractTableClass
    this.tableByName = {}
  }

  static addTask(item){
    if ( item.categorie == '' ) { return }
    if ( undefined == this.tableByName ) { this.init() }
    const cate = item.categorie
    let icate = this.getByName(cate)
    if ( undefined == icate ) {
      /*
      |  La catégorie n'existe pas encore
      */
      icate = this.add(new Categorie({name: cate, id: this.getNewId()}))
    }
  }

  static add(icate){
    super.add(icate)
    Object.assign(this.tableByName, {[icate.name]: icate})
    return icate
  }

  static getByName(name){
    return this.tableByName[name]
  }

  constructor(data){
    super()
    this.data = data
    this.items = []
  }

  addTask(task){
    this.items.push(task)
  }

  get id()  { return this.data.id}
  get name(){ return this.data.name}
}
