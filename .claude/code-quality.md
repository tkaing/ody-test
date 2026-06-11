# Qualité du code

- Solution idiomatique en premier (propre et courante dans l'écosystème)
- Mentionner les librairies connues quand elles font mieux qu'une solution maison
- Pas de valeurs magiques — constantes nommées pour couleurs, espacements, statuts
- Séparation stricte : logique métier ≠ présentation
- Types stricts — pas de `any`, pas de cast non justifié
- Découpage des pages en sous-composants : une page ne fait qu'assembler des sous-composants focalisés (`OrderList`, `OrderDetail`, `CreateOrderModal`…). Un fichier qui dépasse ~150 lignes est un signal de découpage nécessaire.

## Styles React Native

- Tout dans `StyleSheet.create()`, jamais en inline sauf exception justifiée
- Clés descriptives (`selectedButton` pas `button`)
- Séparer styles de layout et styles visuels dans des clés distinctes

## Notes TypeScript

- **Narrowing par condition aliasée (TS 4.4+)** — TypeScript narrow les types à travers une variable `const` booléenne. `const canSubmit = !!type && !!audience` + `if (!canSubmit) return` → TypeScript considère `type` et `audience` comme non-nullables après le `return`. Ne pas signaler ça comme une erreur de typage.

## Notes React Native

- **`fontWeight` en number** — RN 0.85+ accepte `fontWeight: 600` (number) sans erreur. Ne pas signaler ça comme une erreur de typage.
- **State local et cycle de vie des modals** — Un state local dans un composant parent persiste même quand la modal est fermée. Extraire la modal dans son propre composant et le monter conditionnellement (`{isOpen && <MyModal />}`) garantit que son state se réinitialise à chaque ouverture.
