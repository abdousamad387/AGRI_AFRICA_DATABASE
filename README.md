# AFRICA AGRI DATABASE — Observatoire Analytique de l'Agriculture Africaine (2000–2024)

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Recharts-2.x-FF6384?logo=chart.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white" />
  <img src="https://img.shields.io/badge/Data-20%2C000%2B%20obs-4CAF50" />
  <img src="https://img.shields.io/badge/Countries-51-FFD600" />
  <img src="https://img.shields.io/badge/License-MIT-blue" />
</p>

> **Plateforme d'intelligence analytique** intégrant **14 dimensions thématiques**, **200+ variables** et **20 000+ observations** couvrant **51 pays africains** sur **25 ans** (2000–2024). Le système combine analyses statistiques descriptives, matrices de corrélation, indices composites normalisés et cartographie WebGIS interactive pour fournir un diagnostic multidimensionnel de la transformation agricole africaine.

🔗 **Application en ligne** : [https://abdousamad387.github.io/AGRI_AFRICA_DATABASE/](https://abdousamad387.github.io/AGRI_AFRICA_DATABASE/)

---

## Table des Matières

1. [Contexte Scientifique](#1-contexte-scientifique)
2. [Architecture des Données](#2-architecture-des-données)
3. [Pipeline ETL](#3-pipeline-etl)
4. [Cadre Méthodologique](#4-cadre-méthodologique)
5. [Dimensions Thématiques](#5-dimensions-thématiques)
6. [Indices Composites et Scoring](#6-indices-composites-et-scoring)
7. [Analyses Statistiques Avancées](#7-analyses-statistiques-avancées)
8. [Module WebGIS — Cartographie Choroplèthe](#8-module-webgis--cartographie-choroplèthe)
9. [Benchmark Afrique vs Monde](#9-benchmark-afrique-vs-monde)
10. [Architecture Technique](#10-architecture-technique)
11. [Résultats Clés](#11-résultats-clés)
12. [Alignement ODD](#12-alignement-odd)
13. [Sources de Données](#13-sources-de-données)
14. [Structure du Répertoire](#14-structure-du-répertoire)
15. [Installation et Déploiement](#15-installation-et-déploiement)
16. [Références Bibliographiques](#16-références-bibliographiques)

---

## 1. Contexte Scientifique

L'agriculture africaine constitue le socle socio-économique du continent, employant **54 % de la population active** et contribuant à **15–25 % du PIB** dans la majorité des économies subsahariennes (Banque Mondiale, 2023). Malgré cette centralité, le secteur fait face à un **paradoxe structurel** : le continent détient **60 % des terres arables non exploitées** de la planète, mais enregistre des rendements céréaliers de **1,95 t/ha** — soit **45 % en-dessous** de la moyenne mondiale de 3,58 t/ha (FAO, 2024).

Ce diagnostic multidimensionnel se fonde sur trois constats analytiques :

1. **Fracture de productivité** : L'utilisation d'engrais en Afrique (18 kg/ha) représente seulement **13 %** de la moyenne mondiale (135 kg/ha), avec un taux de mécanisation **13 fois inférieur** à l'Asie (IFPRI, 2023).

2. **Vulnérabilité climatique** : Les anomalies pluviométriques et l'augmentation du stress hydrique affectent directement les indices de végétation (NDVI), avec des corrélations significatives entre sécheresses et insécurité alimentaire (r > 0.65).

3. **Transformation silencieuse** : L'adoption du mobile farming (+45 % en 2024) et l'inclusion financière rurale via mobile money constituent des vecteurs de transformation souvent sous-documentés dans les analyses agrégées conventionnelles.

La plateforme **Africa Agri Database** répond à cette lacune en proposant un cadre analytique intégré, croisant données de production, indicateurs climatiques, métriques commerciales, scores composites et dimensions sociales dans un tableau de bord interactif bilingue (FR/EN).

---

## 2. Architecture des Données

### 2.1 Matrice Dimensionnelle

Le système de données est structuré autour de **14 fichiers JSON** dérivés d'un classeur Excel maître multi-feuilles. Chaque observation est indexée par le triplet `(Année, Pays, Région)`.

| # | Dimension | Observations | Variables | Contenu Principal |
|---|-----------|:------------:|:---------:|-------------------|
| 1 | **Production Agricole** | 1 275 | 24 | PIB agricole, rendements céréaliers, FPI, élevage, mécanisation |
| 2 | **Comparatif Mondial** | 1 525 | 19 | Afrique vs Chine, Inde, USA, Brésil, France, Russie, Australie, Pays-Bas |
| 3 | **Climat & Ressources** | 1 275 | 21 | Pluviométrie CHIRPS, NDVI, sécheresse, anomalies thermiques, CO₂ |
| 4 | **Commerce Agricole** | 1 275 | 20 | Exports/imports, balance commerciale, prix internationaux |
| 5 | **Sécurité Alimentaire** | 1 275 | 21 | FSI, sous-nutrition, stunting, apport calorique, ODD2 |
| 6 | **Foncier & Ressources** | 1 275 | 20 | Terres arables, irrigation, dégradation, accaparement, genre foncier |
| 7 | **Finance Agricole** | 1 275 | 21 | Crédit, budget CAADP, taux d'intérêt, assurance, FDI, inclusion financière |
| 8 | **Technologie & Innovation** | 1 275 | 23 | Tracteurs, engrais, mobile farming, semences, R&D, électricité rurale |
| 9 | **Aspects Sociaux** | 1 275 | 20 | Main d'œuvre, femmes, jeunes, revenus, pauvreté rurale, emploi formel |
| 10 | **Durabilité** | 1 275 | 20 | Pertes post-récolte, agroécologie, émissions N₂O/CH₄, certification bio |
| 11 | **Indices & Scores** | 1 275 | 18 | Compétitivité, mécanisation, CAADP/Malabo, résilience, inclusion |
| 12 | **Statistiques Descriptives** | — | dynamique | Moyennes, écarts-types, min, max, quartiles |
| 13 | **Corrélations** | — | matrice | Matrice de corrélation de Pearson inter-variables |
| 14 | **Métadonnées** | — | — | Documentation des sources et unités |

### 2.2 Couverture Géographique

**51 pays africains** répartis en **5 sous-régions** selon la classification de l'Union Africaine :

| Sous-région | Pays (échantillon) | Code couleur |
|-------------|-------------------|:------------:|
| **Afrique du Nord** | Algérie, Égypte, Libye, Maroc, Tunisie | `#1E88E5` |
| **Afrique Occidentale** | Sénégal, Nigeria, Ghana, Côte d'Ivoire, Mali, Niger | `#4CAF50` |
| **Afrique Centrale** | Cameroun, RD Congo, Gabon, Congo, Tchad | `#FB8C00` |
| **Afrique Orientale** | Kenya, Éthiopie, Tanzanie, Rwanda, Ouganda | `#E53935` |
| **Afrique Australe** | Afrique du Sud, Mozambique, Zimbabwe, Zambie | `#8E24AA` |

### 2.3 Couverture Temporelle

- **Période** : 2000–2024 (25 années consécutives)
- **Granularité** : Annuelle
- **Résolution** : Pays × Année (panel data)

---

## 3. Pipeline ETL

### 3.1 Extraction et Transformation

Le pipeline de données utilise un script Python (`convert_data.py`) qui extrait les données depuis un classeur Excel multi-feuilles et génère des fichiers JSON optimisés pour le frontend :

```python
# Pipeline: Excel → JSON (14 datasets)
wb = openpyxl.load_workbook('AfricaAgri_Database_2000_2024.xlsx', data_only=True)

# Mapping intelligent des onglets
sheet_map = {}
for sn in wb.sheetnames:
    if 'Production' in sn: sheet_map[sn] = 'production'
    elif 'Comparatif' in sn: sheet_map[sn] = 'comparatif'
    elif 'Climat' in sn: sheet_map[sn] = 'climat'
    # ... 11 autres dimensions

# Extraction: headers en ligne 2, données à partir de ligne 3
for sn, fname in sheet_map.items():
    headers = [str(c.value) for c in ws[2]]
    for row in ws.iter_rows(min_row=3, values_only=True):
        # Arrondi des flottants à 4 décimales
        if isinstance(val, float): rd[key] = round(val, 4)
```

### 3.2 Schéma de Données Commun

Tous les fichiers JSON thématiques partagent un schéma pivot :

```typescript
interface AgriRecord {
  Année: number        // 2000–2024
  Pays: string         // Nom du pays (FR)
  Région: string       // Sous-région UA
  [indicator: string]: number | string  // Variables thématiques
}
```

### 3.3 Système de Cache Client

Le hook `useData()` implémente un **cache en mémoire singleton** pour éviter les requêtes HTTP redondantes :

```typescript
const cache: Record<string, any[]> = {}

export function useData<T>(file: string): { data: T[]; loading: boolean } {
  // Si le fichier est en cache, retour immédiat (0 ms)
  if (cache[file]) return { data: cache[file], loading: false }
  // Sinon, fetch unique depuis /data/{file}.json
  fetch(`${BASE_URL}data/${file}.json`)
    .then(d => { cache[file] = d })
}
```

---

## 4. Cadre Méthodologique

### 4.1 Fonctions d'Agrégation

Le système implémente **4 fonctions d'agrégation** fondamentales appliquées uniformément à travers les 14 dimensions :

#### Moyenne arithmétique par année (taux et indices)

$$\bar{x}_t = \frac{1}{n_t} \sum_{i=1}^{n_t} x_{i,t}$$

où $n_t$ est le nombre de pays avec données valides pour l'année $t$, et $x_{i,t}$ la valeur de l'indicateur pour le pays $i$ à l'année $t$.

#### Somme par année (volumes et totaux)

$$S_t = \sum_{i=1}^{n_t} x_{i,t}$$

Utilisée pour les grandeurs extensives : production céréalière (Mt), exports/imports ($Mrd), terres arables (Mha), personnes sous-nourries (M).

#### Moyenne régionale (benchmarking spatial)

$$\bar{x}_{r,t} = \frac{1}{n_{r,t}} \sum_{i \in r} x_{i,t}$$

où $r \in \{$Nord, Ouest, Centre, Est, Australe$\}$ et $n_{r,t}$ le nombre de pays dans la région $r$ à l'année $t$.

#### Top-N (classement national)

$$\text{Top}_N(t) = \text{sort}_{desc}\left(\{x_{i,t}\}_{i=1}^{n_t}\right)[1:N]$$

Retourne les $N$ pays avec les valeurs les plus élevées pour un indicateur donné à l'année $t$. Utilisé systématiquement avec $N = 10$.

### 4.2 Précision Numérique

Tous les résultats d'agrégation sont arrondis selon la formule :

$$\hat{x} = \frac{\lfloor x \cdot 10^p + 0.5 \rfloor}{10^p}$$

avec $p = 2$ pour les agrégations standard, $p = 1$ pour les KPI, $p = 4$ pour les données brutes.

---

## 5. Dimensions Thématiques

### 5.1 Production Agricole

**Objectif** : Quantifier la dynamique productive du secteur agricole africain à travers les rendements, volumes et indices de production.

| Indicateur | Unité | Type d'agrégation | Visualisation |
|------------|:-----:|:-----------------:|:-------------:|
| Rendement céréales | t/ha | Moyenne | AreaChart |
| Production céréales | Mt | Somme | BarChart Top-10 |
| Indice prod. alimentaire | 2000=100 | Moyenne | LineChart |
| Engrais | kg/ha | Moyenne | KPI |
| Production racines/tubercules | Mt | Somme | AreaChart multi |
| Production cultures de rente | Mt | Somme | AreaChart multi |
| Production viande | kt | Somme | LineChart multi |
| Production lait | kt | Somme | LineChart multi |
| Production poisson | kt | Somme | LineChart multi |

**Indice de Production Alimentaire (FPI)** — Base 100 en 2000 :

$$FPI_t = \frac{\sum_{c} q_{c,t} \cdot p_{c,\text{ref}}}{\sum_{c} q_{c,\text{2000}} \cdot p_{c,\text{ref}}} \times 100$$

où $q_{c,t}$ est la quantité produite de la culture $c$ à l'année $t$ et $p_{c,\text{ref}}$ le prix de référence international (méthode Laspeyres, FAO).

### 5.2 Climat & Ressources Naturelles

**Objectif** : Monitorer les variables climatiques et environnementales impactant la productivité agricole.

| Indicateur | Unité | Domaine | Source |
|------------|:-----:|:-------:|--------|
| Pluviométrie | mm/an | [0, 2500] | CHIRPS |
| Stress hydrique | % | [0, 100] | FAO AQUASTAT |
| Indice sécheresse | 0–10 | [0, 10] | Composite |
| NDVI végétation | 0–1 | [0, 1] | MODIS |
| Anomalie pluviométrique | % | [-100, +100] | CHIRPS |
| Anomalie température | °C | [-2, +3] | ERA5 |
| Émissions CO₂ agricoles | MtCO₂eq | [0, ∞] | EDGAR |
| Déforestation | 000 ha/an | [0, ∞] | FAO FRA |

**Anomalie pluviométrique standardisée** :

$$A_t = \frac{P_t - \bar{P}_{\text{ref}}}{\bar{P}_{\text{ref}}} \times 100$$

où $P_t$ est la pluviométrie de l'année $t$ et $\bar{P}_{\text{ref}}$ la moyenne de référence climatologique (1981–2010).

**Indice de Végétation par Différence Normalisée (NDVI)** :

$$NDVI = \frac{\rho_{NIR} - \rho_{Red}}{\rho_{NIR} + \rho_{Red}}$$

où $\rho_{NIR}$ est la réflectance dans le proche infrarouge et $\rho_{Red}$ dans le rouge visible (Tucker, 1979).

### 5.3 Commerce Agricole

**Objectif** : Analyser les flux commerciaux agricoles, la dépendance aux importations alimentaires et la volatilité des prix internationaux.

| Indicateur | Unité | Agrégation |
|------------|:-----:|:----------:|
| Exports agricoles | $Mrd | Somme |
| Imports agricoles | $Mrd | Somme |
| Balance commerciale | $Mrd | Somme |
| Dépendance alimentaire | % | Moyenne |
| Prix blé international | $/t | Valeur directe |
| Prix maïs international | $/t | Valeur directe |
| Prix riz international | $/t | Valeur directe |
| Prix café international | $/t | Valeur directe |
| Prix cacao international | $/t | Valeur directe |

**Balance commerciale agricole** :

$$B_t = \sum_{i=1}^{N} \left( X_{i,t} - M_{i,t} \right)$$

où $X_{i,t}$ sont les exportations et $M_{i,t}$ les importations du pays $i$ à l'année $t$.

**Taux de dépendance alimentaire** :

$$D_{i,t} = \frac{M_{i,t}^{\text{alim}}}{C_{i,t}^{\text{alim}}} \times 100$$

où $M_{i,t}^{\text{alim}}$ sont les importations alimentaires et $C_{i,t}^{\text{alim}}$ la consommation alimentaire totale.

### 5.4 Sécurité Alimentaire

**Objectif** : Évaluer la prévalence de l'insécurité alimentaire à travers des indicateurs multidimensionnels alignés sur l'ODD 2 (Faim Zéro).

| Indicateur | Unité | Domaine | Interprétation |
|------------|:-----:|:-------:|----------------|
| Score sécurité alimentaire (FSI) | 0–100 | [0, 100] | 100 = sécurité totale |
| Sous-nutrition | % | [0, 100] | Prévalence population |
| Personnes sous-nourries | M | [0, ∞] | Volume absolu |
| Retard de croissance <5 ans | % | [0, 100] | Stunting (OMS) |
| Apport calorique | kcal/hab/j | [1500, 3500] | Seuil OMS : 2 100 |
| Score ODD2 | 0–10 | [0, 10] | Progression Faim Zéro |

**Score de Sécurité Alimentaire (FSI)** — Indice composite multi-piliers :

$$FSI = w_1 \cdot \text{Disponibilité} + w_2 \cdot \text{Accès} + w_3 \cdot \text{Utilisation} + w_4 \cdot \text{Stabilité}$$

basé sur le cadre conceptuel de la FAO (2013) avec les quatre piliers de la sécurité alimentaire, où $\sum w_i = 1$.

### 5.5 Foncier & Ressources

**Objectif** : Caractériser la base foncière agricole, l'intensification par irrigation, la dégradation des sols et les dynamiques d'accaparement.

| Indicateur | Unité | Agrégation |
|------------|:-----:|:----------:|
| Terres arables totales | Mha | Somme |
| Terres irriguées | Mha | Somme |
| Taux d'irrigation | % arables | Moyenne |
| Terres dégradées | % surface agri | Moyenne |
| Accaparement foncier étranger | Mha | Somme |
| Femmes propriétaires foncier | % | Moyenne |

**Taux de dégradation des terres** (Land Degradation Neutrality — LDN, UNCCD 2015) :

$$LDN_t = \frac{S_{deg,t}}{S_{agri,t}} \times 100$$

### 5.6 Finance Agricole

**Objectif** : Mesurer l'écosystème de financement agricole, incluant le crédit, les budgets publics, et l'inclusion financière.

| Indicateur | Unité | Benchmark |
|------------|:-----:|:---------:|
| Crédit agricole | % PIB agri | — |
| Budget agri public | % budget national | **CAADP : 10 %** |
| Taux d'intérêt prêts agri | % | — |
| Assurance récolte | % agriculteurs | — |
| Inclusion financière rurale | % | — |
| FDI secteur agricole | $M | — |

**Engagement de Maputo/Malabo** (CAADP) :

$$\text{Conformité CAADP} = \begin{cases} \text{Conforme} & \text{si } B_{agri} \geq 10\% \cdot B_{total} \\ \text{Non conforme} & \text{sinon} \end{cases}$$

La plateforme matérialise cette cible par une **ligne de référence horizontale à 10 %** sur le graphique d'évolution budgétaire (rouge, pointillée).

### 5.7 Technologie & Innovation

**Objectif** : Quantifier le niveau de modernisation technologique du secteur agricole et identifier les vecteurs de transformation.

| Indicateur | Unité | Benchmark mondial |
|------------|:-----:|:-----------------:|
| Tracteurs | /1000 ha | 19 (monde) |
| Engrais chimiques | kg/ha | 135 (monde) |
| Mobile farming adoption | % | — |
| Semences améliorées | % utilisation | — |
| R&D agricole | % PIB | 1 % (objectif UA) |
| Électricité rurale | % accès | — |
| Score innovation | 0–10 | — |

**Écart technologique Afrique–Monde** :

$$\Delta_{tech} = \frac{x_{Afrique} - x_{Monde}}{x_{Monde}} \times 100$$

### 5.8 Aspects Sociaux

**Objectif** : Analyser les dimensions humaines de l'agriculture africaine — emploi, genre, revenus, démographie.

| Indicateur | Unité |
|------------|:-----:|
| Main d'œuvre agricole | % population active |
| Femmes en agriculture | % |
| Jeunes agriculteurs <35 ans | % |
| Revenu mensuel agricole moyen | $/mois |
| Pauvreté rurale | % |
| Emplois agricoles formels | % |
| Score genre agriculture | 0–10 |

### 5.9 Durabilité

**Objectif** : Évaluer la soutenabilité environnementale du secteur agricole à travers les pertes, émissions et pratiques agroécologiques.

| Indicateur | Unité | Domaine |
|------------|:-----:|:-------:|
| Pertes post-récolte | % | [0, 50] |
| Score agroécologie | 0–10 | [0, 10] |
| Score durabilité globale | 0–10 | [0, 10] |
| Score adaptation climatique | 0–10 | [0, 10] |
| Objectifs Malabo 2025 | % progression | [0, 100] |
| Certification biologique | % terres | [0, 100] |
| Émissions N₂O agricoles | kt | [0, ∞] |
| Émissions méthane agricoles | kt | [0, ∞] |

**Émissions de Gaz à Effet de Serre (GES) agricoles** :

$$E_{GES} = E_{N_2O} \cdot GWP_{N_2O} + E_{CH_4} \cdot GWP_{CH_4}$$

avec $GWP_{N_2O} = 265$ et $GWP_{CH_4} = 28$ (AR5, GIEC 2014).

---

## 6. Indices Composites et Scoring

### 6.1 Indice de Compétitivité Agricole (ICA)

Indice synthétique sur échelle [0–100] intégrant productivité, technologie et commerce :

$$ICA = \sum_{j=1}^{k} w_j \cdot \frac{x_j - x_{j,\min}}{x_{j,\max} - x_{j,\min}} \times 100$$

où $x_j$ est la valeur brute du sous-indicateur $j$, et la normalisation min-max ramène chaque composante à l'intervalle [0, 1].

### 6.2 Indice de Mécanisation (IM)

Échelle [0–100] combinant densité de tracteurs, utilisation d'engrais, pourcentage de semences améliorées et accès à l'électricité rurale.

### 6.3 Indice CAADP/Malabo

Progression vers les 7 engagements de la Déclaration de Malabo (2014) :

| Engagement | Cible |
|------------|-------|
| Investissement public agricole | ≥ 10 % budget national |
| Croissance PIB agricole | ≥ 6 %/an |
| Éradication de la faim | FSI → 100 |
| Réduction de la pauvreté | -50 % pauvreté rurale |
| Commerce intra-africain | Tripler le commerce |
| Résilience | Score adaptation ≥ 8/10 |
| Responsabilité mutuelle | Mécanisme de suivi |

### 6.4 Indice de Résilience Agricole (IRA)

Échelle [0–10], rescalée à [0–100] pour la comparaison inter-indices :

$$IRA_{norm} = IRA_{0\text{-}10} \times 10$$

### 6.5 Profil Comparatif Normalisé (Radar)

Pour le graphique radar multi-axes, chaque indicateur est normalisé par rapport au maximum observé :

$$x_{j,norm} = \frac{x_j}{\max(x_{j,\text{all}})} \times 100$$

Cette normalisation permet de comparer des indicateurs d'échelles hétérogènes (rendement t/ha, engrais kg/ha, irrigation %, tracteurs/1000 ha) sur un même radar [0–100].

---

## 7. Analyses Statistiques Avancées

### 7.1 Statistiques Descriptives

Le module **Analyses Avancées** fournit un tableau de synthèse avec les mesures de tendance centrale et de dispersion :

| Mesure | Formule |
|--------|---------|
| Moyenne | $\bar{x} = \frac{1}{n}\sum x_i$ |
| Écart-type | $\sigma = \sqrt{\frac{1}{n-1}\sum(x_i - \bar{x})^2}$ |
| Minimum | $x_{\min} = \min(x_1, \ldots, x_n)$ |
| Maximum | $x_{\max} = \max(x_1, \ldots, x_n)$ |
| 1er Quartile | $Q_1 = P_{25}$ |
| Médiane | $Q_2 = P_{50}$ |
| 3e Quartile | $Q_3 = P_{75}$ |

### 7.2 Matrice de Corrélation de Pearson

La corrélation linéaire entre deux variables $X$ et $Y$ est calculée selon le coefficient de Pearson :

$$r_{XY} = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2 \cdot \sum_{i=1}^{n}(y_i - \bar{y})^2}}$$

**Propriétés** :
- $r \in [-1, +1]$
- $|r| > 0.7$ → corrélation forte (affichage en gras dans la heatmap)
- $r > 0$ → fond vert avec opacité $\alpha = |r| \times 0.6$
- $r < 0$ → fond rouge avec opacité $\alpha = |r| \times 0.6$

### 7.3 Heatmap de Corrélation

La visualisation utilise un code couleur bidirectionnel :

$$\text{couleur}(r) = \begin{cases} \text{rgba}(76, 175, 80, |r| \times 0.6) & \text{si } r \geq 0 \text{ (vert)} \\ \text{rgba}(239, 83, 80, |r| \times 0.6) & \text{si } r < 0 \text{ (rouge)} \end{cases}$$

### 7.4 Extraction des Top-K Corrélations

L'algorithme extrait les $K = 15$ paires de variables les plus fortement corrélées :

1. Parcours de la matrice triangulaire supérieure (exclusion diagonale et doublons)
2. Dédoublonnage par clé triée : $\text{key} = \text{sort}(var_i, var_j)$
3. Tri par $|r|$ décroissant
4. Sélection des 15 premières paires
5. Visualisation en `BarChart` horizontal, domaine $[-1, +1]$, vert positif / rouge négatif

---

## 8. Module WebGIS — Cartographie Choroplèthe

### 8.1 Architecture Cartographique

Le module WebGIS implémente une **carte choroplèthe interactive** basée sur React-Leaflet :

| Paramètre | Valeur |
|-----------|--------|
| **Centre** | [2°N, 20°E] (Afrique équatoriale) |
| **Zoom** | 3 (min: 2, max: 8) |
| **Fond de carte** | CARTO Dark Matter |
| **Projection** | EPSG:3857 (Web Mercator) |
| **Géométries** | GeoJSON polygones (51 pays) |
| **Indicateurs** | 12 variables sélectionnables |

### 8.2 Indicateurs Cartographiables

| Indicateur | Unité |
|------------|:-----:|
| Production céréales | Mt |
| Rendement céréales | t/ha |
| PIB agricole | $Mrd |
| PIB agri / PIB total | % |
| Production viande | kt |
| Production lait | kt |
| Engrais | kg/ha |
| Terres arables | Mha |
| Tracteurs | /1000 ha |
| Indice prod. alimentaire | 2000=100 |
| Pertes pré-récolte | % |
| Score mécanisation | 0–10 |

### 8.3 Échelle de Couleurs Séquentielle

Le système utilise une échelle de **9 niveaux de vert** avec normalisation min-max :

$$\text{ratio} = \frac{v - v_{\min}}{v_{\max} - v_{\min}}$$

$$\text{idx} = \min\left(\lfloor \text{ratio} \times 9 \rfloor, 8\right)$$

| Niveau | Code Hex | Interprétation |
|:------:|:--------:|----------------|
| 9 (max) | `#064e3b` | Valeur maximale (vert très foncé) |
| 8 | `#065f46` | Très élevé |
| 7 | `#047857` | Élevé |
| 6 | `#059669` | Modérément élevé |
| 5 | `#10b981` | Moyen |
| 4 | `#34d399` | Modérément bas |
| 3 | `#6ee7b7` | Bas |
| 2 | `#a7f3d0` | Très bas |
| 1 (min) | `#d1fae5` | Valeur minimale (vert très clair) |
| — | `#1e293b` | Pas de données (opacité 0.3) |

L'échelle est **inversée** : les valeurs élevées correspondent aux teintes foncées (principe cartographique de Brewer, 2003).

### 8.4 Jointure Attributaire

La correspondance entre les noms de pays français (données) et les noms anglais (GeoJSON) est assurée par un dictionnaire de **51 entrées** :

```typescript
const NAME_MAP: Record<string, string> = {
  'Algérie': 'Algeria',
  'Cameroun': 'Cameroon',
  'RD Congo': 'Dem. Rep. Congo',
  'Côte d\'Ivoire': "Côte d'Ivoire",
  'Soudan du Sud': 'S. Sudan',
  // ... 46 autres correspondances
}
```

### 8.5 Interactivité

- **Survol** : Mise en surbrillance du polygone (bordure verte, épaisseur 3)
- **Clic** : Popup avec nom du pays, valeur de l'indicateur et année
- **Re-rendu** : Clé composite `${indicator}-${year}-${lang}` forçant le rechargement complet du GeoJSON

---

## 9. Benchmark Afrique vs Monde

### 9.1 Méthodologie Comparative

Le module **Comparatif Mondial** confronte les moyennes africaines aux performances de 8 pays de référence : Chine, Inde, USA, France, Brésil, Russie, Australie, Pays-Bas.

**Calcul de la moyenne africaine** :

$$\bar{x}_{AF,t} = \frac{1}{n_{AF}} \sum_{i \in \text{Afrique}} x_{i,t}$$

**Calcul de l'écart (gap)** :

$$\Delta(\%) = \left(\frac{\bar{x}_{AF}}{\bar{x}_{Monde}} - 1\right) \times 100$$

### 9.2 Tableau des Écarts Structurels

| Indicateur | Afrique | Monde | Écart |
|------------|:-------:|:-----:|:-----:|
| Rendement céréales | 1.95 t/ha | 3.58 t/ha | **-45 %** |
| Engrais | 18 kg/ha | 135 kg/ha | **-87 %** |
| Irrigation | 4 % | 34 % | **-88 %** |
| Tracteurs | 1.5 /1000 ha | 19 /1000 ha | **-92 %** |
| Sous-nutrition | 19.7 % | 8.9 % | **+121 %** |

### 9.3 Normalisation Radar

Pour le profil radar comparatif :

$$x_{j,\text{norm}} = \frac{x_j}{\max_{k \in \{\text{AF, pays}\}}(x_{j,k})} \times 100$$

Chaque axe du radar est normalisé indépendamment par le maximum observé parmi l'Afrique et les pays comparateurs, permettant une lecture directe en pourcentage du meilleur performer.

---

## 10. Architecture Technique

### 10.1 Stack Technologique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Runtime** | React 18 + TypeScript 5 | SPA réactive avec typage statique |
| **Build** | Vite 5 | HMR, tree-shaking, code-splitting |
| **Visualisation** | Recharts 2.x | 6 types de graphiques (Line, Area, Bar, Radar, Scatter, Composed) |
| **Cartographie** | React-Leaflet + Leaflet | Carte interactive choroplèthe |
| **Internationalisation** | Context API (i18n.tsx) | Bilingue FR/EN, 250+ clés |
| **Icônes** | Bootstrap Icons | 14 icônes de navigation |
| **Déploiement** | GitHub Actions + Pages | CI/CD automatisé |
| **ETL** | Python (openpyxl) | Excel → JSON pipeline |

### 10.2 Architecture des Composants

```
App.tsx
├── LanguageProvider (Context i18n)
├── Sidebar (navigation 14 pages)
├── ChartExporter (export PNG/SVG)
└── PageComponent (routage dynamique)
    ├── Filters (région, pays, plage d'années)
    ├── KPICard[] (indicateurs synthétiques)
    └── Charts[] (Recharts + Leaflet)
```

### 10.3 Types de Visualisation

| Type | Composant Recharts | Usage |
|------|-------------------|-------|
| **Courbe de tendance** | `AreaChart` + gradient | Évolutions temporelles continues |
| **Ligne multi-séries** | `LineChart` + Legend | Comparaisons multi-indicateurs |
| **Barres horizontales** | `BarChart` layout=vertical | Classements régionaux |
| **Barres groupées** | `BarChart` multi-Bar | Exports vs Imports |
| **Radar** | `RadarChart` | Profils comparatifs normalisés |
| **Choroplèthe** | `GeoJSON` + React-Leaflet | Distribution spatiale |

### 10.4 Système de Filtrage

Chaque page thématique intègre un système de filtrage tri-dimensionnel :

- **Région** : 5 sous-régions UA + "All" (agrégation complète)
- **Pays** : 51 pays (filtré dynamiquement selon la région)
- **Plage temporelle** : `[yearStart, yearEnd]` ∈ [2000, 2024]

Les filtres sont chaînés : `Région → Pays → Année` avec cascade automatique.

---

## 11. Résultats Clés

### 11.1 Indicateurs de Production (2024)

| Métrique | Valeur | Tendance 2000–2024 |
|----------|:------:|:------------------:|
| Rendement céréalier moyen | **1.95 t/ha** | +32 % |
| Production céréales totale | **4 273 Mt** | +49 % |
| Indice prod. alimentaire | **149** (base 2000) | +49 pts |
| Utilisation engrais | **18 kg/ha** | stagnation |

### 11.2 Sécurité Alimentaire (2024)

| Métrique | Valeur | Interprétation |
|----------|:------:|----------------|
| Score FSI moyen | **79.4/100** | Stagnation depuis 2015 |
| Sous-nutrition | **19.7 %** | 1 adulte sur 5 |
| Personnes sous-nourries | **257 M** | Volume en hausse |
| Stunting enfants <5 ans | **32 %** | Malnutrition chronique |
| Apport calorique | **2 050 kcal/j** | < seuil OMS 2 100 |

### 11.3 Commerce (2024)

| Métrique | Valeur |
|----------|:------:|
| Exports agricoles | **85 $Mrd** |
| Imports agricoles | **123 $Mrd** |
| Balance commerciale | **-38 $Mrd** |
| Dépendance alimentaire | **35 %** |

### 11.4 Technologie (2024)

| Métrique | Afrique | Monde | Ratio |
|----------|:-------:|:-----:|:-----:|
| Tracteurs/1000 ha | 1.5 | 19 | ×0.08 |
| Engrais kg/ha | 18 | 135 | ×0.13 |
| Mobile farming | 45 % | — | Révolution |
| Semences améliorées | 25 % | — | Progrès |
| R&D agricole | 0.38 % PIB | 1 % | ×0.38 |

---

## 12. Alignement ODD

| ODD | Cible | Dimension couverte |
|:---:|-------|-------------------|
| **ODD 1** | Éradication pauvreté | Pauvreté rurale, revenus agricoles |
| **ODD 2** | Faim zéro | FSI, sous-nutrition, stunting, ODD2 score |
| **ODD 5** | Égalité des genres | Femmes agriculture, propriété foncière, score genre |
| **ODD 8** | Travail décent | Emploi agri, emploi formel, revenus |
| **ODD 9** | Innovation | Mécanisation, R&D, AgriTech |
| **ODD 12** | Consommation responsable | Pertes post-récolte, agroécologie, bio |
| **ODD 13** | Action climatique | Anomalies, NDVI, adaptation, émissions GES |
| **ODD 15** | Vie terrestre | Déforestation, dégradation sols, LDN |

---

## 13. Sources de Données

| # | Source | Organisation | Variables principales |
|:-:|--------|-------------|---------------------|
| 1 | **FAOSTAT** | FAO | Production, rendements, FPI, commerce, terres |
| 2 | **IFPRI** | Int. Food Policy Research Institute | Indices composites, compétitivité |
| 3 | **World Bank** | Banque Mondiale | PIB, indicateurs macro-économiques |
| 4 | **IFAD** | Fonds Int. Développement Agricole | Finance rurale, inclusion |
| 5 | **CHIRPS** | UCSB/USGS | Pluviométrie haute résolution |
| 6 | **MODIS** | NASA | NDVI végétation |
| 7 | **ERA5** | ECMWF/Copernicus | Anomalies températures |
| 8 | **EDGAR** | EU JRC | Émissions GES sectorielles |
| 9 | **AQUASTAT** | FAO | Stress hydrique, irrigation |

---

## 14. Structure du Répertoire

```
AGRI_AFRICA_DATABASE/
├── .github/
│   └── workflows/           # CI/CD GitHub Actions
├── dashboard/
│   ├── public/
│   │   └── data/            # 14 fichiers JSON thématiques
│   │       ├── production.json
│   │       ├── comparatif.json
│   │       ├── climat.json
│   │       ├── commerce.json
│   │       ├── securite.json
│   │       ├── foncier.json
│   │       ├── finance.json
│   │       ├── technologie.json
│   │       ├── social.json
│   │       ├── durabilite.json
│   │       ├── indices.json
│   │       ├── statistiques.json
│   │       ├── correlations.json
│   │       └── metadonnees.json
│   └── src/
│       ├── components/
│       │   ├── Sidebar.tsx       # Navigation 14 pages
│       │   ├── Filters.tsx       # Filtrage région/pays/année
│       │   ├── KPICard.tsx       # Carte indicateur synthétique
│       │   └── ChartExporter.tsx # Export graphiques
│       ├── hooks/
│       │   └── useData.ts        # Hook data + cache + agrégations
│       ├── pages/
│       │   ├── Accueil.tsx       # Dashboard principal
│       │   ├── Production.tsx    # Production agricole
│       │   ├── Comparatif.tsx    # Benchmark mondial
│       │   ├── Climat.tsx        # Climat & environnement
│       │   ├── Commerce.tsx      # Commerce agricole
│       │   ├── Securite.tsx      # Sécurité alimentaire
│       │   ├── Foncier.tsx       # Foncier & ressources
│       │   ├── Finance.tsx       # Finance agricole
│       │   ├── Technologie.tsx   # Technologie & innovation
│       │   ├── Social.tsx        # Aspects sociaux
│       │   ├── Durabilite.tsx    # Durabilité
│       │   ├── Indices.tsx       # Indices composites
│       │   ├── Analyses.tsx      # Statistiques & corrélations
│       │   └── WebGIS.tsx        # Carte choroplèthe interactive
│       ├── styles/               # CSS modules
│       ├── utils/
│       │   └── chartExport.ts    # Utilitaires export
│       ├── App.tsx               # Routeur principal SPA
│       ├── i18n.tsx              # Internationalisation FR/EN
│       └── main.tsx              # Point d'entrée React
├── AfricaAgri_Database_2000_2024.xlsx  # Base de données maîtresse
├── AfricaAgri_Senior_Report.pdf        # Rapport analytique complet
├── convert_data.py                      # Pipeline ETL Python
├── shapefile_mondiale.geojson           # Géométries pays
└── README.md
```

---

## 15. Installation et Déploiement

### Prérequis

- Node.js ≥ 18.x
- Python ≥ 3.8 (pour le pipeline ETL uniquement)

### Installation locale

```bash
# Cloner le répertoire
git clone https://github.com/abdousamad387/AGRI_AFRICA_DATABASE.git
cd AGRI_AFRICA_DATABASE/dashboard

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Régénérer les données (optionnel)

```bash
pip install openpyxl
python convert_data.py
```

### Déploiement production

```bash
npm run build
# Le dossier dist/ est déployé automatiquement via GitHub Actions sur GitHub Pages
```

---

## 16. Références Bibliographiques

1. **FAO** (2024). *The State of Food Security and Nutrition in the World (SOFI)*. Rome: FAO.
2. **FAO** (2013). *The State of Food Insecurity in the World — The Multiple Dimensions of Food Security*. Rome: FAO.
3. **IFPRI** (2023). *Global Food Policy Report: Rethinking Food Crisis Responses*. Washington DC: IFPRI.
4. **Banque Mondiale** (2023). *Africa's Pulse — An Analysis of Issues Shaping Africa's Economic Future*. Vol. 28.
5. **Tucker, C.J.** (1979). Red and photographic infrared linear combinations for monitoring vegetation. *Remote Sensing of Environment*, 8(2), 127–150.
6. **Brewer, C.A.** (2003). *Designing Better Maps: A Guide for GIS Users*. ESRI Press.
7. **African Union** (2014). *Malabo Declaration on Accelerated Agricultural Growth and Transformation for Shared Prosperity*. Malabo, Equatorial Guinea.
8. **NEPAD/CAADP** (2003). *Comprehensive Africa Agriculture Development Programme*. Maputo Declaration.
9. **UNCCD** (2015). *Land Degradation Neutrality: Resilience at Local, National and Regional Levels*. Bonn.
10. **IPCC** (2014). *Climate Change 2014: Synthesis Report — AR5*. Geneva: IPCC.
11. **Pearson, K.** (1895). Notes on regression and inheritance in the case of two parents. *Proceedings of the Royal Society of London*, 58, 240–242.
12. **CHIRPS** — Funk, C. et al. (2015). The climate hazards infrared precipitation with stations. *Scientific Data*, 2, 150066.
13. **FAO AQUASTAT** (2023). *Global Water Information System*. Rome: FAO.
14. **EDGAR** — Crippa, M. et al. (2021). EDGAR v6.0 Greenhouse Gas Emissions. *Earth System Science Data*, 13(11).

---

<p align="center">
  <strong>AFRICA AGRI DATABASE</strong> — Observatoire analytique multidimensionnel de l'agriculture africaine<br/>
  51 pays · 25 ans · 14 dimensions · 200+ variables · 20 000+ observations<br/><br/>
  <em>Données : FAO | IFPRI | Banque Mondiale | IFAD | CHIRPS | MODIS | ERA5 | EDGAR | AQUASTAT</em><br/>
  <em>Avril 2026</em>
</p>
