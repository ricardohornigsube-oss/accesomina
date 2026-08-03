(() => {
  const help = {
    dashboard: 'Revise aquí qué servicios están listos, qué requiere atención y cuál es la próxima acción recomendada.',
    alertas: 'Priorice vencimientos y bloqueos. Atienda primero lo que pueda detener una orden de servicio.',
    mineras: 'Mantenga actualizados los datos del cliente y use sus contratos y órdenes de servicio como punto de partida.',
    contratos: 'Registre vigencia, alcance, responsables y documentos. Cada cambio conserva su historial.',
    mantenciones: 'Asigne personas y recursos disponibles para confirmar que la orden está preparada antes de ejecutarla.',
    trabajadores: 'Busque, revise la ficha y actualice documentos, asignaciones, aptitudes y estado operativo de cada persona.',
    'personal-planta': 'Administre la dotación permanente, sus cargos, turnos, documentos y asignaciones vigentes.',
    reclutamiento: 'Gestione candidatos temporales desde la convocatoria hasta la habilitación para una orden de servicio.',
    epp: 'Registre entregas, tallas y reposiciones. Los faltantes alimentan las alertas operativas.',
    hoteleria: 'Controle disponibilidad, asignaciones y estadías por persona y por orden de servicio.',
    vehiculos: 'Mantenga vigencias, responsables, costos y documentos de cada vehículo, activo o equipo.',
    subcontratos: 'Revise cumplimiento documental, renovaciones y trazabilidad de cada tercero.',
    turnos: 'Organice jornadas, asistencia y horas trabajadas por persona, cliente y orden de servicio.',
    auditoria: 'Revise evidencias, observaciones y estados documentales antes de aprobar o rechazar.',
    reportes: 'Filtre la información que necesita y exporte una vista útil para operación, clientes o gerencia.'
  };

  const enhance = () => {
    if (!document.body.classList.contains('private')) return;
    const main = document.getElementById('main');
    if (!main) return;
    const page = window.currentPage || '';
    const header = main.querySelector('.section-header');
    if (header && help[page] && !main.querySelector('[data-nk-client-help]')) {
      header.insertAdjacentHTML('afterend', `<div class="nk-client-help" data-nk-client-help>${help[page]}</div>`);
    }
    main.querySelectorAll('.card').forEach(card => card.classList.add('nk-client-card'));
    main.querySelectorAll('.badge').forEach(badge => {
      const text = badge.textContent.toLowerCase();
      badge.classList.toggle('nk-status-ready', /listo|vigente|aprobado|habilitado|disponible/.test(text));
      badge.classList.toggle('nk-status-review', /pendiente|observado|revisar|por vencer/.test(text));
      badge.classList.toggle('nk-status-blocked', /bloqueado|vencido|rechazado|no habilitado/.test(text));
    });
  };

  const observe = () => {
    const main = document.getElementById('main');
    if (!main || main.dataset.nkClientUxReady) return;
    main.dataset.nkClientUxReady = 'true';
    new MutationObserver(() => requestAnimationFrame(enhance)).observe(main, { childList: true, subtree: true });
    enhance();
  };

  document.addEventListener('DOMContentLoaded', observe);
  window.addEventListener('load', observe);
})();
