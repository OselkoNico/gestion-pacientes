import express from 'express';
const router = express.Router();

const pacientes = [];

const CAMPOS = ['name', 'surname', 'address', 'city', 'postalCode', 'phone'];

function esTexto(valor) {
    return typeof valor === 'string' && valor.trim() !== '';
}

function validarPaciente(body, {conDni}) {
    const errores = [];
    const datos = {};

    if(conDni) {
        if(!esTexto(body?.dni)) {
            errores.push('El DNI es obligatorio.');
        } else if (!/^\d{8}[A-Za-z]$/.test(body.dni.trim())) {
            errores.push('El DNI debe tener 8 números y una letra.');
        } else {
            datos.dni = body.dni.trim().toUpperCase();
        }
    }

    for(const campo of CAMPOS) {
        if(!esTexto(body?.[campo])) {
            errores.push(`El campo "${campo}" es obligatorio.`);
        } else {
            datos[campo] = body[campo].trim();
        }
    }

    if(datos.postalCode && !/^\d{5}$/.test(datos.postalCode)) {
        errores.push('El código postal debe tener 5 números');
    }

    if(datos.phone && !/^\d{9}$/.test(datos.phone)) {
        errores.push('El teléfono debe tener 9 números.')
    }

    return { datos, errores };
}

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
    const { datos, errores } = validarPaciente(req.body, { conDni: true });

    if(errores.length > 0) {
        return res.status(400).json({ message: errores.join(' ') });
    }

    const existingPaciente = pacientes.find(
        paciente => paciente.dni === datos.dni
    );

    if(existingPaciente) {
        return res.status(409).json({ message: 'Ya existe un paciente con ese DNI.' });
    }

    pacientes.push(datos);

    res.status(201).json(datos);
});

router.put('/:dni', (req, res) => {
    const { datos, errores } = validarPaciente(req.body, { conDni: false });

    if(errores.length > 0) {
        return res.status(400).json({ message: errores.join(' ') });
    }

    const pacienteIndex = pacientes.findIndex(
        paciente => paciente.dni === req.params.dni
    );

    if(pacienteIndex < 0) {
        return res.status(404).json({
            message: 'Paciente not found with that DNI'
        });
    }

    pacientes[pacienteIndex] = {
        ...pacientes[pacienteIndex],
        ...datos
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