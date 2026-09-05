import TablaPacientes from "./components/TablaPacientes";
import FormularioPacientes from "./components/FormularioPacientes";
import { usePacientes } from "./hooks/usePacientes";
import { useState } from "react";
import { type Paciente } from "./services/pacientesService";
import "./App.css";

function App() {

    const {
        pacientes,
        loading,
        operacion,
        error,
        guardarPaciente,
        borrarPaciente,
        editarPaciente
    } = usePacientes();

    const [pacienteEditar, setPacienteEditar] = useState<Paciente | null>(null);

    function seleccionarPaciente(paciente: Paciente) {
        setPacienteEditar(paciente);
    }

    function cancelarEdicion() {
        setPacienteEditar(null);
    }

    return (
    <div className="app">

        <h1>Gestión de pacientes</h1>

        <FormularioPacientes
            guardarPaciente={guardarPaciente}
            editarPaciente={editarPaciente}
            pacienteEditar={pacienteEditar}
            cancelarEdicion={cancelarEdicion}
            operacion={operacion}
        />

        {loading ? (
            <p>Cargando los pacientes...</p>
        ) : error ? (
            <p className="error">{error}</p>
        ) : (
            <TablaPacientes
                pacientes={pacientes}
                borrarPaciente={borrarPaciente}
                seleccionarPaciente={seleccionarPaciente}
                operacion={operacion}
            />
        )}

    </div>
    );
}

export default App;