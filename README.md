# Higia V

Este proyecto está basado en React y Firebase. Requiere una cuenta activa en Firebase para funcionar correctamente. Asegúrate de configurar tu proyecto de Firebase y obtener las credenciales necesarias.

## Estado del Proyecto

Este proyecto está en desarrollo. Algunas características pueden no estar completamente implementadas o pueden cambiar en futuras versiones.

## Descripción

Higia V es una herramienta básica para la esterilización y desinfección de instrumental y equipos médicos. Proporciona una solución eficiente y segura para mantener los estándares de higiene en entornos médicos.

## Características

1. **Control de Loncheras o Clientes**: Gestiona los inventarios de material para esterilizar de diferentes clientes, incluyendo instrumental y equipo biomédico. Cada cliente puede tener su propio inventario personalizado.
2. **Control de Procesos**: Ofrece una descripción detallada de cada proceso de esterilización, incluyendo tiempos, temperaturas y métodos utilizados. Facilita el seguimiento y la documentación de cada proceso.
3. **Control de Rutas de Procesos**: Gestiona y optimiza las rutas de los procesos de esterilización, asegurando que cada paso se realice en el orden correcto y de manera eficiente.
4. **Control de Inventario de Equipos Biomédicos**: Lleva un registro detallado de los equipos biomédicos disponibles, su estado y sus usos. Facilita la gestión del mantenimiento y la disponibilidad de los equipos.
5. **Control de Cargas y Ciclos de Esterilización**: Monitorea y registra las cargas y los ciclos de esterilización, incluyendo los controles químicos y microbiológicos necesarios para asegurar la efectividad del proceso y la seguridad del instrumental.
6. **Control de Usuarios**: Administra los usuarios que tienen acceso a la herramienta, asignando roles y permisos específicos para cada uno. Permite la creación, edición y eliminación de usuarios, así como la gestión de sus credenciales de acceso.
7. **Control de Archivos de las Cargas**: Gestiona y almacena los archivos relacionados con las cargas de esterilización, incluyendo reportes, certificados y registros de control. Facilita el acceso y la consulta de estos documentos para auditorías y verificaciones.

## Instalación

Para instalar Higia V, sigue estos pasos:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Chriscc097/higia-v
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd higia-v
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Configura Firebase con los siguientes servicios: Firestore, Storage, Hosting, Authentication, y Functions. Asegúrate de seguir la documentación oficial de Firebase para cada uno de estos servicios.
   ```bash
   npm install -g firebase-tools
   npm install firebase
   ```
5. Crea un archivo `keys.js` en la carpeta `config` con la configuración de Firebase. Puedes usar `keys-example.js` como referencia. El archivo debe tener la siguiente estructura:
   ```javascript
   const firebaseConfig = {
        apiKey: "<YOUR_API_KEY>",
        authDomain: "<YOUR_AUTH_DOMAIN>",
        projectId: "<YOUR_PROJECT_ID>",
        storageBucket: "<STORAGE_BUCKET>",
        messagingSenderId: "<YOUR_MESSAGING_SENDER_ID>",
        appId: "<YOUR_APP_ID>",
        measurementId: "<YOUR_MEASUREMENT_ID>"
   };

   export { firebaseConfig };
   ```

## Uso

Para iniciar la aplicación, ejecuta el siguiente comando:
```bash
npm start
```

## Contribuir

Si deseas contribuir a Higia V, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit (`git commit -am 'Añadir nueva funcionalidad'`).
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Para más información, puedes contactarme en [christianrcardenas@icloud.com](mailto:christianrcardenas@icloud.com).
