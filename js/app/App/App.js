'use strict';

class App {

  /* TODO : la remonter du serveur */
  static get APP_VERSION(){ return '0.1.0' }

  /**
  * Pour remonter une erreur depuis le serveur avec WAA.
  * (WAA.send(class:'App',method:'onError', data:{:message, :backtrace}))
  */
  static onError(err){
    erreur(err.message + " (voir en console)")
    console.error(err.message)
    console.error(err.backtrace)
  }
  

  static onReady(){
    /*
    |  Préparation de l'interface
    */
    UI.prepare()
    /*
    |  Affichage de ce qu'il y a à faire aujourd'hui
    */
    Todo.loadAndDisplayAllTasks()

    // Pour lancer le check des résultat KPD
    this.getKDPResult()

  }


  static getKDPResult(retour){
    console.log("Retour = ", retour)
    this.kdpTimer && clearTimeout(this.kdpTimer)
    if (undefined == retour) {
      DGet('span#kdp-nombre-ventes').innerHTML = `…`
      DGet('span#kdp-time').innerHTML = DateUtils.currentTime()
      WAA.send({class:"Dashboard::App",method:"get_kdp_score", data:{ok:true}})
    } else {
      if ( retour.ok ) {
        /*
        |  Affichage du nombre de ventes et on lance le prochain
        */
        const oldNombreVentes = Number(retour.oldNombreVentes)
        const newNombreVentes = Number(retour.newNombreVentes)
        DGet('span#kdp-nombre-ventes').innerHTML = `${newNombreVentes}`
        DGet('span#kdp-time').innerHTML = DateUtils.currentTime()
        this.kdpTimer = setTimeout(this.getKDPResult.bind(this), 60 * 1000 /* toutes les minutes */)
        console.log("nombreVentes = ", newNombreVentes, DateUtils.currentTime())
      } else {
        /*
        |  Erreur:
        */
        erreur(retour.msg)
      }
    }
  }
} // /class App


