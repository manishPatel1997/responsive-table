'use client';

import React, { useState, useRef } from 'react';
import {
  ResponsiveAutoTable,
  ColumnDefinition,
  ResponsiveAutoTableHandle,
} from '@/components/responsive-auto-table';
import {
  Sliders,
  Maximize2,
  Minimize2,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  department: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Suspended';
  location: string;
  salary: string;
  joinDate: string;
  bio: string;
}

const INITIAL_DATA: Employee[] = [
  {
    id: 'EMP-101',
    name: 'Eleanor Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    role: 'Principal Cloud Architect',
    email: 'eleanor.vance@acme-global.io',
    department: 'Infrastructure & DevOps',
    status: 'Active',
    location: 'San Francisco, CA',
    salary: '$195,000',
    joinDate: '2020-04-12',
    bio: 'Oversees distributed multi-region Kubernetes clusters, zero-trust security mesh, and global CDN caching pipelines.',
  },
  {
    id: 'EMP-102',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    role: 'Staff Database Administrator',
    email: 'm.chen@enterprise.acme.corp',
    department: 'Data Platform',
    status: 'Active',
    location: 'New York, NY',
    salary: '$178,000',
    joinDate: '2019-09-18',
    bio: 'PostgreSQL distributed partitioning, high-availability replication, and query optimizer tuning specialist.',
  },
  {
    id: 'EMP-103',
    name: 'Sophia Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    role: 'Lead Product Designer',
    email: 'sophia.rodriguez@design.acme.co.uk',
    department: 'Product & UX',
    status: 'Pending',
    location: 'London, UK',
    salary: '£118,000',
    joinDate: '2022-11-05',
    bio: 'Directs design systems, accessibility WCAG AAA compliance, and interaction telemetry across mobile applications.',
  },
  {
    id: 'EMP-104',
    name: 'Dr. Alexander Humboldt',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    role: 'Chief AI Research Fellow',
    email: 'alexander.humboldt@ml-labs.internal.acme.io',
    department: 'Artificial Intelligence',
    status: 'Active',
    location: 'Berlin, Germany',
    salary: '€155,000',
    joinDate: '2018-03-22',
    bio: 'Quantized LLM fine-tuning, RAG semantic vector stores, and neural model latency acceleration.',
  },
  {
    id: 'EMP-105',
    name: 'Zoe Miller',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    role: 'Customer Operations Manager',
    email: 'zoe.miller@support.acme.io',
    department: 'Customer Success',
    status: 'Inactive',
    location: 'Austin, TX',
    salary: '$86,000',
    joinDate: '2021-08-30',
    bio: 'Enterprise client escalations, SLA triage workflows, and customer onboarding automation.',
  },
  {
    id: 'EMP-106',
    name: 'Kavita Patel',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
    role: 'VP of Platform Reliability',
    email: 'kavita.patel@apac.acme.com',
    department: 'Engineering',
    status: 'Active',
    location: 'Singapore',
    salary: 'S$260,000',
    joinDate: '2017-06-14',
    bio: 'Leads global infrastructure operations across 6 continents with guaranteed 99.999% uptime availability.',
  },
];

