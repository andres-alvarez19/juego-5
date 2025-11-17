# Prompts para Tareas de Backend (Integración)

## Añadir un nuevo método al ApiClient

"En el archivo `Daring Dungeon Delver/src/integration/ApiClient.ts`, añade un nuevo método público llamado `getUserProfile` que acepte un `userId` de tipo `string`. Este método debe realizar una petición GET al endpoint `/users/{userId}`. Debe devolver una promesa que se resuelva con el perfil del usuario. Asegúrate de que maneje los errores y la autenticación como los otros métodos de la clase."

## Implementar un nuevo store para datos de usuario

"Crea un nuevo store de Pinia llamado `userStore.ts` en `Daring Dungeon Delver/src/stores/`. Este store debe gestionar los datos del perfil del usuario. Debe tener una acción `fetchUserProfile(userId: string)` que use el método `gameLabClient.getUserProfile` para obtener los datos y almacenarlos en el estado. También debe manejar los estados de carga y error."
