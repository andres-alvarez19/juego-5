# 📚 Documentación - Daring Dungeon Delver

Bienvenido a la documentación del proyecto **Daring Dungeon Delver**.

## 🚀 Inicio Rápido

**¿Primera vez aquí?** Comienza por leer **[INDEX.md](./INDEX.md)** - Es tu guía completa de navegación.

## 📁 Estructura de Carpetas

```
docs/
├── INDEX.md                      ⭐ EMPIEZA AQUÍ
├── 01_ARQUITECTURA/              Arquitectura del sistema
├── 02_API/                       Contratos y documentación de API
├── 03_DESARROLLO/                Guías de desarrollo
├── 04_NIVELES/                   Documentación de niveles del juego
├── 05_REQUERIMIENTOS/            Requisitos y casos de uso
└── 06_PRUEBAS/                   Documentación de testing
```

## 🔍 Búsqueda Rápida

### ¿Qué necesitas hacer?

| Tarea | Lee esto |
|-------|----------|
| **Entender el proyecto** | [INDEX.md](./INDEX.md) → [Requerimientos](./05_REQUERIMIENTOS/Requerimientos_CU_diagramas.md) |
| **Desarrollar/debuggear** | [Modo DEV](./03_DESARROLLO/DEV_MODE.md) → [Formato de Código](./03_DESARROLLO/formato_codigo.md) |
| **Crear nuevo nivel** | [Desarrollo de Niveles](./03_DESARROLLO/LEVEL_DEV.md) → [Ejemplos de Niveles](./04_NIVELES/) |
| **Integrar con API** | [Token API](./02_API/token_api.md) → [Contrato API](./02_API/contrato_api.md) |
| **Ejecutar tests** | [Test Report](./06_PRUEBAS/test_report.md) |
| **Modificar campaña** | [Modo Campaña](./04_NIVELES/CAMPAIGN_MODE.md) |

## 📖 Documentos Principales

### 1️⃣ Para Desarrolladores Nuevos
1. [INDEX.md](./INDEX.md) - Mapa completo de la documentación
2. [Requerimientos y Casos de Uso](./05_REQUERIMIENTOS/Requerimientos_CU_diagramas.md)
3. [Modo de Desarrollo](./03_DESARROLLO/DEV_MODE.md)

### 2️⃣ Para Trabajar con Niveles
1. [Modo Campaña](./04_NIVELES/CAMPAIGN_MODE.md)
2. [Guía de Desarrollo de Niveles](./03_DESARROLLO/LEVEL_DEV.md)
3. Ejemplos: [Nivel 2](./04_NIVELES/LEVEL2_INTEGRATION.md), [Nivel 3](./04_NIVELES/LEVEL3_INTEGRATION.md), [Nivel 4](./04_NIVELES/LEVEL4_INTEGRATION.md), [Nivel 5](./04_NIVELES/LEVEL5_INTEGRATION.md)

### 3️⃣ Para Integración con Backend
1. [Sistema de Autenticación](./02_API/token_api.md)
2. [Contrato API v2](./02_API/contrato_api.md)
3. [Informe de Testing](./06_PRUEBAS/test_report.md)

## ⚙️ Configuración Rápida

### Desarrollo Local

```bash
# Activar modo DEV (sin backend)
# En .env.development
VITE_DEV_MODE=true

# Instalar y ejecutar
pnpm install
pnpm dev
```

### Producción

```bash
# Desactivar modo DEV
# En .env.production
VITE_DEV_MODE=false

# Build
pnpm build
```

## 🎮 Niveles Implementados

| Nivel | Estado | Dificultad | Enemigos | Documento |
|-------|--------|------------|----------|-----------|
| 1 | ⏳ Pendiente | ⭐ Tutorial | 1-2 | - |
| 2 | ✅ Completo | ⭐⭐ Fácil | 3 | [LEVEL2_INTEGRATION.md](./04_NIVELES/LEVEL2_INTEGRATION.md) |
| 3 | ✅ Completo | ⭐⭐⭐ Intermedio | 4 | [LEVEL3_INTEGRATION.md](./04_NIVELES/LEVEL3_INTEGRATION.md) |
| 4 | ✅ Completo | ⭐⭐⭐⭐ Difícil | 8 | [LEVEL4_INTEGRATION.md](./04_NIVELES/LEVEL4_INTEGRATION.md) |
| 5 | ✅ Completo | ⭐⭐⭐⭐⭐ Boss | 11 | [LEVEL5_INTEGRATION.md](./04_NIVELES/LEVEL5_INTEGRATION.md) |

## 🔗 Enlaces Importantes

- **Repositorio:** (URL del repositorio)
- **Portal Ufro GameLab:** https://ufrogamelab.cl
- **API Base URL:** https://ufrogamelab.cl/v2

## 👥 Equipo

**Responsables del Proyecto:**
- Andrés Álvarez Morales
- Enrique Pincheira

## 📅 Última Actualización

11 de noviembre de 2025

---

**¿Perdido?** → Vuelve al [INDEX.md](./INDEX.md)
# juego-5
# juego-5
