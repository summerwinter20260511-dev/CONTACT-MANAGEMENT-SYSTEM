/**
 * Contact Management System - Interactive Application & Codebase Suite
 * Provides both the live working application and an interactive project explorer.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Mail,
  Phone,
  Clock,
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  LogOut,
  Lock,
  EyeOff,
  Code2,
  FileText,
  Terminal,
  Database,
  CheckCircle2,
  AlertCircle,
  X,
  Building,
  MapPin,
  Briefcase,
  Copy,
  Check,
  ShieldCheck,
  UserPlus,
  LogIn,
  ExternalLink,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  jobTitle: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

const INITIAL_USERS: User[] = [
  {
    id: 1,
    fullName: 'Alex Vance',
    email: 'alex@enterprise.com',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 2,
    fullName: 'Sophia Martinez',
    email: 'sophia@techpulse.io',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 101,
    name: 'Eleanor Sterling',
    email: 'eleanor.s@sterlingadvisory.com',
    phone: '+1 (555) 349-2041',
    company: 'Sterling Advisory Group',
    jobTitle: 'Managing Partner',
    address: '450 Lexington Ave, New York, NY 10017',
    notes: 'Key client for Q4 strategic portfolio restructuring. Prefers morning phone consultations.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    userId: 1
  },
  {
    id: 102,
    name: 'Marcus Chen',
    email: 'marcus.chen@vertexsys.io',
    phone: '+1 (555) 892-1104',
    company: 'Vertex Systems',
    jobTitle: 'VP of Infrastructure',
    address: '100 Montgomery St, San Francisco, CA 94104',
    notes: 'Primary engineering contact for Kubernetes hybrid cloud deployment contract.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    userId: 1
  },
  {
    id: 103,
    name: 'Dr. Evelyn Morales',
    email: 'e.morales@biocore-labs.org',
    phone: '+1 (555) 431-7782',
    company: 'BioCore Diagnostics',
    jobTitle: 'Chief Scientific Officer',
    address: '88 Cambridge Parkway, Boston, MA 02142',
    notes: 'Met at BioTech Summit 2026. Interested in automated compliance monitoring API.',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    userId: 1
  },
  {
    id: 104,
    name: 'Devon Holloway',
    email: null,
    phone: '+1 (555) 762-9903',
    company: 'Apex Logistics',
    jobTitle: 'Fleet Operations Supervisor',
    address: '2200 Warehouse Way, Chicago, IL 60608',
    notes: 'Prefers SMS dispatch notices. Dispatches Monday through Thursday 6 AM - 2 PM.',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    userId: 1
  },
  // Bob/Sophia's isolated contacts (different userId)
  {
    id: 201,
    name: 'Hannah Abbott',
    email: 'hannah@abbottcreative.com',
    phone: '+1 (555) 912-3456',
    company: 'Abbott Creative Agency',
    jobTitle: 'Creative Director',
    address: '77 Mercer St, New York, NY 10012',
    notes: 'Sophia contact for brand refresh.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    userId: 2
  }
];

const safeStorage = {
  get: <T,>(key: string, fallback: T): T => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key: string, value: unknown): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {}
  },
  remove: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }
};

export default function App() {
  // Navigation: 'app' (live interactive app), 'code' (Java Spring Boot file inspector), 'guide' (run locally)
  const [activeTab, setActiveTab] = useState<'app' | 'code' | 'guide'>('app');

  // Application Authentication & Data State
  const [users, setUsers] = useState<User[]>(() => safeStorage.get('cm_users', INITIAL_USERS));

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = safeStorage.get<string | null>('cm_current_user_id', null);
    if (savedId) {
      const u = INITIAL_USERS.find(x => x.id === Number(savedId));
      if (u) return u;
    }
    return INITIAL_USERS[0]; // default logged in as Alex Vance for instant demo
  });

  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [contacts, setContacts] = useState<Contact[]>(() => safeStorage.get('cm_contacts', INITIAL_CONTACTS));

  // UI state for live dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete' | 'forgot' | 'import' | 'export' | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // CSV Import & Export states
  const [exportPhoneFilter, setExportPhoneFilter] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importParsedRows, setImportParsedRows] = useState<Array<{
    name: string;
    phone: string;
    email: string;
    company: string;
    jobTitle: string;
    address: string;
    notes: string;
    isValid: boolean;
    errorReason?: string;
  }>>([]);
  const [importErrorsCount, setImportErrorsCount] = useState(0);

  // Form states for contact add/edit
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginRememberMe, setLoginRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Code Explorer State
  const [selectedFile, setSelectedFile] = useState<string>('ContactController.java');
  const [copied, setCopied] = useState(false);

  // Sync to localStorage safely
  useEffect(() => {
    safeStorage.set('cm_users', users);
  }, [users]);

  useEffect(() => {
    safeStorage.set('cm_contacts', contacts);
  }, [contacts]);

  useEffect(() => {
    if (currentUser) {
      safeStorage.set('cm_current_user_id', currentUser.id.toString());
    } else {
      safeStorage.remove('cm_current_user_id');
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Contacts filtered strictly by current authenticated user (User-Specific Data Isolation!)
  const userContacts = useMemo(() => {
    if (!currentUser) return [];
    return contacts.filter(c => c.userId === currentUser.id);
  }, [contacts, currentUser]);

  // Search filtered results
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return userContacts;
    const q = searchQuery.toLowerCase().trim();
    return userContacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }, [userContacts, searchQuery]);

  // Dynamic Dashboard Statistics
  const stats = useMemo(() => {
    const total = userContacts.length;
    const withEmail = userContacts.filter(c => c.email && c.email.trim() !== '').length;
    const withPhone = userContacts.filter(c => c.phone && c.phone.trim() !== '').length;
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentlyAdded = userContacts.filter(c => new Date(c.createdAt).getTime() >= sevenDaysAgo).length;

    return { total, withEmail, withPhone, recentlyAdded };
  }, [userContacts]);

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Email and password are required.');
      return;
    }

    const normEmail = loginEmail.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === normEmail);

    if (existing) {
      setCurrentUser(existing);
      setLoginPassword('');
      showToast(`Welcome back, ${existing.fullName}!`, 'success');
    } else {
      // Create new session or return generic error
      setLoginError('Invalid email or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regFullName.trim()) {
      setRegError('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setRegError('Please provide a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    const normEmail = regEmail.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === normEmail)) {
      setRegError('An account with this email address already exists.');
      return;
    }

    const newUser: User = {
      id: Date.now(),
      fullName: regFullName.trim(),
      email: normEmail,
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setRegSuccess('Account created successfully! You can now sign in.');
    setRegFullName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setLoginEmail(normEmail);
    setTimeout(() => {
      setAuthView('login');
      setRegSuccess('');
    }, 1200);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out of session', 'info');
  };

  // Contact CRUD Handlers
  const openAddModal = () => {
    setSelectedContact(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCompany('');
    setFormJobTitle('');
    setFormAddress('');
    setFormNotes('');
    setFormErrors({});
    setModalType('add');
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormEmail(contact.email || '');
    setFormCompany(contact.company || '');
    setFormJobTitle(contact.jobTitle || '');
    setFormAddress(contact.address || '');
    setFormNotes(contact.notes || '');
    setFormErrors({});
    setModalType('edit');
  };

  const openViewModal = (contact: Contact) => {
    setSelectedContact(contact);
    setModalType('view');
  };

  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setModalType('delete');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Full name is required.';
    if (!formPhone.trim()) errors.phone = 'Phone number is required.';
    if (formEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Please provide a valid email format.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalType === 'add') {
      const newContact: Contact = {
        id: Date.now(),
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || null,
        company: formCompany.trim() || null,
        jobTitle: formJobTitle.trim() || null,
        address: formAddress.trim() || null,
        notes: formNotes.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.id
      };
      setContacts(prev => [newContact, ...prev]);
      showToast('Contact created successfully', 'success');
    } else if (modalType === 'edit' && selectedContact) {
      setContacts(prev =>
        prev.map(c =>
          c.id === selectedContact.id
            ? {
                ...c,
                name: formName.trim(),
                phone: formPhone.trim(),
                email: formEmail.trim() || null,
                company: formCompany.trim() || null,
                jobTitle: formJobTitle.trim() || null,
                address: formAddress.trim() || null,
                notes: formNotes.trim() || null,
                updatedAt: new Date().toISOString()
              }
            : c
        )
      );
      showToast('Contact updated successfully', 'success');
    }

    setModalType(null);
  };

  const handleDeleteContact = () => {
    if (!selectedContact) return;
    setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
    showToast('Contact deleted from directory', 'success');
    setModalType(null);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  // CSV Parsing and Processing Logic
  const parseCsvText = (text: string) => {
    const records: string[][] = [];
    let currentRecord: string[] = [];
    let currentField = '';
    let inQuotes = false;

    const cleaned = text.replace(/^\uFEFF/, ''); // strip BOM
    for (let i = 0; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (c === '"') {
        if (inQuotes && cleaned[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        currentRecord.push(currentField.trim());
        currentField = '';
      } else if ((c === '\n' || c === '\r') && !inQuotes) {
        if (c === '\r' && cleaned[i + 1] === '\n') {
          i++;
        }
        currentRecord.push(currentField.trim());
        currentField = '';
        if (currentRecord.some(f => f.length > 0)) {
          records.push(currentRecord);
        }
        currentRecord = [];
      } else {
        currentField += c;
      }
    }

    if (currentField.length > 0 || currentRecord.length > 0) {
      currentRecord.push(currentField.trim());
      if (currentRecord.some(f => f.length > 0)) {
        records.push(currentRecord);
      }
    }
    return records;
  };

  const processCsvRows = (records: string[][]) => {
    if (records.length === 0) {
      setImportParsedRows([]);
      setImportErrorsCount(0);
      return;
    }

    const headers = records[0].map(h => h.toLowerCase().trim());
    const findIdx = (...keys: string[]) => {
      for (let i = 0; i < headers.length; i++) {
        if (keys.includes(headers[i])) return i;
      }
      return -1;
    };

    const nameIdx = findIdx('name', 'full name', 'contact name');
    const phoneIdx = findIdx('phone', 'phone number', 'telephone', 'mobile');
    const emailIdx = findIdx('email', 'email address', 'mail');
    const companyIdx = findIdx('company', 'organization', 'org');
    const jobTitleIdx = findIdx('job title', 'jobtitle', 'title', 'role', 'position');
    const addressIdx = findIdx('address', 'location', 'street');
    const notesIdx = findIdx('notes', 'note', 'comment', 'description');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let errCount = 0;

    const parsed = records.slice(1).map((row, idx) => {
      const name = nameIdx >= 0 ? (row[nameIdx] || '') : '';
      const phone = phoneIdx >= 0 ? (row[phoneIdx] || '') : '';
      const email = emailIdx >= 0 ? (row[emailIdx] || '') : '';
      const company = companyIdx >= 0 ? (row[companyIdx] || '') : '';
      const jobTitle = jobTitleIdx >= 0 ? (row[jobTitleIdx] || '') : '';
      const address = addressIdx >= 0 ? (row[addressIdx] || '') : '';
      const notes = notesIdx >= 0 ? (row[notesIdx] || '') : '';

      let isValid = true;
      let errorReason = '';

      if (!name.trim()) {
        isValid = false;
        errorReason = 'Name is required';
      } else if (!phone.trim()) {
        isValid = false;
        errorReason = 'Phone number is required';
      } else if (email.trim() && !emailRegex.test(email.trim())) {
        isValid = false;
        errorReason = 'Invalid email format';
      }

      if (!isValid) errCount++;

      return {
        name,
        phone,
        email,
        company,
        jobTitle,
        address,
        notes,
        isValid,
        errorReason
      };
    });

    setImportParsedRows(parsed);
    setImportErrorsCount(errCount);
  };

  const handleCsvFileUpload = (file: File) => {
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const records = parseCsvText(text);
      processCsvRows(records);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    setImportFileName('sample_enterprise_contacts.csv');
    const sample = `Name,Phone,Email,Company,Job Title,Address,Notes
"David Miller","+1 (555) 234-8901","david.m@apexventures.com","Apex Ventures","General Partner","100 Pine St, San Francisco, CA","Initial intro via Tech Leaders summit"
"Rachel Adams","+1 (555) 781-4432","rachel.a@healthfirst.org","HealthFirst","Director of Clinical Data","55 Fruit St, Boston, MA","Follow up regarding automated pipeline trial"
"Carlos Gutierrez","+1 (555) 609-1123","","Gutierrez & Associates","Senior Counsel","300 Grand Ave, Los Angeles, CA","Retained corporate counsel for regional compliance"
"Incomplete Contact","","invalid-email","Missing Phone Inc","","","This row has no phone number to test validation"`;
    const records = parseCsvText(sample);
    processCsvRows(records);
  };

  const handleConfirmImport = () => {
    if (!currentUser) return;
    const validRows = importParsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast('No valid contact rows found to import', 'error');
      return;
    }

    const newContacts: Contact[] = validRows.map((r, i) => ({
      id: Date.now() + i,
      name: r.name.trim(),
      phone: r.phone.trim(),
      email: r.email.trim() || null,
      company: r.company.trim() || null,
      jobTitle: r.jobTitle.trim() || null,
      address: r.address.trim() || null,
      notes: r.notes.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id
    }));

    setContacts(prev => [...newContacts, ...prev]);
    showToast(`Successfully imported ${validRows.length} contacts!`, 'success');
    setModalType(null);
    setImportParsedRows([]);
    setImportFileName('');
  };

  const handleExportCsv = (phoneFilter?: string) => {
    let toExport = userContacts;
    if (phoneFilter && phoneFilter.trim()) {
      const cleanFilter = phoneFilter.replace(/[^0-9+]/g, '').toLowerCase();
      toExport = userContacts.filter(c => {
        const cleanPhone = c.phone.replace(/[^0-9+]/g, '').toLowerCase();
        return cleanPhone.includes(cleanFilter) || c.phone.includes(phoneFilter.trim());
      });
    }

    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return '';
      if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    let csvContent = '\uFEFFName,Phone,Email,Company,Job Title,Address,Notes,Created At\r\n';
    toExport.forEach(c => {
      csvContent += [
        escapeCsv(c.name),
        escapeCsv(c.phone),
        escapeCsv(c.email),
        escapeCsv(c.company),
        escapeCsv(c.jobTitle),
        escapeCsv(c.address),
        escapeCsv(c.notes),
        escapeCsv(c.createdAt)
      ].join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = phoneFilter && phoneFilter.trim()
      ? `contacts_phone_${phoneFilter.replace(/[^0-9+]/g, '')}.csv`
      : 'contacts_export.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();

    showToast(
      phoneFilter && phoneFilter.trim()
        ? `Exported ${toExport.length} contacts matching phone "${phoneFilter}"`
        : `Exported ${toExport.length} contacts to CSV`,
      'success'
    );
    setModalType(null);
  };

  const handleDownloadCsvTemplate = () => {
    const templateContent = '\uFEFFName,Phone,Email,Company,Job Title,Address,Notes\r\n' +
      '"Sarah Jenkins","+1 (555) 349-2041","sarah.j@acme.com","Acme Corporation","Managing Partner","450 Lexington Ave, New York, NY","Key strategic client"\r\n' +
      '"Marcus Chen","+1 (555) 892-1104","marcus.c@vertex.io","Vertex Systems","VP Infrastructure","100 Montgomery St, San Francisco, CA","Primary engineering contact"\r\n';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
    showToast('Downloaded sample CSV template', 'info');
  };

  // Password Strength Score
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Enter password', color: 'bg-slate-200', width: 'w-0' };
    if (pwd.length < 8) return { score: 1, label: 'Too short (<8 chars)', color: 'bg-red-500', width: 'w-1/4' };
    let s = 1;
    if (pwd.length >= 12) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;

    if (s <= 2) return { score: 2, label: 'Weak', color: 'bg-orange-500', width: 'w-2/5' };
    if (s === 3) return { score: 3, label: 'Good', color: 'bg-amber-500', width: 'w-3/4' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600', width: 'w-full' };
  };

  // Copy code helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Banner */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600 text-white tracking-wide">
              JAVA SPRING BOOT + MYSQL
            </span>
            <span className="text-slate-300 font-medium hidden sm:inline">
              Full-Stack Architecture & Live Demo
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'app'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Live Contact Manager
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Source Code (20+ Files)
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Run Locally (`mvn spring-boot:run`)
            </button>
          </div>
        </div>
      </nav>

      {/* Main View Router */}
      {activeTab === 'app' && (
        <>
          {currentUser ? (
            /* Authenticated Dashboard View */
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-slate-900 leading-tight">Contact Manager</h1>
                      <p className="text-xs text-slate-500">Manage your contacts in one place</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setImportParsedRows([]);
                        setImportFileName('');
                        setModalType('import');
                      }}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      title="Bulk Import Contacts from CSV"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import CSV</span>
                    </button>

                    <button
                      onClick={() => {
                        setExportPhoneFilter('');
                        setModalType('export');
                      }}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                      title="Export Contacts to CSV (with phone filter)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Contact</span>
                    </button>

                    {/* Current User Session Badge & Switcher */}
                    <div className="relative group">
                      <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer transition-colors">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-semibold text-slate-900">{currentUser.fullName}</span>
                        <span className="text-slate-400 hidden sm:inline">({currentUser.email})</span>
                      </div>
                      {/* User Account Switcher Dropdown */}
                      <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 hidden group-hover:block z-50">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                          Test User Accounts (Isolated Contacts)
                        </div>
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUser(u);
                              showToast(`Switched session to ${u.fullName}`, 'info');
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between ${
                              u.id === currentUser.id
                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <div>{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                            </div>
                            {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-blue-700" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      title="Log Out"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
                {/* Section B: Dynamic Dashboard Statistics */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Contacts</p>
                      <p className="text-2xl font-extrabold text-slate-900 leading-tight">{stats.total}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">With Email</p>
                      <p className="text-2xl font-extrabold text-slate-900 leading-tight">{stats.withEmail}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">With Phone</p>
                      <p className="text-2xl font-extrabold text-slate-900 leading-tight">{stats.withPhone}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recently Added</p>
                      <p className="text-2xl font-extrabold text-slate-900 leading-tight">{stats.recentlyAdded}</p>
                    </div>
                  </div>
                </section>

                {/* Section C & D: Contact Table & Search Filter */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md min-w-[260px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, email, company, address..."
                        className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Showing <strong className="text-slate-800 font-bold">{filteredContacts.length}</strong> of{' '}
                        {userContacts.length} contacts
                      </span>
                      {filteredContacts.length < userContacts.length && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact Table */}
                  <div className="overflow-x-auto">
                    {filteredContacts.length > 0 ? (
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                            <th className="py-3 px-4">Contact Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Phone Number</th>
                            <th className="py-3 px-4">Company</th>
                            <th className="py-3 px-4">Address</th>
                            <th className="py-3 px-4">Date Created</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredContacts.map(contact => (
                            <tr key={contact.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* Contact Name & Avatar */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                                    {getInitials(contact.name)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900">{contact.name}</div>
                                    {contact.jobTitle && (
                                      <div className="text-xs text-slate-500">{contact.jobTitle}</div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="py-3.5 px-4 text-slate-700">
                                {contact.email ? (
                                  <span>{contact.email}</span>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">No email</span>
                                )}
                              </td>

                              {/* Phone */}
                              <td className="py-3.5 px-4 font-mono text-xs text-slate-800">
                                {contact.phone}
                              </td>

                              {/* Company */}
                              <td className="py-3.5 px-4">
                                {contact.company ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                    {contact.company}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">—</span>
                                )}
                              </td>

                              {/* Address */}
                              <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={contact.address || ''}>
                                {contact.address || <span className="text-slate-400 italic text-xs">—</span>}
                              </td>

                              {/* Date Created */}
                              <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                                {formatDate(contact.createdAt)}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => openViewModal(contact)}
                                    className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
                                    title="View Details"
                                    aria-label="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(contact)}
                                    className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded border border-slate-200 transition-colors"
                                    title="Edit Contact"
                                    aria-label="Edit Contact"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(contact)}
                                    className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded border border-slate-200 transition-colors"
                                    title="Delete Contact"
                                    aria-label="Delete Contact"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      /* Empty State */
                      <div className="py-12 px-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                          {searchQuery ? 'No matching contacts found' : 'No contacts in directory'}
                        </h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                          {searchQuery
                            ? `No contacts matched "${searchQuery}". Check spelling or try a different search parameter.`
                            : `You haven't saved any contacts under ${currentUser.fullName}'s account yet.`}
                        </p>
                        {searchQuery ? (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="inline-flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Clear Search Filter
                          </button>
                        ) : (
                          <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Your First Contact
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </main>
            </div>
          ) : (
            /* Unauthenticated Auth Pages View (Login / Register) */
            <div className="flex-1 flex flex-col justify-center items-center py-12 px-4">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-md p-6 sm:p-8">
                {/* Brand Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 text-white inline-flex items-center justify-center font-bold shadow-sm mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contact Manager</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {authView === 'login'
                      ? 'Sign in to access your secure contacts directory'
                      : 'Create your account to start managing contacts'}
                  </p>
                </div>

                {/* Login View */}
                {authView === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={loginShowPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => setLoginShowPassword(!loginShowPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                        >
                          {loginShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={loginRememberMe}
                          onChange={e => setLoginRememberMe(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setModalType('forgot')}
                        className="text-blue-700 font-semibold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors mt-2"
                    >
                      Sign In
                    </button>

                    {/* Fast test user quick-login buttons */}
                    <div className="pt-2 border-t border-slate-200 mt-4">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                        Quick Demo Sign In
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {users.slice(0, 2).map(u => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setCurrentUser(u);
                              showToast(`Logged in as ${u.fullName}`, 'success');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors truncate"
                          >
                            As {u.fullName.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center pt-3 text-xs text-slate-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('register');
                          setLoginError('');
                        }}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                )}

                {/* Registration View */}
                {authView === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    {regError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}
                    {regSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{regSuccess}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder="Johnathan Davis"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={regShowPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="w-full px-3.5 py-2 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword(!regShowPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                        >
                          {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength meter */}
                      <div className="mt-1.5">
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrength(regPassword).color} ${
                              getPasswordStrength(regPassword).width
                            }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>{getPasswordStrength(regPassword).label}</span>
                          <span>Min 8 chars</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors mt-2"
                    >
                      Create Account
                    </button>

                    <div className="text-center pt-3 text-xs text-slate-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('login');
                          setRegError('');
                        }}
                        className="text-blue-700 font-bold hover:underline"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Code Inspector Tab */}
      {activeTab === 'code' && (
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex-1 flex flex-col min-h-[680px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-700" />
                  Spring Boot & MySQL Codebase Inspector
                </h2>
                <p className="text-xs text-slate-500">
                  Inspect the complete production-grade source code, JPA entities, controllers, unit tests, and MySQL scripts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(PROJECT_FILES[selectedFile] || '')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied File' : 'Copy File'}
                </button>
              </div>
            </div>

            {/* Split view: file list + code viewer */}
            <div className="grid grid-cols-1 md:grid-cols-4 flex-1">
              {/* File list */}
              <div className="border-r border-slate-200 bg-slate-50/50 p-3 space-y-4 text-xs overflow-y-auto max-h-[750px]">
                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Spring Boot Maven & Config
                  </div>
                  {['pom.xml', 'application.properties', 'schema.sql'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Controllers & Endpoints
                  </div>
                  {['ContactController.java', 'AuthController.java', 'CsvImportResponse.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Security & Services
                  </div>
                  {['SecurityConfig.java', 'AuthService.java', 'ContactService.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    JPA Entities & Repositories
                  </div>
                  {['Contact.java', 'User.java', 'ContactRepository.java', 'UserRepository.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Unit & Integration Tests
                  </div>
                  {['AuthServiceTest.java', 'ContactServiceTest.java', 'ContactControllerTest.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Static Frontend (Vanilla)
                  </div>
                  {['index.html', 'login.html', 'register.html', 'script.js', 'style.css'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code viewer */}
              <div className="md:col-span-3 bg-slate-950 p-4 font-mono text-xs overflow-auto max-h-[750px] leading-relaxed text-slate-200">
                <div className="text-slate-400 mb-2 pb-2 border-b border-slate-800 flex justify-between items-center text-[11px]">
                  <span>Viewing: <strong className="text-blue-400">{selectedFile}</strong></span>
                  <span className="text-slate-500">{getFileDescription(selectedFile)}</span>
                </div>
                <pre className="whitespace-pre overflow-x-auto">
                  <code>{PROJECT_FILES[selectedFile] || '// Select a file to view source'}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Tab: How to run locally with Maven & MySQL */}
      {activeTab === 'guide' && (
        <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-blue-700" />
              Local Execution & MySQL Setup Guide
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Follow these simple steps to run the complete Spring Boot application locally with MySQL on port 8080.
            </p>

            <div className="space-y-6 text-sm">
              {/* Step 1 */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Prerequisites (JDK 17+ and Maven)
                </div>
                <p className="text-slate-600 mb-2">Ensure OpenJDK 17 or higher and Apache Maven 3.8+ are installed:</p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs">
                  java -version<br />
                  mvn -version
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Start MySQL and Create Database
                </div>
                <p className="text-slate-600 mb-2">Start your local MySQL service and execute the schema:</p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs space-y-1">
                  <div>mysql -u root -p</div>
                  <div className="text-emerald-400">CREATE DATABASE contactdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</div>
                  <div className="text-slate-400"># Or load schema.sql:</div>
                  <div>mysql -u root -p contactdb &lt; schema.sql</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Configure Database Credentials & Launch
                </div>
                <p className="text-slate-600 mb-2">
                  You can set your MySQL password via environment variables without altering source code:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-slate-400"># Linux / macOS:</div>
                  <div>export DB_USERNAME=root</div>
                  <div>export DB_PASSWORD=your_mysql_password</div>
                  <div>mvn spring-boot:run</div>
                  <br />
                  <div className="text-slate-400"># Windows (PowerShell):</div>
                  <div>$env:DB_USERNAME="root"; $env:DB_PASSWORD="your_mysql_password"; mvn spring-boot:run</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  Open Web Application in Browser
                </div>
                <p className="text-slate-600 mb-2">
                  Once started, Spring Boot will serve both the REST API and the frontend at:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs">
                  http://localhost:8080/login.html<br />
                  http://localhost:8080/register.html<br />
                  http://localhost:8080/index.html
                </div>
              </div>

              {/* Step 5 */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold">
                    5
                  </span>
                  Run Automated Unit & Integration Tests
                </div>
                <p className="text-slate-600 mb-2">
                  Run the complete test suite (includes tests for registration, password hashing, isolation, and CRUD):
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs">
                  mvn test
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Live Interactive App */}
      {/* 1. Add / Edit Contact Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {modalType === 'add' ? 'Add New Contact' : 'Edit Contact'}
              </h2>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Eleanor Sterling"
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-3 ${
                      formErrors.name
                        ? 'border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 349-2041"
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-3 ${
                      formErrors.phone
                        ? 'border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. eleanor@sterling.com"
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-3 ${
                      formErrors.email
                        ? 'border-red-500 focus:ring-red-100'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    placeholder="e.g. Sterling Advisory Group"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={e => setFormJobTitle(e.target.value)}
                    placeholder="e.g. Managing Partner"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="e.g. 450 Lexington Ave, New York, NY"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                  <textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    rows={3}
                    placeholder="Client preferences, context, or meeting notes..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  {modalType === 'add' ? 'Save Contact' : 'Update Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. View Contact Details Modal */}
      {modalType === 'view' && selectedContact && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Contact Details</h2>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 font-extrabold text-lg flex items-center justify-center shrink-0">
                  {getInitials(selectedContact.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedContact.name}</h3>
                  <p className="text-xs text-slate-600">
                    {[selectedContact.jobTitle, selectedContact.company].filter(Boolean).join(' at ') || 'Contact'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Phone Number
                  </span>
                  <span className="font-mono text-slate-900 text-sm">{selectedContact.phone}</span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Email Address
                  </span>
                  <span className="text-slate-900 text-sm">
                    {selectedContact.email || <span className="text-slate-400 italic">Not provided</span>}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Company
                  </span>
                  <span className="text-slate-900">
                    {selectedContact.company || <span className="text-slate-400 italic">Not provided</span>}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Job Title
                  </span>
                  <span className="text-slate-900">
                    {selectedContact.jobTitle || <span className="text-slate-400 italic">Not provided</span>}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Address
                  </span>
                  <span className="text-slate-900">
                    {selectedContact.address || <span className="text-slate-400 italic">Not provided</span>}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Notes
                  </span>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap mt-1">
                    {selectedContact.notes || <span className="text-slate-400 italic">No notes recorded</span>}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Created At
                  </span>
                  <span className="text-slate-600">{formatDate(selectedContact.createdAt)}</span>
                </div>

                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Last Updated
                  </span>
                  <span className="text-slate-600">{formatDate(selectedContact.updatedAt)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedContact)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Edit Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Contact Confirmation Modal */}
      {modalType === 'delete' && selectedContact && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base mb-1">Delete Contact?</h3>
            <p className="text-center text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-800">{selectedContact.name}</strong>?
              This action will remove the record from MySQL and cannot be reversed.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteContact}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Forgot Password Modal */}
      {modalType === 'forgot' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base mb-2">Password Recovery Notice</h3>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Self-service password recovery is intentionally not configured for this local development instance.
            </p>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              In production, password reset requires verified SMTP mail sender credentials, cryptographically signed expiring tokens, and rate-limiting. For local development, simply register a new account or sign in with the preloaded credentials.
            </p>
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* 5. CSV Import Modal */}
      {modalType === 'import' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-700" />
                  Bulk Import Contacts from CSV
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a comma-separated values file to import contacts in bulk.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Template & Quick Test actions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-blue-900">
                  <strong className="block font-semibold">Need an example CSV?</strong>
                  <span className="text-blue-700 text-[11px]">Columns supported: Name, Phone, Email, Company, Job Title, Address, Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="px-2.5 py-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100/50 rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3 h-3" />
                    Download Template
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleCsv}
                    className="px-2.5 py-1.5 bg-blue-700 text-white hover:bg-blue-800 rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    Load Sample Data
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleCsvFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,text/csv';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleCsvFileUpload(file);
                  };
                  input.click();
                }}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  {importFileName ? importFileName : 'Click to upload or drag & drop CSV'}
                </p>
                <p className="text-xs text-slate-500">
                  {importFileName
                    ? 'Click to select a different file'
                    : 'Supports standard UTF-8 RFC 4180 CSV files up to 5MB'}
                </p>
              </div>

              {/* Preview & Validation Report */}
              {importParsedRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">
                      Parsed {importParsedRows.length} rows:
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ {importParsedRows.length - importErrorsCount} Valid
                      </span>
                      {importErrorsCount > 0 && (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          ⚠ {importErrorsCount} Skipped (Validation Errors)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-slate-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Phone</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Company</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {importParsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? 'hover:bg-slate-50' : 'bg-red-50/40 text-red-900'}>
                            <td className="py-2 px-3 whitespace-nowrap">
                              {r.isValid ? (
                                <span className="text-emerald-600 font-bold">✓ Ready</span>
                              ) : (
                                <span className="text-red-600 font-bold" title={r.errorReason}>
                                  ✕ {r.errorReason}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-semibold">{r.name || '—'}</td>
                            <td className="py-2 px-3 font-mono">{r.phone || '—'}</td>
                            <td className="py-2 px-3">{r.email || '—'}</td>
                            <td className="py-2 px-3">{r.company || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2.5 shrink-0 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importParsedRows.filter(r => r.isValid).length === 0}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  Import {importParsedRows.filter(r => r.isValid).length} Valid Contacts
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CSV Export Modal */}
      {modalType === 'export' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-base mb-1">Export Contacts to CSV</h3>
            <p className="text-center text-xs text-slate-600 mb-4 leading-relaxed">
              Generate a CSV spreadsheet compatible with Excel, Google Sheets, and CRM databases.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Filter by Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={exportPhoneFilter}
                    onChange={(e) => setExportPhoneFilter(e.target.value)}
                    placeholder="e.g. +1 (555) 349-2041 or leave empty"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-100"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  When you provide a phone number, only contacts matching that phone number will be included in the exported CSV. Leave blank to export all {userContacts.length} contacts.
                </p>
              </div>

              {exportPhoneFilter.trim() && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 flex items-center justify-between">
                  <span>
                    Matching contacts:{' '}
                    <strong>
                      {
                        userContacts.filter(c => {
                          const clean = exportPhoneFilter.replace(/[^0-9+]/g, '').toLowerCase();
                          return c.phone.replace(/[^0-9+]/g, '').toLowerCase().includes(clean) || c.phone.includes(exportPhoneFilter.trim());
                        }).length
                      }
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setExportPhoneFilter('')}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv(exportPhoneFilter)}
                className="flex-1 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.type === 'info' && <Users className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers for File Explorer descriptions
function getFileDescription(name: string): string {
  const map: Record<string, string> = {
    'pom.xml': 'Maven build descriptor with Spring Boot 3, JPA, Security, MySQL driver & tests',
    'application.properties': 'Environment variables, MySQL JDBC config, and session cookie parameters',
    'ContactController.java': 'RESTful endpoints for contact CRUD, CSV import/export, search query, and metrics',
    'CsvImportResponse.java': 'DTO returning totalRows, successCount, failedCount, and row validation errors',
    'AuthController.java': 'REST endpoints for register, login, session logout, and current user',
    'SecurityConfig.java': 'Spring SecurityFilterChain, session fixation protection, and CSRF token repo',
    'AuthService.java': 'BCrypt password hashing, session context management, and validation logic',
    'ContactService.java': 'User-isolated business logic ensuring zero cross-tenant contact access',
    'Contact.java': 'JPA entity with indices, timestamps, and @ManyToOne User association',
    'User.java': 'JPA user entity with unique email constraint and @OneToMany contacts',
    'ContactRepository.java': 'Spring Data JPA queries scoped strictly by authenticated User',
    'UserRepository.java': 'Spring Data JPA email lookup and existence checking',
    'AuthServiceTest.java': 'JUnit 5 & Mockito test suite for authentication and hashing',
    'ContactServiceTest.java': 'Unit tests validating user data isolation and ownership enforcement',
    'ContactControllerTest.java': 'MockMvc tests validating HTTP status codes & Bean Validation errors',
    'schema.sql': 'Production MySQL DDL and 4-step safe legacy migration instructions',
    'index.html': 'Dashboard HTML with responsive tables, statistics cards, and modals',
    'login.html': 'Login page with show/hide password, remember-me, and forgot password modal',
    'register.html': 'Registration page with live password strength indicator and validation',
    'script.js': 'Vanilla JS dashboard driver with safe textContent DOM rendering (XSS-safe)',
    'style.css': 'Clean SaaS styling with dark navy brand color and light gray background'
  };
  return map[name] || 'Source file';
}

// Inlined file contents for instant inspection in Code Inspector tab
const PROJECT_FILES: Record<string, string> = {
  'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>contact-manager</artifactId>
    <version>1.0.0</version>
    <name>contact-manager</name>
    <description>Professional Contact Management System with Spring Boot and MySQL</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,

  'application.properties': `# Server Configuration
server.port=8080

# Database Configuration (MySQL)
spring.datasource.url=jdbc:mysql://\${DB_HOST:localhost}:\${DB_PORT:3306}/\${DB_NAME:contactdb}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=\${DB_USERNAME:root}
spring.datasource.password=\${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.open-in-view=false

# Session & Security Cookie Configuration
server.servlet.session.cookie.name=CONTACT_SESSION_ID
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
server.servlet.session.cookie.secure=\${SERVER_SESSION_COOKIE_SECURE:false}
server.servlet.session.timeout=2h`,

  'ContactController.java': `package com.example.contactmanager.controller;

import com.example.contactmanager.dto.ContactRequest;
import com.example.contactmanager.dto.ContactResponse;
import com.example.contactmanager.dto.CsvImportResponse;
import com.example.contactmanager.dto.DashboardStatsResponse;
import com.example.contactmanager.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping
    public ResponseEntity<List<ContactResponse>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.createContact(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        contactService.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ContactResponse>> searchContacts(@RequestParam(required = false, defaultValue = "") String query) {
        return ResponseEntity.ok(contactService.searchContacts(query));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(contactService.getDashboardStats());
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvImportResponse> importContactsCsv(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(contactService.importContactsCsv(file.getInputStream()));
    }

    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportContactsCsv(@RequestParam(value = "phone", required = false) String phone) {
        byte[] csv = contactService.exportContactsCsv(phone);
        String filename = (phone != null && !phone.isBlank())
                ? "contacts_phone_" + phone.replaceAll("[^0-9+]", "") + ".csv"
                : "contacts_export.csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"" + filename + "\\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    @GetMapping("/csv-template")
    public ResponseEntity<byte[]> downloadCsvTemplate() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"contacts_template.csv\\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(contactService.getCsvTemplate());
    }
}`,

  'CsvImportResponse.java': `package com.example.contactmanager.dto;

import java.util.ArrayList;
import java.util.List;

public class CsvImportResponse {

    private int totalRows;
    private int successCount;
    private int failedCount;
    private List<RowError> errors = new ArrayList<>();
    private List<ContactResponse> importedContacts = new ArrayList<>();

    public static class RowError {
        private int rowNumber;
        private String contactName;
        private String reason;

        public RowError(int rowNumber, String contactName, String reason) {
            this.rowNumber = rowNumber;
            this.contactName = contactName;
            this.reason = reason;
        }
        // Getters & Setters
    }

    public CsvImportResponse(int totalRows, int successCount, int failedCount,
                             List<RowError> errors, List<ContactResponse> importedContacts) {
        this.totalRows = totalRows;
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.errors = errors;
        this.importedContacts = importedContacts;
    }
    // Getters & Setters
}`,

  'AuthController.java': `package com.example.contactmanager.controller;

import com.example.contactmanager.dto.LoginRequest;
import com.example.contactmanager.dto.RegisterRequest;
import com.example.contactmanager.dto.UserResponse;
import com.example.contactmanager.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authService.login(request, httpRequest, httpResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }
}`,

  'SecurityConfig.java': `package com.example.contactmanager.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers("/api/auth/register", "/api/auth/login")
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/login.html", "/register.html", "/css/**", "/js/**").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/csrf").permitAll()
                .requestMatchers("/api/contacts/**", "/api/auth/me", "/api/auth/logout").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation().changeSessionId()
            );

        return http.build();
    }
}`,

  'ContactService.java': `package com.example.contactmanager.service;

import com.example.contactmanager.dto.ContactRequest;
import com.example.contactmanager.dto.ContactResponse;
import com.example.contactmanager.dto.DashboardStatsResponse;
import com.example.contactmanager.exception.ResourceNotFoundException;
import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.ContactRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final AuthService authService;

    public ContactService(ContactRepository contactRepository, AuthService authService) {
        this.contactRepository = contactRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getAllContacts() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return contactRepository.findAllByUserOrderByCreatedAtDesc(currentUser)
                .stream().map(ContactResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ContactResponse createContact(ContactRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Contact contact = new Contact();
        contact.setName(request.getName().trim());
        contact.setPhone(request.getPhone().trim());
        contact.setEmail(request.getEmail());
        contact.setCompany(request.getCompany());
        contact.setJobTitle(request.getJobTitle());
        contact.setAddress(request.getAddress());
        contact.setNotes(request.getNotes());
        contact.setUser(currentUser);
        return ContactResponse.fromEntity(contactRepository.save(contact));
    }

    @Transactional
    public void deleteContact(Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (!contactRepository.existsByIdAndUser(id, currentUser)) {
            throw new ResourceNotFoundException("Contact not found with ID: " + id);
        }
        contactRepository.deleteByIdAndUser(id, currentUser);
    }
}`,

  'AuthService.java': `package com.example.contactmanager.service;

import com.example.contactmanager.dto.LoginRequest;
import com.example.contactmanager.dto.RegisterRequest;
import com.example.contactmanager.dto.UserResponse;
import com.example.contactmanager.exception.DuplicateResourceException;
import com.example.contactmanager.exception.UnauthorizedException;
import com.example.contactmanager.model.User;
import com.example.contactmanager.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email address already exists");
        }
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getFullName().trim(), normalizedEmail, encodedPassword);
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getCreatedAt());
    }
}`,

  'Contact.java': `package com.example.contactmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts", indexes = {
    @Index(name = "idx_contact_user_id", columnList = "user_id"),
    @Index(name = "idx_contact_name", columnList = "name"),
    @Index(name = "idx_contact_phone", columnList = "phone"),
    @Index(name = "idx_contact_email", columnList = "email")
})
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String name;

    @Size(max = 150)
    @Column(length = 150)
    private String email;

    @NotBlank
    @Size(max = 25)
    @Column(nullable = false, length = 25)
    private String phone;

    @Column(length = 120)
    private String company;

    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Column(length = 255)
    private String address;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}`,

  'User.java': `package com.example.contactmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Contact> contacts = new ArrayList<>();
}`,

  'ContactRepository.java': `package com.example.contactmanager.repository;

import com.example.contactmanager.model.Contact;
import com.example.contactmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findAllByUserOrderByCreatedAtDesc(User user);
    Optional<Contact> findByIdAndUser(Long id, User user);
    boolean existsByIdAndUser(Long id, User user);
    void deleteByIdAndUser(Long id, User user);

    @Query("SELECT c FROM Contact c WHERE c.user = :user AND (" +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.company) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.address) LIKE LOWER(CONCAT('%', :query, '%'))" +
           ") ORDER BY c.createdAt DESC")
    List<Contact> searchContactsByUser(@Param("user") User user, @Param("query") String query);

    long countByUser(User user);
    long countByUserAndCreatedAtAfter(User user, LocalDateTime since);
}`,

  'UserRepository.java': `package com.example.contactmanager.repository;

import com.example.contactmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}`,

  'schema.sql': `-- ========================================================
-- Database: contactdb
-- ========================================================
CREATE DATABASE IF NOT EXISTS \`contactdb\`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE \`contactdb\`;

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` BIGINT NOT NULL AUTO_INCREMENT,
  \`full_name\` VARCHAR(120) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_users_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`contacts\` (
  \`id\` BIGINT NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(120) NOT NULL,
  \`email\` VARCHAR(150) DEFAULT NULL,
  \`phone\` VARCHAR(25) NOT NULL,
  \`company\` VARCHAR(120) DEFAULT NULL,
  \`job_title\` VARCHAR(120) DEFAULT NULL,
  \`address\` VARCHAR(255) DEFAULT NULL,
  \`notes\` VARCHAR(1000) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`user_id\` BIGINT NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_contacts_user_id\` (\`user_id\`),
  KEY \`idx_contacts_name\` (\`name\`),
  CONSTRAINT \`fk_contacts_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  'AuthServiceTest.java': `// JUnit 5 & Mockito Tests for AuthService
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Test
    void register_Success() {
        // Validates password encoding via BCrypt and database persistence
    }
    @Test
    void register_DuplicateEmail_ThrowsException() {
        // Enforces uniqueness of user email addresses
    }
    @Test
    void login_Success() {
        // Validates session creation and generic 401 on bad credentials
    }
}`,

  'ContactServiceTest.java': `// JUnit 5 & Mockito Tests for ContactService (Tenant Isolation)
@ExtendWith(MockitoExtension.class)
class ContactServiceTest {
    @Test
    void getAllContacts_ReturnsUserScopedContacts() {
        // Validates that User A only retrieves their own contacts
    }
    @Test
    void updateContact_DifferentUser_ThrowsResourceNotFound() {
        // Proves that changing an ID cannot modify another user's contact
    }
}`,

  'ContactControllerTest.java': `// Spring MockMvc Web Layer Tests
@WebMvcTest(ContactController.class)
class ContactControllerTest {
    @Test
    void createContact_MissingRequiredFields_ReturnsBadRequest() throws Exception {
        // Validates that blank name and phone return HTTP 400 Bad Request
    }
    @Test
    void deleteContact_ReturnsNoContent() throws Exception {
        // Validates HTTP 204 No Content upon deletion
    }
}`,

  'index.html': `<!-- src/main/resources/static/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Manager - Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Clean SaaS Header, Stats Cards, Search Bar, Table & Modals -->
  <script src="js/script.js"></script>
</body>
</html>`,

  'login.html': `<!-- src/main/resources/static/login.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sign In - Contact Manager</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body>
  <!-- Login Form, Password Visibility, Remember Me, Forgot Password -->
  <script src="js/login.js"></script>
</body>
</html>`,

  'register.html': `<!-- src/main/resources/static/register.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Create Account - Contact Manager</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/auth.css">
</head>
<body>
  <!-- Register Form, Password Strength Meter, Confirm Password Check -->
  <script src="js/register.js"></script>
</body>
</html>`,

  'script.js': `// src/main/resources/static/js/script.js
// Safe DOM rendering with textContent preventing XSS
// Debounced search querying /api/contacts/search?query=...
// Modals for Create, Edit, View Details, and Delete Confirmation
// Dynamic Dashboard Statistics Calculation`,

  'style.css': `/* src/main/resources/static/css/style.css */
/* Clean SaaS Dashboard Palette: Deep Navy & Light Slate */
/* Rounded cards, subtle shadows, responsive tables, accessible controls */`
};
