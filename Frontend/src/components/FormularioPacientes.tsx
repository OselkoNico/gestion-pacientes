import {
    useState,
    useEffect,
    type ChangeEvent,
    type SubmitEvent
} from "react";

import {
    ApiError,
    type Paciente
} from "../services/pacientesService";


interface FormularioPacientesProps {
    guardarPaciente: (paciente: Paciente) => void | Promise<void>;

    editarPaciente: (
        dni: string,
        paciente: Omit<Paciente, "dni">
    ) => Promise<void>;

    pacienteEditar: Paciente | null;

    cancelarEdicion: () => void;

    operacion: "creando" | "editando" | "eliminando" | null;
}


export default function FormularioPacientes({
    guardarPaciente,
    editarPaciente,
    pacienteEditar,
    cancelarEdicion,
    operacion
}: FormularioPacientesProps) {

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


    useEffect(() => {

        if (pacienteEditar) {
            setPaciente(pacienteEditar);
        }

    }, [pacienteEditar]);


    function handleChange(e: ChangeEvent<HTMLInputElement>) {

        setPaciente({
            ...paciente,
            [e.target.name]: e.target.value
        });

        setError("");
    }


    async function handleSave(e: SubmitEvent<HTMLFormElement>) {

        e.preventDefault();


        if (
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


        setError("");


        try {

            if (pacienteEditar) {

                const { dni: _dni, ...datosPaciente } = paciente;

                await editarPaciente(pacienteEditar.dni, datosPaciente);

            } else {

                await guardarPaciente(paciente);
            }


            setPaciente({
                dni: "",
                name: "",
                surname: "",
                address: "",
                city: "",
                postalCode: "",
                phone: ""
            });

            cancelarEdicion();


        } catch (error) {

            if (error instanceof ApiError) {

                setError(error.message);

            } else {

                setError("Ha ocurrido un error inesperado.");
            }
        }
    }


    return (
        <form onSubmit={handleSave}>

            <label htmlFor="dni">
                DNI
            </label>

            <input
                id="dni"
                type="text"
                name="dni"
                value={paciente.dni}
                onChange={handleChange}
                disabled={pacienteEditar !== null}
            />


            <label htmlFor="name">
                Nombre
            </label>

            <input
                id="name"
                type="text"
                name="name"
                value={paciente.name}
                onChange={handleChange}
            />


            <label htmlFor="surname">
                Apellidos
            </label>

            <input
                id="surname"
                type="text"
                name="surname"
                value={paciente.surname}
                onChange={handleChange}
            />


            <label htmlFor="address">
                Dirección
            </label>

            <input
                id="address"
                type="text"
                name="address"
                value={paciente.address}
                onChange={handleChange}
            />


            <label htmlFor="city">
                Localidad
            </label>

            <input
                id="city"
                type="text"
                name="city"
                value={paciente.city}
                onChange={handleChange}
            />


            <label htmlFor="postalCode">
                Código postal
            </label>

            <input
                id="postalCode"
                type="text"
                name="postalCode"
                value={paciente.postalCode}
                onChange={handleChange}
            />


            <label htmlFor="phone">
                Teléfono
            </label>

            <input
                id="phone"
                type="text"
                name="phone"
                value={paciente.phone}
                onChange={handleChange}
            />


            {error && (
                <p className="error">
                    {error}
                </p>
            )}


            <button
                type="submit"
                disabled={operacion !== null}
            >
                {operacion === "creando"
                    ? "Guardando..."
                    : operacion === "editando"
                        ? "Modificando..."
                        : pacienteEditar
                            ? "Modificar paciente"
                            : "Guardar"
                }
            </button>

            {pacienteEditar && (
                <button
                    type="button"
                    onClick={cancelarEdicion}
                >
                    Cancelar
                </button>
            )}

        </form>
    );
}