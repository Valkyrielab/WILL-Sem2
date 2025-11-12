;(function(){
	// ============= DATA =============
	function loadWarnings(){ try{ const raw = localStorage.getItem('warnings'); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
	function saveWarnings(data){ localStorage.setItem('warnings', JSON.stringify(data)); }

	// ============= UI =============
	const searchInput = document.getElementById('searchInput');
	const clearSearchBtn = document.getElementById('clearSearch');
	const sortSelect = document.getElementById('sortSelect');
	const addNewBtn = document.getElementById('addNew');
	const warningModal = document.getElementById('warningModal');
	const warningForm = document.getElementById('warningForm');
	const closeModalBtn = document.getElementById('closeModal');
	const cancelFormBtn = document.getElementById('cancelForm');
	const modalTitle = document.getElementById('modalTitle');

	let currentSearch = '';
	let currentSort = '';
	let editingIndex = -1;

	function applySort(items, sortKey){
		if(!sortKey) return items.slice();
		var copy = items.slice();
		if(sortKey === 'name-asc') return copy.sort(function(a,b){ var A=(a.empName||'').toLowerCase(), B=(b.empName||'').toLowerCase(); return A<B?-1:A>B?1:0; });
		if(sortKey === 'name-desc') return copy.sort(function(a,b){ var A=(a.empName||'').toLowerCase(), B=(b.empName||'').toLowerCase(); return A>B?-1:A<B?1:0; });
		if(sortKey === 'date-newest') return copy.sort(function(a,b){ var da=a.warningDate||'', db=b.warningDate||''; return db < da ? -1 : db > da ? 1 : 0; });
		if(sortKey === 'date-oldest') return copy.sort(function(a,b){ var da=a.warningDate||'', db=b.warningDate||''; return da < db ? -1 : da > db ? 1 : 0; });
		return copy;
	}

	function matches(w){ if(!currentSearch) return true; var s = currentSearch; return (w.empName||'').toLowerCase().includes(s) || (w.username||'').toLowerCase().includes(s); }

	function render(){
		var list = document.getElementById('warningsList');
		var empty = document.getElementById('emptyMsg');
		var warnings = loadWarnings();
		var tpl = document.getElementById('warningItemTemplate');
		if(!list || !tpl) return;
		list.innerHTML = '';
		var items = applySort(warnings, currentSort);
		var count = 0;
		items.forEach(function(warning){ if(!matches(warning)) return; count++; var clone = tpl.content.cloneNode(true); clone.querySelector('.warning-title').textContent = warning.empName || '—'; clone.querySelector('.warning-meta').textContent = 'ID: ' + (warning.id||'—'); clone.querySelector('.empName').textContent = warning.empName || '—'; clone.querySelector('.warningDate').textContent = warning.warningDate || '—'; var lv = clone.querySelector('.level'); lv.textContent = warning.level || '—'; lv.setAttribute('data-level', warning.level || ''); clone.querySelector('.reason').textContent = warning.reason || '—'; clone.querySelector('.notes').textContent = warning.notes || '—';
			var viewBtn = clone.querySelector('.btn-small.view'); if(viewBtn) viewBtn.addEventListener('click', function(){ alert('Warning for: ' + (warning.empName||'—') + '\nLevel: ' + (warning.level||'—') + '\nReason: ' + (warning.reason||'—')) });
			var editBtn = clone.querySelector('.btn-small.edit'); if(editBtn) editBtn.addEventListener('click', function(){ var idx = loadWarnings().findIndex(function(w){ return w.id === warning.id; }); openModal('Edit Warning', idx); });
			var expBtn = clone.querySelector('.btn-small.export'); if(expBtn) expBtn.addEventListener('click', function(){ downloadText('Warning\n'+JSON.stringify(warning,null,2), (warning.empName||'warning')+'_warning.txt'); });
			var delBtn = clone.querySelector('.btn-small.delete'); if(delBtn) delBtn.addEventListener('click', function(){ if(confirm('Delete this warning?')){ var arr = loadWarnings(); var ridx = arr.findIndex(function(w){ return w.id === warning.id; }); if(ridx !== -1){ arr.splice(ridx,1); saveWarnings(arr); render(); } } });
			list.appendChild(clone);
		});
		if(empty) empty.style.display = count === 0 ? 'block' : 'none';
	}

	function openModal(title, index){ editingIndex = index; modalTitle.textContent = title; if(index === -1){ warningForm.reset(); document.getElementById('formUsername').focus(); } else { var arr = loadWarnings(); var w = arr[index] || {}; document.getElementById('formUsername').value = w.username || ''; document.getElementById('formEmpName').value = w.empName || ''; document.getElementById('formWarningDate').value = w.warningDate || ''; document.getElementById('formLevel').value = w.level || ''; document.getElementById('formReason').value = w.reason || ''; document.getElementById('formNotes').value = w.notes || ''; } warningModal.classList.add('show'); }
	function closeModal(){ warningModal.classList.remove('show'); warningForm.reset(); editingIndex = -1; }

	if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
	if(cancelFormBtn) cancelFormBtn.addEventListener('click', closeModal);
	if(addNewBtn) addNewBtn.addEventListener('click', function(){ openModal('Issue Warning', -1); });
	if(searchInput) searchInput.addEventListener('input', function(){ currentSearch = this.value.toLowerCase().trim(); render(); });
	if(clearSearchBtn) clearSearchBtn.addEventListener('click', function(){ if(searchInput) searchInput.value=''; currentSearch=''; render(); });
	if(sortSelect) sortSelect.addEventListener('change', function(){ currentSort = this.value || ''; render(); });

	if(warningForm) warningForm.addEventListener('submit', function(e){ e.preventDefault(); var arr = loadWarnings(); var nw = { id: Date.now().toString(), username: document.getElementById('formUsername').value.trim(), empName: document.getElementById('formEmpName').value.trim(), warningDate: document.getElementById('formWarningDate').value, level: document.getElementById('formLevel').value, reason: document.getElementById('formReason').value.trim(), notes: document.getElementById('formNotes').value.trim() }; if(!nw.username||!nw.empName||!nw.warningDate||!nw.level||!nw.reason){ alert('Please fill all required fields'); return; } if(editingIndex === -1){ arr.push(nw); } else { nw.id = arr[editingIndex].id; arr[editingIndex] = nw; } saveWarnings(arr); closeModal(); render(); });

	function downloadText(text, filename){ var blob = new Blob([text], { type: 'text/plain' }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

	window.addEventListener('click', function(e){ if(e.target === warningModal) closeModal(); });

	// initial render
	render();
})();
