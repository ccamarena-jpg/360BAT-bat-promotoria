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
  // Supervisores que aparecen en el «Planning del supervisor» cuando la hoja «Calendario sup.» aún no tiene la semana (normalmente salen de la propia hoja).
  supervisores: ['GIAN', 'JUAN ROSAS'],
  // Historial que procesan Materiales y Cobertura: solo los últimos N meses (incluido el actual). 0 = todo el archivo.
  historialMeses: 3,
  // Todos los links de SharePoint que usa el sitio, en un solo lugar. Las páginas (radar, materiales, cobertura)
  // los toman de aquí; si un archivo cambia de link, se actualiza solo esta línea.
  links: {
    validacion:   'https://ttauditperu-my.sharepoint.com/:x:/r/personal/acastro_ttauditperu_onmicrosoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BF5BF96FA-7FC4-4D5D-B601-F00FC14B98AD%7D&file=VALIDACI%25u00d3N_2026.xlsx&action=default&mobileredirect=true', // Radar: VALIDACIÓN_2026.xlsx
    popEjecucion: 'https://ttauditperu-my.sharepoint.com/:x:/g/personal/acastro_ttauditperu_onmicrosoft_com/IQC3XD0DBBHTTKUIDSqtcqVnAZl4eojITmpAFajAa6sdl5w?e=eAMDDe', // Materiales: 582-EJECUCIÓN-POP.xlsx
    infoGeneral:  'https://ttauditperu-my.sharepoint.com/:x:/g/personal/acastro_ttauditperu_onmicrosoft_com/IQDl5lLllIOWT74Z3_Ou_6muAZ4PxqwmXMyiqtVAl8TDU-Y?e=x6bLbV', // Materiales y Cobertura: 582-INFORMACIÖN GENERAL.xlsx
    // Padrón de cada mes. Cada archivo vale para SU mes: el de octubre es octubre y el de noviembre es noviembre. Todas las vistas los usan:
    //  · Padrón: el del mes en curso (o el más reciente) · Histórico: compara meses · Cobertura y Radar: cada semana usa el padrón de su mes.
    // Cada mes nuevo: sumar una línea con la ruta del Excel (pestaña «BBDD <mes>»). Se puede agregar `alterno:` (link de respaldo) si hiciera falta.
    padrones: [
      { mes: '2026-10', nombre: 'Octubre 2026',   url: 'https://ttauditperu-my.sharepoint.com/personal/acastro_ttauditperu_onmicrosoft_com/Documents/MATHIAS/PADRONES/Propuesta%20Padron%20Promotoria%20Octubre%202026%20VF.xlsx' },
      { mes: '2026-11', nombre: 'Noviembre 2026', url: 'https://ttauditperu-my.sharepoint.com/personal/acastro_ttauditperu_onmicrosoft_com/Documents/MATHIAS/PADRONES/Propuesta%20Padron%20Promotoria%20Noviembre%202026%20USAR.xlsx' }
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
