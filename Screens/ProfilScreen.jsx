import { View, Text, Pressable, KeyboardAvoidingView, ScrollView, TouchableOpacity, Platform } from "react-native";
import styles from "../styles/Styles";
import { UserContext } from "../Context/Context";
import { useContext } from "react";

const ProfilScreen = ({ navigation, panier, favoris, setIsLogin }) => {

    const { user, setUser } = useContext(UserContext);

	const handleDeconnexion = () => {
        setUser(null);
		setIsLogin(false); // Remet l'état global à "déconnecté"
		navigation.navigate("Catalogue"); // Retour automatique à l'accueil
	};

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.header}>
				<Text style={styles.title}>Bienvenue {user?.prenom ?? ""}</Text>
				<View>
					<TouchableOpacity style={styles.cartBadge} onPress={() => navigation.navigate("Panier")}>
						<Text style={styles.cartText}>
							🛒 {panier.reduce((s, i) => s + (i.quantite || 1), 0)} |{" "}
							{panier.length > 0 ? panier.reduce((acc, i) => acc + i.prix * (i.quantite || 1), 0).toFixed(2) : 0} €
						</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.disconnectBadge} onPress={handleDeconnexion}>
						<Text style={styles.disconnectText}>Se déconnecter</Text>
					</TouchableOpacity>
				</View>
			</View>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
				style={styles.formContainer}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={{ minHeight: "100%", justifyContent: "center" }}
					showsHorizontalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				></ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
};

export default ProfilScreen;
