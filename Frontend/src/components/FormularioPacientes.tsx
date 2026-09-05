import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { ApiError, type Paciente } from "../services/pacientesService";

interface FormularioPacientesProps {
    guardarPaciente: (paciente: Paciente) => Promise<void>;
}

export default function FormularioPacientes({ guardarPaciente }: FormularioPacientesProps) {

    const [paciente, setPaciente] = useState<Paciente>({
        dni: "",
        name: "",
        surname: "",
        address: "",
        city: "",
        postalCode: "",
        phone: ""
    });

    const [error, setError] = useState("");

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setPaciente({
            ...paciente,
            [e.target.name]: e.target.value
        });

        setError("")
    }

    async function handleSave(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        if(
            !paciente.dni ||
            !paciente.name ||
            !paciente.surname ||
            !paciente.address ||
            !paciente.city ||
            !paciente.postalCode ||
            !paciente.phone
        ) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        try {
            await guardarPaciente(paciente);

            setPaciente({
                dni: "",
                name: "",
                surname: "",
                address: "",
                city: "",
                postalCode: "",
                phone: ""
            });

            setError("");
        } catch(error) {
            if(error instanceof ApiError) {
                setError(error.message);
            } else {
                setError("Ha ocurrido un error inesperado.")
            }
        }}

    return(
        <form onSubmit={handleSave}>
            <label htmlFor="dni">DNI</label>
            <input 
                id="dni" 
                type="text" 
                name="dni" 
                value={paciente.dni} 
                onChange={handleChange} />

            <label htmlFor="name">Nombre</label>
            <input 
                id="name" 
                type="text" 
                name="name" 
                value={paciente.name} 
                onChange={handleChange} />

            <label htmlFor="surname">Apellidos</label>
            <input 
                id="surname" 
                type="text" 
                name="surname" 
                value={paciente.surname} 
                onChange={handleChange} />

            <label htmlFor="address">Dirección</label>
            <input 
                id="address" 
                type="text" 
                name="address" 
                value={paciente.address} 
                onChange={handleChange} />

            <label htmlFor="city">Localidad</label>
            <input 
                id="city" 
                type="text" 
                name="city" 
                value={paciente.city} 
                onChange={handleChange} />

            <label htmlFor="postalCode">Código postal</label>
            <input 
                id="postalCode" 
                type="text" 
                name="postalCode" 
                value={paciente.postalCode} 
                onChange={handleChange} />

            <label htmlFor="phone">Teléfono</label>
            <input 
                id="phone" 
                type="text" 
                name="phone" 
                value={paciente.phone} 
                onChange={handleChange} />

            {error && <p className="error">{error}</p>}

            <button type="submit">Guardar</button>
        </form>
    );
}