import React, { useContext, useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { UserContext } from "../Context/UserContext";
import PanierScreen from "../Screens/PanierScreen";
import CatalogueWithDrawer from "./CatalogueWithDrawer";
import ProfilWithDrawer from "./ProfilWithDrawer";
import InscriptionFormScreen from "../Screens/InscriptionFormScreen";
import ConnexionFormScreen from "../Screens/ConnexionFormScreen";
import FavorisScreen from "../Screens/FavorisScreen";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
	const { user } = useContext(UserContext);

	// Signifie que isLogin sera true si user existe
	const isLogin = useMemo(() => !!user, [user]);

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color, size }) => {
					let iconName;
					if (route.name === "Catalogue") {
						iconName = "bag-handle-sharp";
					} else if (route.name === "Favoris") {
						iconName = "star";
					} else if (route.name === "Panier") {
						iconName = "cart";
					} else if (route.name === "Inscription") {
						iconName = "pencil";
					} else if (route.name === "Connexion") {
						iconName = "log-in-outline";
					} else if (route.name === "Profil") {
						iconName = "person";
					}
					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarStyle: {
					marginTop: 20,
				},
			})}
		>
			{/* Catalogue - Écrans publics - AVEC Drawer */}
			<Tab.Screen name="Catalogue" options={{ headerShown: false }} children={(props) => <CatalogueWithDrawer {...props} />} />

			{/* Favoris - Écrans protégés (seulement si connecté) - SANS Drawer (écran direct) */}
			{isLogin && <Tab.Screen name="Favoris" options={{ headerShown: false }} children={(props) => <FavorisScreen {...props} />} />}

			{/* Inscription/Connexion - Écrans publics - Seulement si DÉCONNECTÉ  */}
			{!isLogin && (
				<>
					<Tab.Screen name="Inscription" options={{ headerShown: false }} children={(props) => <InscriptionFormScreen {...props} />} />

					<Tab.Screen name="Connexion" options={{ headerShown: false }} children={(props) => <ConnexionFormScreen {...props} />} />
				</>
			)}

			{/* Favoris - Écrans protégés (seulement si connecté) - SANS Drawer (écran direct) */}
			{isLogin && <Tab.Screen name="Panier" options={{ headerShown: false }} children={(props) => <PanierScreen {...props} />} />}

			{/* Profil - Écrans protégés (seulement si connecté) - AVEC Drawer */}
			{isLogin && <Tab.Screen name="Profil" options={{ headerShown: false }} children={(props) => <ProfilWithDrawer {...props} />} />}
		</Tab.Navigator>
	);
};

export default TabNavigator;
