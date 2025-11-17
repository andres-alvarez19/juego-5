# Guía de "Controladores" (Lógica de UI)

En el contexto de una arquitectura Vue (MVVM - Model-View-ViewModel), el "controlador" o la lógica de la vista reside principalmente en los componentes de Vue y los stores de Pinia.

## Componentes de Vue (`<script setup>`)

La sección `<script setup>` de los componentes de Vue actúa como el controlador para la plantilla (`<template>`).

### Responsabilidades:

-   **Importar y usar stores de Pinia**: Para acceder al estado global y llamar a acciones.
-   **Definir estado local**: Usando `ref()` y `reactive()` para datos que solo son relevantes para el componente.
-   **Definir manejadores de eventos**: Funciones que se ejecutan en respuesta a interacciones del usuario (ej. `@click`).
-   **Lógica del ciclo de vida**: Usando hooks como `onMounted` para buscar datos iniciales.

## Stores de Pinia

Los stores de Pinia (`Daring Dungeon Delver/src/stores/`) manejan la lógica de negocio y las interacciones con los servicios (como el `ApiClient`). Separan esta lógica de los componentes, haciéndolos más limpios y reutilizables.

### Ejemplo de Flujo:

1.  **Usuario hace clic en un botón** en un componente Vue.
2.  El manejador `@click` en el componente llama a una **acción del store** (ej. `scoreStore.fetchLeaderboard('game1')`).
3.  La **acción del store** ejecuta la lógica, como llamar a la API a través de `gameLabClient`.
4.  La acción **actualiza el estado** del store con el resultado.
5.  El componente, al ser reactivo al estado del store, **se actualiza automáticamente** para mostrar los nuevos datos.

Este patrón separa las preocupaciones:
-   **Componentes**: Se encargan de la presentación y la captura de eventos de usuario.
-   **Stores**: Se encargan de la gestión del estado y la lógica de negocio.
