# Protocolo de Pruebas de Campo 
Este documento recoge los resultados de las pruebas de campo para evaluar si la tecnología AR basada en GPS y brújula es viable en distintos entornos. No se necesitan conocimientos técnicos.

# Calibración de la brújula:

¿Cómo medirlo?
Según la documentación oficial de mozilla: 

# Sobre la rotación
La rotación se describe alrededor de cualquier eje dado en función del número de grados de diferencia entre el sistema de coordenadas del dispositivo y el sistema de coordenadas terrestre, y se mide en grados.

# Alfa
La rotación alrededor del eje z — es decir, la torsión del dispositivo — hace que el ángulo alfa de rotación cambie:

El ángulo alfa es 0° cuando la parte superior del dispositivo apunta directamente hacia el polo norte de la Tierra, y aumenta a medida que el dispositivo se gira en sentido antihorario. Por tanto, 90° corresponde a apuntar hacia el oeste, 180° con el sur y 270° con el este. Teniendo en cuenta esto, he añadido al hud un medidor de estos grados que indica la desviación. La medición consiste, siguiendo el ejemplo del tutorial de locar.js en colocar una caja en cada punto cardinal y capturar el momento en el que están centradas.

Es importante conocer también la técnica del 8 y su importancia para estas pruebas.

# La técnica del 8:

Ayuda a mejorar la señal de los sensores del móvil.

Google recomienda hacer lo siguiente:
Mejorar la precisión de la ubicación en Google Maps:

Si la ubicación sigue sin mostrarse en el lugar correcto, prueba a reiniciar tu teléfono o tablet Android. También puedes hacer lo siguiente:
Calibrar el teléfono o tablet. Si el haz de luz del punto azul es amplio o señala una dirección equivocada, calibra la brújula.
En tu teléfono o tablet Android, abre la aplicación Google Maps.Mueve el dispositivo dibujando un 8 hasta que el haz se estreche y apunte en la dirección correcta.
Con unas cuantas veces es suficiente.

Una vez explicado esto el modelo utilizado para las pruebas es:
# Xiaomi POCO X7 PRO

# Prueba 1: “Interior de edificio”
Antes de la técnica del 8:
- NORTE: -30º
- ESTE: -15º
- OESTE: 0°
- SUR: 20°

Después de técnica del 8:
- NORTE: -22º
- ESTE: -2º
- SUR: 10º
- OESTE: 0º

# Conclusión:
-Los marcadores eran visibles la orientación mejoro usando está técnica.

# Prueba 2: Plaza amplia
| Métrica                                         | Resultado          |
| :---------------------------------------------- | :----------------- |
| Accuracy GPS alcanzado                          | 1 metro            |
| Desviación de brújula estimada                  | 30° a 42°          |
| Comparado con el resto: ¿mejor o peor orientación? | peor            |
| Efecto palanca                                   | Severo             |

Notas:
- Peor escenario posible muralla de granito, edificios grandes de metal.
- Un parking debajo de la plaza.
- Se ve uno de los 4 marcadores que coloque de casualidad.
- Técnica del 8 inservible frente a factores del entorno tan grandes.
- No se puede arreglar en un sitio así, el error lo agrava el entorno.
- Con una desviación de 40°, el efecto palanca genera:
- Un marcador a 20 metros de ti se desplaza 14 metros a un lado.
- Un marcador a 50 metros se desplaza 36 metros.
- Quedan fuera de tu rango visión completamente, además la desviación no es estable lo que genera continuos cambios. El magnetómetro confunde al giroscopio cambiándole el norte continuamente.

# Prueba 3: Calle estrecha 

| Métrica                                         | Resultado          |
| :---------------------------------------------- | :----------------- |
| Accuracy GPS alcanzado                          | 2 metros           |
| Desviación de brújula estimada                  | 10º                |
| Comparado con el resto: ¿mejor o peor orientación? | mejor           |
| Efecto palanca                                   | Leve               |

Antes de la técnica del 8:
- NORTE: 6º
- ESTE: 1º
- OESTE: -26º 
- SUR:  -14º

Después de la técnica del 8:
- NORTE: 6º
- ESTE: 3º
- OESTE: -8º  
- SUR:  -14º

