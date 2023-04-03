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
    /*
    |  Mettre ses données dans les champs
    */
    ['resume','start','end', 'todo'].forEach(prop => {
      this.field(prop).value = task[prop]
    })
    /*
    |  Afficher l'éditeur
    */
    this.show()
  }

  show(){
    this.obj.classList.remove('hidden')
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
    console.warn("Je dois apprendre à enregistrer la tâche")
    return stopEvent(ev)
  }
  onClickCancel(ev){
    console.warn("Je dois apprendre à annuler")
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
