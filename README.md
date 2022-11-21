# **Queryable Encryption**

Este proyecto es una implementación de la nueva funcionalidad que lanzó MongoDB respecto a [Queryable Encryption](https://www.mongodb.com/blog/post/mongodb-releases-queryable-encryption-preview) con el fin de agregar una capa de seguridad a las aplicaciones que se construyen hoy en día. Para leer más al respecto ir a la documentación oficial o bien, leer [documentación](https://uninorte-my.sharepoint.com/:b:/g/personal/jwalvarez_uninorte_edu_co1/Efas6JyIjOpFu8S8poYRh54BQ441FG6B9yIYphNH2_82IQ?e=7P6Q3o) por parte de nuestro equipo.

## Preparación 🚀

Para llevar a cabo la ejecución de este proyecto se requiere completar los siguientes puntos

- [ ] Cluster dedicado en MongoAtlas con MongoDB versión 6 o superior
  _De aqui sacaremos el String de conexión para añadirlo a nuestra implementación_
- [ ] Crear base de datos ‘**userRecords**’ y las colecciones ‘**userRecords.transactions**’ y ‘**userRecords.users**’
- [ ] Instalar dependencias para Mongo Encryption en el proyecto: ‘mongodb’ y ‘mongodb-client-encryption’
  _NOTA: Tambien se debe tener descargado el paquete ‘[crypt_shared](https://www.mongodb.com/try/download/enterprise)’ (ya se encuentra incluido en el proyecto)_
- [ ] [Insomnia](https://insomnia.rest/download) para hacer CRUD + [JSON con las request principales](https://uninorte-my.sharepoint.com/:u:/g/personal/jwalvarez_uninorte_edu_co1/EbBVkYxTZyNFoa6AoI0gK_oBqC71_dw5QBw8W5NsAxLvfg?e=bMLzD4)

## Puesta en marcha 💥

Una vez clonado el repo, se procede a ejecutar los siguientes comandos:

```bash
# instalar dependencias de node
npm i

# ejecutar el proyecto (inicialización con mongoDB y puesta en marcha del server
npm run start
```

Con esto tendremos el server conectado a mongoDB a la espera de peticiones por parte del cliente.

### Demostración 🧪

Para revisar el correcto funcionamiento de esta implementación se trabajó con [Insomnia](https://insomnia.rest/download), así podremos crear, actualizar, eliminar y obtener información de los usuarios y transacciones.

Así mismo, se desarrolló una pequeña [app en Flutter](https://transfibank.netlify.app/#login) (~~esta app no está funcinoal en web~~) con la cual podremos interacturar con este backend, demostrando un area en el cual se puede emplear esta funcionalidad de mongoDB.

![App demo flutter](demo.gif)
