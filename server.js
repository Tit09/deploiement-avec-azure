require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Modèle : une tâche a un titre
const taskSchema = new mongoose.Schema(
    { title: { type: String, required: true } },
    { timestamps: true }
);
const Task = mongoose.model('Task', taskSchema);

// Routes de l'API
app.get('/api/tasks', async (req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
    const task = await Task.create({ title: req.body.title });
    res.status(201).json(task);
});

app.delete('/api/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tâche supprimée' });
});

// Sert le frontend React compilé
app.use(express.static(path.join(__dirname, 'public')));

// Toute autre adresse renvoie la page React
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connexion à MongoDB, puis démarrage du serveur
const PORT = process.env.PORT || 5001;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connecté');
        app.listen(PORT, () => console.log('Serveur démarré sur le port ' + PORT));
    })
    .catch((err) => {
        console.error('Erreur MongoDB : ' + err.message);
        process.exit(1);
    });