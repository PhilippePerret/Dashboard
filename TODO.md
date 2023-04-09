
## Gestion des tâches liées

### À faire

* masquer les tâches suivantes dans la liste des tâches courantes
* régler les tâches suivantes des tâches au chargement
* afficher les tâches suivantes dans la liste des tâches futures

### Réflexion 

* une tâche liée (suivante, donc qui possède une tâche précédente) doit forcément posséder une durée
* sa date de démarrage est réglée au moment où la tâche précédente est supprimée ou faite

Quand une tâche est supprimée ou marquée faite
-> Voir si elle possède des tâches suivantes (avant la suppression)
Si c'est le cas 
-> définir la date de début de la tâche suivante à maintenant
-> définir sa date de fin en fonction de la durée de cette tâche suivante
