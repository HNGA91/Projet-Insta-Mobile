import React, { createContext, useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { updateFavoris, fetchUserData } from "../Database/UserDataAPI";

//Créer un context - une sorte de "zone mémoire partagée"
export const FavorisContext = createContext();

//Definir le fournisseur du context
export const FavorisProvider = ({ children, user }) => {
	const [favoris, setFavoris] = useState([]);
	const [lastSync, setLastSync] = useState(null);
	const [loading, setLoading] = useState(true);

	// Charger les favoris au démarrage ou quand l'utilisateur change
	useEffect(() => {
		const loadFavoris = async () => {
			try {
				setLoading(true);
				if (user) {
					// Connecté : charger depuis serveur
					const userData = await fetchUserData(user.email);
					setFavoris(userData.favoris || []);
					setLastSync(Date.now());
				} else {
					// Non connecté : favoris vides (pas de sauvegarde locale)
					setFavoris([]);
				}
			} catch (error) {
				console.log("❌ Chargement favoris échoué, favoris vide");
				setFavoris([]);
			} finally {
				setLoading(false);
			}
		};
		loadFavoris();
	}, [user]);

	// Synchroniser avec le backend MongoDB à chaque modification
	useEffect(() => {
		if (!user) return; // Pas de sync si non connecté
		if (!lastSync || Date.now() - lastSync < 1000) return; // Anti-spam

		const sync = async () => {
			try {
				await updateFavoris(user.email, favoris);
				setLastSync(Date.now());
                console.log("✅ Favoris synchronisés avec MongoDB");
			} catch (error) {
				console.error("❌ Sync favoris échoué", error);
			}
		};
		sync();
	}, [favoris, user]);

	// Fonction toggle favoris (Ajouter / Retirer)
	const toggleFavoris = useCallback(
		(article, user) => {
			if (!user) {
				Alert.alert("⛔ Connexion requise", "Veuillez vous connecter pour ajouter aux favoris");
				return;
			}

			setFavoris((prev) => {
				// 1. Vérifier si l'article existe déjà dans parmis les favoris
				const existe = prev.some((item) => item._id === article._id);
				if (existe) {
					// 2. Si OUI : le retire des favoris
					return prev.filter((item) => item._id !== article._id);
				} else {
					// 3. Si NON : l'Aajoute aux favoris
					return [...prev, { ...article }];
				}
			});
		},
		[user]
	);

	// Supprimer un article de la liste des favoris
	const supprimerDesFavoris = useCallback((id) => {
		setFavoris((prev) => prev.filter((item) => item._id !== id));
	}, []);

	return (
		<FavorisContext.Provider
			value={{
				favoris,
				setFavoris,
				toggleFavoris,
				supprimerDesFavoris,
				loading,
			}}
		>
			{children}
		</FavorisContext.Provider>
	);
};
