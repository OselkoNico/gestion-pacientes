import { useState } from "react";
import { ApiError, type Paciente } from "../services/pacientesService";

interface TablaPacientesProps {
    pacientes: Paciente[];
    borrarPaciente: (dni: string) => Promise<void>;
    seleccionarPaciente: (paciente: Paciente) => void;
    operacion: "creando" | "editando" | "eliminando" | null;
}

export default function TablaPacientes({ pacientes, borrarPaciente, seleccionarPaciente, operacion }: TablaPacientesProps) {

    const [error, setError] = useState<string | null>(null);

    const [eliminandoDni, setEliminandoDni] = useState<string | null>(null);

    async function handleDelete(dni: string) {
        const confirmar = window.confirm(
            "¿Estás seguro de que quieres eliminar este paciente?"
        );

        if(!confirmar) {
            return;
        }

        setError(null);
        setEliminandoDni(dni);

        try {
            await borrarPaciente(dni);
        } catch(error) {
            if(error instanceof ApiError) {
                setError(error.message);
            } else {
                setError("Ha ocurrido un error inesperado.")
            }
        } finally {
            setEliminandoDni(null);
        }
    }

    return (
        <>
        {error && <p className="error">{error}</p>}
        <table>
            <thead>
                <tr>
                    <th>DNI</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Dirección</th>
                    <th>Localidad</th>
                    <th>Código postal</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {pacientes.length > 0 ? (
                    pacientes.map((paciente) => (
                        <tr key={paciente.dni}>
                            <td>{paciente.dni}</td>
                            <td>{paciente.name}</td>
                            <td>{paciente.surname}</td>
                            <td>{paciente.address}</td>
                            <td>{paciente.city}</td>
                            <td>{paciente.postalCode}</td>
                            <td>{paciente.phone}</td>

                            <td>
                                <button
                                    onClick={() => seleccionarPaciente(paciente)}
                                    disabled={operacion !== null}
                                >
                                    Modificar
                                </button>

                                <button
                                    onClick={() => handleDelete(paciente.dni)}
                                    disabled={operacion !== null}
                                >
                                    {eliminandoDni === paciente.dni
                                        ? "Eliminando..."
                                        : "Eliminar"
                                    }
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={8}>
                            No hay pacientes registrados.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
        </>
    );
}