'use strict';
/**
* Pour tester la (dé)liaison des tâches
* On teste ici tous les cas possibles
* 
* - création de plusieurs tâches liées de différentes manières :
* 
*   T1 est seulement liée à T2      T2 -> T1
*   T3 est aussi liée à T2          T2 -> T3
*     (=> quand T2 est faite/supprimée, elle dégage T1 et T3)
*     (   mais seule T1 est vraiment dégagée car T3 dépend aussi de T4)
*   T3 est aussi liés à T4          T4 -> T3
*     (donc T3 ne peut commencer que lorsque T2 et T4 sont faites)
*   T5 est lié à T3                 T3 -> T5
*     (T5 peut commencer dès que T3 est faite/supprimée)
*   T6 est lié à T3                 T3 -> T6
*   T6 est lié à T2                 T2 -> T6
*     (=> T6 ne peut démarrer que lorsque T3 et T2 sont faites/supprimées)
* 
* 
*   - Vérifications initiales -
*   Seules T2 et T4 sont affichées
*   T1, T3, T5, T6 sont masquées
* 
*   - Tests effectués -
*   T2 est marquée faite
*     => T1 est libérée complètement (affichée courante, ses dates réglées)
*     => T3 perd une précédente mais reste liée à T4
* 
*/
var exp, act ;

