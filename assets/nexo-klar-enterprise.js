(function () {
  "use strict";

  const VERSION = "12.8";
  const ENTERPRISE_KEYS = [
    "uiRolePreferences", "alertWorkflow", "operationTasks", "signatureReminders",
    "communicationTemplates", "communicationHistory", "portalReviews",
    "trainingMatrices", "healthRiskMatrices", "importValidations",
    "inventory", "inventoryMovements", "warehouses"
  ];
  let modalSave = null;
  let recruitmentSpecialty = "";

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const today = () => new Date().toISOString().slice(0, 10);
  const money = (value) => `$${Math.round(Number(value) || 0).toLocaleString("es-CL")}`;
  const tenantUser = () => typeof currentTenantUser !== "undefined" ? currentTenantUser : null;
  const currentRole = () => String(tenantUser()?.rol || "administrador").toLowerCase();

  function ensureState() {
    if (typeof S === "undefined") return;
    S.uiRolePreferences ||= {};
    S.alertWorkflow ||= {};
    S.operationTasks ||= [];
    S.signatureReminders ||= [];
    S.communicationTemplates ||= [];
    S.communicationHistory ||= [];
    S.portalReviews ||= [];
    S.trainingMatrices ||= [];
    S.healthRiskMatrices ||= [];
    S.importValidations ||= [];
    S.inventory ||= [];
    S.inventoryMovements ||= [];
    S.warehouses ||= [];
  }

  function save() {
    ensureState();
    if (typeof persistTenant === "function") persistTenant();
  }

  function installModal() {
    if (document.getElementById("nk128-modal")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal-overlay" id="nk128-modal">
        <div class="modal nk128-modal">
          <div class="modal-header">
            <div class="modal-title" id="nk128-modal-title">Nexo Klar</div>
            <button class="modal-close" type="button" onclick="closeModal('nk128-modal')">✕</button>
          </div>
          <div class="modal-body" id="nk128-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" type="button" onclick="closeModal('nk128-modal')">Cancelar</button>
            <button class="btn btn-primary" id="nk128-modal-save" type="button">Guardar</button>
          </div>
        </div>
      </div>`);
    document.getElementById("nk128-modal-save").addEventListener("click", () => modalSave?.());
  }

  function openForm(title, body, onSave, saveLabel = "Guardar") {
    installModal();
    document.getElementById("nk128-modal-title").textContent = title;
    document.getElementById("nk128-modal-body").innerHTML = body;
    document.getElementById("nk128-modal-save").textContent = saveLabel;
    modalSave = onSave;
    openModal("nk128-modal");
  }

  function upsertAfterHeader(page, id, html) {
    const pageNode = document.getElementById(`page-${page}`);
    if (!pageNode) return null;
    document.getElementById(id)?.remove();
    const guidance = pageNode.querySelector(".nk-page-guidance");
    const header = pageNode.querySelector(".section-header");
    (guidance || header)?.insertAdjacentHTML("afterend", html);
    return document.getElementById(id);
  }

  function dashboardMetrics() {
    const alerts = typeof computeAlertas === "function" ? computeAlertas() : [];
    const services = S.mantenciones || [];
    const ready = services.filter((service) => typeof serviceStatusV107 === "function" && serviceStatusV107(service).status === "Lista para ejecutar").length;
    return {
      personas: (S.trabajadores || []).length,
      clientes: (S.minas || []).length,
      contratos: (S.contratos || []).length,
      ordenes: services.length,
      listos: ready,
      alertas: alerts.length,
      bloqueados: (S.trabajadores || []).filter((worker) => worker.bloqueado || worker.operationalStatus === "bloqueado").length,
      firmas: (S.firmas || []).filter((row) => !["firmado", "cerrado"].includes(row.estado)).length
    };
  }

  const KPI_LABELS = {
    personas: "Personas", clientes: "Clientes", contratos: "Contratos", ordenes: "Órdenes",
    listos: "Listas para ejecutar", alertas: "Alertas", bloqueados: "Personas bloqueadas", firmas: "Firmas pendientes"
  };
  const SHORTCUTS = {
    mineras: "Clientes", mantenciones: "Órdenes", trabajadores: "Personas", alertas: "Alertas",
    reclutamiento: "Personal temporal", "operaciones-cloud": "Centro Operativo", reportes: "Reportes"
  };

  function renderDashboardPreferences() {
    ensureState();
    const role = currentRole();
    const pref = S.uiRolePreferences[role] || { kpis: ["ordenes", "listos", "alertas", "bloqueados"], shortcuts: ["mineras", "mantenciones", "alertas", "reportes"] };
    const metrics = dashboardMetrics();
    const html = `<div class="card" id="nk128-dashboard-role" style="margin-bottom:16px;">
      <div class="card-header"><div><div class="card-title">Panel configurado para ${esc(role)}</div><div class="card-subtitle">Cada rol puede elegir sus indicadores y accesos rápidos sin afectar a los demás.</div></div><button class="btn btn-secondary btn-sm" onclick="openDashboardConfig128()">Configurar panel</button></div>
      <div class="kpi-grid" style="margin-top:12px;">${pref.kpis.map((key) => `<div class="kpi kpi-blue"><div class="kpi-value">${metrics[key] ?? 0}</div><div class="kpi-label">${esc(KPI_LABELS[key])}</div></div>`).join("")}</div>
      <div class="nk128-actions" style="margin-top:12px;">${pref.shortcuts.map((page) => `<button class="btn btn-secondary btn-sm" onclick="nav('${page}')">${esc(SHORTCUTS[page])}</button>`).join("")}</div>
    </div>`;
    upsertAfterHeader("dashboard", "nk128-dashboard-role", html);
  }

  window.openDashboardConfig128 = function () {
    ensureState();
    const role = currentRole();
    const current = S.uiRolePreferences[role] || { kpis: ["ordenes", "listos", "alertas", "bloqueados"], shortcuts: ["mineras", "mantenciones", "alertas", "reportes"] };
    openForm("Configurar Panel General", `
      <div class="cloud-note">Esta configuración se aplica al rol <b>${esc(role)}</b> dentro de esta empresa.</div>
      <div class="card-title" style="margin-top:14px;">Indicadores</div>
      <div class="form-grid">${Object.entries(KPI_LABELS).map(([key, label]) => `<label><input type="checkbox" data-nk128-kpi value="${key}" ${current.kpis.includes(key) ? "checked" : ""}> ${esc(label)}</label>`).join("")}</div>
      <div class="card-title" style="margin-top:14px;">Accesos rápidos</div>
      <div class="form-grid">${Object.entries(SHORTCUTS).map(([key, label]) => `<label><input type="checkbox" data-nk128-shortcut value="${key}" ${current.shortcuts.includes(key) ? "checked" : ""}> ${esc(label)}</label>`).join("")}</div>`,
    () => {
      const kpis = [...document.querySelectorAll("[data-nk128-kpi]:checked")].map((node) => node.value).slice(0, 6);
      const shortcuts = [...document.querySelectorAll("[data-nk128-shortcut]:checked")].map((node) => node.value).slice(0, 6);
      if (!kpis.length) return toast("Selecciona al menos un indicador", "err");
      S.uiRolePreferences[role] = { kpis, shortcuts };
      save(); closeModal("nk128-modal"); renderDashboardPreferences(); toast("Panel del rol actualizado");
    });
  };

  function alertKey(row) {
    return `${row.tipo || "alerta"}|${row.trabId || row.mantId || row.contratoId || ""}|${row.msg || ""}`;
  }

  function activeAlerts() {
    ensureState();
    const now = today();
    return (typeof computeAlertas === "function" ? computeAlertas() : []).map((row) => {
      const workflow = S.alertWorkflow[alertKey(row)] || {};
      return { ...row, workflow, key: alertKey(row) };
    }).filter((row) => row.workflow.status !== "cerrada" && (!row.workflow.snoozedUntil || row.workflow.snoozedUntil <= now));
  }

  function alertAction(row) {
    if (row.trabId) return `Abrir ficha de ${trabNombre(row.trabId)}`;
    if (row.mantId) return `Revisar orden ${mantNombre(row.mantId)}`;
    if (row.contratoId) return `Revisar contrato ${contratoNombre(row.contratoId)}`;
    return "Revisar antecedente y resolver";
  }

  function renderManagedAlerts() {
    ensureState();
    const listHost = document.getElementById("alertas-list");
    if (!listHost) return;
    const txt = (document.getElementById("filt-alerta-txt")?.value || "").toLowerCase();
    const type = document.getElementById("filt-alerta-tipo")?.value || "";
    const urgency = document.getElementById("filt-alerta-urg")?.value || "";
    const rows = activeAlerts().filter((row) => (!txt || row.msg.toLowerCase().includes(txt)) && (!type || row.tipo === type) && (!urgency || row.urgencia === urgency));
    const order = ["vencido", "critico", "falta", "proximo"];
    listHost.innerHTML = order.map((level) => {
      const group = rows.filter((row) => row.urgencia === level);
      if (!group.length) return "";
      return `<div class="card" style="margin-bottom:12px;"><div class="card-header"><div class="card-title">${esc(level.toUpperCase())}</div><span class="badge ${level === "vencido" ? "badge-err" : "badge-warn"}">${group.length}</span></div>${group.map((row) => `
        <div class="alert-item alert-${level === "falta" ? "critico" : level}">
          <div class="alert-dot dot-${level === "falta" ? "critico" : level}"></div>
          <div style="flex:1;"><b>${esc(row.msg)}</b><div class="nk128-muted">${esc(row.workflow.owner || "Sin responsable")} · ${esc(alertAction(row))}</div></div>
          <div class="nk128-actions"><button class="btn btn-secondary btn-sm" onclick="manageAlert128('${encodeURIComponent(row.key)}')">Gestionar</button></div>
        </div>`).join("")}</div>`;
    }).join("") || '<div class="empty">No existen alertas activas para estos filtros.</div>';
    const closed = Object.values(S.alertWorkflow).filter((row) => row.status === "cerrada").length;
    const snoozed = Object.values(S.alertWorkflow).filter((row) => row.snoozedUntil && row.snoozedUntil > today()).length;
    document.getElementById("alertas-sub").textContent = `${rows.length} activas · ${closed} cerradas · ${snoozed} pospuestas`;
  }

  window.manageAlert128 = function (encodedKey) {
    ensureState();
    const key = decodeURIComponent(encodedKey);
    const record = S.alertWorkflow[key] || {};
    openForm("Gestionar alerta", `
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Responsable</label><input class="form-input" id="nk128-alert-owner" value="${esc(record.owner || tenantUser()?.nombre || tenantUser()?.email || "")}"></div>
        <div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="nk128-alert-status"><option value="pendiente">Pendiente</option><option value="en_gestion" ${record.status === "en_gestion" ? "selected" : ""}>En gestión</option><option value="cerrada">Cerrada</option></select></div>
        <div class="form-group"><label class="form-label">Posponer hasta</label><input class="form-input" id="nk128-alert-snooze" type="date" value="${esc(record.snoozedUntil || "")}"></div>
        <div class="form-group"><label class="form-label">Fecha compromiso</label><input class="form-input" id="nk128-alert-due" type="date" value="${esc(record.dueAt || "")}"></div>
        <div class="form-group full"><label class="form-label">Acción / comentario</label><textarea class="form-textarea" id="nk128-alert-note">${esc(record.note || "")}</textarea></div>
      </div>`,
    () => {
      S.alertWorkflow[key] = {
        owner: document.getElementById("nk128-alert-owner").value.trim(),
        status: document.getElementById("nk128-alert-status").value,
        snoozedUntil: document.getElementById("nk128-alert-snooze").value,
        dueAt: document.getElementById("nk128-alert-due").value,
        note: document.getElementById("nk128-alert-note").value.trim(),
        updatedAt: new Date().toISOString(),
        updatedBy: tenantUser()?.email || "usuario"
      };
      save(); closeModal("nk128-modal"); renderManagedAlerts(); if (typeof updateBadges === "function") updateBadges(); toast("Alerta actualizada");
    });
  };

  function startOfWeek() {
    const date = new Date();
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function renderOperationsPlanning() {
    ensureState();
    const start = startOfWeek();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index);
      const iso = date.toISOString().slice(0, 10);
      const services = (S.mantenciones || []).filter((row) => row.inicio <= iso && row.termino >= iso);
      return `<div class="nk128-day ${iso === today() ? "today" : ""}"><b>${date.toLocaleDateString("es-CL", { weekday: "short", day: "2-digit" })}</b>${services.map((service) => `<div class="nk128-item"><b>${esc(service.nombre)}</b><div class="nk128-muted">${esc(minaNombre(service.minaId))}</div></div>`).join("") || '<div class="nk128-muted" style="margin-top:10px;">Sin órdenes</div>'}</div>`;
    }).join("");
    const workflowTasks = Object.entries(S.alertWorkflow).filter(([, row]) => row.status !== "cerrada" && row.owner).map(([key, row]) => ({ id: key, title: row.note || "Resolver alerta", owner: row.owner, due: row.dueAt, source: "Alerta" }));
    const serviceTasks = (S.mantenciones || []).filter((row) => row.gapOwner || row.nextMilestone).map((row) => ({ id: row.id, title: row.nextMilestone || "Resolver brechas", owner: row.gapOwner || "Sin responsable", due: row.nextMilestoneDate || row.termino, source: row.nombre }));
    const tasks = [...workflowTasks, ...serviceTasks].sort((a, b) => String(a.due || "").localeCompare(String(b.due || ""))).slice(0, 12);
    upsertAfterHeader("operaciones-cloud", "nk128-operations-planning", `<div id="nk128-operations-planning">
      <div class="card" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Calendario semanal de ejecución</div><div class="card-subtitle">Órdenes activas según su fecha de inicio y término.</div></div></div><div class="nk128-week">${days}</div></div>
      <div class="card" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Bandeja de tareas por responsable</div><div class="card-subtitle">Compromisos provenientes de alertas y brechas operativas.</div></div></div><div class="table-wrap"><table><thead><tr><th>Tarea</th><th>Origen</th><th>Responsable</th><th>Compromiso</th></tr></thead><tbody>${tasks.map((task) => `<tr><td><b>${esc(task.title)}</b></td><td>${esc(task.source)}</td><td>${esc(task.owner)}</td><td>${esc(task.due || "Sin fecha")}</td></tr>`).join("") || '<tr><td colspan="4">Sin tareas asignadas.</td></tr>'}</tbody></table></div></div>
    </div>`);
  }

  function renderOpportunityProjection() {
    const active = (S.opportunities || []).filter((row) => !["ganada", "perdida"].includes(row.stage));
    const months = {};
    active.forEach((row) => {
      const month = String(row.expectedClose || "Sin fecha").slice(0, 7) || "Sin fecha";
      months[month] ||= { count: 0, gross: 0, weighted: 0, missing: 0 };
      months[month].count += 1;
      months[month].gross += Number(row.amount) || 0;
      months[month].weighted += (Number(row.amount) || 0) * (Number(row.probability) || 0) / 100;
      if (!row.nextAction) months[month].missing += 1;
    });
    upsertAfterHeader("oportunidades", "nk128-opportunity-projection", `<div class="card" id="nk128-opportunity-projection" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Proyección mensual del embudo</div><div class="card-subtitle">La probabilidad, fecha estimada y próxima acción permiten anticipar cierres y gestiones.</div></div></div><div class="table-wrap"><table><thead><tr><th>Mes estimado</th><th>Oportunidades</th><th>Pipeline</th><th>Ponderado</th><th>Sin próxima acción</th></tr></thead><tbody>${Object.entries(months).sort().map(([month, row]) => `<tr><td><b>${esc(month)}</b></td><td>${row.count}</td><td>${money(row.gross)}</td><td>${money(row.weighted)}</td><td><span class="badge ${row.missing ? "badge-warn" : "badge-ok"}">${row.missing}</span></td></tr>`).join("") || '<tr><td colspan="5">Sin oportunidades activas.</td></tr>'}</tbody></table></div></div>`);
  }

  function renderContractReminders() {
    ensureState();
    const rows = (S.firmas || []).filter((row) => !["firmado", "cerrado"].includes(row.estado));
    const providerReady = Boolean(window.AccesoMinaCloud?.enabled);
    upsertAfterHeader("contratos", "nk128-contract-reminders", `<div class="card" id="nk128-contract-reminders" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Recordatorios y confirmación de firma</div><div class="card-subtitle">Seguimiento de documentos pendientes y estado del conector de firma.</div></div><span class="badge ${providerReady ? "badge-ok" : "badge-warn"}">${providerReady ? "API productiva disponible" : "Proveedor pendiente de configuración"}</span></div><div class="table-wrap"><table><thead><tr><th>Documento</th><th>Persona</th><th>Orden</th><th>Estado</th><th>Último recordatorio</th><th></th></tr></thead><tbody>${rows.map((row) => { const last = S.signatureReminders.find((item) => item.signatureId === row.id); return `<tr><td><b>${esc(row.tipo)}</b></td><td>${esc(trabNombre(row.trabId))}</td><td>${esc(mantNombre(row.mantId))}</td><td><span class="badge badge-warn">${esc(row.estado)}</span></td><td>${esc(last?.sentAt?.slice(0, 16).replace("T", " ") || "Sin envío")}</td><td><button class="btn btn-secondary btn-sm" onclick="sendSignatureReminder128('${row.id}')">Registrar recordatorio</button></td></tr>`; }).join("") || '<tr><td colspan="6">No existen firmas pendientes.</td></tr>'}</tbody></table></div></div>`);
  }

  window.sendSignatureReminder128 = function (id) {
    ensureState();
    S.signatureReminders.unshift({ id: `sr_${Date.now()}`, signatureId: id, sentAt: new Date().toISOString(), sentBy: tenantUser()?.email || "usuario", providerConfirmed: Boolean(window.AccesoMinaCloud?.enabled) });
    save(); renderContractReminders(); toast("Recordatorio registrado en historial");
  };

  function injectServiceManagement(id) {
    const service = S.mantenciones.find((row) => row.id === id);
    const target = document.getElementById("mant-tab-timeline");
    if (!service || !target || document.getElementById("nk128-service-management")) return;
    target.insertAdjacentHTML("afterbegin", `<div class="card" id="nk128-service-management" style="margin-bottom:14px;"><div class="card-header"><div><div class="card-title">Plan, avance e hitos</div><div class="card-subtitle">Presupuesto, progreso y responsable de resolver las brechas de la orden.</div></div><button class="btn btn-primary btn-sm" onclick="saveServiceManagement128('${id}')">Guardar</button></div><div class="form-grid">
      <div class="form-group"><label class="form-label">Presupuesto (CLP)</label><input class="form-input" id="nk128-service-budget" type="number" min="0" value="${Number(service.budget || 0)}"></div>
      <div class="form-group"><label class="form-label">Avance (%)</label><input class="form-input" id="nk128-service-progress" type="number" min="0" max="100" value="${Number(service.progress || 0)}"></div>
      <div class="form-group"><label class="form-label">Responsable de brechas</label><input class="form-input" id="nk128-service-owner" value="${esc(service.gapOwner || service.admin || "")}"></div>
      <div class="form-group"><label class="form-label">Próximo hito</label><input class="form-input" id="nk128-service-milestone" value="${esc(service.nextMilestone || "")}"></div>
      <div class="form-group"><label class="form-label">Fecha próximo hito</label><input class="form-input" id="nk128-service-milestone-date" type="date" value="${esc(service.nextMilestoneDate || "")}"></div>
      <div class="form-group full"><label class="form-label">Hitos y observaciones</label><textarea class="form-textarea" id="nk128-service-notes">${esc(service.milestones || "")}</textarea></div>
    </div></div>`);
  }

  window.saveServiceManagement128 = function (id) {
    const service = S.mantenciones.find((row) => row.id === id);
    if (!service) return;
    service.budget = Math.max(0, Number(document.getElementById("nk128-service-budget").value) || 0);
    service.progress = Math.min(100, Math.max(0, Number(document.getElementById("nk128-service-progress").value) || 0));
    service.gapOwner = document.getElementById("nk128-service-owner").value.trim();
    service.nextMilestone = document.getElementById("nk128-service-milestone").value.trim();
    service.nextMilestoneDate = document.getElementById("nk128-service-milestone-date").value;
    service.milestones = document.getElementById("nk128-service-notes").value.trim();
    service.evolution ||= [];
    service.evolution.unshift({ id: `ev_${Date.now()}`, date: today(), type: "avance", detail: `Avance ${service.progress}% · presupuesto ${money(service.budget)} · ${service.nextMilestone || "sin hito"}`, owner: tenantUser()?.email || "usuario" });
    save(); toast("Plan de la orden actualizado");
  };

  function subcontractScore(row) {
    const fields = ["f30", "f301", "cotizaciones", "seguro"];
    const valid = fields.filter((key) => row[key] && typeof estadoFecha === "function" && estadoFecha(row[key]) === "vigente").length;
    const missing = fields.filter((key) => !row[key] || estadoFecha(row[key]) === "vencido");
    return { score: Math.round(valid / fields.length * 100), missing, blocked: missing.length > 0 };
  }

  function renderSubcontractCompliance() {
    ensureState();
    (S.subcontratos || []).forEach((row) => { row.operationalBlock = subcontractScore(row).blocked; });
    const rows = (S.subcontratos || []).map((row) => ({ row, status: subcontractScore(row) }));
    upsertAfterHeader("subcontratos", "nk128-subcontract-compliance", `<div class="card" id="nk128-subcontract-compliance" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Cumplimiento y bloqueo automático</div><div class="card-subtitle">Un tercero queda bloqueado operacionalmente cuando falta o vence documentación crítica.</div></div></div><div class="table-wrap"><table><thead><tr><th>Tercero</th><th>Cumplimiento</th><th>Faltantes críticos</th><th>Estado operativo</th></tr></thead><tbody>${rows.map(({ row, status }) => `<tr><td><b>${esc(row.razon)}</b><div class="worker-rut">${esc(row.rut)}</div></td><td><b>${status.score}%</b></td><td>${status.missing.map((key) => `<span class="badge badge-err">${esc(key.toUpperCase())}</span>`).join(" ") || '<span class="badge badge-ok">Sin brechas</span>'}</td><td><span class="badge ${status.blocked ? "badge-err" : "badge-ok"}">${status.blocked ? "Bloqueado" : "Habilitado"}</span></td></tr>`).join("") || '<tr><td colspan="4">Sin terceros registrados.</td></tr>'}</tbody></table></div></div>`);
  }

  function renderRecruitmentKanban() {
    const serviceId = document.getElementById("rec-mant")?.value || "";
    const service = S.mantenciones.find((row) => row.id === serviceId);
    if (!service) return;
    const specialties = [...new Set((S.trabajadores || []).map((row) => row.especialidad).filter(Boolean))].sort();
    const assignments = (S.asignaciones || []).filter((row) => row.mantId === serviceId);
    const stages = typeof RECRUITMENT_STAGES_V84 !== "undefined" ? RECRUITMENT_STAGES_V84 : [];
    upsertAfterHeader("reclutamiento", "nk128-recruitment-kanban", `<div class="card" id="nk128-recruitment-kanban" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Vista Kanban de contratación</div><div class="card-subtitle">Seguimiento visual por etapa y especialidad.</div></div><div class="nk128-toolbar"><select class="form-select" id="nk128-recruit-specialty" onchange="saveRecruitmentFilter128(this.value)"><option value="">Todas las especialidades</option>${specialties.map((item) => `<option ${item === recruitmentSpecialty ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></div></div><div class="nk128-board">${stages.map((stage) => { const rows = assignments.filter((assignment) => (assignment.recruitmentStage || "reclutamiento") === stage.id).filter((assignment) => { const worker = S.trabajadores.find((item) => item.id === assignment.trabId); return !recruitmentSpecialty || worker?.especialidad === recruitmentSpecialty; }); return `<div class="nk128-column"><div class="nk128-column-title"><span>${esc(stage.label)}</span><span class="badge badge-blue">${rows.length}</span></div>${rows.map((assignment) => { const worker = S.trabajadores.find((item) => item.id === assignment.trabId); return `<div class="nk128-item"><b>${esc(worker?.nombre || "Persona")}</b><div class="nk128-muted">${esc(worker?.especialidad || "Sin especialidad")}</div></div>`; }).join("") || '<div class="nk128-muted">Sin personas</div>'}</div>`; }).join("")}</div></div>`);
  }

  window.saveRecruitmentFilter128 = function (value) {
    recruitmentSpecialty = value;
    try { localStorage.setItem(`nk128_recruitment_specialty_${currentTenantId || "local"}`, value); } catch {}
    renderRecruitmentKanban();
  };

  function renderPermanentStructure() {
    const workers = (S.trabajadores || []).filter((row) => row.tipo === "permanente" && !row.bloqueado);
    const groups = {};
    workers.forEach((row) => { const area = row.area || row.rol || "Sin área"; groups[area] ||= []; groups[area].push(row); });
    upsertAfterHeader("personal-planta", "nk128-permanent-structure", `<div class="card" id="nk128-permanent-structure" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Estructura, centro de costo y reemplazos</div><div class="card-subtitle">Vista organizacional de la dotación permanente.</div></div></div><div class="nk128-board">${Object.entries(groups).map(([area, rows]) => `<div class="nk128-column"><div class="nk128-column-title"><span>${esc(area)}</span><span class="badge badge-blue">${rows.length}</span></div>${rows.map((worker) => `<div class="nk128-item"><b>${esc(worker.nombre)}</b><div class="nk128-muted">${esc(worker.cargo || worker.especialidad || "Sin cargo")}</div><label class="nk128-muted">Centro de costo<input class="form-input" value="${esc(worker.costCenter || "")}" onchange="saveWorkerStructure128('${worker.id}','costCenter',this.value)"></label><label class="nk128-muted">Reemplazo<select class="form-select" onchange="saveWorkerStructure128('${worker.id}','replacementId',this.value)"><option value="">Sin reemplazo</option>${workers.filter((item) => item.id !== worker.id).map((item) => `<option value="${item.id}" ${worker.replacementId === item.id ? "selected" : ""}>${esc(item.nombre)}</option>`).join("")}</select></label></div>`).join("")}</div>`).join("") || '<div class="empty">Sin personal permanente.</div>'}</div></div>`);
  }

  window.saveWorkerStructure128 = function (id, field, value) {
    const worker = S.trabajadores.find((row) => row.id === id);
    if (!worker) return;
    worker[field] = value; save(); toast("Estructura de personal actualizada");
  };

  function renderEppInventoryBridge() {
    const stock = S.inventory.filter((row) => String(row.category || row.type || "").toLowerCase().includes("epp"));
    const pending = (S.trabajadores || []).filter((worker) => typeof eppStatus === "function" && (eppStatus(worker).missing.length || eppStatus(worker).expired.length));
    upsertAfterHeader("epp", "nk128-epp-inventory", `<div class="card" id="nk128-epp-inventory" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">EPP conectado con inventario y reposición</div><div class="card-subtitle">Las entregas y faltantes se contrastan con el stock disponible.</div></div><button class="btn btn-secondary btn-sm" onclick="nav('operaciones-cloud')">Gestionar inventario</button></div><div class="kpi-grid" style="margin-top:12px;"><div class="kpi kpi-blue"><div class="kpi-value">${stock.reduce((sum, row) => sum + Number(row.stock || 0), 0)}</div><div class="kpi-label">Unidades EPP en stock</div></div><div class="kpi kpi-orange"><div class="kpi-value">${pending.length}</div><div class="kpi-label">Personas por abastecer</div></div><div class="kpi kpi-red"><div class="kpi-value">${stock.filter((row) => Number(row.stock || 0) <= Number(row.minStock || 0)).length}</div><div class="kpi-label">Reposiciones necesarias</div></div></div></div>`);
  }

  function renderTrainingMatrix() {
    const roles = [...new Set((S.trabajadores || []).map((row) => row.cargo || row.especialidad).filter(Boolean))].sort();
    upsertAfterHeader("cursos", "nk128-training-matrix", `<div class="card" id="nk128-training-matrix" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Matriz de formación obligatoria</div><div class="card-subtitle">Define cursos mínimos por cargo y orden de servicio.</div></div><button class="btn btn-primary btn-sm" onclick="openTrainingMatrix128()">+ Regla de formación</button></div><div class="table-wrap"><table><thead><tr><th>Cargo / especialidad</th><th>Orden</th><th>Curso requerido</th><th>Vigencia</th></tr></thead><tbody>${S.trainingMatrices.map((row) => `<tr><td><b>${esc(row.role)}</b></td><td>${esc(mantNombre(row.serviceId) || "Todas")}</td><td>${esc(row.course)}</td><td>${row.validityMonths} meses</td></tr>`).join("") || '<tr><td colspan="4">Sin reglas configuradas.</td></tr>'}</tbody></table></div><div class="nk128-muted">Cargos disponibles: ${roles.map(esc).join(", ") || "sin catálogo"}</div></div>`);
  }

  window.openTrainingMatrix128 = function () {
    const roles = [...new Set((S.trabajadores || []).map((row) => row.cargo || row.especialidad).filter(Boolean))].sort();
    openForm("Nueva regla de formación", `<div class="form-grid"><div class="form-group"><label class="form-label">Cargo / especialidad</label><select class="form-select" id="nk128-training-role">${roles.map((role) => `<option>${esc(role)}</option>`).join("")}</select></div><div class="form-group"><label class="form-label">Orden de servicio</label><select class="form-select" id="nk128-training-service"><option value="">Todas</option>${(S.mantenciones || []).map((row) => `<option value="${row.id}">${esc(row.nombre)}</option>`).join("")}</select></div><div class="form-group"><label class="form-label">Curso requerido</label><input class="form-input" id="nk128-training-course" required></div><div class="form-group"><label class="form-label">Vigencia (meses)</label><input class="form-input" id="nk128-training-validity" type="number" min="1" value="12"></div></div>`, () => {
      const course = document.getElementById("nk128-training-course").value.trim();
      if (!course) return toast("Indica el curso requerido", "err");
      S.trainingMatrices.push({ id: `tm_${Date.now()}`, role: document.getElementById("nk128-training-role").value, serviceId: document.getElementById("nk128-training-service").value, course, validityMonths: Number(document.getElementById("nk128-training-validity").value) || 12 });
      save(); closeModal("nk128-modal"); renderTrainingMatrix(); toast("Regla de formación creada");
    });
  };

  function renderHealthMatrix() {
    const canView = ["admin", "prevencion", "salud"].some((role) => currentRole().includes(role));
    upsertAfterHeader("protocolos", "nk128-health-matrix", `<div class="card" id="nk128-health-matrix" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Matriz cargo–riesgo–protocolo</div><div class="card-subtitle">Los datos clínicos permanecen restringidos; la operación consulta solo aptitud y vigencia.</div></div>${canView ? '<button class="btn btn-primary btn-sm" onclick="openHealthMatrix128()">+ Regla de salud</button>' : '<span class="badge badge-warn">Vista restringida</span>'}</div>${canView ? `<div class="table-wrap"><table><thead><tr><th>Cargo</th><th>Riesgo / exposición</th><th>Protocolo</th><th>Periodicidad</th></tr></thead><tbody>${S.healthRiskMatrices.map((row) => `<tr><td><b>${esc(row.role)}</b></td><td>${esc(row.risk)}</td><td>${esc(row.protocol)}</td><td>${row.frequencyMonths} meses</td></tr>`).join("") || '<tr><td colspan="4">Sin reglas configuradas.</td></tr>'}</tbody></table></div>` : '<div class="cloud-note">Solicite acceso a un administrador o responsable de salud ocupacional.</div>'}</div>`);
  }

  window.openHealthMatrix128 = function () {
    const roles = [...new Set((S.trabajadores || []).map((row) => row.cargo || row.especialidad).filter(Boolean))].sort();
    openForm("Nueva regla de salud ocupacional", `<div class="form-grid"><div class="form-group"><label class="form-label">Cargo</label><select class="form-select" id="nk128-health-role">${roles.map((role) => `<option>${esc(role)}</option>`).join("")}</select></div><div class="form-group"><label class="form-label">Riesgo / exposición</label><input class="form-input" id="nk128-health-risk"></div><div class="form-group"><label class="form-label">Protocolo requerido</label><input class="form-input" id="nk128-health-protocol"></div><div class="form-group"><label class="form-label">Periodicidad (meses)</label><input class="form-input" id="nk128-health-frequency" type="number" min="1" value="12"></div></div>`, () => {
      const risk = document.getElementById("nk128-health-risk").value.trim(), protocol = document.getElementById("nk128-health-protocol").value.trim();
      if (!risk || !protocol) return toast("Completa riesgo y protocolo", "err");
      S.healthRiskMatrices.push({ id: `hm_${Date.now()}`, role: document.getElementById("nk128-health-role").value, risk, protocol, frequencyMonths: Number(document.getElementById("nk128-health-frequency").value) || 12 });
      save(); closeModal("nk128-modal"); renderHealthMatrix(); toast("Regla de salud creada");
    });
  };

  function renderCommunicationsGovernance() {
    upsertAfterHeader("llamados", "nk128-communications", `<div class="card" id="nk128-communications" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Plantillas, consentimiento e historial de entrega</div><div class="card-subtitle">Comunicación individual o grupal con trazabilidad.</div></div><button class="btn btn-primary btn-sm" onclick="openCommunicationTemplate128()">+ Plantilla aprobada</button></div><div class="grid-2"><div class="table-wrap"><table><thead><tr><th>Plantilla</th><th>Canal</th><th>Estado</th></tr></thead><tbody>${S.communicationTemplates.map((row) => `<tr><td><b>${esc(row.name)}</b><div class="worker-rut">${esc(row.body)}</div></td><td>${esc(row.channel)}</td><td><span class="badge ${row.approved ? "badge-ok" : "badge-warn"}">${row.approved ? "Aprobada" : "Borrador"}</span></td></tr>`).join("") || '<tr><td colspan="3">Sin plantillas.</td></tr>'}</tbody></table></div><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Destinatarios</th><th>Canal</th><th>Resultado</th></tr></thead><tbody>${S.communicationHistory.slice(0, 10).map((row) => `<tr><td>${esc(row.sentAt?.slice(0, 16).replace("T", " "))}</td><td>${row.recipients}</td><td>${esc(row.channel)}</td><td>${esc(row.status)}</td></tr>`).join("") || '<tr><td colspan="4">Sin entregas registradas.</td></tr>'}</tbody></table></div></div><div class="cloud-note">Antes de enviar, valide consentimiento y datos de contacto. Los envíos reales requieren el proveedor de correo o WhatsApp configurado.</div></div>`);
  }

  window.openCommunicationTemplate128 = function () {
    openForm("Nueva plantilla de comunicación", `<div class="form-grid"><div class="form-group"><label class="form-label">Nombre</label><input class="form-input" id="nk128-comm-name"></div><div class="form-group"><label class="form-label">Canal</label><select class="form-select" id="nk128-comm-channel"><option>WhatsApp</option><option>Correo</option><option>Ambos</option></select></div><div class="form-group full"><label class="form-label">Mensaje</label><textarea class="form-textarea" id="nk128-comm-body"></textarea></div><div class="form-group full"><label><input type="checkbox" id="nk128-comm-approved"> Aprobada para uso</label></div></div>`, () => {
      const name = document.getElementById("nk128-comm-name").value.trim(), body = document.getElementById("nk128-comm-body").value.trim();
      if (!name || !body) return toast("Completa nombre y mensaje", "err");
      S.communicationTemplates.push({ id: `ct_${Date.now()}`, name, body, channel: document.getElementById("nk128-comm-channel").value, approved: document.getElementById("nk128-comm-approved").checked });
      save(); closeModal("nk128-modal"); renderCommunicationsGovernance(); toast("Plantilla guardada");
    });
  };

  function renderPortalReviewQueue() {
    upsertAfterHeader("acreditacion-mandante", "nk128-portal-review", `<div class="card" id="nk128-portal-review" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Portal externo de revisión</div><div class="card-subtitle">El cliente puede revisar, observar o aprobar antecedentes según su permiso.</div></div><button class="btn btn-secondary btn-sm" onclick="nav('operaciones-cloud')">Administrar accesos</button></div><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Entidad</th><th>Cliente</th><th>Revisor</th><th>Resultado</th><th>Observación</th></tr></thead><tbody>${S.portalReviews.map((row) => `<tr><td>${esc(row.at?.slice(0, 10))}</td><td>${esc(row.entity)}</td><td>${esc(minaNombre(row.clientId))}</td><td>${esc(row.reviewer)}</td><td><span class="badge ${row.result === "aprobado" ? "badge-ok" : "badge-warn"}">${esc(row.result)}</span></td><td>${esc(row.note)}</td></tr>`).join("") || '<tr><td colspan="6">Sin revisiones externas registradas.</td></tr>'}</tbody></table></div></div>`);
  }

  function documentScore(row) {
    const checks = row.checks || row.controls || {};
    const values = ["ocr", "signature", "qr", "photo", "integrity", "issuer"].map((key) => Boolean(checks[key] ?? row[key]));
    return Math.round(values.filter(Boolean).length / values.length * 100);
  }

  function renderAuditConfidence() {
    const rows = S.documentVerifications || S.documentReviews || [];
    upsertAfterHeader("auditoria", "nk128-audit-confidence", `<div class="card" id="nk128-audit-confidence" style="margin-bottom:16px;"><div class="card-header"><div><div class="card-title">Confianza documental y revisión humana</div><div class="card-subtitle">OCR, QR, firma, fotografía, integridad y emisor generan un score; la aprobación final siempre corresponde a una persona.</div></div></div><div class="table-wrap"><table><thead><tr><th>Documento</th><th>Entidad</th><th>Score</th><th>Revisión humana</th></tr></thead><tbody>${rows.slice(0, 20).map((row) => { const score = documentScore(row); return `<tr><td><b>${esc(row.documentType || row.type || "Documento")}</b></td><td>${esc(row.entityId || row.entity || "—")}</td><td><span class="badge ${score >= 80 ? "badge-ok" : score >= 50 ? "badge-warn" : "badge-err"}">${score}%</span></td><td>${esc(row.humanStatus || row.status || "Pendiente")}</td></tr>`; }).join("") || '<tr><td colspan="4">Sin validaciones registradas. Use Acreditación documental inteligente en Centro Operativo.</td></tr>'}</tbody></table></div></div>`);
  }

  function parseCsvLine(line) {
    const result = []; let value = "", quote = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') { if (quote && line[index + 1] === '"') { value += '"'; index += 1; } else quote = !quote; }
      else if (char === "," && !quote) { result.push(value); value = ""; }
      else value += char;
    }
    result.push(value); return result;
  }

  function installImportPreview() {
    const input = document.getElementById("imp-file");
    if (!input || input.dataset.nk128) return;
    input.dataset.nk128 = "1";
    input.closest(".card")?.insertAdjacentHTML("beforeend", '<div id="nk128-import-preview" class="card" style="margin-top:14px;"><div class="card-title">Vista previa y control de duplicados</div><div class="nk128-muted">Seleccione un archivo para revisar las primeras filas antes de importar.</div></div>');
    input.addEventListener("change", async () => {
      const file = input.files?.[0], host = document.getElementById("nk128-import-preview");
      if (!file || !host) return;
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      if (file.name.toLowerCase().endsWith(".json")) {
        try { const value = JSON.parse(text); host.innerHTML = `<div class="card-title">Respaldo JSON válido</div><div class="cloud-note">${Object.keys(value || {}).length} secciones detectadas. La importación aplicará las validaciones del servidor.</div>`; }
        catch (error) { host.innerHTML = `<div class="card-title">Archivo inválido</div><div class="cloud-note">${esc(error.message)}</div>`; }
        return;
      }
      const allRows = lines.map(parseCsvLine);
      const rows = allRows.slice(0, 7);
      const headers = allRows[0];
      const rutIndex = headers.findIndex((header) => /rut/i.test(header));
      const existing = new Set((S.trabajadores || []).map((row) => String(row.rut || "").replace(/\W/g, "").toLowerCase()));
      const imported = new Set();
      const errors = [];
      allRows.slice(1).forEach((row, index) => {
        const rut = rutIndex >= 0 ? String(row[rutIndex] || "").replace(/\W/g, "").toLowerCase() : "";
        if (rut && existing.has(rut)) errors.push(`Fila ${index + 2}: RUT duplicado`);
        if (rut && imported.has(rut)) errors.push(`Fila ${index + 2}: RUT repetido dentro del archivo`);
        if (rut) imported.add(rut);
        if (row.length !== headers.length) errors.push(`Fila ${index + 2}: cantidad de columnas incorrecta`);
      });
      S.importValidations.unshift({ id: `iv_${Date.now()}`, fileName: file.name, at: new Date().toISOString(), rows: lines.length - 1, errors });
      save();
      host.innerHTML = `<div class="card-header"><div><div class="card-title">Vista previa: ${esc(file.name)}</div><div class="card-subtitle">${lines.length - 1} registros · ${errors.length} observaciones detectadas en el archivo completo</div></div>${errors.length ? '<button class="btn btn-secondary btn-sm" onclick="downloadImportErrors128()">Descargar errores</button>' : '<span class="badge badge-ok">Sin duplicados detectados</span>'}</div><div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map((row) => `<tr>${row.map((value) => `<td>${esc(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${errors.slice(0, 20).map((error) => `<div class="badge badge-err">${esc(error)}</div>`).join(" ")}${errors.length > 20 ? `<div class="nk128-muted">Se muestran 20 de ${errors.length} observaciones. Descargue el reporte completo.</div>` : ""}`;
    });
  }

  window.downloadImportErrors128 = function () {
    const latest = S.importValidations?.[0];
    if (!latest?.errors?.length) return toast("No existen errores para descargar", "err");
    exportCSV([["Archivo", "Error"], ...latest.errors.map((error) => [latest.fileName, error])], `errores_importacion_${today()}.csv`);
  };

  function enhance(page) {
    ensureState();
    if (page === "dashboard") renderDashboardPreferences();
    if (page === "alertas") renderManagedAlerts();
    if (page === "operaciones-cloud") renderOperationsPlanning();
    if (page === "oportunidades") renderOpportunityProjection();
    if (page === "contratos") renderContractReminders();
    if (page === "subcontratos") renderSubcontractCompliance();
    if (page === "reclutamiento") renderRecruitmentKanban();
    if (page === "personal-planta") renderPermanentStructure();
    if (page === "epp") renderEppInventoryBridge();
    if (page === "cursos") renderTrainingMatrix();
    if (page === "protocolos") renderHealthMatrix();
    if (page === "llamados") renderCommunicationsGovernance();
    if (page === "acreditacion-mandante") renderPortalReviewQueue();
    if (page === "auditoria") renderAuditConfidence();
    if (page === "transferencia") installImportPreview();
  }

  function install() {
    if (typeof S === "undefined" || typeof renderPage !== "function") return window.setTimeout(install, 100);
    ensureState(); installModal();
    const baseSnapshotState = snapshotState;
    snapshotState = function () {
      const snapshot = baseSnapshotState();
      ENTERPRISE_KEYS.forEach((key) => { snapshot[key] = S[key]; });
      return JSON.parse(JSON.stringify(snapshot));
    };
    const baseApplyState = applyState;
    applyState = function (data) {
      baseApplyState(data);
      ENTERPRISE_KEYS.forEach((key) => {
        const emptyValue = key === "uiRolePreferences" || key === "alertWorkflow" ? {} : [];
        S[key] = data?.[key] !== undefined ? data[key] : emptyValue;
      });
      ensureState();
    };
    try { recruitmentSpecialty = localStorage.getItem(`nk128_recruitment_specialty_${currentTenantId || "local"}`) || ""; } catch {}
    const baseRenderPage = renderPage;
    renderPage = function (page) { baseRenderPage(page); window.setTimeout(() => enhance(page), 0); };
    const baseOpenMant = openMantDetalle;
    openMantDetalle = function (id) { baseOpenMant(id); window.setTimeout(() => injectServiceManagement(id), 0); };
    const baseRenderAlerts = renderAlertas;
    renderAlertas = function () { baseRenderAlerts(); renderManagedAlerts(); };
    const page = document.querySelector(".page.active")?.id?.replace("page-", "") || "dashboard";
    window.setTimeout(() => enhance(page), 0);
    window.NexoKlarEnterprise = { version: VERSION, enhance };
  }

  window.addEventListener("load", install);
})();
