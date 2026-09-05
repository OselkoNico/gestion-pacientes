import express from 'express';
import router from './routes/pacientes.js';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/pacientes', router);

app.use((req,res) => {
    res.status(404).json({
        message: 'Incorrect route or params.'
    })
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});