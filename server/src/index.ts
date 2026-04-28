import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/configDev';
import { inicializarDatos } from './config/initialSetup';
import authRoutes from './routes/authRoutes';
import clienteRoutes from './routes/clienteRoutes';
import trabajadorRoutes from './routes/trabajadorRoutes';
import proyectoRoutes from './routes/proyectoRoutes';
import productoRoutes from './routes/productoRoutes';
import inventarioRoutes from './routes/inventarioRoutes';
import { errorHandler } from './handlers/errorHandler';
import { env } from './config/configEnv';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api', clienteRoutes);
app.use('/api', trabajadorRoutes);
app.use('/api', proyectoRoutes);
app.use('/api', productoRoutes);
app.use('/api', inventarioRoutes);

// Manejo global de errores (debe ir al final)
app.use(errorHandler);

// Conectar a la BD y levantar el servidor
AppDataSource.initialize()
  .then(async () => {
    console.log('Conectado a la base de datos');
    await inicializarDatos();

    app.listen(env.PORT, () => {
      console.log(`Servidor corriendo en http://${env.HOST}:${env.PORT}`);
      console.log(`API disponible en http://${env.HOST}:${env.PORT}/api`);
    });
  })
  .catch(error => {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1);
  });
