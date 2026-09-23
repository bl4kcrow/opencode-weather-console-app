[ ]  AGENTS.md: dice que index.ts es stub, pero la app ya funciona — hay que actualizarlo.
[ ]  Colores: no hay ninguno; falta definir cyan (menú), amarillo (temp), verde/rojo (ok/error).
[x]  Tests: suite completa en `tests/` con bun:test (storage, api, utils, presentation, actions); el build se aborta si fallan.
[ ]  Binario: compila bien; revisar que ./weather guarde datos en ~/.config/weather-cli/.
[ ]  Escalabilidad: ¿qué tan fácil será expandir con nuevas funcionalidades?
[ ]  Carga: ¿hay estado de carga en las tareas asíncronas?