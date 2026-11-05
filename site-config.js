/* Configuración de BAT 360 Promotoría.
   - usuarios: correos con acceso y qué vistas ven ('*' = todas).
   - vistas: entradas del menú lateral. Para sumar una vista nueva: sube su .html a esta carpeta y agrega una línea aquí. */
window.SITE = {
  id: 'promotoria',
  nombre: 'Promotoría',
  // Mismo Client ID de Google que BAT 360. OJO: este dominio nuevo debe agregarse en Google Cloud → "Orígenes JavaScript autorizados".
  googleClientId: '382427877987-j68n1tmm6ers3biekqamem2jlrdguubj.apps.googleusercontent.com',
  usuarios: {
    'ccamarena@ttaudit.com': { vistas: ['*'] },
    'acastro@ttaudit.com':   { vistas: ['*'] }
  },
  // Historial que procesan Materiales y Cobertura: solo los últimos N meses (incluido el actual). 0 = todo el archivo.
  historialMeses: 3,
  // Todos los links de SharePoint que usa el sitio, en un solo lugar. Las páginas (radar, materiales, cobertura)
  // los toman de aquí; si un archivo cambia de link, se actualiza solo esta línea.
  links: {
    validacion:   'https://ttauditperu-my.sharepoint.com/:x:/r/personal/acastro_ttauditperu_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BF5BF96FA-7FC4-4D5D-B601-F00FC14B98AD%7D&file=VALIDACI%25u00d3N_2026.xlsx&action=default&mobileredirect=true', // Radar: VALIDACIÓN_2026.xlsx
    popEjecucion: 'https://ttauditperu-my.sharepoint.com/:x:/g/personal/acastro_ttauditperu_onmicrosoft_com/IQC3XD0DBBHTTKUIDSqtcqVnAZl4eojITmpAFajAa6sdl5w?e=eAMDDe', // Materiales: 582-EJECUCIÓN-POP.xlsx
    infoGeneral:  'https://ttauditperu-my.sharepoint.com/:x:/g/personal/acastro_ttauditperu_onmicrosoft_com/IQDl5lLllIOWT74Z3_Ou_6muAZ4PxqwmXMyiqtVAl8TDU-Y?e=x6bLbV', // Materiales y Cobertura: 582-INFORMACIÖN GENERAL.xlsx
    padron:       'https://ttauditperu-my.sharepoint.com/:x:/g/personal/acastro_ttauditperu_onmicrosoft_com/IQCMw-AHmgwHQoMO0AV4UU4TAUqoAgk0rnzdVjQLg5T23SI?e=FbLrNF',  // Padrón vigente (Padrón, Cobertura): Propuesta Padrón Promotoría (la "biblia")
    // Padrón de cada mes, para la vista Histórico (se compara un mes con otro). Cada mes nuevo: copiar el link del Excel y sumar una línea.
    padrones: [
      { mes: '2026-10', nombre: 'Octubre 2026',   url: 'https://ttauditperu-my.sharepoint.com/:x:/g/personal/acastro_ttauditperu_onmicrosoft_com/IQCMw-AHmgwHQoMO0AV4UU4TAUqoAgk0rnzdVjQLg5T23SI?e=FbLrNF' },
      { mes: '2026-11', nombre: 'Noviembre 2026', url: '' }   // PENDIENTE: pegar aquí el link de "Propuesta Padron Promotoria Noviembre 2026 USAR.xlsx"
    ]
  },
  vistas: [
    { id: 'padron',     seccion: 'Promotoría', icono: '🗂️', titulo: 'Padrón',
      sub: 'El padrón vigente: tienda, promotor, día y frecuencia. Filtra por promotor, ciudad, día o frecuencia y mira la distribución de los puntos en el mapa.',
      src: 'padron.html?vista=padron' },
    { id: 'historico',  seccion: 'Promotoría', icono: '📈', titulo: 'Histórico',
      sub: 'Tiendas por cadena, promotor, ciudad y frecuencia en cada mes, y cómo cambió entre un mes y otro.',
      src: 'padron.html?vista=historico' },
    { id: 'radar',      seccion: 'Promotoría', icono: '📡', titulo: 'Radar de cobertura',
      sub: 'Cobertura y efectividad por promotor, tiendas sin cobertura y motivos, con matriz diaria. Lee el Excel de VALIDACIÓN.',
      src: 'radar.html' },
    { id: 'materiales', seccion: 'Promotoría', icono: '📦', titulo: 'Materiales',
      sub: 'Avance por material contra el universo de tiendas, motivos de no implementación y de no cobertura, y fotos. Los materiales de cada mes se definen en config/materiales.json.',
      src: 'materiales.html' },
    { id: 'cobertura',  seccion: 'Promotoría', icono: '🧭', titulo: 'Cobertura y calendario',
      sub: 'Cruza el padrón (día y frecuencia Q1/Q2) con Información General: cobertura por promotor, tiendas no cubiertas con motivo y programación semanal por distrito.',
      src: 'cobertura.html' }
  ]
};
