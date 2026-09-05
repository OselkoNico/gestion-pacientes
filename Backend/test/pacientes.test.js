import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

let app;

beforeEach(async () => {
    vi.resetModules();
    app = (await import('../app.js')).default;
});


const PACIENTE = {
    dni: '12345678Z',
    name: 'Ana',
    surname: 'Pérez',
    address: 'C/ Mayor 1',
    city: 'Madrid',
    postalCode: '28001',
    phone: '600123456'
};


describe('GET /pacientes', () => {

    it('devuelve una lista vacía cuando no hay pacientes', async () => {
        const res = await request(app).get('/pacientes');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });


    it('devuelve los pacientes creados', async () => {
        await request(app).post('/pacientes').send(PACIENTE);

        const res = await request(app).get('/pacientes');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].dni).toBe('12345678Z');
    });
});


describe('GET /pacientes/:dni', () => {

    it('devuelve el paciente pedido', async () => {
        await request(app).post('/pacientes').send(PACIENTE);

        const res = await request(app).get('/pacientes/12345678Z');

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Ana');
    });


    it('devuelve 404 si el DNI no existe', async () => {
        const res = await request(app).get('/pacientes/99999999X');

        expect(res.status).toBe(404);
    });
});


describe('POST /pacientes', () => {

    it('crea un paciente y lo devuelve', async () => {
        const res = await request(app).post('/pacientes').send(PACIENTE);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(PACIENTE);
    });


    it('normaliza el DNI a mayúsculas', async () => {
        const res = await request(app)
            .post('/pacientes')
            .send({ ...PACIENTE, dni: '12345678z' });

        expect(res.status).toBe(201);
        expect(res.body.dni).toBe('12345678Z');
    });


    it('rechaza un paciente al que le faltan campos', async () => {
        const res = await request(app)
            .post('/pacientes')
            .send({ dni: '12345678Z' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('name');
    });


    it('rechaza un DNI con formato incorrecto', async () => {
        const res = await request(app)
            .post('/pacientes')
            .send({ ...PACIENTE, dni: 'ABC' });

        expect(res.status).toBe(400);
    });


    it('rechaza un teléfono que no tenga 9 dígitos', async () => {
        const res = await request(app)
            .post('/pacientes')
            .send({ ...PACIENTE, phone: '123' });

        expect(res.status).toBe(400);
    });


    it('descarta los campos que no forman parte del paciente', async () => {
        const res = await request(app)
            .post('/pacientes')
            .send({ ...PACIENTE, admin: true, rol: 'superusuario' });

        expect(res.status).toBe(201);
        expect(res.body).not.toHaveProperty('admin');
        expect(res.body).not.toHaveProperty('rol');
    });


    it('devuelve 409 si el DNI ya existe', async () => {
        await request(app).post('/pacientes').send(PACIENTE);

        const res = await request(app).post('/pacientes').send(PACIENTE);

        expect(res.status).toBe(409);
    });
});


describe('PUT /pacientes/:dni', () => {

    it('actualiza un paciente existente', async () => {
        await request(app).post('/pacientes').send(PACIENTE);

        const { dni, ...datos } = PACIENTE;

        const res = await request(app)
            .put('/pacientes/12345678Z')
            .send({ ...datos, city: 'Barcelona' });

        expect(res.status).toBe(200);
        expect(res.body.city).toBe('Barcelona');
        expect(res.body.dni).toBe('12345678Z');
    });


    it('devuelve 404 si el paciente no existe', async () => {
        const { dni, ...datos } = PACIENTE;

        const res = await request(app).put('/pacientes/99999999X').send(datos);

        expect(res.status).toBe(404);
    });


    it('rechaza datos inválidos', async () => {
        await request(app).post('/pacientes').send(PACIENTE);

        const { dni, ...datos } = PACIENTE;

        const res = await request(app)
            .put('/pacientes/12345678Z')
            .send({ ...datos, postalCode: 'no-valido' });

        expect(res.status).toBe(400);
    });
});


describe('DELETE /pacientes/:dni', () => {

    it('elimina el paciente y lo quita de la lista', async () => {
        await request(app).post('/pacientes').send(PACIENTE);

        const res = await request(app).delete('/pacientes/12345678Z');

        expect(res.status).toBe(200);
        expect(res.body.dni).toBe('12345678Z');

        const lista = await request(app).get('/pacientes');
        expect(lista.body).toEqual([]);
    });


    it('devuelve 404 si el paciente no existe', async () => {
        const res = await request(app).delete('/pacientes/99999999X');

        expect(res.status).toBe(404);
    });
});


describe('rutas desconocidas', () => {

    it('devuelve 404 con un mensaje en JSON', async () => {
        const res = await request(app).get('/no-existe');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Incorrect route or params.');
    });
});