# Informe de pruebas de integración y servicios

Este documento resume las pruebas automatizadas agregadas al proyecto para
validar la capa de integración con la API de Ufro GameLab, incluyendo manejo de
tokens, consumo de endpoints y flujos extremo a extremo.

## Cobertura de pruebas

- **Servicios de integración**
  - `tests/unit/integration/LeaderboardsService.spec.ts` comprueba que
    `LeaderboardsService.getLeaderboard` construye la ruta
    `/collection/leaderboards/{gameId}` con el `limit` codificado y ejecuta una
    petición `GET` autenticada.
  - `tests/unit/integration/SessionService.spec.ts` valida que
    `SessionService.updateSession` realice el `PUT` a
    `/collection/my-games/{gameId}/session-update` con `Content-Type: application/json`
    y el cuerpo serializado, respetando el contrato de `SessionUpdatePayload`.

- **Cliente HTTP**
  - `tests/unit/integration/ApiClient.spec.ts` garantiza que se adjunte el
    encabezado `Authorization`, que los códigos `401`, `429` y los errores
    `5xx` se manejen con reintentos, y que se solicite una renovación de token
    solo una vez cuando el portal responde a la petición de refresco.

- **Gestión de sesión runtime**
  - `tests/unit/runtime/SessionManager.spec.ts` valida la acumulación de tiempo,
    el envío de heartbeats con `sendBeacon` y la inclusión del token en el
    payload cuando es necesario.

- **Flujos extremo a extremo (E2E)**
  - `tests/integration/postmessage_handshake.spec.ts` contiene dos escenarios:
    1. Handshake exitoso desde `postMessage` hasta las llamadas `GET` y `PUT`
       utilizando el mismo token en memoria.
    2. Reintento automático tras un `401`, donde `AuthProvider` solicita un
       nuevo token al portal y `ApiClient` repite la petición con las cabeceras
       correctas.

## Cómo muestran el cumplimiento de requisitos

1. **Token en memoria y handshake seguro**
   - Las pruebas E2E verifican que `AuthProvider` sólo acepta mensajes del
     `origin` permitido y que distribuye el token en memoria a los servicios
     consumidores, cumpliendo las reglas de seguridad.

2. **Consumo de endpoints**
   - Las pruebas unitarias de `LeaderboardsService` y `SessionService` confirman
     que se llaman exactamente los endpoints definidos por Ufro GameLab con los
     métodos HTTP, headers y cuerpos esperados.

3. **Reintentos y administración de errores**
   - El conjunto de pruebas de `ApiClient` cubre los flujos de reintento con
     backoff, respeto a `Retry-After`, y renovación de token tras `401`, lo cual
     demuestra la resistencia requerida para producción.

4. **Telemetry y heartbeats**
   - `SessionManager` queda probado frente a heartbeats periódicos, cortes de
     lotes y envío con `sendBeacon`, asegurando la persistencia de métricas de
     juego incluso al cerrar la pestaña.

## Ejecución de la suite

```bash
npm install
npm run test
```

El comando anterior ejecuta toda la batería de Vitest (unitaria,
integración y E2E). Para inspeccionar los casos específicos, utilice
`npm run test -- {pattern}`.

