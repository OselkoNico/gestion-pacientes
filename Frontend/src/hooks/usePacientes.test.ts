import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import { usePacientes } from "./usePacientes";

import {
    obtenerPacientes,
    crearPaciente,
    eliminarPaciente,
    modificarPaciente,
    ApiError
} from "../services/pacientesService";

vi.mock("../services/pacientesService", async (importOriginal) => {
    const original = await importOriginal<
        typeof import("../services/pacientesService")
    >();

    return {
        ...original,
        obtenerPacientes: vi.fn(),
        crearPaciente: vi.fn(),
        eliminarPaciente: vi.fn(),
        modificarPaciente: vi.fn()
    };
});


const PACIENTE = {
    dni: "12345678Z",
    name: "Ana",
    surname: "Pérez",
    address: "C/ Mayor 1",
    city: "Madrid",
    postalCode: "28001",
    phone: "600123456"
};


beforeEach(() => {
    vi.mocked(obtenerPacientes).mockResolvedValue([]);
    vi.mocked(crearPaciente).mockReset();
    vi.mocked(eliminarPaciente).mockReset();
    vi.mocked(modificarPaciente).mockReset();
});


describe("usePacientes", () => {

    it("carga los pacientes al montarse", async () => {
        vi.mocked(obtenerPacientes).mockResolvedValue([PACIENTE]);

        const { result } = renderHook(() => usePacientes());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.pacientes).toEqual([PACIENTE]);
        expect(result.current.error).toBeNull();
    });


    it("guarda el mensaje si la carga falla", async () => {
        vi.mocked(obtenerPacientes).mockRejectedValue(
            new ApiError("No se pudo conectar con el servidor.")
        );

        const { result } = renderHook(() => usePacientes());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe("No se pudo conectar con el servidor.");
        expect(result.current.pacientes).toEqual([]);
    });


    it("muestra un mensaje genérico ante un error inesperado", async () => {
        vi.mocked(obtenerPacientes).mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => usePacientes());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe("Ha ocurrido un error inesperado.");
    });


    it("añade a la lista el paciente que devuelve el servidor", async () => {
        vi.mocked(crearPaciente).mockResolvedValue(PACIENTE);

        const { result } = renderHook(() => usePacientes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.guardarPaciente({ ...PACIENTE, dni: "12345678z" });
        });

        expect(result.current.pacientes).toEqual([PACIENTE]);
        expect(result.current.operacion).toBeNull();
    });


    it("quita de la lista el paciente borrado", async () => {
        vi.mocked(obtenerPacientes).mockResolvedValue([PACIENTE]);
        vi.mocked(eliminarPaciente).mockResolvedValue(PACIENTE);

        const { result } = renderHook(() => usePacientes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.borrarPaciente("12345678Z");
        });

        expect(result.current.pacientes).toEqual([]);
    });


    it("reemplaza el paciente editado", async () => {
        const actualizado = { ...PACIENTE, city: "Barcelona" };

        vi.mocked(obtenerPacientes).mockResolvedValue([PACIENTE]);
        vi.mocked(modificarPaciente).mockResolvedValue(actualizado);

        const { result } = renderHook(() => usePacientes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        const { dni: _dni, ...datos } = actualizado;

        await act(async () => {
            await result.current.editarPaciente("12345678Z", datos);
        });

        expect(result.current.pacientes).toEqual([actualizado]);
    });


    it("deja el estado limpio si falla el borrado", async () => {
        vi.mocked(obtenerPacientes).mockResolvedValue([PACIENTE]);
        vi.mocked(eliminarPaciente).mockRejectedValue(new ApiError("Error"));

        const { result } = renderHook(() => usePacientes());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await expect(
                result.current.borrarPaciente("12345678Z")
            ).rejects.toThrow();
        });

        expect(result.current.operacion).toBeNull();
        expect(result.current.pacientes).toEqual([PACIENTE]);
    });
});