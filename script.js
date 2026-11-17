(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = new Date().toISOString().slice(0, 10);
  const seedCampaigns = [
    {id:1,name:"Summer Sale 2026",type:"Email Campaign",audience:"All Subscribers",status:"In Progress",date:"2026-06-20",open:45.2,click:12.8},
    {id:2,name:"Product Launch: New Collection",type:"Product Update",audience:"Engaged Subscribers",status:"Scheduled",date:"2026-06-25",open:0,click:0},
    {id:3,name:"June Newsletter",type:"Newsletter",audience:"All Subscribers",status:"Completed",date:"2026-06-12",open:38.6,click:9.4},
    {id:4,name:"Welcome Series",type:"Email Campaign",audience:"New Subscribers",status:"Draft",date:"2026-06-28",open:0,click:0},
    {id:5,name:"Weekend Flash Offer",type:"Promotional",audience:"Engaged Subscribers",status:"Completed",date:"2026-06-08",open:51.3,click:16.2}
  ];
  const seedSubscribers = [
    {id:1,name:"John Smith",email:"john@email.com",status:"Active",date:"2026-01-15"},
    {id:2,name:"Sarah Johnson",email:"sarah@email.com",status:"Active",date:"2026-02-20"},
    {id:3,name:"Michael Brown",email:"michael@email.com",status:"Inactive",date:"2026-03-02"},
    {id:4,name:"Emily Davis",email:"emily@email.com",status:"Active",date:"2026-03-18"},
    {id:5,name:"David Wilson",email:"david@email.com",status:"Unsubscribed",date:"2026-04-04"}
  ];
  const seedTemplates = [
    {id:1,name:"Welcome email",subject:"Welcome to our community!",description:"A warm introduction for new subscribers.",category:"Onboarding"},
    {id:2,name:"Product announcement",subject:"Something new is here",description:"Share your latest product or feature.",category:"Product"},
    {id:3,name:"Monthly newsletter",subject:"Your monthly update",description:"A clean layout for news and updates.",category:"Newsletter"}
  ];
  const seedWorkflows = [
    {id:1,name:"Welcome new subscribers",trigger:"When someone subscribes",description:"Send a welcome message and introduce your brand.",status:"Active",symbol:"✉"},
    {id:2,name:"Customer nurture",trigger:"After first email is opened",description:"Follow up with useful content and product tips.",status:"Active",symbol:"♡"},
    {id:3,name:"Re-engagement sequence",trigger:"After 30 days of inactivity",description:"Invite inactive subscribers back to your community.",status:"Paused",symbol:"⟳"}
  ];
  const load = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
    catch { return fallback; }
  };
  let campaigns = load("marketauto_campaigns", seedCampaigns);
  let subscribers = load("marketauto_subscribers", seedSubscribers);
  let templates = load("marketauto_templates", seedTemplates);
  let workflows = load("marketauto_workflows", seedWorkflows);
  let landingPages = load("marketauto_landing", [{id:1,name:"Summer collection",description:"Summer promotion landing page",status:"Published"},{id:2,name:"New subscriber offer",description:"Signup offer landing page",status:"Draft"}]);
  const persist = () => {
    localStorage.setItem("marketauto_campaigns", JSON.stringify(campaigns));
    localStorage.setItem("marketauto_subscribers", JSON.stringify(subscribers));
    localStorage.setItem("marketauto_templates", JSON.stringify(templates));
    localStorage.setItem("marketauto_workflows", JSON.stringify(workflows));
    localStorage.setItem("marketauto_landing", JSON.stringify(landingPages));
  };
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const statusClass = status => status.toLowerCase().replace(/\s+/g, "-");
  const statusBadge = status => `<span class="status status-${statusClass(status)}">${escapeHTML(status)}</span>`;
  const campaignIcon = type => type.includes("Newsletter") ? "▤" : type.includes("Product") ? "◇" : "✉";
  const showToast = message => {
    const toast = $("#toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
  };
  const saveAndRender = () => { persist(); renderAll(); };

  function renderRecent() {
    $("#recentCampaignRows").innerHTML = campaigns.slice(0,4).map(c => `<tr><td><div class="campaign-name"><span class="campaign-icon">${campaignIcon(c.type)}</span>${escapeHTML(c.name)}</div></td><td>${escapeHTML(c.type)}</td><td>${statusBadge(c.status)}</td><td>${Number(c.open).toFixed(1)}%</td><td>${Number(c.click).toFixed(1)}%</td><td>${escapeHTML(c.date)}</td></tr>`).join("");
    $("#statCampaigns").textContent = String(campaigns.length + 7);
    $("#statSubscribers").textContent = (8544 + subscribers.length).toLocaleString("en-US");
  }
  function renderCampaigns() {
    const query = ($("#campaignSearch")?.value || "").trim().toLowerCase();
    const filter = $("#campaignFilter")?.value || "all";
    const filtered = campaigns.filter(c => (filter === "all" || c.status === filter) && `${c.name} ${c.type} ${c.audience}`.toLowerCase().includes(query));
    $("#campaignRows").innerHTML = filtered.map(c => `<tr><td><div class="campaign-name"><span class="campaign-icon">${campaignIcon(c.type)}</span>${escapeHTML(c.name)}</div></td><td>${escapeHTML(c.type)}</td><td>${escapeHTML(c.audience)}</td><td>${statusBadge(c.status)}</td><td>${Number(c.open).toFixed(1)}%</td><td>${Number(c.click).toFixed(1)}%</td><td>${escapeHTML(c.date)}</td><td><button class="action-btn" data-edit-campaign="${c.id}">Edit</button><button class="action-btn delete" data-delete-campaign="${c.id}">Delete</button></td></tr>`).join("");
    $("#campaignEmpty").hidden = filtered.length !== 0;
  }
  function renderSubscribers() {
    const query = ($("#subscriberSearch")?.value || "").trim().toLowerCase();
    const filter = $("#subscriberFilter")?.value || "all";
    const filtered = subscribers.filter(s => (filter === "all" || s.status === filter) && `${s.name} ${s.email}`.toLowerCase().includes(query));
    $("#subscriberRows").innerHTML = filtered.map(s => `<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.email)}</td><td>${statusBadge(s.status)}</td><td>${escapeHTML(s.date)}</td><td><button class="action-btn" data-toggle-subscriber="${s.id}">Change status</button><button class="action-btn delete" data-delete-subscriber="${s.id}">Delete</button></td></tr>`).join("");
    $("#subscriberEmpty").hidden = filtered.length !== 0;
    $("#subscriberTotal").textContent = subscribers.length;
    $("#subscriberActive").textContent = subscribers.filter(s => s.status === "Active").length;
    $("#subscriberUnsub").textContent = subscribers.filter(s => s.status === "Unsubscribed").length;
  }
  function renderTemplates() {
    $("#templateGrid").innerHTML = templates.map(t => `<article class="template-card"><div class="template-preview"><div class="email-mock"><div class="mock-head"></div><div class="mock-hero"></div><div class="mock-lines"></div><div class="mock-lines"></div><div class="mock-button"></div></div></div><div class="template-info"><h3>${escapeHTML(t.name)}</h3><p>${escapeHTML(t.description)}</p><small class="muted">${escapeHTML(t.category)} · ${escapeHTML(t.subject)}</small><div><button class="action-btn" data-preview-template="${t.id}">Preview</button><button class="action-btn delete" data-delete-template="${t.id}">Delete</button></div></div></article>`).join("");
  }
  function renderWorkflows() {
    $("#workflowGrid").innerHTML = workflows.map(w => `<article class="workflow-card"><div class="workflow-symbol">${escapeHTML(w.symbol || "⟳")}</div>${statusBadge(w.status)}<h3>${escapeHTML(w.name)}</h3><p>${escapeHTML(w.description)}</p><p><strong>Trigger:</strong> ${escapeHTML(w.trigger)}</p><button class="action-btn" data-toggle-workflow="${w.id}">${w.status === "Active" ? "Pause" : "Activate"}</button><button class="action-btn delete" data-delete-workflow="${w.id}">Delete</button></article>`).join("");
  }
  function renderLanding() {
    $("#landingGrid").innerHTML = landingPages.map(p => `<article class="template-card"><div class="template-preview"><div class="email-mock"><div class="mock-head"></div><div class="mock-hero"></div><div class="mock-lines"></div><div class="mock-lines"></div><div class="mock-button"></div></div></div><div class="template-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description)}</p>${statusBadge(p.status)}<div><button class="action-btn" data-toggle-landing="${p.id}">${p.status === "Published" ? "Unpublish" : "Publish"}</button><button class="action-btn delete" data-delete-landing="${p.id}">Delete</button></div></div></article>`).join("");
  }
  function renderAnalytics() {
    $("#analyticsRows").innerHTML = campaigns.map(c => `<tr><td>${escapeHTML(c.name)}</td><td>${c.status === "Draft" ? 0 : 1250}</td><td>${Number(c.open).toFixed(1)}%</td><td>${Number(c.click).toFixed(1)}%</td><td>1.8%</td><td>${c.status === "Completed" ? 65 : 0}</td></tr>`).join("");
  }
  function renderAll() { renderRecent(); renderCampaigns(); renderSubscribers(); renderTemplates(); renderWorkflows(); renderLanding(); renderAnalytics(); }

  function openCampaign(campaign) {
    $("#campaignForm").reset();
    $("#campaignId").value = campaign ? campaign.id : "";
    $("#campaignDialogTitle").textContent = campaign ? "Edit campaign" : "Create campaign";
    $("#campaignName").value = campaign?.name || "";
    $("#campaignType").value = campaign?.type || "Email Campaign";
    $("#campaignStatus").value = campaign?.status || "Draft";
    $("#campaignAudience").value = campaign?.audience || "All Subscribers";
    $("#campaignDate").value = campaign?.date || today;
    $("#campaignDialog").showModal();
  }
  function openSimple(title, eyebrow, fields, onSave) {
    const dialog = $("#simpleDialog"), form = $("#simpleForm");
    form.reset(); $("#simpleTitle").textContent = title; $("#simpleEyebrow").textContent = eyebrow;
    $("#simpleFields").innerHTML = fields.map(f => `<label>${escapeHTML(f.label)}${f.type === "select" ? `<select name="${escapeHTML(f.name)}" ${f.required ? "required" : ""}>${f.options.map(o => `<option>${escapeHTML(o)}</option>`).join("")}</select>` : `<input name="${escapeHTML(f.name)}" type="${f.type || "text"}" placeholder="${escapeHTML(f.placeholder || "")}" ${f.required ? "required" : ""} maxlength="100">`}</label>`).join("");
    form.onsubmit = event => { event.preventDefault(); const data = Object.fromEntries(new FormData(form).entries()); onSave(data); dialog.close(); };
    dialog.showModal();
  }
  function downloadCSV(filename, rows) {
    if (!rows.length) { showToast("There is no data to export."); return; }
    const columns = Object.keys(rows[0]);
    const csv = [columns.join(","), ...rows.map(row => columns.map(key => `"${String(row[key] ?? "").replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    showToast("CSV report downloaded.");
  }

  $("#campaignForm").addEventListener("submit", event => {
    event.preventDefault();
    const id = $("#campaignId").value;
    const existing = campaigns.find(c => c.id === Number(id));
    const item = {id: id ? Number(id) : Date.now(), name: $("#campaignName").value.trim(), type: $("#campaignType").value, status: $("#campaignStatus").value, audience: $("#campaignAudience").value, date: $("#campaignDate").value || today, open: existing?.open || 0, click: existing?.click || 0};
    if (!item.name) return;
    if (id) campaigns = campaigns.map(c => c.id === Number(id) ? item : c); else campaigns.unshift(item);
    $("#campaignDialog").close(); saveAndRender(); showToast(id ? "Campaign updated." : "Campaign created.");
  });

  document.addEventListener("click", event => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-open-campaign]")) openCampaign();
    if (target.matches("[data-close-dialog]")) target.closest("dialog")?.close();
    if (target.dataset.editCampaign) openCampaign(campaigns.find(c => c.id === Number(target.dataset.editCampaign)));
    if (target.dataset.deleteCampaign) {
      const id = Number(target.dataset.deleteCampaign);
      if (confirm("Delete this campaign?")) { campaigns = campaigns.filter(c => c.id !== id); saveAndRender(); showToast("Campaign deleted."); }
    }
    if (target.dataset.deleteSubscriber) {
      const id = Number(target.dataset.deleteSubscriber);
      if (confirm("Delete this subscriber?")) { subscribers = subscribers.filter(s => s.id !== id); saveAndRender(); showToast("Subscriber deleted."); }
    }
    if (target.dataset.toggleSubscriber) {
      const id = Number(target.dataset.toggleSubscriber);
      const order = ["Active","Inactive","Unsubscribed"];
      subscribers = subscribers.map(s => s.id === id ? {...s,status:order[(order.indexOf(s.status)+1)%order.length]} : s);
      saveAndRender(); showToast("Subscriber status updated.");
    }
    if (target.dataset.deleteTemplate) { templates = templates.filter(t => t.id !== Number(target.dataset.deleteTemplate)); saveAndRender(); showToast("Template deleted."); }
    if (target.dataset.previewTemplate) {
      const t = templates.find(item => item.id === Number(target.dataset.previewTemplate));
      if (t) alert(`Template: ${t.name}\nSubject: ${t.subject}\n\n${t.description}\n\nThis is a simulated email preview.`);
    }
    if (target.dataset.toggleWorkflow) {
      workflows = workflows.map(w => w.id === Number(target.dataset.toggleWorkflow) ? {...w,status:w.status === "Active" ? "Paused" : "Active"} : w);
      saveAndRender(); showToast("Workflow status updated.");
    }
    if (target.dataset.deleteWorkflow) { workflows = workflows.filter(w => w.id !== Number(target.dataset.deleteWorkflow)); saveAndRender(); showToast("Workflow deleted."); }
    if (target.dataset.toggleLanding) {
      landingPages = landingPages.map(p => p.id === Number(target.dataset.toggleLanding) ? {...p,status:p.status === "Published" ? "Draft" : "Published"} : p);
      saveAndRender(); showToast("Landing page status updated.");
    }
    if (target.dataset.deleteLanding) { landingPages = landingPages.filter(p => p.id !== Number(target.dataset.deleteLanding)); saveAndRender(); showToast("Landing page deleted."); }
  });

  $("#campaignSearch").addEventListener("input", renderCampaigns);
  $("#campaignFilter").addEventListener("change", renderCampaigns);
  $("#subscriberSearch").addEventListener("input", renderSubscribers);
  $("#subscriberFilter").addEventListener("change", renderSubscribers);
  $("#newTemplateBtn").addEventListener("click", () => openSimple("New email template","TEMPLATE",[
    {name:"name",label:"Template name",required:true,placeholder:"e.g. Event invitation"},
    {name:"subject",label:"Email subject",required:true,placeholder:"Your subject line"},
    {name:"category",label:"Category",type:"select",options:["Onboarding","Product","Newsletter","Promotional"]},
    {name:"description",label:"Description",placeholder:"What is this template for?"}
  ], data => {templates.unshift({id:Date.now(),...data});saveAndRender();showToast("Email template created.");}));
  $("#addSubscriberBtn").addEventListener("click", () => openSimple("Add subscriber","AUDIENCE",[
    {name:"name",label:"Full name",required:true,placeholder:"Subscriber name"},
    {name:"email",label:"Email address",type:"email",required:true,placeholder:"name@example.com"},
    {name:"status",label:"Status",type:"select",options:["Active","Inactive","Unsubscribed"]}
  ], data => {
    if (subscribers.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {showToast("That email is already on the list.");return;}
    subscribers.unshift({id:Date.now(),...data,date:today});saveAndRender();showToast("Subscriber added.");
  }));
  $("#newWorkflowBtn").addEventListener("click", () => openSimple("Create workflow","AUTOMATION",[
    {name:"name",label:"Workflow name",required:true,placeholder:"e.g. Post-purchase follow-up"},
    {name:"trigger",label:"Trigger",required:true,placeholder:"e.g. When a purchase is made"},
    {name:"description",label:"Description",placeholder:"Describe the automation"}
  ], data => {workflows.unshift({id:Date.now(),...data,status:"Active",symbol:"⟳"});saveAndRender();showToast("Workflow created.");}));
  $("#newLandingBtn").addEventListener("click", () => openSimple("Create landing page","PUBLISH",[
    {name:"name",label:"Page name",required:true,placeholder:"e.g. Winter offer"},
    {name:"description",label:"Description",placeholder:"Describe this landing page"}
  ], data => {landingPages.unshift({id:Date.now(),...data,status:"Draft"});saveAndRender();showToast("Landing page draft created.");}));
  $("#exportSubscribers").addEventListener("click", () => downloadCSV("market-auto-subscribers.csv", subscribers));
  $("#exportAnalytics").addEventListener("click", () => downloadCSV("market-auto-analytics.csv", campaigns.map(c => ({campaign:c.name,status:c.status,open_rate:c.open,click_rate:c.click,bounce_rate:"1.8%",conversions:c.status === "Completed" ? 65 : 0}))));
  $("#downloadReport").addEventListener("click", () => downloadCSV("market-auto-campaign-report.csv", campaigns));
  $("#downloadSubscriberReport").addEventListener("click", () => downloadCSV("market-auto-subscriber-report.csv", subscribers));
  $("#helpBtn").addEventListener("click", () => alert("Market Auto demo help\n\nUse the sidebar to navigate. Create campaigns, manage subscribers, edit templates and simulate automation workflows. Data is stored in this browser."));
  $("#themeBtn").addEventListener("click", () => {document.body.classList.toggle("dark");localStorage.setItem("marketauto_dark",document.body.classList.contains("dark") ? "1" : "0");});
  if (localStorage.getItem("marketauto_dark") === "1") document.body.classList.add("dark");
  $("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  function navigate() {
    const id = location.hash.replace("#","") || "dashboard";
    const sections = $$(".page-section");
    const active = sections.some(section => section.id === id) ? id : "dashboard";
    sections.forEach(section => {section.hidden = section.id !== active;});
    $$(".nav-link").forEach(link => link.classList.toggle("active",link.getAttribute("href") === `#${active}`));
    $("#currentPage").textContent = active === "landing" ? "Landing pages" : active.charAt(0).toUpperCase() + active.slice(1);
    $("#sidebar").classList.remove("open");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  window.addEventListener("hashchange",navigate);
  $("#todayLabel").textContent = new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(new Date());
  renderAll(); navigate();
})();