import React, { createContext, useState, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { updatePanier, fetchUserData } from "../Database/UserDataAPI";

//Créer un context - une sorte de "zone mémoire partagée"
export const PanierContext = createContext();

//Definir le fournisseur du context
export const PanierProvider = ({ children, user }) => {
	const [panier, setPanier] = useState([]);
	const [lastSync, setLastSync] = useState(null);
    const [loading, setLoading] = useState(true);

	// Charger le panier au démarrage ou quand l'utilisateur change
	useEffect(() => {
		const loadPanier = async () => {
			try {
				setLoading(true);
				if (user) {
					// Connecté : charger depuis serveur
					const userData = await fetchUserData(user.email);
					setPanier(userData.panier || []);
					setLastSync(Date.now());
				} else {
					// Non connecté : panier vide (pas de sauvegarde locale)
					setPanier([]);
				}
			} catch (error) {
				console.log("❌ Chargement panier échoué, panier vide");
				setPanier([]);
			} finally {
				setLoading(false);
			}
		};
		loadPanier();
	}, [user]);

	// Synchroniser avec le backend à chaque modification
	useEffect(() => {
		if (!user) return; // Pas de sync si non connecté
		if (!lastSync || Date.now() - lastSync < 1000) return; // Anti-spam

		const sync = async () => {
			try {
				await updatePanier(user.email, panier);
				setLastSync(Date.now());
                console.log("✅ Panier synchronisé avec MongoDB");
			} catch (error) {
				console.error("❌ Sync panier échoué", error);
			}
		};
		sync();
	}, [panier, user]);

	// Ajouter un article (ou augmenter sa quantité)
	const ajouterAuPanier = useCallback(
		(article) => {
			setPanier((prev) => {
				// 1. Vérifier si l'article existe déjà
				const existe = prev.find((item) => item._id === article._id);
				if (existe) {
					// 2. Si OUI : augmenter la quantité de 1
					return prev.map((item) => (item._id === article._id ? { ...item, quantite: (item.quantite || 1) + 1 } : item));
				} else {
					// 3. Si NON : ajouter nouvel article avec quantité 1
					return [...prev, { ...article, quantite: 1 }];
				}
			});
		},
		[user]
	);

	// Supprimer un article (ou diminuer sa quantité)
	const supprimerDuPanier = useCallback(
		(id) => {
			setPanier((prev) => {
				// 1. Diminuer la quantité de 1 pour l'article ciblé via l'id
				return (
					prev
						.map((item) => (item._id === id ? { ...item, quantite: (item.quantite || 1) - 1 } : item))
						// 2. Filtrer pour garder seulement les articles avec quantite > 0
						.filter((item) => (item.quantite || 0) > 0)
				);
			});
		},
		[user]
	);

	// Vider entièrement le panier avec confirmation avant
	const viderLePanier = useCallback(() => {
		Alert.alert("Confirmation", "⚠️ Voulez-vous vraiment vider le panier ?", [
			{ text: "❌ Annuler", style: "cancel" },
			{
				text: "✅ Oui, je confirme",
				style: "destructive",
				onPress: () => setPanier([]),
			},
		]);
	}, [user]);

	return (
		<PanierContext.Provider
			value={{
				panier,
				setPanier,
				ajouterAuPanier,
				supprimerDuPanier,
				viderLePanier,
				loading,
			}}
		>
			{children}
		</PanierContext.Provider>
	);
};