# Prueba 4: Parque 
| Métrica                                         | Resultado |
| :---------------------------------------------- | :-------- |
| Accuracy GPS alcanzado                          | 1 metro   |
| Comparado con el resto: ¿mejor o peor orientación? | Mejor   |
| Efecto palanca                                   | Leve      |

Notas:
- Los árboles no han afectado la señal GPS 1m constante.
- Se observa un ruido de sensor de unos 5-7 grados
- Los marcadores fueron visibles la técnica del 8 mejoro la orientación.

# -Análisis de los resultados después de las 4 pruebas:
En el Oeste de la calle, en la prueba de la calle estrecha el cambio es espectacular: de -26° inusable a -8° perfetamente usable. 
Eso es una mejora de 18 grados con solo un gesto. Sin embargo, en otras direcciones como el Norte o el Sur de la calle, el gesto no hizo nada 0° de cambio. Esto confirma que el sensor limpia el error donde más saturado está, pero ignora el error ambiental.
Hay que conocer mucho el terreno y tener en cuenta muchos factores, yo pense que la plaza sería un buen entorno. Un sitio amplio de primeras bastante bueno para camuflar errores de desviación de la brújula, pero no recordé el parking que tiene debajo, estos errores serán muy frecuentes.
Cambio del angulo en interiores el ángulo perfecto era el OESTE, pero en la calle el ángulo perfecto pasó a ser el ESTE.
Esto también demuestra la importancia de la interferencia geográfica, depende mucho de los objetos metálicos que te rodean en ese punto exacto.

# Consumo de batería
Procedimiento:
1. Anotar el % de batería al abrir la app.
2. Usar la app activamente durante 15 minutos
3. Anotar el % al cerrar.
4. El móvil debe estar con la pantalla encendida todo el rato.

Métrica	                            Resultado
Batería al iniciar	                82%
Batería a los 15 minutos	          76%
Consumo total	                      6%
Consumo estimado por hora	          24% / hora
El móvil se calienta notablemente	  No

# Conclusión:
Consumo aceptable, con el stack actual y el móvil elegido.
Resumen general de viabilidad

| Entorno        | Viable | Parcial | No viable |
| :------------- | :----: | :-----: | :-------: |
| Plaza grande   |        |         |     X     |
| Calle estrecha |        |    X    |           |
| Parque         |   X    |         |           |


| Aspecto                             | Correcto | Mejorable | Bloqueante |
| :---------------------------------- | :------: | :-------: | :--------: |
| Precisión de orientación (brújula)  |          |           |      X     |
| Precisión de posición (GPS)         |    X     |           |            |
| Estabilidad de los POIs             |          |     X     |            |
| Consumo de batería                  |    X     |           |            |
| Velocidad de inicio                 |    X     |           |            |

# Conclusión final:
Como conclusión, este stack es viable para la investigación, pero para una app comercial presenta desafíos de hardware profundo. 
Inestabilidad de brújula y magnetismo ambiental que no permiten garantizar una experiencia de usuario consistente.

# Ideas para solucionar el problema:
Hay que eliminar el magnetometro de la ecuación, sin eso no es viable.

# Anexos:

# Fuentes:

# Orientation and motion data explained - Web APIs | MDN

https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Orientation_and_motion_data_explained

# Encontrar tu ubicación y mejorar la precisión en Google Maps - Ordenador - Ayuda de Google Maps

https://support.google.com/maps/answer/2839911?hl=es&co=GENIE.Platform%3DDesktop

# Device Orientation and Motion

https://w3c.github.io/deviceorientation/

# Orientation Sensor DeviceOrientationAbsolute

https://w3c.github.io/orientation-sensor/

# Magnetometer

https://w3c.github.io/magnetometer/

# Window: deviceorientation event - Web APIs | MDN

https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event

https://ar-js-org.github.io/AR.js-Docs/

https://ar-js-org.github.io/AR.js-Docs/location-based/

# Issues realcionadas desde 2021:

- https://github.com/AR-js-org/AR.js/issues/302#event-6220396703
- https://github.com/AR-js-org/AR.js/issues/590
- https://github.com/AR-js-org/AR.js/pull/661
- https://github.com/AR-js-org/locar.js/issues/18
- https://github.com/AR-js-org/locar.js/issues/28
- https://github.com/AR-js-org/locar.js/issues/11

