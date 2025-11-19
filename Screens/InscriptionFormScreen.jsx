import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import styles from "../styles/Styles";
import { Alert } from "react-native";
import { InitDB } from "../Database/InitDB";
import { InsertUser } from "../Database/Task";

const InscriptionFormScreen = ({ setIsLogin }) => {
	const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", tel: "", password: "", confirmPassword: "" });
	const [error, setError] = useState("");
	const [errorNom, setErrorNom] = useState("");
	const [errorPrenom, setErrorPrenom] = useState("");
	const [errorEmail, setErrorEmail] = useState("");
	const [errorTel, setErrorTel] = useState("");
	const [errorPassword, setErrorPassword] = useState("");
	const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
	const [isValid, setIsValid] = useState(false);

	// Ref pour déplacer le focus entre les inputs
	const nomInputRef = useRef(null);
	const prenomInputRef = useRef(null);
	const emailInputRef = useRef(null);
	const telInputRef = useRef(null);
	const passwordInputRef = useRef(null);
	const confirmPasswordInputRef = useRef(null);

	const navigation = useNavigation();

	useEffect(() => {
		if (nomInputRef.current) {
			nomInputRef.current.focus();
		}
	}, []);

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

	// UseEffect qui surveille la validité du formulaire pour l'activation du bouton submit
	useEffect(() => {
		const formIsValid =
			formData.nom.trim() !== "" &&
			formData.prenom.trim() !== "" &&
			formData.email.trim() !== "" &&
			formData.tel.trim() !== "" &&
			formData.password.trim() !== "" &&
			formData.confirmPassword.trim() !== "" &&
			!error &&
			!errorNom &&
			!errorPrenom &&
			!errorEmail &&
			!errorTel &&
			!errorPassword &&
			!errorConfirmPassword;

		setIsValid(formIsValid);
	}, [formData, error, errorNom, errorPrenom, errorEmail, errorTel, errorPassword, errorConfirmPassword]);

	useEffect(() => {
		if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
			setError("⚠️ Les mots de passe ne correspondent pas");
		} else {
			setError("");
		}
	}, [formData.password, formData.confirmPassword]);

	// Les différents Regex utiles aux vérifications
	const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{12,}$/;

	//Vérification du champ "nom"
	const handleNomChange = (champ, value) => {
		setFormData((prev) => ({
			...prev,
			[champ]: value,
		}));

		if (value.trim() === "") {
			setErrorNom('⚠️ Le champ "Pseudo" ne peut pas etre vide');
		} else if (!nameRegex.test(value)) {
			setErrorNom("⚠️ Le nom ne peut contenir que des lettres");
		} else {
			setErrorNom("");
		}
	};

	//Vérification du champ "prenom"
	const handlePrenomChange = (champ, value) => {
		setFormData((prev) => ({
			...prev,
			[champ]: value,
		}));

		if (value.trim() === "") {
			setErrorPrenom('⚠️ Le champ "Pseudo" ne peut pas etre vide');
		} else if (!nameRegex.test(value)) {
			setErrorPrenom("⚠️ Le prenom ne peut contenir que des lettres");
		} else {
			setErrorPrenom("");
		}
	};

	//Vérification du champ "email"
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

	//Vérification du champ "tel"
	const handleTelChange = (champ, value) => {
		const numericValue = value.replace(/[^0-9]/g, "");

		setFormData((prev) => ({
			...prev,
			[champ]: numericValue,
		}));

		if (numericValue.trim() === "") {
			setErrorTel('⚠️ Le champ "Numéro de téléphone" ne peut pas etre vide');
		} else if (numericValue.length < 10) {
			setErrorTel("⚠️ Le numéro de téléphone semble trop court");
		} else {
			setErrorTel("");
		}
	};

	//Vérification du champ "mot de passe"
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

	//Vérification du champ "confirmation de mot de passe"
	const handleConfirmPasswordChange = (champ, value) => {
		setFormData((prev) => ({
			...prev,
			[champ]: value,
		}));

		if (value.trim() === "") {
			setErrorConfirmPassword('⚠️ Le champ "Confirmation de mot de passe" ne peut pas etre vide');
		} else if (value.length < 12) {
			setErrorConfirmPassword('⚠️ Le champ "Confirmation de mot de passe" doit etre supérieur ou égale à 12');
		} else if (!passwordRegex.test(value.trim())) {
			setErrorConfirmPassword("⚠️ Le mot de passe est invalide");
		} else {
			setErrorConfirmPassword("");
		}
	};

	const handleSubmit = async () => {
		let isValid = true;

		// VALIDATION COTE CLIENT

		// Nom
		if (formData.nom.trim() === "") {
			setErrorNom('⚠️ Le champ "Nom" ne peut pas être vide');
			isValid = false;
		} else if (!nameRegex.test(formData.nom)) {
			setErrorNom("⚠️ Le nom ne peut contenir que des lettres");
		} else {
			setErrorNom("");
		}

		// Prenom
		if (formData.prenom.trim() === "") {
			setErrorPrenom('⚠️ Le champ "Prenom" ne peut pas être vide');
			isValid = false;
		} else if (!nameRegex.test(formData.prenom)) {
			setErrorNom("⚠️ Le prenom ne peut contenir que des lettres");
		} else {
			setErrorPrenom("");
		}

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

		// Tel
		if (formData.tel.trim() === "") {
			setErrorTel('⚠️ Le champ "Tel" ne peut pas être vide');
			isValid = false;
		} else if (formData.tel.length < 10) {
			setErrorTel("⚠️ Le numéro de téléphone semble trop court");
			isValid = false;
		} else {
			setErrorTel("");
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
		// Confirmation du mot de passe
		if (formData.confirmPassword.trim() === "") {
			setErrorConfirmPassword('⚠️ Le champ "Confirmation de mot de passe" ne peut pas être vide');
			isValid = false;
		} else if (formData.confirmPassword.length < 12) {
			setErrorConfirmPassword('⚠️ Le champ "Confirmation de mot de passe" doit etre supérieur ou égale à 12');
			isValid = false;
		} else if (formData.password !== formData.confirmPassword) {
			setErrorConfirmPassword("⚠️ Les mots de passe ne correspondent pas");
			isValid = false;
		} else {
			setErrorConfirmPassword("");
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

			await InsertUser(formData.nom, formData.prenom, formData.email, formData.tel, formData.password);
			Alert.alert("✅ Inscription réussie", `Bienvenue, ${formData.prenom} !`);

			// Réinitialisation correcte du formulaire
			setFormData({
				nom: "",
				prenom: "",
				email: "",
				tel: "",
				password: "",
				confirmPassword: "",
			});
            
			// Marquer comme connecté et navigation vers "Profil"
			setIsLogin(true);
			navigation.navigate("Profil");
		} catch (error) {
			console.error("Erreur lors de l'insertion :", error);
			Alert.alert("❌ Erreur", "Impossible d'insérer l'utilisateur.");
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
				<Text style={styles.titre}>Créer un compte</Text>
				<View>
					<Text style={styles.label}>Nom:</Text>
					<TextInput
						ref={nomInputRef}
						keyboardType="default"
						autoCapitalize="words"
						style={[styles.input, errorNom && styles.inputErreur]}
						value={formData.nom}
						onChangeText={(valeur) => handleNomChange("nom", valeur)}
						placeholder="Entrez votre nom ici"
						returnKeyType="next"
						onSubmitEditing={() => prenomInputRef.current && prenomInputRef.current.focus()}
					/>
					{errorNom ? <Text style={styles.texteErreur}>{errorNom}</Text> : null}
				</View>
				<View>
					<Text style={styles.label}>Prenom:</Text>
					<TextInput
						ref={prenomInputRef}
						keyboardType="default"
						autoCapitalize="words"
						style={[styles.input, errorPrenom && styles.inputErreur]}
						value={formData.prenom}
						onChangeText={(valeur) => handlePrenomChange("prenom", valeur)}
						placeholder="Entrez votre prenom ici"
						returnKeyType="next"
						onSubmitEditing={() => emailInputRef.current && emailInputRef.current.focus()}
					/>
					{errorPrenom ? <Text style={styles.texteErreur}>{errorPrenom}</Text> : null}
				</View>
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
						onSubmitEditing={() => telInputRef.current && telInputRef.current.focus()}
					/>
					{errorEmail ? <Text style={styles.texteErreur}>{errorEmail}</Text> : null}
				</View>
				<View>
					<Text style={styles.label}>Numéro de téléphone:</Text>
					<TextInput
						ref={telInputRef}
						keyboardType="phone-pad"
						style={[styles.input, errorTel && styles.inputErreur]}
						value={formData.tel}
						onChangeText={(valeur) => handleTelChange("tel", valeur)}
						placeholder="Entrez votre numéro de Téléphone ici"
						returnKeyType="next"
						onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
					/>
					{errorTel ? <Text style={styles.texteErreur}>{errorTel}</Text> : null}
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
						returnKeyType="next"
						onSubmitEditing={() => confirmPasswordInputRef.current && confirmPasswordInputRef.current.focus()}
					/>
					{errorPassword ? <Text style={styles.texteErreur}>{errorPassword}</Text> : null}
				</View>
				<View>
					<Text style={styles.label}>Confirmation du mot de passe:</Text>
					<TextInput
						style={[styles.input, errorConfirmPassword && styles.inputErreur]}
						value={formData.confirmPassword}
						secureTextEntry={true}
						onChangeText={(valeur) => handleConfirmPasswordChange("confirmPassword", valeur)}
						placeholder="Entrez votre confirmation de mot de passe ici"
						returnKeyType="done"
						onSubmitEditing={handleSubmit}
					/>
					{errorConfirmPassword ? <Text style={styles.texteErreur}>{errorConfirmPassword}</Text> : null}
				</View>
				<TouchableOpacity style={[styles.bouton, !isValid && { backgroundColor: "#e74c3c" }]} onPress={handleSubmit} disabled={!isValid}>
					<Text style={styles.texteBouton}>{isValid ? "S'inscrire" : "Champs invalides"}</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default InscriptionFormScreen;
