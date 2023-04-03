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
    console.info("Ce qu'il faut faire au démarrage.")
    /*
    |  Préparation de l'interface
    */
    UI.prepare()
    /*
    |  Affichage de ce qu'il y a à faire aujourd'hui
    */
    Todo.loadAndDisplayTodayTasks()
  }
} // /class App


