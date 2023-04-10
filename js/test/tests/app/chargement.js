'use strict';


console.info("-> premier_chargement.js")

// Chargement des tâches en essai dans le dossier
Task.loadAndDisplayAllTasks()

wait(5).then(()=>{
  console.log("J'ai attendu 5 secondes. Je vais passer à la suite")
  Test.next()
})

// waitFor(function(){return App.isReady == true}).then(_ => {
waitFor(function(){return App.isReady == true})
.then(_ => {
  console.info("L'application est prête pour la vérification.")
})
.catch(err => {
  console.log("err wait", err)
})
