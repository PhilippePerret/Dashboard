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

### Empêcher le comportement par défaut de l’application

Si l’on veut empêcher les opérations d’une méthode qui pourrait être par exemple `App.onReady` — qui chargerait des éléments côté serveur — il suffit d’utiliser la constante `WAA.mode_test` qui est mise à true quand les tests sont lancés. Par exemple :

~~~javascript
class App {
  static onReady(){
    UI.prepare() // Sera toujours fait, même pour les tests
 		// À ne faire qu'en mode normal :   
    WAA.mode_test || this.chargerElements()
  }
}
~~~



### Revenir au mode production

Pour revenir au mode production après avoir jouer la suite de test, il est certainement nécessaire de relancer toute l’application (c’est-à-dire en la quittant d’abord).

### Définir les tests à jouer

Les tests à jouer ***peuvent*** être définis dans la constante **`TEST_FILES`** en haut du fichier `js/test/Test.js` de l’application WAA.

> Penser à ajouter au début le fichier [`required`](#required) s’il existe, pour qu’il soit chargé aux tout débuts des tests.

***Mais*** si cette constantes n’est pas définie, l’application *WAA* lira les tests du dossier `./js/test/tests` s’il existe.

> Noter qu’on ne met que l’affixe du fichier, pas son extension.
>
> Noter que ces tests seront joués de façon aléatoire.

Par exemple :

~~~javascript
// dans js/test/Test.js

const TEST_FILES = [
    'required'
  , 'app/premier_test'
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

<a name="required"></a>

### Éléments requis (constantes…)

Si le dossier `./js/test/tests` contient un module `required.js`, celui-ci sera chargé tout au début des tests. Il sert à définir des constantes, des méthodes utilitaires, etc.

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
  	// Autre test
  	//
  	// puis on attend quelques secondes avant de passer
  	// au fichier test suivant
  	wait(4).then(next)
	})
})
~~~

Noter qu’on peut avoir des tests plus clair (et plus modulables) en se servant du fait que les méthodes `wait` et `waitFor` retourne des promesses :

~~~javascript
wait(3)
.then( _ => {
  // un test de quelque chose
  //
  // On attend par exemple l'existence d'un élément à l'écran
  return waitFor(existence)
})
.then( _ => {
  // un autre test
  
  return wait(3)
})
.then( _ => {
  // Un autre test
  // Pour utiliser les promesses d'attente, mais sans attendre
  return wait(0)
})
.then( _ => {
  // etc.
})
~~~



## Méthodes d’assertion

Le testeur de *WAA* voulant rester simple, on ne trouve que ces méthodes pour gérer les assertions et comptages d’erreurs et de succès :

### assert

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



### refute

Vérifie une différence :

~~~javascript
[Test.]refute(not_expected, actual[, message d’erreur])
~~~

Par exemple :

~~~javascript
refute(5, 2 + 2, "2 + 2 ne doit pas être égal à 5")
~~~

Sans message d’erreur fourni, le retour serait :

~~~
4 ne devrait pas être égal à 5
~~~

Pour reprendre les valeurs `not_expected` et `actual` dans le message, on utilise `${actual}` et `${not_expected}`. Par exemple :

~~~javascript
assert(4, 2 + 3, "Le  nombre ${actual} ne devrait surtout pas valoir ${not_expected} !")
~~~

### add_success

On peut ajouter un succès grâce à cette méthode

> Noter que les méthodes Test.assert, Test.refute, etc. ajoutent automatiquement des succès et des échecs.

Si un argument est fourni, ce sera le message de victoire produit. Pour le moment, il n’est pas utilisé.

### add_failure

Pour ajouter une erreur.

~~~javascript
add_failure("Cette opération produit une erreur")
~~~

Sans message fourni, le retour serait :

~~~
Une erreur a été produite.
~~~

---

<a name="message"></a>

## Pour les messages

> Il s’agit des messages de notice ou d’erreur, pas des [messages interactifs](#interactive-messages) qui permettent de demander des choses à l’utilisateur.

#### Message.assert_contains(`msg` )

Pour tester que le message `msg` est bien affiché (note : fonctionne par expression régulière insensible à la casse).

#### Message.assert_contains_error(`msg`)

Produit un succès si la page affiche le message d’erreur `err_msg` (note : fonctionne par expression régulière insensible à la casse).

---

<a name="interative-messages"></a>

## Messages interactif

> Il s’agit des messages qui permettent de demander des choses à l’utilisateur (substituts des `prompt` et `confirm` natifs), pas des [messages notices](#message) qui servent simplement à afficher des notifications ou des erreurs.

On obtient l’instance du message interactif voulu par la méthode :

~~~javascript
const iM = IMessage.getWithMessage("Un bout du message affiché")
~~~

On peut s’assurer que ce message existe avec :

~~~javascript
iM.exists // => true s'il a été trouvé
~~~

On peut ensuite cliquer sur son bouton OK ou Cancel par :

~~~javascript
clickOn(iM.btnOK)

// ou 

clickOn(iM.btnCancel)
~~~

Noter que ces deux méthodes produiront une erreur si le message interactif n’existe pas.
