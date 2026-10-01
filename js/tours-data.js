/**
 * Hotspots en u/v sobre la equirectangular (0–1).
 * u: izquierda → derecha · v: arriba → abajo
 * Medidos sobre 00.png y las panorámicas de Bogotá.
 */
export const hub = {
  id: 'hub',
  title: 'Colombia 360°',
  src: './00.png',
  // -90: al cargar se ve el pueblo colonial (centro del collage)
  skyRotation: '0 -90 0',
  hotspots: [
    {
      id: 'bogota',
      title: 'Bogot\u00e1',
      subtitle: 'Plaza de Bol\u00edvar',
      description:
        'Corazón histórico de Colombia. Catedral Primada, Capitolio Nacional y Palacio de Justicia en un mismo recorrido inmersivo.',
      // Costura del panorama: u alto = Catedral en la vista 360
      u: 0.945,
      v: 0.45,
      tourId: 'bogota',
    },
    {
      id: 'medellin',
      title: 'Medell\u00edn',
      subtitle: 'Plaza Botero',
      description:
        'La escultura voluminosa evoca el universo de Fernando Botero y el centro cultural de Medell\u00edn.',
      // Botero en el collage (lado opuesto a las estatuas de San Agustín)
      u: 0.68,
      v: 0.52,
      tourId: null,
    },
    {
      id: 'colonial',
      title: 'Pueblo colonial',
      subtitle: 'Villa de Leyva',
      description:
        'Iglesias blancas y tejas de barro al pie de la cordillera: el paisaje típico de los pueblos patrimonio.',
      u: 0.48,
      v: 0.455,
      tourId: null,
    },
    {
      id: 'san-agustin',
      title: 'San Agust\u00edn',
      subtitle: 'Parque Arqueol\u00f3gico',
      description:
        'Estatuas monol\u00edticas precolombinas bajo techumbre de paja: uno de los mayores legados arqueol\u00f3gicos del pa\u00eds.',
      u: 0.3,
      v: 0.52,
      tourId: null,
    },
    {
      id: 'cartagena',
      title: 'Cartagena',
      subtitle: 'Torre del Reloj',
      description:
        'La Ciudad Amurallada abre sus puertas al Caribe. Murallas, palmeras y el skyline de Bocagrande al fondo.',
      u: 0.085,
      v: 0.44,
      tourId: null,
    },
  ],
};

export const tours = {
  bogota: {
    id: 'bogota',
    title: 'Bogot\u00e1',
    startScene: 'plaza',
    scenes: {
      plaza: {
        id: 'plaza',
        title: 'Plaza de Bolívar',
        src: './Bogota/01%20Plaza.png',
        skyRotation: '0 -90 0',
        hotspots: [],
      },
      congreso: {
        id: 'congreso',
        title: 'Capitolio Nacional',
        src: './Bogota/02%20Congreso.png',
        skyRotation: '0 -90 0',
        hotspots: [],
      },
      justicia: {
        id: 'justicia',
        title: 'Palacio de Justicia',
        src: './Bogota/03%20Palacio%20de%20justicia.png',
        skyRotation: '0 -90 0',
        hotspots: [],
      },
    },
  },
};
