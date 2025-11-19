import * as SQLite from "expo-sqlite";

// Fonction servant à ouvrir une base de donnée
const openDB = async () => {
	const db = await SQLite.openDatabaseAsync("MyProjectDB");
	return db;
};

export default openDB;