function getStatusBadge(status: Employee['status']) {
  const styles: Record<Employee['status'], string> = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    Pending: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    Inactive: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    Suspended: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shadow-xs ${
        styles[status]
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
}

export default function MasterDemoPage() {
  // Container width interactive slider / presets (null means 100% full width)
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Data state
  const [data, setData] = useState<Employee[]>(() => [...INITIAL_DATA]);

  // Feature toggles
  const [showBioColumn, setShowBioColumn] = useState(true);
  const [showSalaryColumn, setShowSalaryColumn] = useState(true);
  const [showJoinDateColumn, setShowJoinDateColumn] = useState(true);
  const [debugMode, setDebugMode] = useState(true);
  const [responsiveEnabled, setResponsiveEnabled] = useState(true);

  // Ref handle
  const tableRef = useRef<ResponsiveAutoTableHandle>(null);

  // Column definitions with DataTables Responsive priorities
  const allColumns: ColumnDefinition<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      accessor: (r) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={r.avatar}
            alt={r.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {r.name}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {r.id}
            </div>
          </div>
        </div>
      ),
      responsivePriority: 1,
      alwaysVisible: true,
      minWidth: 150,
    },
    {
      key: 'role',
      header: 'Designation / Role',
      accessor: (r) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {r.role}
        </span>
      ),
      responsivePriority: 2,
      minWidth: 140,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (r) => getStatusBadge(r.status),
      responsivePriority: 3,
      minWidth: 90,
    },
    {
      key: 'email',
      header: 'Work Email',
      accessor: (r) => (
        <span className="text-sm text-slate-500 hover:text-indigo-600 transition truncate block max-w-[200px]">
          {r.email}
        </span>
      ),
      responsivePriority: 4,
      maxWidth: 220,
    },
    ...(showBioColumn
      ? [
          {
            key: 'bio',
            header: 'Bio & Expertise (Wrapping)',
            accessor: (r: Employee) => (
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed block max-w-[280px]">
                {r.bio}
              </span>
            ),
            responsivePriority: 6,
            nowrap: false,
            minWidth: 130,
          },
        ]
      : []),
    {
      key: 'department',
      header: 'Department',
      accessor: (r) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {r.department}
        </span>
      ),
      responsivePriority: 5,
    },
    {
      key: 'location',
      header: 'Location',
      accessor: (r) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          📍 {r.location}
        </span>
      ),
      responsivePriority: 7,
    },
    ...(showSalaryColumn
      ? [
          {
            key: 'salary',
            header: 'Compensation',
            accessor: (r: Employee) => (
              <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {r.salary}
              </span>
            ),
            responsivePriority: 8,
          },
        ]
      : []),
    ...(showJoinDateColumn
      ? [
          {
            key: 'joinDate',
            header: 'Hired Date',
            accessor: (r: Employee) => (
              <span className="text-xs text-slate-500 font-mono">
                {r.joinDate}
              </span>
            ),
            responsivePriority: 9,
          },
        ]
      : []),
    {
      key: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert(`Managing profile: ${r.name} (${r.id})`);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-md border border-indigo-200 dark:border-indigo-800 transition"
        >
          Manage
        </button>
      ),
      responsivePriority: 2,
      alwaysVisible: true,
    },
  ];

  // Helper actions
  const handleAddRow = () => {
    const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    setData((prev) => [
      ...prev,
      {
        id: newId,
        name: `New Team Member #${prev.length + 1}`,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face`,
        role: 'Full Stack Engineer',
        email: `engineer.${prev.length + 1}@acme.io`,
        department: 'Product Engineering',
        status: 'Active',
        location: 'Remote',
        salary: '$140,000',
        joinDate: new Date().toISOString().slice(0, 10),
        bio: 'React, Next.js, and TypeScript frontend systems architecture.',
      },
    ]);
  };

  const handleRemoveRow = () => {
    setData((prev) => prev.slice(0, Math.max(1, prev.length - 1)));
  };

  const handleResetData = () => {
    setData([...INITIAL_DATA]);
  };

  const handleLoad100Rows = () => {
    const list: Employee[] = [];
    for (let i = 1; i <= 100; i++) {
      const base = INITIAL_DATA[(i - 1) % INITIAL_DATA.length];
      list.push({
        ...base,
        id: `EMP-${String(i).padStart(4, '0')}`,
        name: `${base.name} (#${i})`,
      });
    }
    setData(list);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> All-In-One Master Demo
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              ResponsiveAutoTable Showcase
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Complete DataTables Responsive clone in React 19 + Next.js with content-aware DOM measurement, subtractive priority hiding, inline child details rows, wrapping column compression, and zero horizontal scrollbars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => tableRef.current?.recalculate()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition"
              title="Imperative recalculate() via ref"
            >
              <RefreshCw className="w-3.5 h-3.5" /> recalculate()
            </button>
            <button
              onClick={() => {
                const visible = tableRef.current?.getVisibleColumns();
                alert(`Visible Columns (${visible?.length}):\n${visible?.join(', ')}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition"
              title="Imperative getVisibleColumns() via ref"
            >
              <Eye className="w-3.5 h-3.5" /> getVisibleColumns()
            </button>
          </div>
        </header>

        {/* Master Control Bar */}
        <div className="bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sliders className="w-4 h-4 text-indigo-400" /> Interactive Container & Layout Controls
            </div>
            <div className="text-xs text-slate-400">
              Container Width:{' '}
              <span className="font-mono font-bold text-indigo-300">
                {containerWidth ? `${containerWidth}px` : '100% (Auto)'}
              </span>
            </div>
          </div>

          {/* Width Presets & Slider */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Presets */}
            <div className="lg:col-span-6 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-slate-400 mr-1">Presets:</span>
              <button
                onClick={() => setContainerWidth(null)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  containerWidth === null
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Maximize2 className="w-3 h-3" /> 100% Full
              </button>
              <button
                onClick={() => setContainerWidth(1100)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  containerWidth === 1100
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Monitor className="w-3 h-3" /> Desktop (1100px)
              </button>
              <button
                onClick={() => setContainerWidth(768)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  containerWidth === 768
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Tablet className="w-3 h-3" /> Tablet (768px)
              </button>
              <button
                onClick={() => setContainerWidth(435)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  containerWidth === 435
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Smartphone className="w-3 h-3" /> Mobile (435px)
              </button>
              <button
                onClick={() => setContainerWidth(333)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  containerWidth === 333
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Minimize2 className="w-3 h-3" /> Small (333px)
              </button>
              <button
                onClick={() => setContainerWidth(250)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  containerWidth === 250
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Tiny (250px)
              </button>
            </div>

            {/* Slider */}
            <div className="lg:col-span-6 flex items-center gap-3">
              <span className="text-xs text-slate-400 whitespace-nowrap">240px</span>
              <input
                type="range"
                min={240}
                max={1200}
                value={containerWidth ?? 1200}
                onChange={(e) => setContainerWidth(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">1200px</span>
            </div>
          </div>

          {/* Dataset & Column Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/80">
            {/* Data modifiers */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Rows ({data.length}):</span>
              <button
                onClick={handleAddRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <Plus className="w-3 h-3" /> Add Row
              </button>
              <button
                onClick={handleRemoveRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
              >
                <Minus className="w-3 h-3" /> Remove Row
              </button>
              <button
                onClick={handleLoad100Rows}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition"
              >
                <Layers className="w-3 h-3" /> Load 100 Rows
              </button>
              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition"
              >
                Reset
              </button>
            </div>

            {/* Column & Feature Switches */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showBioColumn}
                  onChange={(e) => setShowBioColumn(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-500"
                />
                Bio (Wrapping)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showSalaryColumn}
                  onChange={(e) => setShowSalaryColumn(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-500"
                />
                Salary
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={showJoinDateColumn}
                  onChange={(e) => setShowJoinDateColumn(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-500"
                />
                Hired Date
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={responsiveEnabled}
                  onChange={(e) => setResponsiveEnabled(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-500"
                />
                Responsive Mode
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-indigo-400 font-semibold">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-500"
                />
                Debug Panel
              </label>
            </div>
          </div>
        </div>

        {/* Master Table Stage Container */}
        <div className="flex justify-center w-full">
          <div
            style={{
              width: containerWidth ? `${containerWidth}px` : '100%',
              maxWidth: '100%',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="border-2 border-dashed border-indigo-500/40 p-4 rounded-2xl bg-slate-800/40 backdrop-blur-sm relative shadow-2xl"
          >
            {/* Width indicator badge */}
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white font-mono text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-md border border-indigo-400/30">
              Container: {containerWidth ? `${containerWidth}px` : '100%'}
            </div>

            {/* The Master ResponsiveAutoTable Component */}
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 shadow-md">
              <ResponsiveAutoTable
                ref={tableRef}
                columns={allColumns}
                data={data}
                getRowKey={(r) => r.id}
                responsive={responsiveEnabled}
                debugResponsive={debugMode}
                tableClassName="text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