wait(0.5)
.then(_ => {
  App.resetAll()
  return wait(0.6)
})
.then(_ => {
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  action("Création de Tâche T1")
  Editor.resume = "Tâche T1"
  Editor.dureeNombre = 4
  Editor.dureeUnite  = 'jour'
  Editor.todo   = ""
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("Création de Tâche T2")
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  Editor.resume = "Tâche T2"
  Editor.todo   = ""
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("Liaison de T1 et T2")
  clickOn_task(1)
  clickOn(btnLink)
  clickOn_task(2)
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  clickOn(iMsg.btnOK)
  Task.refute_isDisplayed(1)
  Task.assert_isDisplayed(2)
  return wait(INTERTIME)
})
.then( _ => {
  action("Création de Tâche T3")
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  Editor.resume = "Tâche T3"
  Editor.todo   = ""
  Editor.dureeNombre = 7
  Editor.dureeUnite  = 'jour'
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("Création de Tâche T4")
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  Editor.resume = "Tâche T4"
  Editor.todo   = ""
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("Liaison de T3 et T2")
  Task.assert_isDisplayed(3)
  Task.assert_isDisplayed(2)
  clickOn_task(3)
  clickOn(btnLink)
  clickOn_task(2)
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  clickOn(iMsg.btnOK)
  Task.refute_isDisplayed(3)
  Task.assert_isDisplayed(2)
  return wait(INTERTIME)
})
.then( _ => {
  action("Liaison de T3 à T4")
  Task.display_list('all')
  clickOn_task(3)
  clickOn(btnLink)
  const iMsgChoix = IMessage.getWithMessage("délier la tâche ou ajouter")
  clickOn(iMsgChoix.btnCancel)
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  clickOn_task(4)
  clickOn(iMsg.btnOK)
  return wait(0.5)
})
.then( _ => {
  action("Création de Tâche T5")
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  Editor.resume = "Tâche T5"
  Editor.dureeNombre = 3
  Editor.dureeUnite  = 'jour'
  Editor.todo   = ""
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("Création de Tâche T6")
  clickOn(btnPlus)
  return waitFor(Editor.ready)
})
.then( _ => {
  Editor.resume = "Tâche T6"
  Editor.dureeNombre = 6
  Editor.dureeUnite  = 'jour'
  Editor.todo   = ""
  Editor.save()
  return wait(INTERTIME)
})
.then( _ => {
  action("Liaison de T5 et T3")
  clickOn_task(5)
  clickOn(btnLink)
  clickOn_task(3)
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  clickOn(iMsg.btnOK)
  return wait(INTERTIME)
})
.then( _ => {
  action("Liaison de T6 et T3")
  clickOn_task(6)
  clickOn(btnLink)
  clickOn_task(3)
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  clickOn(iMsg.btnOK)
  return wait(INTERTIME)
})
.then( _ => {
  action("Liaison de T6 et T2")
  clickOn_task(6)
  clickOn(btnLink)
  clickOn_task(2)
  const iMsgChoix = IMessage.getWithMessage("délier la tâche ou ajouter")
  clickOn(iMsgChoix.btnCancel)
  const iMsg = IMessage.getWithMessage("Choisis la tâche précédente")
  clickOn(iMsg.btnOK)
  return wait(INTERTIME)
})
.then( _ => {
  notice("Vérification intermédiaire")
  /*
  |  Affichage des tâches courantes
  */
  Task.display_list('current')
  /*
  |  Seules les tâches 2 et 4 sont affichées
  */
  Task.assert_isDisplayed(2)
  Task.assert_isDisplayed(4)
  Task.refute_isDisplayed(1)
  Task.refute_isDisplayed(3)
  Task.refute_isDisplayed(5)
  Task.refute_isDisplayed(6)
  result("Les tâches sont bien affichées.")
  /*
  |  Les tâches utiles
  */
  const tk1 = Task.get(1)
  const tk3 = Task.get(3)
  /*
  |  Les liaisons sont bien définies
  */
  tk1.follows(2)
  tk3.follows(2)
  tk3.follows(4)
  Task.get(5).follows(3)
  Task.get(6).follows(2)
  Task.get(6).follows(3)
  result("Les tâches sont bien liées.")
  /*
  |  Les données sont bien définies
  */
  assert(null, tk1.start)
  assert(null, tk3.start)
  /*
  |  On passe à la suite
  */
  return wait(INTERTIME)
})
.then(_=>{
  action("-> On marque la tâche #2 accomplie")
  expect("Ça doit libérer la tâche #1")
  clickOn_task(2)
  clickOn(btnDone)
  return wait(1)
})
.then(_ => {
  // --- Vérification des effets de la déliaison ---
  notice("Vérification des effets de la déliaison…")
  const tk1 = Task.get(1)
  const tk2 = Task.get(2)
  // la tâche 2 doit être dans la liste des done
  Task.refute_isDisplayed(2,'main')
  Task.assert_isDisplayed(2,'done')
  // La tâche 1 doit être affichée
  Task.assert_isDisplayed(1)
  // La tâche 1 ne doit plus avoir de "prev"
  tk1.refute_follows(2)
  refute(null, tk1.start)
  // La tâche 1 doit avoir des temps réglés correctement
  const now = new DateUtils()
  const now_rev = now.asRevdate()
  assert(now_rev, tk1.start)
  const four_days_later = new DateUtils(now.plus(4,'jours'))
  assert(four_days_later.asRevdate(), tk1.end)
  // La tâche 2 doit avoir une propriété "next" avec 1
  assert(["1","3","6"], tk2.data.next, "La tâche #2 devrait avoir un nouveau paramètre @next réglé à ${exp}. Il vaut ${act}.")
  // La tâche 1 doit avoir été bien enregistrée
  return wait(INTERTIME)
})
.then( _ => {

  // --- Vérifications avant de poursuivre ---

  /*
  |  Les tâches utiles
  */
  const tk1 = Task.get(1)
  const tk3 = Task.get(3)
  /*
  |  Les liaisons sont bien définies
  */
  tk1.refute_follows(2)
  tk3.refute_follows(2)
  tk3.follows(4)
  Task.get(5).follows(3)
  Task.get(6).refute_follows(2)
  Task.get(6).follows(3)
  result("Les tâches sont bien liées.")
  /*
  |  Les données sont bien définies
  */
  refute(null, tk1.start)
  assert(null, tk3.start)
  return wait(INTERTIME)
})
.then( _ => {
  action("On détruit T#4")
  expect("Ça doit dégager T#3")
  clickOn_task(4)
  clickOn(btnDele)
  // Confirmation
  const iMsg = IMessage.getWithMessage("Veux-tu vraiment détruire cette tâche")
  clickOn(iMsg.btnOK)
  return wait(1)
})
.then(_ => {
  notice("Vérification de l'effet de la déliaison…")
  const dans_sept_jours = NOW.plus(7,'d', true).asRevdate()
  const tk3 = Task.get(3)
  // La tâche 4…
  // … ne doit plus exister
  refute(true, Task.table[4] instanceof Task, "La tâche #4 ne devrait plus exister.")
  // La tâche 3
  // … doit être affichée
  Task.assert_isDisplayed(tk3)
  // … doit avoir le start et le end bien définis
  assert(NOW.asRevdate(), tk3.data.start, "Le @start de la tâche #3 devrait être ${exp}. Il vaut ${act}.")
  assert(dans_sept_jours, tk3.data.end, "Le @end de la tâche #3 devrait valoir ${exp}. Il vaut ${act}.")
  // … ne doit plus avoir de @prev
  tk3.refute_follows(4)
  assert([],tk3.prev,"La tâche #3 ne devrait plus avoir de @prev. Son @prev vaut ${act}.")
  return wait(INTERTIME)
})
.then( _ => {
  action("On marque T3 comme achevée")
  expect("Ça doit dégager les Tâches #5 et #6")
  clickOn_task(3)
  clickOn(btnDone)
  return wait(1)
})
.then( _ => {
  notice("Vérification des effets de la déliaison…")
  // T6, qui dépendait de T3 et T2, doit être démarrée
  // La tâche #5…
  const tk5 = Task.get(5)
  // … doit être affichée
  Task.assert_isDisplayed(5)
  // La tâche #6…
  const tk6 = Task.get(6)
  // … doit être affichée
  Task.assert_isDisplayed(6)
  // … doit avoir le bon @start et le bon @end
  assert(NOW.asRevdate(), tk6.data.start, 'La propriété @start de #6 devrait être ${exp}. Elle vaut ${act}.')
  const dans_six_jours = NOW.plus(6,'d', true).asRevdate()
  assert(dans_six_jours, tk6.data.end, 'La propriété @end de #6 devrait être ${exp}. Elle vaut ${act}.')
  return wait(INTERTIME)
})
.then(next)

