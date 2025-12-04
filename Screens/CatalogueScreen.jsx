import React, { useState, useEffect, useContext, useCallback, useMemo, memo } from "react";
import { ActivityIndicator } from "react-native"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, FlatList, View, TextInput, TouchableOpacity } from "react-native";
import styles from "../Styles/Styles";
import { ArticleContext } from "../Context/ArticleContext";
import { PanierContext } from "../Context/PanierContext";
import { UserContext } from "../Context/UserContext";
import { useCalculsPanier } from "../Hooks/useCalculsPanier";
import { FavorisContext } from "../Context/FavorisContext";
import ArticlesItem from "../Components/FlatList/ArticlesItem.jsx";
import { SERVER_URL } from "@env";

const CatalogueScreen = memo(({ navigation }) => {
	const [erreur, setErreur] = useState(null);
	const [recherche, setRecherche] = useState("");

	// Etat qui stocke la visibilité de chaque article pour les descriptions individuelles : { idArticle: boolean }
	const [descriptionVisible, setDescriptionVisible] = useState({});

	// Pour vérifier l'état de chargement de la liste des articles
	const [loading, setLoading] = useState(false);

	// Accès au context
	const { articles, setArticles } = useContext(ArticleContext);
	const { favoris, toggleFavoris } = useContext(FavorisContext);
	const { ajouterAuPanier } = useContext(PanierContext);
	const { user } = useContext(UserContext);
	const isLogin = !!user; // ← Récupéré du contexte

	// Accès au hook personnalisé
	const { totalPanier, nombreArticlesPanier } = useCalculsPanier();

	useEffect(() => {
		const chargerArticles = async () => {
			try {
				// Début du loading
				setLoading(true);

				// Réinitialiser les erreurs précédentes
				setErreur(null);

				// Ajouter un timeout pour éviter les attentes infinies
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

				const res = await fetch(`${SERVER_URL}/articles`, {
					signal: controller.signal,
				});

                clearTimeout(timeoutId);

				if (!res.ok) {
					//throw = lancer une erreur (interruption immédiate).
					// new Error() = créer un objet erreur avec message, nom et stack.
					throw new Error(`Erreur HTTP ${res.status}: ${res.statusText}`);
				}

				const data = await res.json();
				setArticles(data); // mise à jour de l’état avec les données reçues
			} catch (err) {
				console.error("❌ Erreur chargement articles:", err);

				// Messages d'erreur plus précis
				if (err.name === "AbortError") {
					setErreur("❌ La requête a pris trop de temps. Vérifiez votre connexion.");
				} else if (err.message.includes("Network request failed")) {
					setErreur("❌ Erreur réseau. Vérifiez :\n1. Votre connexion internet\n2. Que le serveur est démarré\n3. L'adresse IP du serveur");
				} else {
					setErreur(err.message);
				}
			} finally {
				// Fin du loading (même en cas d'erreur)
				setLoading(false);
			}
		};
		chargerArticles();
	}, [setArticles]);

	// Fonction pour la barre de recherche
	const articlesFiltres = useMemo(() => {
		return articles.filter((a) => a.name.toLowerCase().includes(recherche.toLowerCase()));
	}, [articles, recherche]);

	// Fonction Toggle pour le ToggleButton (afficher/masquer la description de chaque article)
	const toggleDescription = useCallback((id) => {
		setDescriptionVisible((prev) => ({
			...prev,
			// Inverse true/false pour cet ID spécifique
			[id]: !prev[id],
		}));
	}, []);

	// OPTIMISATION : Création d'un Set des IDs des favoris
	const idsFavoris = useMemo(
		() =>
			// Convertit le tableau en Set (collection d'éléments uniques)
			new Set(
				// Transforme le tableau d'objets favoris en tableau simple d'IDs
				favoris.map((f) => f._id)
			),
		[favoris]
	);

	// OPTIMISATION : Fonction renderItem de la flatlist mémorisée
	const renderItem = useCallback(
		({ item }) => {
			// Vérifie l'état du bouton toggleDescription de l'article en question, grace à son id passé en paramètre
			const isVisible = descriptionVisible[item._id] || false;
			// OPTIMISATION : Recherche rapide avec Set.has()
			const estFavori = idsFavoris.has(item._id);

			return (
				<ArticlesItem
					item={item}
					isVisible={isVisible}
					estFavori={estFavori}
					onToggleDescription={toggleDescription}
					onToggleFavoris={() => toggleFavoris(item, user)}
					onAddToCart={ajouterAuPanier}
					isLogin={isLogin}
				/>
			);
		},
		[descriptionVisible, idsFavoris, toggleDescription, toggleFavoris, ajouterAuPanier, isLogin]
	);

	// Affiche un écran de chargement en cas de chargements
	if (loading) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" color="#3498db" />
				<Text style={{ marginTop: 10 }}>Chargement des articles...</Text>
			</View>
		);
	}

	// Affiche un écran d'érreur en cas d'érreurs
	if (erreur) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#fff",
				}}
			>
				<Text style={styles.texteErreur}>❌ Erreur : {erreur}</Text>
			</View>
		);
	}

	// Le reste du code NE S'EXÉCUTE PAS si on est en loading ou erreur

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.header}>
				<Text style={styles.title}>Liste des produits</Text>
				<TouchableOpacity style={styles.cartBadge} onPress={() => navigation.navigate("Panier")}>
					<Text style={styles.cartText}>
						🛒 {nombreArticlesPanier} | {totalPanier.toFixed(2)} €
					</Text>
				</TouchableOpacity>
			</View>

			<View style={{ backgroundColor: "#fff" }}>
				<TextInput
					placeholder="Rechercher un article..."
					value={recherche}
					onChangeText={setRecherche}
					style={{
						borderWidth: 1,
						borderColor: "#110404ff",
						borderRadius: 8,
						padding: 10,
						marginBottom: 20,
						width: 380,
						marginLeft: 15,
					}}
				/>
			</View>

			<FlatList
				data={articlesFiltres}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
				ListEmptyComponent={
					recherche.length > 0 ? <Text>Aucun produit ne correspond à "{recherche}".</Text> : <Text>Aucun produit disponible.</Text>
				}
			/>
		</View>
	);
});

export default CatalogueScreen;
