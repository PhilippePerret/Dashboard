'use strict';

class App {


  static onReady(){

    console.info("WAA.mode_test = ", WAA.mode_test)
    /*
    |  Préparation de l'interface
    */
    UI.prepare()

    /*
    |  Affichage de ce qu'il y a à faire aujourd'hui
    */
    WAA.mode_test || Task.loadAndDisplayAllTasks()

  }

  /**
  * Pour repartir à zéro
  * 
  * Pour le moment, utilisé seulement par les tests
  */
  static resetAll(){
    Task.reset()
    Categorie.reset()

  }

  /**
  * Pour remonter une erreur depuis le serveur avec WAA.
  * (WAA.send(class:'App',method:'onError', data:{:message, :backtrace}))
  */
  static onError(err){
    erreur(err.message + " (voir en console)")
    console.error(err.message)
    console.error(err.backtrace)
  }
  
} // /class App
