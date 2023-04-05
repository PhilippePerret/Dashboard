'use strict';

class TaskEditor {

  static editTask(task){
    this.editor.edit(task)
  }

  static get editor(){
    return this._editor || (this._editor = new TaskEditor())
  }

  // --- INSTANCE ---

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
    this.setVisibilityTryAction()
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
    listen(this.btnTryAction,'click',this.onTryAction.bind(this))
    listen(this.actionField,'change', this.onChangeAction.bind(this))
  }

  prepare(){
    this.peupleCategories()
    this.peupleTypesAction()
    $(this.obj).draggable();

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

  /**
  * Méthode appelée quand on clique sur le bouton pour essai le
  * code (action)
  */
  onTryAction(ev){
    return this.task.onClickRun(ev)
  }

  /**
  * Méthode évènement appelée quand on change le code de l'action
  * à jouer
  */
  onChangeAction(ev){
    const actio = this.actionField.value
    this.setVisibilityTryAction(actio)
    const atype = this.field('atype').value
    /*
    |  Les vérifications à faire en fonction du type choisi
    */
    try {
      switch(atype){
      case 'run':
        if ( actio.padStart('run ') ) { throw "Ne pas mettre 'run' au début de la commande, juste l'argument" }
        break;
      }
    } catch(err) {
      erreur(err) 
      this.actionField.focus()
      this.actionField.select()
    }
  }


  // --- Build/Interface Methods ---

  setVisibilityTryAction(action){
    action = action || this.task.data.action
    this.btnTryAction.classList[action ? 'remove' : 'add']('invisible')
  }

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
    for(var atype in Todo.ACTION_TYPES) {
      mAType.appendChild(DCreate('OPTION',{value:atype, text:Todo.ACTION_TYPES[atype]}))
    }
  }


  field(prop){
    return DGet(`#task-${prop}`, this.obj)
  }

  get actionField(){
    return this._actfield || (this._actfield = this.field('action'))
  }
  get btnTryAction(){
    return this._btntryact ||= (this._btntryact = DGet('#btn-try-action', this.obj))
  }
  get btnSave(){
    return this._btnsave || (this._btnsave = DGet('#task-editor-btn-save'))
  }
  get btnCancel(){
    return this._btncancel || (this._btncancel = DGet('#task-editor-btn-cancel'))
  }
  get obj(){return this._obj || (this._obj = DGet('#task-editor'))}
}
