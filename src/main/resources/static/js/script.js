/**
 * Contact Management System - Dashboard Script
 * Implements full CRUD, safe DOM construction (XSS prevention), search debounce,
 * and session/CSRF-aware API integration with Spring Boot.
 */
document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentUser = null;
  let allContacts = [];
  let displayedContacts = [];
  let deleteTargetId = null;
  let searchTimeout = null;

  // DOM Elements - Header & User
  const userNameDisplay = document.getElementById('userNameDisplay');
  const logoutBtn = document.getElementById('logoutBtn');

  // DOM Elements - Stats
  const statTotalContacts = document.getElementById('statTotalContacts');
  const statWithEmail = document.getElementById('statWithEmail');
  const statWithPhone = document.getElementById('statWithPhone');
  const statRecentlyAdded = document.getElementById('statRecentlyAdded');

  // DOM Elements - Table & Search
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const contactsTable = document.getElementById('contactsTable');
  const contactsTbody = document.getElementById('contactsTbody');
  const displayedCount = document.getElementById('displayedCount');
  const tableLoadingState = document.getElementById('tableLoadingState');
  const tableEmptyState = document.getElementById('tableEmptyState');
  const emptyStateTitle = document.getElementById('emptyStateTitle');
  const emptyStateDesc = document.getElementById('emptyStateDesc');
  const emptyStateActionBtn = document.getElementById('emptyStateActionBtn');

  // DOM Elements - Add/Edit Modal
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const contactFormModal = document.getElementById('contactFormModal');
  const closeFormModalBtn = document.getElementById('closeFormModalBtn');
  const cancelFormModalBtn = document.getElementById('cancelFormModalBtn');
  const contactForm = document.getElementById('contactForm');
  const formModalTitle = document.getElementById('formModalTitle');
  const contactIdInput = document.getElementById('contactId');
  const contactNameInput = document.getElementById('contactName');
  const contactPhoneInput = document.getElementById('contactPhone');
  const contactEmailInput = document.getElementById('contactEmail');
  const contactCompanyInput = document.getElementById('contactCompany');
  const contactJobTitleInput = document.getElementById('contactJobTitle');
  const contactAddressInput = document.getElementById('contactAddress');
  const contactNotesInput = document.getElementById('contactNotes');
  const saveContactBtn = document.getElementById('saveContactBtn');
  const saveBtnText = document.getElementById('saveBtnText');
  const saveBtnSpinner = document.getElementById('saveBtnSpinner');
  const contactNameError = document.getElementById('contactNameError');
  const contactPhoneError = document.getElementById('contactPhoneError');
  const contactEmailError = document.getElementById('contactEmailError');

  // DOM Elements - View Modal
  const viewContactModal = document.getElementById('viewContactModal');
  const closeViewModalBtn = document.getElementById('closeViewModalBtn');
  const closeViewModalFooterBtn = document.getElementById('closeViewModalFooterBtn');
  const viewModalBody = document.getElementById('viewModalBody');
  const editFromViewBtn = document.getElementById('editFromViewBtn');
  let currentViewingContact = null;

  // DOM Elements - Delete Modal
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteContactName = document.getElementById('deleteContactName');
  const deleteBtnText = document.getElementById('deleteBtnText');
  const deleteBtnSpinner = document.getElementById('deleteBtnSpinner');

  // DOM Elements - Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // -------------------------------------------------------------
  // INITIALIZATION & AUTHENTICATION CHECK
  // -------------------------------------------------------------
  initApp();

  async function initApp() {
    try {
      const authRes = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!authRes.ok) {
        window.location.href = 'login.html';
        return;
      }
      currentUser = await authRes.json();
      userNameDisplay.textContent = currentUser.fullName || currentUser.email;

      // Load initial data
      await loadContacts();
      await updateDashboardStats();
    } catch (err) {
      console.warn('Backend session check error, redirecting:', err);
      window.location.href = 'login.html';
    }
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const csrf = getCsrfToken();
        const headers = {};
        if (csrf) headers['X-XSRF-TOKEN'] = csrf;

        await fetch('/api/auth/logout', {
          method: 'POST',
          headers,
          credentials: 'same-origin'
        });
      } finally {
        window.location.href = 'login.html';
      }
    });
  }

  // -------------------------------------------------------------
  // CONTACTS FETCHING & RENDERING
  // -------------------------------------------------------------
  async function loadContacts() {
    setLoadingState(true);
    try {
      const res = await fetch('/api/contacts', { credentials: 'same-origin' });
      if (res.ok) {
        allContacts = await res.json();
        displayedContacts = [...allContacts];
        renderContacts(displayedContacts);
      } else if (res.status === 401) {
        window.location.href = 'login.html';
      } else {
        showToast('Failed to load contacts from server', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Error connecting to contact database', 'error');
    } finally {
      setLoadingState(false);
    }
  }

  async function updateDashboardStats() {
    try {
      const res = await fetch('/api/contacts/stats', { credentials: 'same-origin' });
      if (res.ok) {
        const stats = await res.json();
        statTotalContacts.textContent = stats.totalContacts;
        statWithEmail.textContent = stats.contactsWithEmail;
        statWithPhone.textContent = stats.contactsWithPhone;
        statRecentlyAdded.textContent = stats.recentlyAddedCount;
      } else {
        // Fallback: calculate dynamically from loaded contacts list
        computeLocalStats(allContacts);
      }
    } catch (_) {
      computeLocalStats(allContacts);
    }
  }

  function computeLocalStats(contacts) {
    const total = contacts.length;
    const withEmail = contacts.filter(c => c.email && c.email.trim() !== '').length;
    const withPhone = contacts.filter(c => c.phone && c.phone.trim() !== '').length;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = contacts.filter(c => c.createdAt && new Date(c.createdAt) >= sevenDaysAgo).length;

    statTotalContacts.textContent = total;
    statWithEmail.textContent = withEmail;
    statWithPhone.textContent = withPhone;
    statRecentlyAdded.textContent = recent;
  }

  /**
   * Safe Rendering Function:
   * Strictly uses textContent and document.createElement() to prevent XSS.
   */
  function renderContacts(contacts) {
    contactsTbody.innerHTML = '';
    displayedCount.textContent = contacts.length;

    if (contacts.length === 0) {
      contactsTable.style.display = 'none';
      tableEmptyState.style.display = 'block';

      const isSearching = searchInput.value.trim().length > 0;
      if (isSearching) {
        emptyStateTitle.textContent = 'No matching contacts';
        emptyStateDesc.textContent = `No contacts found matching "${searchInput.value.trim()}". Try checking for typos or searching with different terms.`;
        emptyStateActionBtn.style.display = 'none';
      } else {
        emptyStateTitle.textContent = 'No contacts in directory';
        emptyStateDesc.textContent = "You haven't added any contacts yet. Get started by clicking the button below.";
        emptyStateActionBtn.style.display = 'inline-flex';
      }
      return;
    }

    contactsTable.style.display = 'table';
    tableEmptyState.style.display = 'none';

    contacts.forEach(contact => {
      const tr = document.createElement('tr');

      // 1. Name & Avatar Cell
      const tdName = document.createElement('td');
      const nameWrapper = document.createElement('div');
      nameWrapper.className = 'contact-name-cell';

      const avatar = document.createElement('div');
      avatar.className = 'avatar-bubble';
      avatar.textContent = getInitials(contact.name);

      const nameInfo = document.createElement('div');
      const nameTitle = document.createElement('div');
      nameTitle.style.fontWeight = '600';
      nameTitle.style.color = 'var(--color-slate-800)';
      nameTitle.textContent = contact.name;
      nameInfo.appendChild(nameTitle);

      if (contact.jobTitle) {
        const titleSub = document.createElement('div');
        titleSub.className = 'contact-title-sub';
        titleSub.textContent = contact.jobTitle;
        nameInfo.appendChild(titleSub);
      }

      nameWrapper.appendChild(avatar);
      nameWrapper.appendChild(nameInfo);
      tdName.appendChild(nameWrapper);

      // 2. Email Cell
      const tdEmail = document.createElement('td');
      if (contact.email) {
        tdEmail.textContent = contact.email;
      } else {
        const noEmail = document.createElement('span');
        noEmail.className = 'text-muted';
        noEmail.textContent = '—';
        tdEmail.appendChild(noEmail);
      }

      // 3. Phone Cell
      const tdPhone = document.createElement('td');
      const phoneSpan = document.createElement('span');
      phoneSpan.style.fontFamily = "'JetBrains Mono', monospace";
      phoneSpan.style.fontSize = "0.8125rem";
      phoneSpan.textContent = contact.phone || '—';
      tdPhone.appendChild(phoneSpan);

      // 4. Company Cell
      const tdCompany = document.createElement('td');
      if (contact.company) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = contact.company;
        tdCompany.appendChild(badge);
      } else {
        const noCompany = document.createElement('span');
        noCompany.className = 'text-muted';
        noCompany.textContent = '—';
        tdCompany.appendChild(noCompany);
      }

      // 5. Address Cell
      const tdAddress = document.createElement('td');
      if (contact.address) {
        tdAddress.textContent = contact.address;
        tdAddress.style.maxWidth = '220px';
        tdAddress.style.overflow = 'hidden';
        tdAddress.style.textOverflow = 'ellipsis';
        tdAddress.style.whiteSpace = 'nowrap';
      } else {
        const noAddr = document.createElement('span');
        noAddr.className = 'text-muted';
        noAddr.textContent = '—';
        tdAddress.appendChild(noAddr);
      }

      // 6. Date Created Cell
      const tdDate = document.createElement('td');
      tdDate.style.fontSize = '0.8125rem';
      tdDate.style.color = 'var(--color-slate-500)';
      tdDate.textContent = formatDate(contact.createdAt);

      // 7. Actions Cell
      const tdActions = document.createElement('td');
      tdActions.style.textAlign = 'right';

      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'table-actions';
      actionsWrapper.style.justifyContent = 'flex-end';

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'action-btn';
      viewBtn.textContent = 'View';
      viewBtn.setAttribute('aria-label', `View details for ${contact.name}`);
      viewBtn.addEventListener('click', () => openViewModal(contact));

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'action-btn';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit ${contact.name}`);
      editBtn.addEventListener('click', () => openEditModal(contact));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'action-btn delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete ${contact.name}`);
      deleteBtn.addEventListener('click', () => openDeleteModal(contact));

      actionsWrapper.appendChild(viewBtn);
      actionsWrapper.appendChild(editBtn);
      actionsWrapper.appendChild(deleteBtn);
      tdActions.appendChild(actionsWrapper);

      // Append all cells
      tr.appendChild(tdName);
      tr.appendChild(tdEmail);
      tr.appendChild(tdPhone);
      tr.appendChild(tdCompany);
      tr.appendChild(tdAddress);
      tr.appendChild(tdDate);
      tr.appendChild(tdActions);

      contactsTbody.appendChild(tr);
    });
  }

  // -------------------------------------------------------------
  // REAL-TIME SEARCH & FILTERING
  // -------------------------------------------------------------
  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    clearSearchBtn.style.display = query.length > 0 ? 'inline-block' : 'none';

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      await performSearch(query.trim());
    }, 250);
  });

  clearSearchBtn.addEventListener('click', async () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    await performSearch('');
  });

  async function performSearch(query) {
    if (!query) {
      displayedContacts = [...allContacts];
      renderContacts(displayedContacts);
      return;
    }

    try {
      const res = await fetch(`/api/contacts/search?query=${encodeURIComponent(query)}`, {
        credentials: 'same-origin'
      });
      if (res.ok) {
        displayedContacts = await res.json();
        renderContacts(displayedContacts);
      } else {
        // Local fallback
        const lower = query.toLowerCase();
        displayedContacts = allContacts.filter(c =>
          (c.name && c.name.toLowerCase().includes(lower)) ||
          (c.phone && c.phone.toLowerCase().includes(lower)) ||
          (c.email && c.email.toLowerCase().includes(lower)) ||
          (c.company && c.company.toLowerCase().includes(lower)) ||
          (c.address && c.address.toLowerCase().includes(lower))
        );
        renderContacts(displayedContacts);
      }
    } catch (_) {
      const lower = query.toLowerCase();
      displayedContacts = allContacts.filter(c =>
        (c.name && c.name.toLowerCase().includes(lower)) ||
        (c.phone && c.phone.toLowerCase().includes(lower)) ||
        (c.email && c.email.toLowerCase().includes(lower)) ||
        (c.company && c.company.toLowerCase().includes(lower)) ||
        (c.address && c.address.toLowerCase().includes(lower))
      );
      renderContacts(displayedContacts);
    }
  }

  // -------------------------------------------------------------
  // ADD & EDIT CONTACT MODAL HANDLING
  // -------------------------------------------------------------
  openAddModalBtn.addEventListener('click', openAddModal);
  if (emptyStateActionBtn) {
    emptyStateActionBtn.addEventListener('click', openAddModal);
  }

  function openAddModal() {
    clearFormErrors();
    contactForm.reset();
    contactIdInput.value = '';
    formModalTitle.textContent = 'Add New Contact';
    saveBtnText.textContent = 'Save Contact';
    contactFormModal.classList.add('active');
    setTimeout(() => contactNameInput.focus(), 50);
  }

  function openEditModal(contact) {
    clearFormErrors();
    contactForm.reset();
    contactIdInput.value = contact.id;
    contactNameInput.value = contact.name || '';
    contactPhoneInput.value = contact.phone || '';
    contactEmailInput.value = contact.email || '';
    contactCompanyInput.value = contact.company || '';
    contactJobTitleInput.value = contact.jobTitle || '';
    contactAddressInput.value = contact.address || '';
    contactNotesInput.value = contact.notes || '';

    formModalTitle.textContent = 'Edit Contact';
    saveBtnText.textContent = 'Update Contact';
    contactFormModal.classList.add('active');
    setTimeout(() => contactNameInput.focus(), 50);
  }

  const hideFormModal = () => contactFormModal.classList.remove('active');
  closeFormModalBtn.addEventListener('click', hideFormModal);
  cancelFormModalBtn.addEventListener('click', hideFormModal);

  // Form Submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors();

    const name = contactNameInput.value.trim();
    const phone = contactPhoneInput.value.trim();
    const email = contactEmailInput.value.trim();
    const company = contactCompanyInput.value.trim();
    const jobTitle = contactJobTitleInput.value.trim();
    const address = contactAddressInput.value.trim();
    const notes = contactNotesInput.value.trim();
    const id = contactIdInput.value;

    let isValid = true;
    if (!name) {
      showFieldError(contactNameInput, contactNameError, 'Full name is required.');
      isValid = false;
    }
    if (!phone) {
      showFieldError(contactPhoneInput, contactPhoneError, 'Phone number is required.');
      isValid = false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(contactEmailInput, contactEmailError, 'Invalid email format.');
      isValid = false;
    }

    if (!isValid) return;

    setSaveLoading(true);

    const payload = {
      name,
      phone,
      email: email || null,
      company: company || null,
      jobTitle: jobTitle || null,
      address: address || null,
      notes: notes || null
    };

    try {
      const csrf = getCsrfToken();
      const headers = { 'Content-Type': 'application/json' };
      if (csrf) headers['X-XSRF-TOKEN'] = csrf;

      const isEditing = Boolean(id);
      const url = isEditing ? `/api/contacts/${id}` : '/api/contacts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        hideFormModal();
        showToast(isEditing ? 'Contact updated successfully' : 'Contact created successfully', 'success');
        await loadContacts();
        await updateDashboardStats();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || 'Failed to save contact', 'error');
      }
    } catch (err) {
      console.error('Save contact error:', err);
      showToast('Network error while saving contact', 'error');
    } finally {
      setSaveLoading(false);
    }
  });

  // -------------------------------------------------------------
  // VIEW CONTACT DETAILS MODAL
  // -------------------------------------------------------------
  function openViewModal(contact) {
    currentViewingContact = contact;
    viewModalBody.innerHTML = '';

    // Hero item inside modal
    const hero = document.createElement('div');
    hero.style.display = 'flex';
    hero.style.alignItems = 'center';
    hero.style.gap = '1rem';
    hero.style.marginBottom = '1.5rem';
    hero.style.paddingBottom = '1.25rem';
    hero.style.borderBottom = '1px solid var(--color-slate-200)';

    const heroAvatar = document.createElement('div');
    heroAvatar.className = 'avatar-bubble';
    heroAvatar.style.width = '3.5rem';
    heroAvatar.style.height = '3.5rem';
    heroAvatar.style.fontSize = '1.125rem';
    heroAvatar.textContent = getInitials(contact.name);

    const heroText = document.createElement('div');
    const heroName = document.createElement('h3');
    heroName.style.fontSize = '1.25rem';
    heroName.style.fontWeight = '700';
    heroName.style.color = 'var(--color-navy)';
    heroName.textContent = contact.name;
    heroText.appendChild(heroName);

    if (contact.jobTitle || contact.company) {
      const heroRole = document.createElement('p');
      heroRole.style.fontSize = '0.875rem';
      heroRole.style.color = 'var(--color-slate-600)';
      heroRole.textContent = [contact.jobTitle, contact.company].filter(Boolean).join(' at ');
      heroText.appendChild(heroRole);
    }

    hero.appendChild(heroAvatar);
    hero.appendChild(heroText);
    viewModalBody.appendChild(hero);

    // Detail rows grid
    const detailGrid = document.createElement('div');
    detailGrid.className = 'form-grid';

    addDetailItem(detailGrid, 'Phone Number', contact.phone || 'Not provided');
    addDetailItem(detailGrid, 'Email Address', contact.email || 'Not provided');
    addDetailItem(detailGrid, 'Company', contact.company || 'Not provided');
    addDetailItem(detailGrid, 'Job Title', contact.jobTitle || 'Not provided');
    addDetailItem(detailGrid, 'Address', contact.address || 'Not provided', true);
    addDetailItem(detailGrid, 'Notes', contact.notes || 'No notes recorded', true);
    addDetailItem(detailGrid, 'Created On', formatDate(contact.createdAt));
    addDetailItem(detailGrid, 'Last Updated', formatDate(contact.updatedAt || contact.createdAt));

    viewModalBody.appendChild(detailGrid);
    viewContactModal.classList.add('active');
  }

  function addDetailItem(container, labelText, valueText, isFull = false) {
    const item = document.createElement('div');
    item.className = isFull ? 'form-group form-group-full' : 'form-group';

    const label = document.createElement('div');
    label.style.fontSize = '0.75rem';
    label.style.fontWeight = '600';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.05em';
    label.style.color = 'var(--color-slate-500)';
    label.style.marginBottom = '0.25rem';
    label.textContent = labelText;

    const value = document.createElement('div');
    value.style.fontSize = '0.875rem';
    value.style.fontWeight = '500';
    value.style.color = 'var(--color-slate-800)';
    value.textContent = valueText;

    item.appendChild(label);
    item.appendChild(value);
    container.appendChild(item);
  }

  const hideViewModal = () => viewContactModal.classList.remove('active');
  closeViewModalBtn.addEventListener('click', hideViewModal);
  closeViewModalFooterBtn.addEventListener('click', hideViewModal);

  editFromViewBtn.addEventListener('click', () => {
    hideViewModal();
    if (currentViewingContact) {
      openEditModal(currentViewingContact);
    }
  });

  // -------------------------------------------------------------
  // DELETE CONTACT MODAL & CONFIRMATION
  // -------------------------------------------------------------
  function openDeleteModal(contact) {
    deleteTargetId = contact.id;
    deleteContactName.textContent = `"${contact.name}"`;
    deleteConfirmModal.classList.add('active');
  }

  const hideDeleteModal = () => {
    deleteConfirmModal.classList.remove('active');
    deleteTargetId = null;
  };

  closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
  cancelDeleteBtn.addEventListener('click', hideDeleteModal);

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!deleteTargetId) return;

    setDeleteLoading(true);

    try {
      const csrf = getCsrfToken();
      const headers = {};
      if (csrf) headers['X-XSRF-TOKEN'] = csrf;

      const res = await fetch(`/api/contacts/${deleteTargetId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin'
      });

      if (res.ok || res.status === 204) {
        hideDeleteModal();
        showToast('Contact permanently deleted', 'success');
        await loadContacts();
        await updateDashboardStats();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || 'Failed to delete contact', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error connecting to server', 'error');
    } finally {
      setDeleteLoading(false);
    }
  });

  // -------------------------------------------------------------
  // HELPER UTILITIES
  // -------------------------------------------------------------
  function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDate(isoString) {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (_) {
      return isoString;
    }
  }

  function showFieldError(input, errorEl, message) {
    input.classList.add('is-invalid');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }

  function clearFormErrors() {
    [contactNameInput, contactPhoneInput, contactEmailInput].forEach(inp => inp.classList.remove('is-invalid'));
    [contactNameError, contactPhoneError, contactEmailError].forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function setLoadingState(loading) {
    tableLoadingState.style.display = loading ? 'block' : 'none';
    if (loading) {
      contactsTable.style.display = 'none';
      tableEmptyState.style.display = 'none';
    }
  }

  function setSaveLoading(loading) {
    saveContactBtn.disabled = loading;
    saveBtnText.style.display = loading ? 'none' : 'inline';
    saveBtnSpinner.style.display = loading ? 'inline' : 'none';
  }

  function setDeleteLoading(loading) {
    confirmDeleteBtn.disabled = loading;
    deleteBtnText.style.display = loading ? 'none' : 'inline';
    deleteBtnSpinner.style.display = loading ? 'inline' : 'none';
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // -------------------------------------------------------------
  // CSV IMPORT & EXPORT HANDLING
  // -------------------------------------------------------------
  const openImportModalBtn = document.getElementById('openImportModalBtn');
  const importCsvModal = document.getElementById('importCsvModal');
  const closeImportModalBtn = document.getElementById('closeImportModalBtn');
  const cancelImportBtn = document.getElementById('cancelImportBtn');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  const importBtnText = document.getElementById('importBtnText');
  const importBtnSpinner = document.getElementById('importBtnSpinner');
  const csvDropzone = document.getElementById('csvDropzone');
  const csvFileInput = document.getElementById('csvFileInput');
  const selectedFileInfo = document.getElementById('selectedFileInfo');
  const selectedFileName = document.getElementById('selectedFileName');
  const selectedFileSize = document.getElementById('selectedFileSize');
  const removeSelectedFileBtn = document.getElementById('removeSelectedFileBtn');
  const clientPreviewStats = document.getElementById('clientPreviewStats');
  const importResultBanner = document.getElementById('importResultBanner');

  let currentSelectedFile = null;

  if (openImportModalBtn && importCsvModal) {
    openImportModalBtn.addEventListener('click', () => {
      resetImportModal();
      importCsvModal.classList.add('active');
    });

    const hideImportModal = () => importCsvModal.classList.remove('active');
    if (closeImportModalBtn) closeImportModalBtn.addEventListener('click', hideImportModal);
    if (cancelImportBtn) cancelImportBtn.addEventListener('click', hideImportModal);

    // Dropzone interaction
    csvDropzone.addEventListener('click', () => csvFileInput.click());
    csvDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      csvDropzone.style.borderColor = 'var(--color-primary)';
      csvDropzone.style.backgroundColor = '#eff6ff';
    });
    csvDropzone.addEventListener('dragleave', () => {
      csvDropzone.style.borderColor = 'var(--color-slate-300)';
      csvDropzone.style.backgroundColor = 'var(--color-slate-50)';
    });
    csvDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      csvDropzone.style.borderColor = 'var(--color-slate-300)';
      csvDropzone.style.backgroundColor = 'var(--color-slate-50)';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    csvFileInput.addEventListener('change', () => {
      if (csvFileInput.files && csvFileInput.files.length > 0) {
        handleFileSelection(csvFileInput.files[0]);
      }
    });

    if (removeSelectedFileBtn) {
      removeSelectedFileBtn.addEventListener('click', () => {
        resetImportModal();
      });
    }

    confirmImportBtn.addEventListener('click', async () => {
      if (!currentSelectedFile) return;

      setImportLoading(true);
      importResultBanner.style.display = 'none';

      const formData = new FormData();
      formData.append('file', currentSelectedFile);

      try {
        const csrf = getCsrfToken();
        const headers = {};
        if (csrf) headers['X-XSRF-TOKEN'] = csrf;

        const res = await fetch('/api/contacts/import-csv', {
          method: 'POST',
          headers,
          credentials: 'same-origin',
          body: formData
        });

        if (res.ok) {
          const result = await res.json();
          renderImportSuccess(result);
          await loadContacts();
          await updateDashboardStats();
          showToast(`Successfully imported ${result.successCount} contacts!`, 'success');
        } else {
          const errData = await res.json().catch(() => ({}));
          renderImportError(errData.message || 'Failed to import CSV file');
        }
      } catch (err) {
        console.error('CSV import error:', err);
        renderImportError('Network error while uploading CSV');
      } finally {
        setImportLoading(false);
      }
    });
  }

  function handleFileSelection(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Please select a valid .csv file', 'error');
      return;
    }

    currentSelectedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = `(${(file.size / 1024).toFixed(1)} KB)`;
    selectedFileInfo.style.display = 'block';
    csvDropzone.style.display = 'none';
    confirmImportBtn.disabled = false;
    importResultBanner.style.display = 'none';

    // Quick client preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      const estRows = Math.max(0, lines.length - 1);
      clientPreviewStats.textContent = `File ready for server validation. Estimated data rows: ${estRows}.`;
    };
    reader.readAsText(file);
  }

  function resetImportModal() {
    currentSelectedFile = null;
    csvFileInput.value = '';
    selectedFileInfo.style.display = 'none';
    csvDropzone.style.display = 'block';
    confirmImportBtn.disabled = true;
    importResultBanner.style.display = 'none';
    importResultBanner.innerHTML = '';
  }

  function setImportLoading(loading) {
    confirmImportBtn.disabled = loading;
    importBtnText.style.display = loading ? 'none' : 'inline';
    importBtnSpinner.style.display = loading ? 'inline' : 'none';
  }

  function renderImportSuccess(result) {
    importResultBanner.style.display = 'block';
    importResultBanner.style.background = 'var(--color-success-light)';
    importResultBanner.style.border = '1px solid rgba(22, 163, 74, 0.3)';
    importResultBanner.style.color = '#15803d';

    let html = `
      <div style="font-weight: 700; font-size: 0.9375rem; margin-bottom: 0.35rem;">
        Import Completed: ${result.successCount} of ${result.totalRows} contacts imported successfully!
      </div>
    `;

    if (result.failedCount > 0 && result.errors && result.errors.length > 0) {
      html += `
        <div style="font-size: 0.8125rem; color: #b91c1c; margin-top: 0.5rem; max-height: 140px; overflow-y: auto;">
          <strong>${result.failedCount} rows skipped due to validation:</strong>
          <ul style="margin-top: 0.25rem; padding-left: 1.25rem;">
            ${result.errors.map(err => `<li>Line ${err.rowNumber} (${err.contactName}): ${err.reason}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    importResultBanner.innerHTML = html;
  }

  function renderImportError(message) {
    importResultBanner.style.display = 'block';
    importResultBanner.style.background = 'var(--color-danger-light)';
    importResultBanner.style.border = '1px solid rgba(220, 38, 38, 0.3)';
    importResultBanner.style.color = 'var(--color-danger)';
    importResultBanner.innerHTML = `<div style="font-weight: 600; font-size: 0.875rem;">Import Failed: ${message}</div>`;
  }

  // Export CSV Handling
  const openExportModalBtn = document.getElementById('openExportModalBtn');
  const exportCsvModal = document.getElementById('exportCsvModal');
  const closeExportModalBtn = document.getElementById('closeExportModalBtn');
  const cancelExportBtn = document.getElementById('cancelExportBtn');
  const confirmExportBtn = document.getElementById('confirmExportBtn');
  const exportPhoneFilter = document.getElementById('exportPhoneFilter');

  if (openExportModalBtn && exportCsvModal) {
    openExportModalBtn.addEventListener('click', () => {
      exportPhoneFilter.value = '';
      exportCsvModal.classList.add('active');
    });

    const hideExportModal = () => exportCsvModal.classList.remove('active');
    if (closeExportModalBtn) closeExportModalBtn.addEventListener('click', hideExportModal);
    if (cancelExportBtn) cancelExportBtn.addEventListener('click', hideExportModal);

    confirmExportBtn.addEventListener('click', async () => {
      const phoneVal = exportPhoneFilter.value.trim();
      hideExportModal();

      const url = phoneVal
        ? `/api/contacts/export-csv?phone=${encodeURIComponent(phoneVal)}`
        : '/api/contacts/export-csv';

      showToast(phoneVal ? `Exporting contacts filtered by phone "${phoneVal}"...` : 'Exporting all contacts...', 'info');

      try {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = downloadUrl;
          a.download = phoneVal
            ? `contacts_phone_${phoneVal.replace(/[^0-9+]/g, '')}.csv`
            : 'contacts_export.csv';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          a.remove();
          showToast('CSV file downloaded successfully!', 'success');
        } else {
          showToast('Failed to export CSV from server', 'error');
        }
      } catch (err) {
        console.error('Export error:', err);
        showToast('Error downloading export file', 'error');
      }
    });
  }

  function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
});
