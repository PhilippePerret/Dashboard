# CSVReader

Un lecteur (un peu enregistreur) pour données CSV. **MacOS only**.

## Description

Ce lecteur a été créé pour ne pas avoir toute la lourdeur de Excel *and co.* pour lire des données CSV.

Voir le [Manuel](Manuel/Manuel.md) pour savoir comment formater un fichier CSV à lire (car on peut quand même exploiter toute la puissance des clés étrangères *and co.*.

## Utilisation simple

Jouer la commande :

~~~
> csv-reader
~~~

Cliquer sur le bouton “Ouvrir…” et choisir le fichier CSV à afficher.

Hop ! Les données s'affichent dans la page (avec les clés étrangères).

## Notes sur l'implémentation

C'est une application WAA (*Without Ajax Application*) — donc elle permet un dialogue client<->serveur sans passer par ajax, simplement, des deux côtés, avec des messages de type :

~~~ruby

WAA.send({class:'MaClasse',method:'laMethod',data:{les:data}})

# que ce soit en ruby ou en javascript, l'appel est le même

~~~
