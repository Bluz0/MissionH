if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;

const uri = `mongodb://admin:password@mongodb:27017/game_database?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log("Connecté à MongoDB sur le serveur distant !"))
  .catch(err => console.error("Erreur de connexion :", err));