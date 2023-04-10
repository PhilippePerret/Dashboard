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

Le seul impératif pour un test est qu’il appelle la méthode `Test.next()` lorsqu’il a fini son travail.

~~~javascript
Test.next()
~~~

**Sans cet appel, la suite de tests s’interromprait.**

### Exemple simple (séquentiel simple)

Voici l’exemple d’un simple test, uniquement séquentiel, vérifiant les retours de méthodes.

~~~javascript
// dans ./js/test/tests/retour_fonctions.js

Test.assert(6, Math.multiplieParDeux(3))

Test.assert(-4, Math.multiplieParDeux(-2))

Test.assert('string', typeof "Ma chaine de caractère")

// Pour passer au fichier test suivant
Test.next()
~~~

> Rappel : pour fonctionner, ce test a juste besoin qu’on écrive `Test.run()` dans le *ready* de l’application.

### Exemple d’un test asynchrone

