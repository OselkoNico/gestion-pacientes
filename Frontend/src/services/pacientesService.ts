import axios from "axios";

export interface Paciente {
  dni: string; name: string; surname: string;
  address: string; city: string; postalCode: string; phone: string;
}

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  timeout: 10_000,
});

function manejarError(error: unknown): never {
  if (axios.isCancel(error)) throw error;
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response) {
      throw new ApiError(
        error.response.data?.message ?? "Error del servidor.",
        error.response.status,
        { cause: error }
      );
    }
    throw new ApiError("No se pudo conectar con el servidor.", undefined, { cause: error });
  }
  throw new ApiError("Algo ha fallado.", undefined, { cause: error });
}

api.interceptors.response.use(r => r, manejarError);

export async function obtenerPacientes(signal?: AbortSignal) {
  const { data } = await api.get<Paciente[]>("/pacientes", { signal });
  return data;
}

export async function obtenerPaciente(dni: string, signal?: AbortSignal) {
  const { data } = await api.get<Paciente>(`/pacientes/${dni}`, { signal });
  return data;
}

export async function crearPaciente(paciente: Paciente) {
  const { data } = await api.post<Paciente>("/pacientes", paciente);
  return data;
}

export async function modificarPaciente(dni: string, paciente: Omit<Paciente, "dni">) {
  const { data } = await api.put<Paciente>(`/pacientes/${dni}`, paciente);
  return data;
}

export async function eliminarPaciente(dni: string) {
  const { data } = await api.delete<Paciente>(`/pacientes/${dni}`);
  return data;
}