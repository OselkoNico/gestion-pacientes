import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FormularioPacientes from "./FormularioPacientes";
import { type Paciente } from "../services/pacientesService";


const PACIENTE: Paciente = {
    dni: "12345678Z",
    name: "Ana",
    surname: "Pérez",
    address: "C/ Mayor 1",
    city: "Madrid",
    postalCode: "28001",
    phone: "600123456"
};

afterEach(cleanup);

function montar(pacienteEditar: Paciente | null = null) {
    const guardarPaciente = vi.fn();
    const editarPaciente = vi.fn();
    const cancelarEdicion = vi.fn();

    render(
        <FormularioPacientes
            guardarPaciente={guardarPaciente}
            editarPaciente={editarPaciente}
            pacienteEditar={pacienteEditar}
            cancelarEdicion={cancelarEdicion}
            operacion={null}
        />
    );

    return { guardarPaciente, editarPaciente, cancelarEdicion };
}


async function rellenar(usuario: ReturnType<typeof userEvent.setup>) {
    await usuario.type(screen.getByLabelText("DNI"), PACIENTE.dni);
    await usuario.type(screen.getByLabelText("Nombre"), PACIENTE.name);
    await usuario.type(screen.getByLabelText("Apellidos"), PACIENTE.surname);
    await usuario.type(screen.getByLabelText("Dirección"), PACIENTE.address);
    await usuario.type(screen.getByLabelText("Localidad"), PACIENTE.city);
    await usuario.type(screen.getByLabelText("Código postal"), PACIENTE.postalCode);
    await usuario.type(screen.getByLabelText("Teléfono"), PACIENTE.phone);
}


describe("FormularioPacientes", () => {

    it("avisa si se envía vacío y no llama a la API", async () => {
        const usuario = userEvent.setup();
        const { guardarPaciente } = montar();

        await usuario.click(screen.getByRole("button", { name: "Guardar" }));

        screen.getByText("Todos los campos son obligatorios.");
        expect(guardarPaciente).not.toHaveBeenCalled();
    });


    it("envía el paciente y limpia el formulario", async () => {
        const usuario = userEvent.setup();
        const { guardarPaciente } = montar();

        await rellenar(usuario);
        await usuario.click(screen.getByRole("button", { name: "Guardar" }));

        expect(guardarPaciente).toHaveBeenCalledWith(PACIENTE);
        expect(screen.getByLabelText<HTMLInputElement>("DNI").value).toBe("");
    });


    it("en modo edición precarga los datos y bloquea el DNI", () => {
        montar(PACIENTE);

        const dni = screen.getByLabelText<HTMLInputElement>("DNI");

        expect(dni.value).toBe("12345678Z");
        expect(dni.disabled).toBe(true);
        screen.getByRole("button", { name: "Modificar paciente" });
    });


    it("al editar usa el DNI original aunque el campo cambie", async () => {
        const usuario = userEvent.setup();
        const { editarPaciente } = montar(PACIENTE);

        await usuario.type(screen.getByLabelText("DNI"), "00000000A");

        await usuario.clear(screen.getByLabelText("Localidad"));
        await usuario.type(screen.getByLabelText("Localidad"), "Barcelona");

        await usuario.click(
            screen.getByRole("button", { name: "Modificar paciente" })
        );

        expect(editarPaciente).toHaveBeenCalledWith("12345678Z", {
            name: "Ana",
            surname: "Pérez",
            address: "C/ Mayor 1",
            city: "Barcelona",
            postalCode: "28001",
            phone: "600123456"
        });
    });
});