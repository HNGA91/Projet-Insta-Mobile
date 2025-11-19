import openDB from "./DB";

export const InitDB = async () => {
	const db = await openDB();

	await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nom TEXT, Prenom TEXT, Email TEXT, Tel TEXT, Password TEXT
    );
    `);

	console.log('✅ Table "Users" créée avec succès');
	// console.log('📂 Dossier app SQLite :', FileSystem.documentDirectory);
};
