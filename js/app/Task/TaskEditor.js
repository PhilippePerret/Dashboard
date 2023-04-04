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
