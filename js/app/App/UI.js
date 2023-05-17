'use strict';

class UI {
  static prepare(){
    listen(document,'click',this.onClickBody.bind(this))
    TaskConteneur.prepare()
    TaskFilter.prepare()
    TaskButton.prepare()
    TaskSearch.prepare()
    this.espaceButtonTitle()
    Toolbox.setup()
  }

  /**
  * Méthode appelée quand on clique le document (hors tout)
  */
  static onClickBody(ev){
    const tg = ev.target
    if ( tg.classList.contains('task-conteneur') || tg.tagName == 'HTML' || tg.tagName == 'BODY' ) {
      Task.unselectTask()
      return stopEvent(ev)
    }
    return true
  }

  /**
  * Pour que la souris ne masque pas le début du title des boutons
  */
  static espaceButtonTitle(){
    document.querySelectorAll('button').forEach(button => {
      if ( button.title ) {
        button.title = '      ' + button.title
      }
    })
  }
}
