# Manuel de test

Les **tests *WAA*** permettent de faire des tests de l’application en javascript.

## Opérations

### Lancer les tests

Pour lancer les tests, il suffit d’ajouter (ou de décommenter) :

~~~javascript
$(document).ready(e => {
  
  // Lance la suite de tests
  Test.run()
  
  ...
}
~~~

### Définir les tests à jouer

Les tests à jouer ***peuvent*** être définis dans la constante **`TEST_FILES`** en haut du fichier `js/test/Test.js` de l’application WAA.

***Mais*** si cette constantes n’est pas définie, l’application *WAA* lira simplement les tests du dossier `./js/test/tests` s’il existe.

> Noter qu’on ne met que l’affixe du fichier, pas son extension.
>
> Noter que ces tests seront joués de façon aléatoire.

Par exemple :

~~~javascript
// dans js/test/Test.js

const TEST_FILES = [
  'app/premier_test'
]
~~~

> Le test ci-dessus est défini par son chemin relatif dans `./js/test/tests/`

Tous les tests doivent être définis dans le dossier :

~~~
./js/test/tests/
~~~

Pour la définition ci-dessus, on doit donc trouver le fichier :

~~~
./js/test/tests/app/premier_test.js
~~~

## Fabrication d’un test

Un fichier test est un fichier (script) qui va être joué séquentiellement lorsqu’il est chargé. Même s’il contient des tests asynchrones.

### Impératif pour chaque test

Le seul impératif pour un test est qu’il appelle la méthode `[Test.]next()` lorsqu’il a fini son travail.

~~~javascript
next()
~~~

**Sans cet appel, la suite de tests s’interromprait.**

> **Attention cependant** : cet appel **ne veut pas dire de passer au test suivant**, mais bien plutôt de **passer au *fichier* tests suivant**. Ainsi, on ne doit trouver qu’un et un seul appel dans un fichier de tests.

### Exemple de test simple (séquentiel simple)

Voici l’exemple d’un simple test, uniquement séquentiel, vérifiant les retours de méthodes.

~~~javascript
// dans ./js/test/tests/retour_fonctions.js

assert(6, Math.multiplieParDeux(3))

assert(-4, Math.multiplieParDeux(-2))

assert('string', typeof "Ma chaine de caractère")

// Pour passer au fichier test suivant
next()
~~~

> Rappel : pour fonctionner, ce test a juste besoin qu’on écrive `Test.run()` dans le *ready* de l’application.

### Exemple d’un test asynchrone

Pour créer un test asynchrone, on utilise deux méthodes : 

~~~javascript
wait(x.y) // qui attend x.y secondes (p.e. 2.5)

waitFor(callback) // qui attend que la fonction callback retourne true
~~~

Par exemple :

~~~javascript
// dans ./js/test/tests/mon_test_async.js

wait(3)
.then(() => {
  // Joué après 3 secondes d'attente
  
  // On attend de trouver un div d'identifiant #mon_div
  // dans la page
  waitFor({return DGet('div#mon_div')})
	.then(() => {
    // On a trouvé le div, on peut ajouter un succès
  	add_succcess("mon div#mon_div a été trouvé")
  	// Et passer au fichier de tests suivant
  	next()
	})
})
~~~



## Méthodes d’assertion

Le testeur de *WAA* voulant rester simple, on ne trouve que ces méthodes pour gérer les assertions et comptages d’erreurs et de succès :

### [Test.]assert

Vérifie une égalité :

~~~javascript
Test.assert(expected, actual[, message d’erreur])
~~~

Par exemple :

~~~javascript
Test.assert(4, 2 + 2, "2 + 2 doit être égal à 4")
~~~

Sans message d’erreur fourni, un résultat erroné produirait :

~~~
4 doit être égal à 5
~~~

Pour reprendre les valeurs `expected` et `actual` dans le message, on utilise `${actual}` et `${expected}`. Par exemple :

~~~javascript
Test.assert(4, 2 + 3, "Le  nombre ${actual} devrait valoir ${expected}")
~~~



### [Test.]refute

Vérifie une différence :

~~~javascript
[Test.]refute(not_expected, actual[, message d’erreur])
~~~

Par exemple :

~~~javascript
[Test.]refute(5, 2 + 2, "2 + 2 ne doit pas être égal à 5")
~~~

Sans message d’erreur fourni, le retour serait :

~~~
4 ne devrait pas être égal à 5
~~~

Pour reprendre les valeurs `not_expected` et `actual` dans le message, on utilise `${actual}` et `${not_expected}`. Par exemple :

~~~javascript
assert(4, 2 + 3, "Le  nombre ${actual} ne devrait surtout pas valoir ${not_expected} !")
~~~

### [Test.]add_success

On peut ajouter un succès grâce à cette méthode

> Noter que les méthodes Test.assert, Test.refute, etc. ajoutent automatiquement des succès et des échecs.

Si un argument est fourni, ce sera le message de victoire produit. Pour le moment, il n’est pas utilisé.

### [Test.]add_failure

Pour ajouter une erreur.

~~~javascript
[Test.]add_failure("Cette opération produit une erreur")
~~~

Sans message fourni, le retour serait :

~~~
Une erreur a été produite.
~~~

