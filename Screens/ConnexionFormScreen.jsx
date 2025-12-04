import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { ActivityIndicator } from "react-native";
import styles from "../Styles/Styles";
import { Alert } from "react-native";
import { UserContext } from "../Context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "@env";

const ConnexionFormScreen = () => {
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [errorEmail, setErrorEmail] = useState("");
	const [errorPassword, setErrorPassword] = useState("");

	// Pour vérifier l'état de validation du formulaire
	const [isValid, setIsValid] = useState(false);

	// Pour vérifier l'état de chargement du formulaire
	const [loading, setLoading] = useState(false);

	// Accès au context
	const { login } = useContext(UserContext);

	//Ref pour déplacer le focus entre les inputs
	const emailInputRef = useRef(null);
	const passwordInputRef = useRef(null);

	const navigation = useNavigation();

	// Focus auto sur l'email
	useEffect(() => {
		if (emailInputRef.current) {
			emailInputRef.current.focus();
		}
	}, []);

	// UseEffect qui surveille la validité du formulaire pour l'activation du bouton submit
	useEffect(() => {
		const formIsValid = formData.email.trim() !== "" && formData.password.trim() !== "" && !error && !errorEmail && !errorPassword;

		setIsValid(formIsValid);
	}, [formData, error, errorEmail, errorPassword]);

	// Les différents Regex utiles aux vérifications
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{12,}$/;

	// Vérification du champ "email"
	const handleEmailChange = (champ, value) => {
		setFormData((prev) => ({
			...prev,
			[champ]: value,
		}));

		if (value.trim() === "") {
			setErrorEmail('⚠️ Le champ "Email" ne peut pas etre vide');
		} else if (!emailRegex.test(value.trim())) {
			setErrorEmail("⚠️ Le format de l'email est invalide.");
		} else {
			setErrorEmail("");
		}
	};

	// Vérification du champ "mot de passe"
	const handlePasswordChange = (champ, value) => {
		setFormData((prev) => ({
			...prev,
			[champ]: value,
		}));

		if (value.trim() === "") {
			setErrorPassword('⚠️ Le champ "Mot de passe" ne peut pas etre vide');
		} else if (value.length < 12) {
			setErrorPassword('⚠️ Le champ "Mot de passe" doit etre supérieur ou égale à 12');
		} else if (!passwordRegex.test(value.trim())) {
			setErrorPassword("⚠️ Le mot de passe est invalide");
		} else {
			setErrorPassword("");
		}
	};

	const handleSubmit = async () => {
		// Ajout de loading afin d'empêcher la double soumission
		if (loading) return;

		let isValid = true;

		// VALIDATION COTE CLIENT

		// Email
		if (formData.email.trim() === "") {
			setErrorEmail('⚠️ Le champ "Email" ne peut pas être vide');
			isValid = false;
		} else if (!emailRegex.test(formData.email.trim())) {
			setErrorEmail("⚠️ Le format de l'email est invalide");
			isValid = false;
		} else {
			setErrorEmail("");
		}

		// Mot de passe
		if (formData.password.trim() === "") {
			setErrorPassword('⚠️ Le champ "Mot de passe" ne peut pas être vide');
			isValid = false;
		} else if (formData.password.length < 12) {
			setErrorPassword('⚠️ Le champ "Mot de passe" doit etre supérieur ou égale à 12');
			isValid = false;
		} else if (!passwordRegex.test(formData.password.trim())) {
			setErrorPassword("⚠️ Le mot de passe est invalide");
			isValid = false;
		} else {
			setErrorPassword("");
		}

		if (!isValid) {
			// Arrête tout ici si il y a une erreur
			console.log("❌ Le formulaire contient des erreurs. Envoi bloqué");
			return;
		}

		// Début du loading
		setLoading(true);

		// VALIDATION COTE BASE DE DONNEE

		try {
			console.log("✅ Validation côté client réussie, connexion avec JWT...");

			// Appel à la NOUVELLE route d'authentification
			const response = await fetch(`${SERVER_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
					source: "mobile",
				}),
			});

			const result = await response.json();

			if (result.success) {
				console.log("✅ Connexion JWT réussie:", result.user);

				// 1. Stocker le token
				await AsyncStorage.setItem("authToken", result.token);
				await AsyncStorage.setItem("user", JSON.stringify(result.user));

				// 2. Mettre à jour le contexte utilisateur et connexion
				login(result.user, result.token);

				// 3. Redirection
				Alert.alert("✅ Connexion réussie", "Bienvenue !");
				navigation.navigate("Catalogue");
			} else {
				Alert.alert("❌ Erreur", result.message);
				console.log("❌ Échec de l'authentification:", result.message);
			}
		} catch (error) {
			console.error("❌ Erreur lors de la vérification :", error);
			Alert.alert("❌ Erreur", "Une erreur est survenue lors de la connexion.");
		} finally {
			// Fin du loading (même en cas d'erreur)
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
			style={styles.formContainer}
		>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={{ paddingBottom: 120 }}
				showsHorizontalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<Text style={styles.titre}>Se connecter</Text>

				<View>
					<Text style={styles.label}>Email:</Text>
					<TextInput
						ref={emailInputRef}
						autoCapitalize="none"
						keyboardType="email-address"
						style={[styles.input, errorEmail && styles.inputErreur]}
						value={formData.email}
						onChangeText={(valeur) => handleEmailChange("email", valeur)}
						placeholder="Entrez votre email ici"
						returnKeyType="next"
						onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
					/>
					{errorEmail ? <Text style={styles.texteErreur}>{errorEmail}</Text> : null}
				</View>

				<View>
					<Text style={styles.label}>Mot de passe:</Text>
					<TextInput
						ref={passwordInputRef}
						style={[styles.input, errorPassword && styles.inputErreur]}
						value={formData.password}
						secureTextEntry={true}
						onChangeText={(valeur) => handlePasswordChange("password", valeur)}
						placeholder="Entrez votre mot de passe ici"
						returnKeyType="done"
						onSubmitEditing={handleSubmit}
					/>
					{errorPassword ? <Text style={styles.texteErreur}>{errorPassword}</Text> : null}
				</View>

				{/* Affichage du loading */}
				{loading ? (
					<View style={{ alignItems: "center", marginTop: 20 }}>
						<ActivityIndicator size="large" color="#3498db" />
						<Text style={{ marginTop: 10 }}>Connexion en cours...</Text>
					</View>
				) : (
					<TouchableOpacity
						style={[styles.bouton, !isValid && { backgroundColor: "#e74c3c" }]}
						onPress={handleSubmit}
						// Désactivé si loading ou non valide
						disabled={!isValid || loading}
					>
						<Text style={styles.texteBouton}>{isValid ? "Se connecter" : "Champs invalides"}</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default ConnexionFormScreen;
