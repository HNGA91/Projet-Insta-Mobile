import { useEffect, useRef, useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import styles from "../styles/Styles";
import { Alert } from "react-native";
import { InitDB } from "../Database/InitDB";
import { VerifUser } from "../Database/Task"

const ConnexionFormScreen = ({ setIsLogin, isLogin }) => {
    
	const [formData, setFormData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [errorEmail, setErrorEmail] = useState("");
	const [errorPassword, setErrorPassword] = useState("");

    // Accès au context
    const { setUser } = useContext(UserContext);

    // Pour vérifier l'état de validation du formulaire
	const [isValid, setIsValid] = useState(false);

	//Ref pour déplacer le focus entre les inputs
	const emailInputRef = useRef(null);
	const passwordInputRef = useRef(null);

	const navigation = useNavigation();

    // Initialise la base de donnée
    useEffect(() => {
            const setupDB = async () => {
                try {
                    await InitDB();
                } catch (error) {
                    console.error("Erreur lors de m'initialisation de la base :", error);
                }
            };
            setupDB();
        }, []);

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

		// VALIDATION COTE BASE DE DONNEE

        // Si la validation côté client est passée, on vérifie en base de données
		try {
			console.log("✅ Validation côté client réussie, vérification en base de données...");

			const user = await VerifUser(formData.email, formData.password);

			if (user) {
				console.log("✅ Utilisateur authentifié:", user);
				Alert.alert("✅ Connexion réussie", "Bienvenue!");

				// Mettre à jour le contexte utilisateur
				setUser({
					nom: user.Nom,
                    prenom: user.Prenom,
					email: user.Email,
				});

				// Marquer comme connecté et navigation vers "Profil"
				setIsLogin(true);
				navigation.navigate("Profil");
			} else {
				Alert.alert("❌ Erreur", "Email ou mot de passe incorrect.");
				console.log("❌ Échec de l'authentification, Email ou mot de passe incorrect.");
			}
		} catch (error) {
			console.error("Erreur lors de la vérification :", error);
			Alert.alert("❌ Erreur", "Une erreur est survenue lors de la connexion.");
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
				<TouchableOpacity style={[styles.bouton, !isValid && { backgroundColor: "#e74c3c" }]} onPress={handleSubmit} disabled={!isValid}>
					<Text style={styles.texteBouton}>{isValid ? "Se connecter" : "Champs invalides"}</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default ConnexionFormScreen;