'use strict';
/**
* Gestion des évènements
*/

class KeyboardEventManager {
  static onPress(ev){
    return true
  }
  static onDown(ev){
    if ( ev.metaKey && ev.key == 's' ){
      return stopEvent(ev)
    }
  }
  static onUp(ev){
    return true
  }
}
window.onkeypress = KeyboardEventManager.onPress
window.onkeydown  = KeyboardEventManager.onDown
window.onkeyup    = KeyboardEventManager.onUp
