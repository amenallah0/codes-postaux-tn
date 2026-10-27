# Codes postaux Tunisie · الرموز البريدية التونسية

Application web bilingue (français / arabe) pour rechercher les codes postaux tunisiens par **gouvernorat**, **ville / délégation** et **imada**.

## Fonctionnalités

- Filtres en cascade : gouvernorat → ville → imada
- Affichage du code postal avec libellés FR et AR
- Recherche texte (noms FR/AR ou code postal)
- Liste filtrable (jusqu’à 400 lignes affichées)

## Lancer l’application

Aucune dépendance ni build : ouvrez simplement `index.html` dans un navigateur, ou servez le dossier en local :

```bash
# Exemple avec Python
python -m http.server 8080
```

Puis ouvrez [http://localhost:8080](http://localhost:8080).

## Structure du projet

| Fichier         | Rôle                                      |
|-----------------|-------------------------------------------|
| `index.html`    | Interface                                 |
| `style.css`     | Styles                                    |
| `app.js`        | Logique de filtres et d’affichage         |
| `data.js`       | Données chargées par l’app (`const DATA`) |
| `codes_ar.csv`  | Source des données (CSV UTF-8)            |

## Format des données (`codes_ar.csv`)

Colonnes (sans en-tête) :

```text
govFr,villeFr,imadaFr,cp,govAr,villeAr,imadaAr[,note]
```

Exemple :

```text
MONASTIR,MOKNINE,AMIRAT EL FEHOUL,5053,المنستير,المكنين,عميرة الفحول,رسمي
```

Le fichier est encodé en **UTF-8** (BOM éventuel).

## Mettre à jour les données

L’interface lit **`data.js`**, pas le CSV directement. Après modification de `codes_ar.csv`, régénérez `data.js` :

```bash
node -e "const fs=require('fs');const csv=fs.readFileSync('codes_ar.csv','utf8').replace(/^\uFEFF/,'');const DATA=csv.trim().split(/\r?\n/).map(l=>{const p=l.split(',');return{govFr:p[0],villeFr:p[1],imadaFr:p[2],cp:p[3],govAr:p[4],villeAr:p[5],imadaAr:p[6]};});fs.writeFileSync('data.js','const DATA = '+JSON.stringify(DATA)+';\n','utf8');console.log(DATA.length+' lignes');"
```

Puis rechargez la page (Ctrl+F5).

## Licence

Données et interface destinées à un usage informatif. Vérifiez les sources officielles (La Poste Tunisienne) pour un usage critique.
