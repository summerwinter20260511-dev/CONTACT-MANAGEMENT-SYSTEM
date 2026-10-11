/**
 * Contact Management System - 3D Tactile UI with Light & Dark Mode
 * Preserves all contact management, CSV bulk import, and phone-filtered export features.
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
  Copy,
  Check,
  ShieldCheck,
  Upload,
  Download,
  FileSpreadsheet,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { PROJECT_FILES, getFileDescription } from './projectFiles.ts';

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

// Theme: Light or Dark mode with 3D tactile aesthetic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return safeStorage.get<'light' | 'dark'>('cm_theme', 'light');
  });

  useEffect(() => {
    safeStorage.set('cm_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

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

  // Sync to safe storage
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

    const cleaned = text.replace(/^\uFEFF/, '');
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

    const parsed = records.slice(1).map((row) => {
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
    if (!pwd) return { score: 0, label: 'Enter password', color: 'bg-slate-200 dark:bg-slate-700', width: 'w-0' };
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

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-800'
    }`}>
      {/* Top 3D Navigation Banner with Theme Switcher */}
      <nav className={`border-b text-xs sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-600 text-white tracking-wide shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              SPRING BOOT 3 + MYSQL
            </span>
            <span className="text-slate-300 font-medium hidden sm:inline text-xs">
              Contact Management System
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Pills with 3D Depth */}
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                onClick={() => setActiveTab('app')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'app'
                    ? 'bg-blue-600 text-white shadow-xs -translate-y-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Live Manager
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow-xs -translate-y-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Code Inspector
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'guide'
                    ? 'bg-blue-600 text-white shadow-xs -translate-y-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Run Locally
              </button>
              
            </div>

            {/* 3D Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 font-bold text-xs ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 btn-3d-secondary-dark'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 btn-3d-secondary-light'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
                  <span className="hidden sm:inline text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-300" />
                  <span className="hidden sm:inline text-slate-200">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main View Router */}
      {activeTab === 'app' && (
        <>
          {currentUser ? (
            /* Authenticated 3D Dashboard View */
            <div className="flex-1 flex flex-col">
              {/* Header with 3D Depth */}
              <header className={`border-b transition-colors shadow-xs ${
                isDark ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white/95 border-slate-200/90'
              }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* 3D Extruded Logo Icon */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center font-extrabold shadow-md border-t border-white/30 transform hover:scale-105 transition-transform">
                      <Users className="w-6 h-6 drop-shadow-sm" />
                    </div>
                    <div>
                      <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Contact Manager
                      </h1>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Manage your contacts in one place
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* 3D Action Buttons */}
                    <button
                      onClick={() => {
                        setImportParsedRows([]);
                        setImportFileName('');
                        setModalType('import');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-200 btn-3d-secondary-dark'
                          : 'bg-white border-slate-300 text-slate-700 btn-3d-secondary-light'
                      }`}
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
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-200 btn-3d-secondary-dark'
                          : 'bg-white border-slate-300 text-slate-700 btn-3d-secondary-light'
                      }`}
                      title="Export Contacts to CSV (with phone filter)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>

                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold btn-3d-primary"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Contact</span>
                    </button>

                    {/* Current User Session Badge & Switcher */}
                    <div className="relative group ml-1">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                        isDark
                          ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-700'
                          : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-bold">{currentUser.fullName}</span>
                        <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({currentUser.email})
                        </span>
                      </div>
                      {/* User Account Switcher Dropdown */}
                      <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl p-2.5 hidden group-hover:block z-50 border ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 modal-3d-dark text-slate-200'
                          : 'bg-white border-slate-200 modal-3d-light text-slate-800'
                      }`}>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 text-slate-400">
                          Switch User (Isolated Contacts)
                        </div>
                        {users.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setCurrentUser(u);
                              showToast(`Switched session to ${u.fullName}`, 'info');
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                              u.id === currentUser.id
                                ? isDark ? 'bg-blue-900/50 text-blue-300 font-bold' : 'bg-blue-50 text-blue-700 font-bold'
                                : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div>
                              <div>{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                            </div>
                            {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      title="Log Out"
                      className={`p-2 rounded-xl border transition-colors ${
                        isDark
                          ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-slate-700'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 py-7 w-full flex-1">
                {/* Section B: Dynamic 3D Dashboard Statistics Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 mb-7">
                  {/* Card 1: Total */}
                  <div className={`rounded-2xl p-4.5 border transition-all duration-150 transform hover:-translate-y-1 ${
                    isDark ? 'bg-slate-900 border-slate-800 card-3d-dark' : 'bg-white border-slate-200/90 card-3d-light'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-t border-white/30 ${
                        isDark
                          ? 'bg-blue-900/60 text-blue-400 border border-blue-700/50 pod-3d-dark'
                          : 'bg-blue-50 text-blue-600 border border-blue-200 pod-3d'
                      }`}>
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Total Contacts
                        </p>
                        <p className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {stats.total}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: With Email */}
                  <div className={`rounded-2xl p-4.5 border transition-all duration-150 transform hover:-translate-y-1 ${
                    isDark ? 'bg-slate-900 border-slate-800 card-3d-dark' : 'bg-white border-slate-200/90 card-3d-light'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-t border-white/30 ${
                        isDark
                          ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 pod-3d-dark'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200 pod-3d'
                      }`}>
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          With Email
                        </p>
                        <p className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {stats.withEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: With Phone */}
                  <div className={`rounded-2xl p-4.5 border transition-all duration-150 transform hover:-translate-y-1 ${
                    isDark ? 'bg-slate-900 border-slate-800 card-3d-dark' : 'bg-white border-slate-200/90 card-3d-light'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-t border-white/30 ${
                        isDark
                          ? 'bg-indigo-900/60 text-indigo-400 border border-indigo-700/50 pod-3d-dark'
                          : 'bg-indigo-50 text-indigo-600 border border-indigo-200 pod-3d'
                      }`}>
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          With Phone
                        </p>
                        <p className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {stats.withPhone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Recently Added */}
                  <div className={`rounded-2xl p-4.5 border transition-all duration-150 transform hover:-translate-y-1 ${
                    isDark ? 'bg-slate-900 border-slate-800 card-3d-dark' : 'bg-white border-slate-200/90 card-3d-light'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-t border-white/30 ${
                        isDark
                          ? 'bg-amber-900/60 text-amber-400 border border-amber-700/50 pod-3d-dark'
                          : 'bg-amber-50 text-amber-600 border border-amber-200 pod-3d'
                      }`}>
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Recently Added
                        </p>
                        <p className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {stats.recentlyAdded}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section C & D: 3D Contacts Table Card & Search Filter */}
                <section className={`rounded-2xl border overflow-hidden transition-colors ${
                  isDark ? 'bg-slate-900 border-slate-800/90 card-3d-dark' : 'bg-white border-slate-200/90 card-3d-light'
                }`}>
                  <div className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-4 ${
                    isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/50'
                  }`}>
                    <div className="relative flex-1 max-w-md min-w-[260px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by name, phone, email, company, address..."
                        className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 transition-all ${
                          isDark
                            ? 'bg-slate-950/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-900/40'
                            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-blue-100'
                        }`}
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

                    <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>
                        Showing <strong className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{filteredContacts.length}</strong> of{' '}
                        {userContacts.length} contacts
                      </span>
                      {filteredContacts.length < userContacts.length && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-blue-500 hover:underline font-bold"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3D Contact Table */}
                  <div className="overflow-x-auto">
                    {filteredContacts.length > 0 ? (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                            isDark
                              ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <th className="py-3 px-4">Contact Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Phone Number</th>
                            <th className="py-3 px-4">Company</th>
                            <th className="py-3 px-4">Address</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                          {filteredContacts.map(contact => (
                            <tr key={contact.id} className={`transition-colors ${
                              isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                            }`}>
                              {/* Contact Name & Avatar with 3D Depth */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 avatar-3d border-t border-white/30">
                                    {getInitials(contact.name)}
                                  </div>
                                  <div>
                                    <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{contact.name}</div>
                                    {contact.jobTitle && (
                                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{contact.jobTitle}</div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className={`py-3.5 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {contact.email ? (
                                  <span>{contact.email}</span>
                                ) : (
                                  <span className="text-slate-500 italic text-xs">—</span>
                                )}
                              </td>

                              {/* Phone */}
                              <td className={`py-3.5 px-4 font-mono text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {contact.phone}
                              </td>

                              {/* Company */}
                              <td className="py-3.5 px-4">
                                {contact.company ? (
                                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                                    isDark
                                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {contact.company}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 italic text-xs">—</span>
                                )}
                              </td>

                              {/* Address */}
                              <td className={`py-3.5 px-4 max-w-[200px] truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`} title={contact.address || ''}>
                                {contact.address || <span className="text-slate-500 italic text-xs">—</span>}
                              </td>

                              {/* Actions with 3D Tactile Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => openViewModal(contact)}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isDark
                                        ? 'border-slate-700 text-slate-300 hover:text-blue-400 hover:bg-slate-800 btn-3d-secondary-dark'
                                        : 'border-slate-300 text-slate-600 hover:text-blue-700 hover:bg-blue-50 btn-3d-secondary-light'
                                    }`}
                                    title="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openEditModal(contact)}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isDark
                                        ? 'border-slate-700 text-slate-300 hover:text-amber-400 hover:bg-slate-800 btn-3d-secondary-dark'
                                        : 'border-slate-300 text-slate-600 hover:text-amber-700 hover:bg-amber-50 btn-3d-secondary-light'
                                    }`}
                                    title="Edit Contact"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(contact)}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isDark
                                        ? 'border-slate-700 text-slate-300 hover:text-red-400 hover:bg-red-950/40 btn-3d-secondary-dark'
                                        : 'border-slate-300 text-slate-600 hover:text-red-700 hover:bg-red-50 btn-3d-secondary-light'
                                    }`}
                                    title="Delete Contact"
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
                      /* 3D Empty State */
                      <div className="py-14 px-4 text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border ${
                          isDark ? 'bg-slate-800 text-slate-400 border-slate-700 pod-3d-dark' : 'bg-slate-100 text-slate-400 border-slate-200 pod-3d'
                        }`}>
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className={`text-base font-extrabold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {searchQuery ? 'No matching contacts found' : 'No contacts in directory'}
                        </h3>
                        <p className={`text-xs max-w-sm mx-auto mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {searchQuery
                            ? `No contacts matched "${searchQuery}". Check spelling or try a different search parameter.`
                            : `You haven't saved any contacts under ${currentUser.fullName}'s account yet.`}
                        </p>
                        {searchQuery ? (
                          <button
                            onClick={() => setSearchQuery('')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                              isDark ? 'bg-slate-800 text-slate-200 border-slate-700 btn-3d-secondary-dark' : 'bg-white text-slate-800 border-slate-300 btn-3d-secondary-light'
                            }`}
                          >
                            Clear Search Filter
                          </button>
                        ) : (
                          <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold btn-3d-primary"
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
            /* Unauthenticated Auth Pages View (Login / Register) with 3D Depth */
            <div className="flex-1 flex flex-col justify-center items-center py-12 px-4">
              <div className={`w-full max-w-md rounded-3xl p-7 sm:p-9 border transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark' : 'bg-white border-slate-200/90 modal-3d-light'
              }`}>
                {/* Brand Header */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white inline-flex items-center justify-center font-black shadow-lg mb-3.5 border-t border-white/30">
                    <Users className="w-7 h-7 drop-shadow-sm" />
                  </div>
                  <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Contact Manager
                  </h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {authView === 'login'
                      ? 'Sign in to access your secure contacts directory'
                      : 'Create your account to start managing contacts'}
                  </p>
                </div>

                {/* Login View */}
                {authView === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={loginShowPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                              : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                          }`}
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
                      <label className={`flex items-center gap-2 cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
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
                        className="text-blue-500 font-bold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black btn-3d-primary mt-2"
                    >
                      Sign In
                    </button>

                    {/* Fast test user quick-login buttons */}
                    <div className={`pt-3 border-t mt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2 text-center text-slate-400">
                        Quick Demo Account Sign In
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
                            className={`px-3 py-2 text-xs font-bold rounded-xl text-center transition-all border ${
                              isDark
                                ? 'bg-slate-800/80 text-slate-300 border-slate-700 btn-3d-secondary-dark'
                                : 'bg-slate-100 text-slate-700 border-slate-200 btn-3d-secondary-light'
                            }`}
                          >
                            As {u.fullName.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center pt-3 text-xs text-slate-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('register');
                          setLoginError('');
                        }}
                        className="text-blue-500 font-bold hover:underline ml-1"
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
                      <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{regError}</span>
                      </div>
                    )}
                    {regSuccess && (
                      <div className="p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{regSuccess}</span>
                      </div>
                    )}

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder="Johnathan Davis"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="name@company.com"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={regShowPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className={`w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                              : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                          }`}
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
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div
                            className={`h-full transition-all duration-300 ${getPasswordStrength(regPassword).color} ${
                              getPasswordStrength(regPassword).width
                            }`}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                          <span>{getPasswordStrength(regPassword).label}</span>
                          <span>Min 8 chars</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={e => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                            : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black btn-3d-primary mt-2"
                    >
                      Create Account
                    </button>

                    <div className="text-center pt-3 text-xs text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('login');
                          setRegError('');
                        }}
                        className="text-blue-500 font-bold hover:underline ml-1"
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
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-7 w-full flex flex-col">
          <div className={`rounded-2xl border overflow-hidden flex-1 flex flex-col min-h-[680px] ${
            isDark ? 'bg-slate-900 border-slate-800 card-3d-dark' : 'bg-white border-slate-200 card-3d-light'
          }`}>
            <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div>
                <h2 className={`text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Code2 className="w-5 h-5 text-blue-500" />
                  Spring Boot & MySQL Codebase Inspector
                </h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Inspect the complete production-grade source code, JPA entities, controllers, unit tests, and MySQL scripts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(PROJECT_FILES[selectedFile] || '')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200 btn-3d-secondary-dark'
                      : 'bg-white border-slate-300 text-slate-700 btn-3d-secondary-light'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied File' : 'Copy File'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 flex-1">
              {/* Sidebar file list */}
              <div className={`border-r p-3 space-y-4 text-xs overflow-y-auto max-h-[750px] ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div>
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Spring Boot Maven & Config
                  </div>
                  {['pom.xml', 'application.properties', 'schema.sql'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Controllers & Endpoints
                  </div>
                  {['ContactController.java', 'AuthController.java', 'CsvImportResponse.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Security & Services
                  </div>
                  {['SecurityConfig.java', 'AuthService.java', 'ContactService.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    JPA Entities & Repositories
                  </div>
                  {['Contact.java', 'User.java', 'ContactRepository.java', 'UserRepository.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Unit & Integration Tests
                  </div>
                  {['AuthServiceTest.java', 'ContactServiceTest.java', 'ContactControllerTest.java'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span className="truncate">{f}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] px-2 mb-1.5">
                    Static Frontend
                  </div>
                  {['index.html', 'login.html', 'register.html', 'script.js', 'style.css'].map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-all ${
                        selectedFile === f
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-200/70'
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

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-7 w-full space-y-6">
          <div className={`rounded-2xl border p-6 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 card-3d-dark' : 'bg-white border-slate-200 card-3d-light'
          }`}>
            <h2 className={`text-xl font-black mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Terminal className="w-6 h-6 text-blue-500" />
              Local Execution & MySQL Setup Guide
            </h2>
            <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Follow these instructions to run the complete Spring Boot backend locally with MySQL on port 8080.
            </p>

            <div className="space-y-5 text-xs">
              <div className={`border rounded-xl p-4 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Prerequisites (JDK 17+ & Maven)
                </div>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-xs">
                  java -version<br />
                  mvn -version
                </div>
              </div>

              <div className={`border rounded-xl p-4 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Start MySQL & Create Database
                </div>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-xs space-y-1">
                  <div>mysql -u root -p</div>
                  <div className="text-emerald-400">CREATE DATABASE contactdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</div>
                </div>
              </div>

              <div className={`border rounded-xl p-4 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  Run Spring Boot
                </div>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-xs space-y-1">
                  <div>export DB_USERNAME=root</div>
                  <div>export DB_PASSWORD=your_password</div>
                  <div>mvn spring-boot:run</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Modals for Live Interactive App */}
      {/* 1. Add / Edit Contact Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-lg border overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark text-slate-100' : 'bg-white border-slate-200 modal-3d-light text-slate-800'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {modalType === 'add' ? 'Add New Contact' : 'Edit Contact'}
              </h2>
              <button
                onClick={() => setModalType(null)}
                className={`p-1.5 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Eleanor Sterling"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      formErrors.name
                        ? 'border-red-500 focus:ring-red-900/30'
                        : isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 349-2041"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      formErrors.phone
                        ? 'border-red-500 focus:ring-red-900/30'
                        : isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. eleanor@sterling.com"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      formErrors.email
                        ? 'border-red-500 focus:ring-red-900/30'
                        : isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={e => setFormCompany(e.target.value)}
                    placeholder="e.g. Sterling Advisory Group"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={e => setFormJobTitle(e.target.value)}
                    placeholder="e.g. Managing Partner"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="e.g. 450 Lexington Ave, New York, NY"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Notes
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    rows={3}
                    placeholder="Client preferences, context, or meeting notes..."
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                </div>
              </div>

              <div className={`pt-4 border-t flex justify-end gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700 btn-3d-secondary-dark' : 'bg-white text-slate-700 border-slate-300 btn-3d-secondary-light'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black btn-3d-primary"
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-lg border overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark text-slate-100' : 'bg-white border-slate-200 modal-3d-light text-slate-800'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h2 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Contact Details
              </h2>
              <button
                onClick={() => setModalType(null)}
                className={`p-1.5 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className={`flex items-center gap-4 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white font-black text-lg flex items-center justify-center shrink-0 avatar-3d border-t border-white/30">
                  {getInitials(selectedContact.name)}
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedContact.name}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {[selectedContact.jobTitle, selectedContact.company].filter(Boolean).join(' at ') || 'Contact'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Phone Number
                  </span>
                  <span className={`font-mono font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{selectedContact.phone}</span>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Email Address
                  </span>
                  <span className={`text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {selectedContact.email || <span className="text-slate-500 italic">Not provided</span>}
                  </span>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Company
                  </span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>
                    {selectedContact.company || <span className="text-slate-500 italic">Not provided</span>}
                  </span>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Job Title
                  </span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>
                    {selectedContact.jobTitle || <span className="text-slate-500 italic">Not provided</span>}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Address
                  </span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-900'}>
                    {selectedContact.address || <span className="text-slate-500 italic">Not provided</span>}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Notes
                  </span>
                  <div className={`p-3.5 rounded-xl border text-xs whitespace-pre-wrap mt-1 ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {selectedContact.notes || <span className="text-slate-500 italic">No notes recorded</span>}
                  </div>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Created At
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{formatDate(selectedContact.createdAt)}</span>
                </div>

                <div>
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Last Updated
                  </span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{formatDate(selectedContact.updatedAt)}</span>
                </div>
              </div>

              <div className={`pt-4 border-t flex justify-end gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700 btn-3d-secondary-dark' : 'bg-white text-slate-700 border-slate-300 btn-3d-secondary-light'
                  }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedContact)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black btn-3d-primary"
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-sm border p-6 text-center ${
            isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark text-slate-100' : 'bg-white border-slate-200 modal-3d-light text-slate-800'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 text-red-500 border border-red-800/50 flex items-center justify-center mx-auto mb-3.5 pod-3d-dark">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className={`font-black text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Delete Contact?</h3>
            <p className={`text-xs mb-5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Are you sure you want to permanently delete <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedContact.name}</strong>?
              This action will remove the record from MySQL and cannot be reversed.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700 btn-3d-secondary-dark' : 'bg-white text-slate-700 border-slate-300 btn-3d-secondary-light'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteContact}
                className="flex-1 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black btn-3d-danger"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Forgot Password Modal */}
      {modalType === 'forgot' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-sm border p-6 text-center ${
            isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark text-slate-100' : 'bg-white border-slate-200 modal-3d-light text-slate-800'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 text-amber-400 border border-amber-800/50 flex items-center justify-center mx-auto mb-3.5 pod-3d-dark">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className={`font-black text-base mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Password Recovery Notice</h3>
            <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Self-service password recovery is intentionally not configured for this local development instance.
            </p>
            <p className={`text-[11px] mb-5 leading-relaxed p-3 rounded-xl border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              In production, password reset requires verified SMTP mail sender credentials, cryptographically signed expiring tokens, and rate-limiting. For local development, simply register a new account or sign in with the preloaded credentials.
            </p>
            <button
              type="button"
              onClick={() => setModalType(null)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-black border ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 btn-3d-secondary-dark' : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-800 btn-3d-primary'
              }`}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* 5. 3D CSV Import Modal */}
      {modalType === 'import' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark text-slate-100' : 'bg-white border-slate-200 modal-3d-light text-slate-800'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <div>
                <h2 className={`text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Upload className="w-5 h-5 text-blue-500" />
                  Bulk Import Contacts from CSV
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Upload a comma-separated values file to import contacts in bulk.
                </p>
              </div>
              <button
                onClick={() => setModalType(null)}
                className={`p-1.5 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Template & Quick Test actions */}
              <div className={`rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs border ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-blue-50/80 border-blue-200 text-blue-900'
              }`}>
                <div>
                  <strong className="block font-bold">Need an example CSV?</strong>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-blue-700'}`}>
                    Columns supported: Name, Phone, Email, Company, Job Title, Address, Notes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border text-xs ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200 btn-3d-secondary-dark'
                        : 'bg-white border-blue-300 text-blue-700 btn-3d-secondary-light'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Template
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleCsv}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center gap-1.5 text-xs btn-3d-primary"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Load Sample Data
                  </button>
                </div>
              </div>

              {/* Upload Dropzone with 3D Depth */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleCsvFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-blue-950/20'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30'
                }`}
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 border ${
                  isDark ? 'bg-blue-900/50 text-blue-400 border-blue-800 pod-3d-dark' : 'bg-blue-100 text-blue-700 border-blue-200 pod-3d'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <p className={`text-sm font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {importFileName ? importFileName : 'Click to upload or drag & drop CSV'}
                </p>
                <p className="text-xs text-slate-400">
                  {importFileName
                    ? 'Click to select a different file'
                    : 'Supports standard UTF-8 RFC 4180 CSV files up to 5MB'}
                </p>
              </div>

              {/* Preview & Validation Report */}
              {importParsedRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                      Parsed {importParsedRows.length} rows:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-lg">
                        ✓ {importParsedRows.length - importErrorsCount} Valid
                      </span>
                      {importErrorsCount > 0 && (
                        <span className="text-red-400 bg-red-950/60 border border-red-800 px-2.5 py-0.5 rounded-lg">
                          ⚠ {importErrorsCount} Skipped (Validation Errors)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`border rounded-xl overflow-x-auto max-h-56 overflow-y-auto ${
                    isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
                  }`}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className={`sticky top-0 text-[10px] font-extrabold uppercase border-b ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <tr>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Company</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                        {importParsedRows.map((r, i) => (
                          <tr key={i} className={r.isValid ? (isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50') : 'bg-red-950/30 text-red-300'}>
                            <td className="py-2 px-3 whitespace-nowrap">
                              {r.isValid ? (
                                <span className="text-emerald-400 font-black">✓ Ready</span>
                              ) : (
                                <span className="text-red-400 font-black" title={r.errorReason}>
                                  ✕ {r.errorReason}
                                </span>
                              )}
                            </td>
                            <td className={`py-2 px-3 font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{r.name || '—'}</td>
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

            <div className={`p-4 border-t flex justify-end gap-2.5 shrink-0 ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700 btn-3d-secondary-dark' : 'bg-white text-slate-700 border-slate-300 btn-3d-secondary-light'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importParsedRows.filter(r => r.isValid).length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-black btn-3d-primary flex items-center gap-1.5"
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

      {/* 6. 3D CSV Export Modal */}
      {modalType === 'export' && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl w-full max-w-md border p-6 ${
            isDark ? 'bg-slate-900 border-slate-800 modal-3d-dark text-slate-100' : 'bg-white border-slate-200 modal-3d-light text-slate-800'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border ${
              isDark ? 'bg-blue-900/50 text-blue-400 border-blue-800 pod-3d-dark' : 'bg-blue-100 text-blue-700 border-blue-200 pod-3d'
            }`}>
              <Download className="w-6 h-6" />
            </div>
            <h3 className={`text-center font-black text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Export Contacts to CSV
            </h3>
            <p className={`text-center text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Generate a CSV spreadsheet compatible with Excel, Google Sheets, and CRM databases.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Filter by Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={exportPhoneFilter}
                    onChange={(e) => setExportPhoneFilter(e.target.value)}
                    placeholder="e.g. +1 (555) 349-2041 or leave empty"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-3 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-900/40'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-blue-100'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  When you provide a phone number, only contacts matching that phone number will be included in the exported CSV. Leave blank to export all {userContacts.length} contacts.
                </p>
              </div>

              {exportPhoneFilter.trim() && (
                <div className={`p-3 rounded-xl border text-[11px] flex items-center justify-between ${
                  isDark ? 'bg-blue-950/60 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
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
                    className="text-blue-400 hover:underline font-bold"
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
                className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700 btn-3d-secondary-dark' : 'bg-white text-slate-700 border-slate-300 btn-3d-secondary-light'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExportCsv(exportPhoneFilter)}
                className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black btn-3d-primary flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container with 3D Depth */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4.5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-700/80 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-red-950 text-red-200 border-red-700/80 shadow-red-950/50'
                : 'bg-slate-900 text-slate-100 border-slate-700 shadow-slate-950/50'
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
