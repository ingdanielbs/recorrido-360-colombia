/**
 * Hotspots en yaw/pitch (grados) respecto a la cámara.
 * yaw: 0 = frente · negativo = izquierda · positivo = derecha
 * pitch: 0 = horizonte · negativo = abajo
 *
 * Hub con skyRotation 0 -90 0: al entrar se ve el pueblo colonial (centro del collage).
 */
export const hub = {
  id: 'hub',
  title: 'Colombia 360°',
  src: './00.png',
  skyRotation: '0 -90 0',
  hotspots: [
    {
      id: 'bogota',
      title: 'Bogotá',
      subtitle: 'Plaza de Bolívar',
      description:
        'Corazón histórico de Colombia. Catedral Primada, Capitolio Nacional y Palacio de Justicia en un mismo recorrido inmersivo.',
      yaw: 100,
      pitch: -2,
      tourId: 'bogota',
    },
    {
      id: 'medellin',
      title: 'Medellín',
      subtitle: 'Plaza Botero',
      description:
        'La escultura voluminosa evoca el universo de Fernando Botero y el centro cultural de Medellín.',
      yaw: 70,
      pitch: -8,
      tourId: null,
    },
    {
      id: 'colonial',
      title: 'Pueblo colonial',
      subtitle: 'Andes colombianos',
      description:
        'Iglesias blancas y tejas de barro al pie de la cordillera: el paisaje típico de los pueblos patrimonio.',
      yaw: 0,
      pitch: -4,
      tourId: null,
    },
    {
      id: 'san-agustin',
      title: 'San Agustín',
      subtitle: 'Parque Arqueológico',
      description:
        'Estatuas monolíticas precolombinas bajo techumbre de paja: uno de los mayores legados arqueológicos del país.',
      yaw: -55,
      pitch: -8,
      tourId: null,
    },
    {
      id: 'cartagena',
      title: 'Cartagena',
      subtitle: 'Torre del Reloj',
      description:
        'La Ciudad Amurallada abre sus puertas al Caribe. Murallas, palmeras y el skyline de Bocagrande al fondo.',
      yaw: -115,
      pitch: -2,
      tourId: null,
    },
  ],
};

export const tours = {
  bogota: {
    id: 'bogota',
    title: 'Bogotá',
    startScene: 'plaza',
    scenes: {
      plaza: {
        id: 'plaza',
        title: 'Plaza de Bolívar',
        src: './Bogota/01%20Plaza.png',
        skyRotation: '0 -90 0',
        hotspots: [
          {
            id: 'capitolio',
            title: 'Capitolio',
            subtitle: 'Congreso de la República',
            description:
              'Sede del Congreso. Columnata neoclásica que cierra el costado sur de la plaza.',
            yaw: -80,
            pitch: -2,
            targetScene: 'congreso',
          },
          {
            id: 'justicia',
            title: 'Palacio de Justicia',
            subtitle: 'Corte Suprema',
            description:
              'Edificio que alberga la Corte Suprema de Justicia, frente a la Catedral.',
            yaw: -25,
            pitch: -2,
            targetScene: 'justicia',
          },
          {
            id: 'catedral',
            title: 'Catedral Primada',
            subtitle: 'Bogotá',
            description:
              'La Catedral Primada de Colombia domina el costado oriental de la Plaza de Bolívar.',
            yaw: 55,
            pitch: 2,
          },
          {
            id: 'volver-hub',
            title: 'Colombia',
            subtitle: 'Volver al hub',
            description: 'Regresa al panorama principal con todos los destinos.',
            yaw: 180,
            pitch: -25,
            targetTour: 'hub',
            variant: 'home',
          },
        ],
      },
      congreso: {
        id: 'congreso',
        title: 'Capitolio Nacional',
        src: './Bogota/02%20Congreso.png',
        skyRotation: '0 -90 0',
        hotspots: [
          {
            id: 'catedral-from-congreso',
            title: 'Catedral',
            subtitle: 'Plaza de Bolívar',
            description: 'Vuelve al centro de la plaza frente a la Catedral Primada.',
            yaw: -100,
            pitch: 0,
            targetScene: 'plaza',
          },
          {
            id: 'capitolio-info',
            title: 'Capitolio',
            subtitle: 'Congreso',
            description:
              'El Capitolio Nacional es la sede del Congreso de Colombia desde el siglo XIX.',
            yaw: 15,
            pitch: 2,
          },
          {
            id: 'justicia-from-congreso',
            title: 'Palacio de Justicia',
            subtitle: 'Recorrido',
            description: 'Continúa hacia el Palacio de Justicia.',
            yaw: 110,
            pitch: 0,
            targetScene: 'justicia',
          },
          {
            id: 'volver-hub-2',
            title: 'Colombia',
            subtitle: 'Volver al hub',
            description: 'Regresa al panorama principal.',
            yaw: 180,
            pitch: -25,
            targetTour: 'hub',
            variant: 'home',
          },
        ],
      },
      justicia: {
        id: 'justicia',
        title: 'Palacio de Justicia',
        src: './Bogota/03%20Palacio%20de%20justicia.png',
        skyRotation: '0 -90 0',
        hotspots: [
          {
            id: 'capitolio-from-justicia',
            title: 'Capitolio',
            subtitle: 'Congreso',
            description: 'Mira hacia el Capitolio Nacional y entra a esa vista.',
            yaw: -100,
            pitch: 0,
            targetScene: 'congreso',
          },
          {
            id: 'justicia-info',
            title: 'Palacio de Justicia',
            subtitle: 'Bogotá',
            description:
              'Sede de la Corte Suprema, el Consejo de Estado y la Corte Constitucional.',
            yaw: 0,
            pitch: 2,
          },
          {
            id: 'catedral-from-justicia',
            title: 'Catedral',
            subtitle: 'Plaza de Bolívar',
            description: 'Regresa a la vista general de la Plaza de Bolívar.',
            yaw: 100,
            pitch: 0,
            targetScene: 'plaza',
          },
          {
            id: 'volver-hub-3',
            title: 'Colombia',
            subtitle: 'Volver al hub',
            description: 'Regresa al panorama principal.',
            yaw: 180,
            pitch: -25,
            targetTour: 'hub',
            variant: 'home',
          },
        ],
      },
    },
  },
};
