import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "@env";

const API_BASE_URL = `${SERVER_URL}`;

const getAuthToken = async () => {
	try {
		return await AsyncStorage.getItem("authToken"); // Stocké à la connexion
	} catch (error) {
		console.error("❌ Erreur récupération token:", error);
		return null;
	}
};

// Récupére toutes les données utilisateur (panier + favoris)
// Au login ou au chargement de l'application renvoi { panier: [...], favoris: [...] } ou erreur
export const fetchUserData = async (email) => {
	try {
		const token = await getAuthToken();

		const response = await fetch(`${API_BASE_URL}/userdata/${email}`, {
			headers: {
				Authorization: `Bearer ${token}`, //  Ajout du token
			},
		});

		if (response.status === 401 || response.status === 403) {
			// Token invalide → déconnecter l'utilisateur
			AsyncStorage.removeItem("authToken");
			throw new Error("Session expirée");
		}

		if (!response.ok) {
			throw new Error("❌ Erreur lors de la récupération des données utilisateur");
		}
		return await response.json(); // Renvoi les données si succès
	} catch (error) {
		console.error("❌ Erreur fetchUserData:", error);
		throw error; // Propage l'erreur au composant appelant
	}
};

// Sauvegarde le panier sur le serveur
// Après chaque modification du panier les données sont mises à jour ou erreur
export const updatePanier = async (email, panier) => {
	try {
		const token = await getAuthToken();

		const response = await fetch(`${API_BASE_URL}/userdata/${email}/panier`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`, //  Ajout du token
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ panier }), // Envoie le panier complet
		});

		if (response.status === 401 || response.status === 403) {
			// Token invalide → déconnecter l'utilisateur
			AsyncStorage.removeItem("authToken");
			throw new Error("Session expirée");
		}

		if (!response.ok) {
			throw new Error("❌ Erreur lors de la mise à jour du panier");
		}

		return await response.json();
	} catch (error) {
		console.error("❌ Erreur updatePanier:", error);
		throw error;
	}
};

// Sauvegarde les favoris sur le serveur
// Après chaque modification des favoris les données sont mises à jour ou erreur
export const updateFavoris = async (email, favoris) => {
	try {
		const token = await getAuthToken();

		const response = await fetch(`${API_BASE_URL}/userdata/${email}/favoris`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`, //  Ajout du token
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ favoris }), // Envoie les favoris complets
		});

		if (response.status === 401 || response.status === 403) {
			// Token invalide → déconnecter l'utilisateur
			AsyncStorage.removeItem("authToken");
			throw new Error("Session expirée");
		}

		if (!response.ok) {
			throw new Error("❌ Erreur lors de la mise à jour des favoris");
		}

		return await response.json();
	} catch (error) {
		console.error("❌ Erreur updateFavoris:", error);
		throw error;
	}
};

// Supprime les données utilisateur
export const deleteUserData = async (email) => {
	try {
		const token = await getAuthToken();

		const response = await fetch(`${API_BASE_URL}/userdata/${email}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`, // Ajout du token
			},
		});

		if (response.status === 401 || response.status === 403) {
			AsyncStorage.removeItem("authToken");
			throw new Error("Session expirée");
		}

		if (!response.ok) {
			throw new Error("❌ Erreur lors de la suppression des données");
		}

		return await response.json();
	} catch (error) {
		console.error("❌ Erreur deleteUserData:", error);
		throw error;
	}
};
