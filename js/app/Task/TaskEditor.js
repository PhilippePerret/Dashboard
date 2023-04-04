'use strict';

class TaskEditor {

  static editTask(task){
    this.editor.edit(task)
  }
  static prepare(){}

  static get editor(){
    return this._editor || (this._editor = new TaskEditor())
  }

  constructor(){
    this.prepare()
    this.observe()
  }

  edit(task){
    this.task = task
    /*
    |  Mettre ses données dans les champs
    */
    this.setValues()
    /*
    |  Afficher l'éditeur
    */
    this.show()
  }

  /**
  * Mettre les valeurs dans les champs
  */
  setValues(){
    this.field('displayed-id').innerHTML = this.task.id
    Todo.PROPERTIES.forEach(prop => {
      this.field(prop).value = this.task.data[prop] || ''
    })
  }
  /**
  * Prendre les valeurs des champs
  */
  getValues(){
    let newData = {}
    Todo.PROPERTIES.forEach(prop => {
      Object.assign(newData, {[prop]: this.field(prop).value})
    })
    return newData;
  }

  show(){
    this.obj.classList.remove('hidden')
    this.focusOn('resume')
  }
  hide(){
    this.obj.classList.add('hidden')
    this.task = null
    delete this.task
  }

  /**
  * Mettre le focus (et tout sélectionner) dans le champ +fieldId+
  * 
  * @note
  *   Si +fieldId+ vaut 'id', l'identifiant du champ est 'task-id'
  */
  focusOn(fieldId){
    const field = this.field(fieldId)
    field.focus()
    field.select()
  }

  /**
  * Pour observer les éléments de l'éditeur
  */
  observe(){
    listen(this.btnSave,'click',this.onClickSave.bind(this))
    listen(this.btnCancel,'click',this.onClickCancel.bind(this))
  }

  prepare(){
    this.peupleCategories()
    this.peupleTypesAction()
  }

  // --- Gestionnaires d'Events ---

  onClickSave(ev){
    const newData = this.getValues()
    if ( this.task.obj ) {
      /*
      |  Tâche existante
      */
      this.task.update(newData)
      
    } else {
      /*
      |  Nouvelle tâche
      */
      this.task.data = this.getValues()
      this.task.constructor.add(this.task)
      this.task.display(null/* pour rechercher où elle doit se mettre*/)
      this.task.save()
    }
    this.hide()
    return stopEvent(ev)
  }
  onClickCancel(ev){
    this.hide()
    return stopEvent(ev)
  }

  /**
  * Méthode appelée :
  *   1) lorsqu'on choisit une catégorie
  *   2) lorsqu'on revient après avoir donné le nom d'une nouvelle catégorie
  *       ok est alors true si on veut l'enregistrer
  */
  onChooseCategorie(ev, ok, newCatName){
    const menu = this.field('cat')
    if ( menu.value == '__new__cate__'){
      ok = ok && newCatName && newCatName.length > 0
      if ( ok ) {
        const icate = Categorie.add(new Categorie({name: newCatName, id: Categorie.getNewId()}))
        this.peupleCategories()
        menu.selectedIndex = icate.index + 1
      } else if ( ok === false ) {
        menu.selectedIndex = 0
      } else {
        demander("Nom de la nouvelle catégorie", "Nouvelle catégorie", {poursuivre:this.onChooseCategorie.bind(this,ev)})
      }
    }
    return stopEvent(ev)
  }


  // --- Build Methods ---

  peupleCategories(){
    const mCate = this.field('cat')
    mCate.innerHTML = ''
    mCate.appendChild(DCreate('OPTION',{value:'',text:'Catégorie…'}))
    Categorie.each(cate => mCate.appendChild(DCreate('OPTION',{value:cate.id, text:cate.name})))
    mCate.appendChild(DCreate('OPTION',{value:'__new__cate__',text:'Autre…'}))
    listen(mCate,'change', this.onChooseCategorie.bind(this))
  }

  peupleTypesAction(){
    const mAType = this.field('atype')
    mAType.innerHTML = ""
    Todo.ACTION_TYPES.forEach(type => mAType.appendChild(DCreate('OPTION',{value:type, text:type})))
  }


  field(prop){
    return DGet(`#task-${prop}`, this.obj)
  }

  get btnSave(){
    return this._btnsave || (this._btnsave = DGet('#task-editor-btn-save'))
  }
  get btnCancel(){
    return this._btncancel || (this._btncancel = DGet('#task-editor-btn-cancel'))
  }
  get obj(){return this._obj || (this._obj = DGet('#task-editor'))}
}
