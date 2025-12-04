import React, { memo } from "react";
import { View, Text, Image, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../Styles/Styles";

const ArticlesItem = memo(({ item, isVisible, estFavori, onToggleDescription, onToggleFavoris, onAddToCart, isLogin }) => {
	return (
		<View>
			<View style={[styles.itemContainer, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
				<Image
					source={{ uri: item.image }}
					style={styles.image}
					resizeMode="cover" // Évite les déformations
					fadeDuration={300} // Transition plus fluide
				/>

				<View style={styles.info}>
					<Text>{item.name}</Text>
					<Text>{item.prix}€</Text>
				</View>

				<View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
					<View>
						{isLogin && (
							<Pressable onPress={() => onToggleFavoris(item)} style={{ padding: 5, alignItems: "center", marginBottom: 8 }}>
								<Ionicons
									name={estFavori ? "bookmark" : "bookmark-outline"}
									size={30}
									color={estFavori ? "#f3c808ff" : "#000000ff"}
								/>
							</Pressable>
						)}

						{!isLogin ? (
							<Pressable
								style={[styles.bouton, { backgroundColor: "#e74c3c", maxWidth: 175 }]}
								onPress={() =>
									Alert.alert("Connectez-vous pour acheter", "Veuillez vous connecter pour ajouter des articles au panier")
								}
							>
								<Text style={[styles.texteBouton, { fontSize: 12 }]}>Connectez-vous pour acheter</Text>
							</Pressable>
						) : (
							<Pressable onPress={() => onAddToCart(item)}>
								{({ pressed }) => (
									<Text
										style={{
											backgroundColor: "#1c5be4ff",
											padding: 10,
											borderRadius: 8,
											color: "white",
											width: 130,
											textAlign: "center",
										}}
									>
										Ajouter au panier
									</Text>
								)}
							</Pressable>
						)}
					</View>
				</View>
			</View>

			<Pressable onPress={() => onToggleDescription(item._id)}>
				{({ pressed }) => (
					<Text
						style={{
							backgroundColor: "#1c5be4ff",
							padding: 10,
							color: "white",
							flex: 1,
							textAlign: "center",
						}}
					>
						{isVisible ? "Masquer les détails" : "Afficher les détails"}
					</Text>
				)}
			</Pressable>

			{isVisible && (
				<View style={{ backgroundColor: "#e0dbdbff" }}>
					<Text style={{ marginBottom: 13 }}>Description technique :</Text>
					<Text style={{ marginBottom: 13 }}>
						- Matériau: Coton 100%{"\n"}- Dimensions: 30x40 cm{"\n"}- Poids: 250g{"\n"}- Couleur: Bleu marine{"\n"}- Entretien: Lavable en
						machine
					</Text>
				</View>
			)}
		</View>
	);
});

export default ArticlesItem;
