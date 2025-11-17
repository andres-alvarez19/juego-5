# Informe de Funcionamiento del Sistema de Token y Consumo de API

## 1. Contexto General

El sistema de autenticación mediante *token* es el mecanismo a través del cual el juego desarrollado con Phaser se comunica de forma segura con los servicios externos de **Ufro GameLab**. Dicho sistema garantiza que todas las operaciones que involucren usuarios (por ejemplo, el registro de tiempo de juego o la actualización de puntajes) estén asociadas a una cuenta autenticada dentro de la plataforma.

En este esquema, el juego **no maneja usuarios directamente**, sino que **recibe la identidad autenticada** de la sesión iniciada en Ufro GameLab. Esa identidad se transmite a través de un **token de acceso (Bearer token)**, emitido y validado exclusivamente por los servidores del GameLab.

---

## 2. Concepto de Token (Bearer Token)

Un **Bearer token** es una credencial digital emitida por el backend de Ufro GameLab cuando un usuario inicia sesión. Este token funciona como un comprobante de autenticidad que el cliente (en este caso, el juego) adjunta en cada petición a la API.

El término *Bearer* proviene del encabezado HTTP estándar:

```
Authorization: Bearer <token>
```

Este encabezado indica que quien posee el token (*the bearer*) tiene permiso para realizar las operaciones autorizadas por el servidor hasta que dicho token expire.

---

## 3. Flujo de Autenticación e Integración

1. **Inicio de sesión en Ufro GameLab**  
   El usuario accede al portal de Ufro GameLab, se autentica y el sistema genera un token JWT firmado criptográficamente.

2. **Apertura del juego**  
   Desde la biblioteca del usuario, el portal abre el juego dentro de una nueva pestaña o un entorno embebido (iframe). En este punto, el usuario ya está autenticado dentro de la sesión del GameLab.

3. **Transferencia del token al juego**  
   Ufro GameLab transmite el token al juego utilizando un canal seguro de comunicación del navegador, conocido como `postMessage`. Este mecanismo permite enviar datos entre diferentes orígenes (por ejemplo, entre el dominio del GameLab y el del juego) de manera controlada y validada.

4. **Almacenamiento temporal del token**  
   El juego recibe el token y lo almacena **en memoria**, sin persistirlo en el disco ni en el almacenamiento local del navegador. Esta decisión busca maximizar la seguridad: si el jugador cierra o recarga el juego, el token desaparece y debe ser reenviado por el portal en una nueva sesión.

5. **Uso del token en las peticiones**  
   Cada vez que el juego realiza una petición a la API del GameLab (por ejemplo, actualizar tiempo de sesión o consultar el ranking), incluye el token en el encabezado `Authorization`. El servidor valida el token y, si es válido, autoriza la operación.

6. **Renovación automática**  
   Si el token expira o el servidor devuelve un código `401 Unauthorized`, el juego solicita nuevamente un token al portal mediante el mismo canal de comunicación (`postMessage`).

---

## 4. Roles y Responsabilidades

| Componente | Rol Principal | Responsabilidad |
|-------------|----------------|-----------------|
| **Ufro GameLab (Backend)** | Autoridad de autenticación | Emitir y validar los tokens JWT; asociar cada token a una cuenta de usuario. |
| **Portal Ufro GameLab (Frontend)** | Intermediario de sesión | Proveer el token al juego y responder solicitudes de renovación. |
| **Juego Phaser (Cliente)** | Consumidor de API | Recibir, mantener temporalmente y usar el token para enviar datos autenticados. |
| **API de Ufro GameLab** | Receptor de datos de juego | Validar el token y procesar operaciones (actualizar sesión, registrar puntaje, obtener ranking). |

---

## 5. Seguridad del Sistema

El diseño está basado en estándares comunes de seguridad web (OAuth 2.0, JWT, CORS controlado) y se apoya en las siguientes prácticas:

- **Transmisión segura:** todo el tráfico ocurre bajo HTTPS.
- **No persistencia del token:** el token solo existe en memoria durante la sesión de juego.
- **Validación de origen:** el juego solo acepta mensajes provenientes del dominio oficial de Ufro GameLab.
- **Expiración programada:** los tokens tienen una vida limitada; el backend fuerza la renovación periódica.
- **No acceso desde código externo:** el token no se almacena en `localStorage` ni se imprime en consola o logs.

---

## 6. Flujo de Comunicación con la API

1. **Actualización de sesión:**  
   El juego informa a la API el tiempo total jugado y la puntuación obtenida a través del endpoint:
   
   ```
   PUT /collection/my-games/{gameId}/session-update
   Authorization: Bearer <token>
   ```

2. **Consulta de leaderboard:**  
   El juego obtiene la clasificación global de jugadores mediante:
   
   ```
   GET /collection/leaderboards/{gameId}
   Authorization: Bearer <token>
   ```

3. **Validación en backend:**  
   Cada petición es autenticada en los servidores del GameLab, donde se verifica la firma criptográfica del token, su vigencia (`exp`) y su asociación con el usuario.

---

## 7. Beneficios del Modelo

- **Seguridad:** el token no puede ser reutilizado fuera del contexto del portal.
- **Escalabilidad:** el backend no mantiene sesiones abiertas, sino que valida tokens firmados.
- **Aislamiento:** los juegos no tienen acceso a las credenciales ni a los datos sensibles de los usuarios.
- **Integración simple:** cualquier nuevo juego en la plataforma puede adoptar el mismo flujo sin modificaciones al backend.

---

## 8. Conclusión

El sistema de autenticación mediante *Bearer token* garantiza una integración segura y estandarizada entre los juegos alojados en la plataforma Ufro GameLab y sus servicios de backend.

El juego funciona como un cliente autenticado temporal: no crea ni almacena credenciales propias, sino que actúa en representación del usuario autenticado en el portal, manteniendo la trazabilidad de las acciones y la protección de la información del jugador.

