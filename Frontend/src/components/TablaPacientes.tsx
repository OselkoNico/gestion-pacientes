import { useState, useEffect } from "react";
import { obtenerPacientes, ApiError, type Paciente } from "../services/pacientesService";

export default function TablaPacientes() {
    
    const[pacientes, setPacientes] = useState<Paciente[]>([]);

    const[error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function cargarPacientes() {
            try {
                const datos = await obtenerPacientes();
                setPacientes(datos);
            } catch (error) {
                if (error instanceof ApiError) {
                    setError(error.message);
                }
            }
        }
        cargarPacientes();
    }, []);

    return(
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
                {pacientes.map((paciente) => (
                    <tr key={paciente.dni}>
                        <td>{paciente.dni}</td>
                        <td>{paciente.name}</td>
                        <td>{paciente.surname}</td>
                        <td>{paciente.address}</td>
                        <td>{paciente.city}</td>
                        <td>{paciente.postalCode}</td>
                        <td>{paciente.phone}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}