import { useEffect, useState } from "react";

import {
    obtenerPacientes,
    crearPaciente,
    ApiError,
    type Paciente,
    eliminarPaciente,
    modificarPaciente
} from "../services/pacientesService";


export function usePacientes() {

    const [pacientes, setPacientes] = useState<Paciente[]>([]);

    const [loading, setLoading] = useState(true);

    const [operacion, setOperacion] = useState<"creando" | "editando" | "eliminando" | null>(null);

    const [error, setError] = useState<string | null>(null);


    useEffect(() => {

        async function cargarPacientes() {

            try {

                const datos = await obtenerPacientes();

                setPacientes(datos);

            } catch (error) {

                if (error instanceof ApiError) {
                    setError(error.message);
                }

            } finally {

                setLoading(false);

            }
        }

        cargarPacientes();

    }, []);


    async function guardarPaciente(paciente: Paciente) {

        setOperacion("creando");

        try {

            const nuevoPaciente = await crearPaciente(paciente);

            setPacientes(prev => [
                ...prev,
                nuevoPaciente
            ]);

        } finally {

            setOperacion(null);

        }
    }


    async function borrarPaciente(dni: string) {

        setOperacion("eliminando");

        try {

            await eliminarPaciente(dni);

            setPacientes(prev =>
                prev.filter(
                    paciente => paciente.dni !== dni
                )
            );

        } finally {

            setOperacion(null);

        }
    }


    async function editarPaciente(
        dni: string,
        paciente: Omit<Paciente, "dni">
    ) {

        setOperacion("editando");

        try {

            const pacienteActualizado =
                await modificarPaciente(dni, paciente);

            setPacientes(prev =>
                prev.map(p =>
                    p.dni === dni
                        ? pacienteActualizado
                        : p
                )
            );

        } finally {

            setOperacion(null);

        }
    }


    return {
        pacientes,
        loading,
        operacion,
        error,
        guardarPaciente,
        borrarPaciente,
        editarPaciente
    };
}