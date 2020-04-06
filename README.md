# webaudioplugin

## Installation

```sh
yarn install
```

Dans le dossier `public/` du package `container`, il doit y avoir 3 liens symboliques vers les dossiers `dist/`
des package `pg1`, `pg2`, `rack`. Le projet ne fonctionnera pas sur un système qui ne supporte pas les liens symboliques.
Il s'agit d'un test, ce fonctionnement n'est pas définitif !

## Packages 

- `container`: la page Web "classique" qui affiche les plugins
- `pg1`: un plugin (non audio) écrit avec la dernière version de React
- `pg2`: un plugin (non audio) écrit avec une version ancienne de React.  
`pg1` et `pg2` servent à tester qu'il n'y pas de contre-indication à importer deux plugins avec leur propre version de React.
- `rack`: un plugin audio qui permet de tester qu'on arrive à récupérer un WebAudioPlugin depuis un composant React

## Tests de fonctionnement

1. Vérifier que deux plugins qui utilisent chacun leur propre version de React n'affichent pas d'erreur

Depuis le dossier root du projet :

```sh
yarn build
yarn start
```

Afficher la page [http://localhost:5000](http://localhost:5000)

Vérifier que les plugins Pg1 et Pg2 fonctionne et qu'il n'y a pas d'erreur dans la console autre que les warning prop-types.
