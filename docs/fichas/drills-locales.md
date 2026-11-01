# Ficha: Drills locales (práctica rápida de Geometría Descriptiva)

## Problema
La cola pide "primera práctica" y repasos, pero no había ninguna práctica con nota que se registrara:
el tema nunca salía de la etapa práctica y el repaso espaciado no tenía datos.

## Qué es
- `js/dominio/drills.js` + `drills-banco.js`: 10 ítems de opción múltiple por método (tercera proyección y
  recta), generados con una semilla (misma semilla = mismos ítems) y corregidos sin IA ni red.
- `js/ui/dialogo-drill.js`: el diálogo. Al corregir registra un intento `drill` con aciertos sobre total;
  con 80% o más el tema sale de la etapa práctica.
- Desde Hoy, "Empezar" en practicar y repasar abre el drill; "Ir al tema" lleva a Ejercicios.

## Decisiones
- Las reglas del banco salen de las hojas 01 y 02 del cuadernillo. La del diedro entre trazas depende de la
  tabla de cota y alejamiento que la hoja 01 marca "pendiente de confirmar con el profesor".
- Recta = traza particular, método de la traza, perfil indeterminado, diedro entre trazas y signos
  (el diedro de un punto queda solo en tercera proyección).
- Las opciones de orden natural (I a IV, signos, ubicaciones) no se mezclan; las de enunciado fijo, sí.
- Un subtema que no es de Geometría Descriptiva abre igual el primer método.

## Fuera de alcance
Bancos de otras materias, ítems con dibujo, usar los `errores` de cada ítem en la hoja.

## Listón (comprobable)
- [ ] Hoy → "Empezar" en una práctica abre 10 ítems; "Corregir" marca cada uno y muestra la correcta en los errados
- [ ] `gm_intentos` gana un intento `drill` con los aciertos y el total
- [ ] Con 8/10 o más el tema deja de pedir práctica; con 7/10 o menos la sigue pidiendo
- [ ] "Repetir" genera ítems distintos; misma semilla y método dan los mismos ítems (test)
- [ ] Funciona sin conexión
- [ ] `node --test js/dominio/*.test.js` y `scripts/verificar.ps1` en verde
