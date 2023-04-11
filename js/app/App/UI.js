'use strict';

class UI {
  static prepare(){
    TaskConteneur.prepare()
    TaskFilter.prepare()
    TaskButton.prepare()
    TaskSearch.prepare()
    this.espaceButtonTitle()
    Toolbox.setup()
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
