import express from 'express';
const router = express.Router();

const pacientes = [];

router.get('/', (req, res) => {
    res.status(200).json(pacientes);
});

router.get('/:dni', (req, res) => {
    const persona = pacientes.find(
        paciente => paciente.dni === req.params.dni
    );

    if(!persona) {
        return res.status(404).json({
            message: 'DNI no encontrado.'
        });
    }

    res.status(200).json(persona);
});

router.post('/', (req, res) => {
    if(!req.body.dni) {
        return res.status(400).json({
            message: 'Paciente data mandatory'
        });
    }

    const existingPaciente = pacientes.find(
        paciente => paciente.dni === req.body.dni
    );

    if(existingPaciente) {
        return res.status(400).json({
            message: 'DNI already exists.'
        })
    }

    pacientes.push(req.body);

    res.status(201).json(req.body);
});

router.put('/:dni', (req, res) => {
    if(!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            message: 'Paciente data or dni param mandatory'
        });
    }

    const pacienteIndex = pacientes.findIndex(
        paciente => paciente.dni === req.params.dni
    );

    if(pacienteIndex < 0) {
        return res.status(404).json({
            message: 'Paciente not found with that DNI'
        });
    }

    const { dni, ...updateData } = req.body;

    pacientes[pacienteIndex] = {
        ...pacientes[pacienteIndex],
        ...updateData
    };

    res.status(200).json(pacientes[pacienteIndex]);
});

router.delete('/:dni', (req, res) => {
    const pacienteIndex = pacientes.findIndex(
        paciente => paciente.dni === req.params.dni
    );

    if(pacienteIndex < 0) {
        return res.status(404).json({
            message: 'Paciente not found with that DNI'
        });
    }

    const [deletedPaciente] = pacientes.splice(pacienteIndex, 1);

    res.status(200).json(deletedPaciente);
});

export default router;