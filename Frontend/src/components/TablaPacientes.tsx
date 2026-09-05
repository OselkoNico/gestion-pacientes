import { useState, useEffect } from "react";
import { obtenerPacientes, ApiError, type Paciente } from "../services/pacientesService";

export default function TablaPacientes() {
    
    const[pacientes, setPacientes] = useState<Paciente[]>([]);

    const[error, setError] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

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
                setLoading(false)
            }
        }
        cargarPacientes();
    }, []);

    return(
    <>
        {loading ? (
            "Cargando los pacientes..."
        ): error ? (
            <p>{error}</p>
        ) : (
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
                    </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={7}>
                            No hay pacientes registrados.
                        </td>
                    </tr>
                    )}
            </tbody>
        </table>
        )}
    </>
    )
}