import dotenv from 'dotenv';
dotenv.config();

function obtenerVar(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno: ${nombre}`);
  return valor;
}

export const env = {
  HOST: process.env.HOST || 'localhost',
  PORT: parseInt(process.env.PORT || '3001'),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_USERNAME: obtenerVar('DB_USERNAME'),
  DB_PASSWORD: obtenerVar('DB_PASSWORD'),
  DATABASE: obtenerVar('DATABASE'),
  JWT_SECRET: obtenerVar('JWT_SECRET')
};
