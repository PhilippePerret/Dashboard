'use strict';
/**
 * 
* Gestion de la "Toolbox", la boite à outils
*/
class Toolbox {

  /**
  * Méthode qui prépare la toolbox en fonction des définitions de
  * l'utilisateur dans son fichier personnel "toolbox.js"
  */
  static setup(retour){
    if ( undefined == retour){
      WAA.send({class:'Dashboard::Toolbox',method:'check_if_exists',data:{}})
    } else {
      /*
      |  Au retour des données
      */
      if ( retour.ok ) {
        if ( retour.has_custom_toolbox ) {        
          const script = DCreate('SCRIPT',{type:'text/javascript'})
          script.src = "toolbox.js"
          listen(script,'load',this.onUserDataLoaded.bind(this))
          document.head.appendChild(script)
        } else {
          // console.info("L'utilisateur n'a pas de script propre.")
        }
      } else {erreur(retour.msg)}
    }
  }

  /**
  * Méthode appelée quand le script 'toolbox.js' de l'utilisateur
  * est chargé.
  */
  static onUserDataLoaded(ev){
    if ( ! Toolbox.data ) return ;
    if ( Toolbox.data.buttons ) {
      Toolbox.data.buttons.forEach(domel => this.obj.appendChild(domel))
    }
  }


  static get obj(){return this._obj||(this._obj = DGet('div#toolbox'))}

}
