# wasabi-plugin-rack

## Tests de fonctionnement

1. Vérifier que deux plugins qui utilisent chacun leur propre version de React n'affichent pas d'erreur

Depuis le dossier root du projet :

```sh
yarn build
yarn start
```

Afficher la page [http://localhost:5000](http://localhost:5000)

Vérifier que les plugins Pg1 et Pg2 fonctionne et qu'il n'y a pas d'erreur dans la console autre que les warning prop-types.
