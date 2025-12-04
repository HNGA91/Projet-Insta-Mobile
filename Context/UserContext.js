import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

//Créer un context - une sorte de "zone mémoire partagée"
export const UserContext = createContext();

//Definir le fournisseur du context
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

    // Charger l'utilisateur au démarrage
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
		try {
			const userJson = await AsyncStorage.getItem("user");
			const token = await AsyncStorage.getItem("authToken");

			if (userJson && token) {
				const userData = JSON.parse(userJson);
				setUser(userData);
			}
		} catch (error) {
			console.error("❌ Erreur lors du chargement de l'utilisateur:", error);
		} finally {
			setLoading(false);
		}
	};

	// Fonction de connexion
	const login = async (userData, token) => {
		try {
			await AsyncStorage.setItem("user", JSON.stringify(userData));
			await AsyncStorage.setItem("authToken", token);
			setUser(userData);
			console.log("✅ Connexion réussie");
		} catch (error) {
			console.error("❌ Erreur lors de la connexion:", error);
			throw error;
		}
	};

	// Fonction de déconnexion
	const logout = async () => {
		try {
			await AsyncStorage.removeItem("user");
			await AsyncStorage.removeItem("authToken");
			setUser(null);
			console.log("✅ Déconnexion réussie");
		} catch (error) {
			console.error("❌ Erreur lors de la déconnexion:", error);
		}
	};

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				login,
				logout,
				loading,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
