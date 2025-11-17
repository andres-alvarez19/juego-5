# Guía de Modelos de Datos (Types)

Para asegurar la consistencia y seguridad de tipos en todo el proyecto, los modelos de datos se definen utilizando interfaces o tipos de TypeScript.

## Ubicación

Las definiciones de tipos globales y modelos de datos se encuentran principalmente en `Daring Dungeon Delver/src/models/types.ts`. Si un tipo es específico de un solo módulo o componente, puede definirse localmente en ese archivo.

## Convenciones

-   Usa `interface` para definir la forma de los objetos.
-   Usa `type` para uniones, intersecciones o tipos más complejos.
-   Nombra las interfaces y tipos con `PascalCase`.
-   Exporta todas las definiciones que necesiten ser compartidas entre módulos.

## Ejemplo

Un ejemplo es el tipo `ApiErrorDetails` usado en el manejo de errores de la API.

```typescript
// filepath: Daring Dungeon Delver/src/utils/safeFetch.ts
import type { ApiErrorDetails } from '@/models/types';
// ...
async function parseErrorResponse(response: Response): Promise<ApiErrorDetails> {
  try {
    const data = await response.json();
    return {
      message: data.message || data.error || 'Unknown error',
      status: response.status,
      code: data.code,
    };
  } catch {
    return {
      message: response.statusText || 'Unknown error',
      status: response.status,
    };
  }
}
```

Cuando necesites definir la estructura de un nuevo objeto de datos (por ejemplo, un nuevo tipo de enemigo, item, o respuesta de API), crea una nueva interfaz en `Daring Dungeon Delver/src/models/types.ts` y úsala en todo el código relevante.
