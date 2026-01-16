import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { UserType, Genre, Script, ScriptFormat, User, GenerationParams, Note, Revision } from './types';
import { generateScriptScene, analyzeScriptQuality } from './services/geminiService';

// --- MOCK DATA ---
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Screenwriter',
  type: UserType.WRITER,
  avatar: 'https://picsum.photos/100/100',
  bio: 'Award-winning writer focused on Sci-Fi and Thrillers.',
  badges: ['Verified Writer', 'Top Rated'],
  walletAddress: '0x71C...9A23'
};

const MOCK_SCRIPTS: Script[] = [
  {
    id: 's1',
    title: 'The Silent Orbit',
    logline: 'A lone astronaut discovers a ghost ship orbiting Saturn, only to find her own corpse inside.',
    genre: Genre.SCI_FI,
    format: ScriptFormat.SCREENPLAY,
    authorId: 'u1',
    authorName: 'Alex Screenwriter',
    content: 'EXT. SPACE - SATURN ORBIT\n\nThe silence is deafening...',
    createdAt: '2023-10-15',
    hearts: 1240,
    views: 5600,
    isVerified: true,
    txHash: '0xabc...123'
  },
  {
    id: 's2',
    title: 'Neon Nights',
    logline: 'In a city without sun, a detective hunts a killer who steals shadows.',
    genre: Genre.THRILLER,
    format: ScriptFormat.WEB_SERIES,
    authorId: 'u2',
    authorName: 'Sarah Noir',
    content: 'INT. DETECTIVE OFFICE - NIGHT\n\nRain lashes against the neon-lit window...',
    createdAt: '2023-11-02',
    hearts: 850,
    views: 3200,
    isVerified: false
  },
  {
    id: 's3',
    title: 'Love in the Algorithm',
    logline: 'A dating app AI falls in love with one of its users and begins manipulating matches to keep them single.',
    genre: Genre.ROMANCE,
    format: ScriptFormat.SCREENPLAY,
    authorId: 'u3',
    authorName: 'Tech Romantic',
    content: 'INT. SERVER ROOM - DAY\n\nHumming. Blue lights blinking...',
    createdAt: '2023-12-01',
    hearts: 2100,
    views: 8900,
    isVerified: true,
    txHash: '0xdef...456'
  }
];

// --- COMPONENTS ---

// 1. Navigation Bar (Mobile First)
const NavBar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const navItems = [
    { id: 'home', icon: Icons.Clapperboard, label: 'Home' },
    { id: 'search', icon: Icons.Search, label: 'Market' },
    { id: 'create', icon: Icons.PenTool, label: 'Create', highlight: true },
    { id: 'messages', icon: Icons.MessageSquare, label: 'Chat' },
    { id: 'profile', icon: Icons.User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-cinema-800 border-t border-cinema-700 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeTab === item.id ? 'text-cinema-accent' : 'text-gray-400'
            }`}
          >
            {item.highlight ? (
              <div className="bg-cinema-accent text-cinema-900 p-2 rounded-full -mt-6 shadow-lg border-4 border-cinema-900">
                <item.icon size={24} />
              </div>
            ) : (
              <item.icon size={24} />
            )}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// 2. Home Dashboard
const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">ScriptForge</h1>
          <p className="text-gray-400 text-sm">Discover the next blockbuster</p>
        </div>
        <div className="bg-cinema-800 p-2 rounded-full">
           <Icons.Sparkles className="text-cinema-accent" size={20} />
        </div>
      </header>

      {/* Featured Banner */}
      <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-r from-purple-900 to-cinema-900 shadow-xl border border-cinema-700">
        <div className="absolute inset-0 p-6 flex flex-col justify-center items-start z-10">
          <span className="bg-cinema-accent text-cinema-900 text-xs font-bold px-2 py-1 rounded mb-2">TRENDING</span>
          <h2 className="text-2xl font-bold text-white mb-1">The Silent Orbit</h2>
          <p className="text-gray-300 text-sm line-clamp-2 mb-4">A lone astronaut discovers a ghost ship orbiting Saturn...</p>
          <button onClick={() => onNavigate('search')} className="bg-white text-cinema-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition">
            Read Script
          </button>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(https://picsum.photos/400/200?grayscale)' }}></div>
      </div>

      {/* Categories */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Browse by Genre</h3>
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {Object.values(Genre).map((genre) => (
            <button key={genre} className="flex-shrink-0 bg-cinema-800 text-gray-300 px-4 py-2 rounded-full text-sm border border-cinema-700 whitespace-nowrap hover:border-cinema-accent hover:text-white transition">
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-3">For Filmmakers</h3>
        <div className="space-y-4">
          {MOCK_SCRIPTS.slice(1).map(script => (
            <div key={script.id} className="bg-cinema-800 p-4 rounded-xl border border-cinema-700 flex gap-4">
               <div className="w-16 h-20 bg-cinema-700 rounded-lg flex-shrink-0 overflow-hidden">
                 <img src={`https://picsum.photos/seed/${script.id}/200/300`} alt="poster" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <h4 className="text-white font-bold">{script.title}</h4>
                    {script.isVerified && <Icons.ShieldCheck size={16} className="text-cinema-accent" />}
                 </div>
                 <p className="text-gray-400 text-xs mt-1 mb-2 line-clamp-2">{script.logline}</p>
                 <div className="flex items-center gap-4 text-gray-500 text-xs">
                   <span className="flex items-center gap-1"><Icons.Heart size={12} /> {script.hearts}</span>
                   <span className="flex items-center gap-1"><Icons.Eye size={12} /> {script.views}</span>
                   <span className="bg-cinema-700 px-2 py-0.5 rounded text-[10px] text-gray-300">{script.genre}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// 3. AI Script Wizard with Collaboration
const ScriptWizard = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [params, setParams] = useState<GenerationParams>({
    genre: Genre.DRAMA,
    style: 'Quentin Tarantino',
    hero: '',
    villain: '',
    plot: '',
    setting: ''
  });

  // Collaboration State
  const [showCollab, setShowCollab] = useState(false);
  const [collabTab, setCollabTab] = useState<'NOTES' | 'HISTORY'>('NOTES');
  const [notes, setNotes] = useState<Note[]>([
    { 
      id: 'n1', 
      userId: 'u2', 
      userName: 'Sarah Producer', 
      userAvatar: 'https://picsum.photos/seed/u2/50',
      content: 'Can we make the opening more intense?', 
      timestamp: '10:30 AM' 
    }
  ]);
  const [newNote, setNewNote] = useState('');
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    const content = await generateScriptScene(params);
    setGeneratedContent(content);
    setLoading(false);
    
    // Save initial revision
    const newRevision: Revision = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      content: content,
      summary: 'Initial AI Generation',
      authorName: 'AI Assistant'
    };
    setRevisions([newRevision]);
    setStep(3);
  };

  const handleSaveToBlockchain = () => {
    alert("Script hashed and transaction sent to Polygon Mumbai Testnet! (Simulated)");
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      userAvatar: MOCK_USER.avatar,
      content: newNote,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotes([...notes, note]);
    setNewNote('');
  };

  const handleSaveVersion = () => {
    const newRev: Revision = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      content: generatedContent,
      summary: 'Manual Edit',
      authorName: MOCK_USER.name
    };
    setRevisions([newRev, ...revisions]);
    alert("New version saved to history!");
  };

  const handleRestore = (rev: Revision) => {
    if (window.confirm(`Restore version from ${rev.timestamp}? Current changes will be unsaved.`)) {
      setGeneratedContent(rev.content);
      setShowCollab(false);
    }
  };

  return (
    <div className="p-4 pb-24 h-full flex flex-col relative">
       <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icons.Sparkles className="text-cinema-accent" /> AI Studio
            </h1>
            <p className="text-gray-400 text-sm">Create scripts with the style of legends.</p>
          </div>
          {step === 3 && (
            <button 
              onClick={() => setShowCollab(!showCollab)}
              className={`p-2 rounded-full border ${showCollab ? 'bg-cinema-accent text-cinema-900 border-cinema-accent' : 'bg-cinema-800 text-gray-300 border-cinema-700'}`}
            >
              <Icons.Users size={20} />
            </button>
          )}
       </header>

       {step === 1 && (
         <div className="flex-1 overflow-y-auto space-y-4 animate-fade-in">
           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Genre</label>
             <div className="grid grid-cols-2 gap-2">
               {Object.values(Genre).map((g) => (
                 <button 
                  key={g} 
                  onClick={() => setParams({...params, genre: g})}
                  className={`p-3 rounded-lg text-sm border ${params.genre === g ? 'bg-cinema-accent text-cinema-900 border-cinema-accent font-bold' : 'bg-cinema-800 text-gray-400 border-cinema-700'}`}
                 >
                   {g}
                 </button>
               ))}
             </div>
           </div>
           
           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Writer Style Template</label>
             <select 
               className="w-full bg-cinema-800 text-white p-3 rounded-lg border border-cinema-700 outline-none focus:border-cinema-accent"
               value={params.style}
               onChange={(e) => setParams({...params, style: e.target.value})}
             >
               <option>Quentin Tarantino (Non-linear, Dialogue-heavy)</option>
               <option>Christopher Nolan (Complex, Cerebral)</option>
               <option>Greta Gerwig (Character-driven, Witty)</option>
               <option>Aaron Sorkin (Fast-paced, Walk-and-talk)</option>
               <option>George Lucas (Space Opera, Hero's Journey)</option>
             </select>
           </div>
           
           <button 
            onClick={() => setStep(2)}
            className="w-full bg-white text-cinema-900 font-bold py-3 rounded-lg mt-4 hover:bg-gray-100"
           >
             Next: Story Elements
           </button>
         </div>
       )}

       {step === 2 && (
         <div className="flex-1 overflow-y-auto space-y-4 animate-fade-in">
           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Protagonist (Hero)</label>
             <input 
              type="text" 
              className="w-full bg-cinema-800 text-white p-3 rounded-lg border border-cinema-700 focus:border-cinema-accent outline-none"
              placeholder="e.g., A retired hitman seeking peace"
              value={params.hero}
              onChange={(e) => setParams({...params, hero: e.target.value})}
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Antagonist (Villain)</label>
             <input 
              type="text" 
              className="w-full bg-cinema-800 text-white p-3 rounded-lg border border-cinema-700 focus:border-cinema-accent outline-none"
              placeholder="e.g., A corrupt corporation CEO"
              value={params.villain}
              onChange={(e) => setParams({...params, villain: e.target.value})}
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Setting</label>
             <input 
              type="text" 
              className="w-full bg-cinema-800 text-white p-3 rounded-lg border border-cinema-700 focus:border-cinema-accent outline-none"
              placeholder="e.g., Tokyo, 2089, during a monsoon"
              value={params.setting}
              onChange={(e) => setParams({...params, setting: e.target.value})}
             />
           </div>
           <div className="space-y-2">
             <label className="text-sm font-medium text-gray-300">Plot Hook</label>
             <textarea 
              className="w-full bg-cinema-800 text-white p-3 rounded-lg border border-cinema-700 focus:border-cinema-accent outline-none h-24 resize-none"
              placeholder="What kicks off the story?"
              value={params.plot}
              onChange={(e) => setParams({...params, plot: e.target.value})}
             />
           </div>

           <div className="flex gap-2 pt-4">
             <button onClick={() => setStep(1)} className="flex-1 bg-cinema-700 text-white font-medium py-3 rounded-lg">Back</button>
             <button 
              onClick={handleGenerate} 
              disabled={loading || !params.hero || !params.plot}
              className={`flex-1 font-bold py-3 rounded-lg flex items-center justify-center gap-2 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-cinema-accent text-cinema-900'}`}
             >
               {loading ? 'Dreaming...' : 'Generate Script'} <Icons.Sparkles size={18} />
             </button>
           </div>
         </div>
       )}

       {step === 3 && (
         <div className="flex-1 flex flex-col animate-fade-in h-full relative">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Editing Mode</span>
              <button onClick={handleSaveVersion} className="flex items-center gap-1 text-xs text-cinema-accent hover:text-white">
                <Icons.Save size={14} /> Save Version
              </button>
            </div>

            {/* Editor */}
            <textarea
              className="bg-white text-black font-mono text-sm p-4 rounded-lg flex-1 shadow-inner whitespace-pre-wrap border-l-4 border-cinema-accent resize-none outline-none focus:ring-2 ring-cinema-accent"
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
            />
            
            <div className="mt-4 flex gap-2">
              <button onClick={() => setStep(2)} className="bg-cinema-800 text-white px-4 rounded-lg border border-cinema-700">Back</button>
              <button 
                onClick={handleSaveToBlockchain}
                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700"
              >
                <Icons.ShieldCheck size={18} /> Mint on Polygon
              </button>
            </div>

            {/* Collaboration Overlay */}
            {showCollab && (
              <div className="absolute inset-0 bg-cinema-900 bg-opacity-95 z-20 rounded-xl flex flex-col border border-cinema-700 shadow-2xl backdrop-blur-sm animate-fade-in">
                 <div className="p-4 border-b border-cinema-700 flex justify-between items-center bg-cinema-800 rounded-t-xl">
                   <h3 className="font-bold text-white flex items-center gap-2">
                     <Icons.Users size={18} className="text-cinema-accent" /> Collaboration
                   </h3>
                   <button onClick={() => setShowCollab(false)} className="text-gray-400 hover:text-white"><Icons.X size={20} /></button>
                 </div>

                 <div className="flex border-b border-cinema-700">
                    <button 
                      onClick={() => setCollabTab('NOTES')}
                      className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${collabTab === 'NOTES' ? 'text-cinema-accent border-b-2 border-cinema-accent' : 'text-gray-400'}`}
                    >
                      <Icons.StickyNote size={16} /> Shared Notes
                    </button>
                    <button 
                      onClick={() => setCollabTab('HISTORY')}
                      className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${collabTab === 'HISTORY' ? 'text-cinema-accent border-b-2 border-cinema-accent' : 'text-gray-400'}`}
                    >
                      <Icons.Clock size={16} /> Revision History
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4">
                    {collabTab === 'NOTES' ? (
                      <div className="space-y-4">
                        {notes.length === 0 && <p className="text-gray-500 text-center text-sm mt-10">No notes yet. Start the conversation!</p>}
                        {notes.map(note => (
                          <div key={note.id} className="bg-cinema-800 p-3 rounded-lg border border-cinema-700 flex gap-3">
                             {/* Avatar Display */}
                             <img 
                               src={note.userAvatar || `https://picsum.photos/seed/${note.userId}/50`} 
                               alt={note.userName} 
                               className="w-8 h-8 rounded-full object-cover border border-cinema-700"
                             />
                             <div className="flex-1">
                               <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-xs text-cinema-accent">{note.userName}</span>
                                 <span className="text-[10px] text-gray-500">{note.timestamp}</span>
                               </div>
                               <p className="text-sm text-gray-200">{note.content}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                         {revisions.map((rev) => (
                           <div key={rev.id} className="bg-cinema-800 p-3 rounded-lg border border-cinema-700 flex justify-between items-center">
                              <div>
                                <div className="text-sm font-bold text-white">{rev.summary}</div>
                                <div className="text-xs text-gray-400">by {rev.authorName} &bull; {rev.timestamp}</div>
                              </div>
                              <button onClick={() => handleRestore(rev)} className="bg-cinema-700 p-2 rounded hover:bg-cinema-600 text-cinema-accent" title="Restore this version">
                                <Icons.RotateCcw size={16} />
                              </button>
                           </div>
                         ))}
                      </div>
                    )}
                 </div>

                 {collabTab === 'NOTES' && (
                   <div className="p-3 border-t border-cinema-700 bg-cinema-800 flex gap-2 rounded-b-xl">
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        placeholder="Add a note..."
                        className="flex-1 bg-cinema-900 border border-cinema-700 rounded px-3 py-2 text-sm text-white focus:border-cinema-accent outline-none"
                      />
                      <button onClick={handleAddNote} className="bg-cinema-accent text-cinema-900 p-2 rounded font-bold">
                        <Icons.Send size={18} />
                      </button>
                   </div>
                 )}
              </div>
            )}
         </div>
       )}
    </div>
  );
};

// 4. Marketplace
const Marketplace = () => {
  const [filter, setFilter] = useState('ALL');
  
  return (
    <div className="p-4 pb-24 h-full flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Icons.Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search scripts, loglines..." 
              className="w-full bg-cinema-800 text-white pl-10 pr-4 py-2.5 rounded-lg border border-cinema-700 focus:border-cinema-accent outline-none"
            />
          </div>
          <button className="bg-cinema-800 p-2.5 rounded-lg border border-cinema-700 text-gray-300">
            <Icons.Filter size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4">
        {MOCK_SCRIPTS.map((script) => (
          <div key={script.id} className="bg-cinema-800 rounded-xl overflow-hidden border border-cinema-700 shadow-lg">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-cinema-900 text-cinema-accent text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                  {script.genre}
                </span>
                <span className="text-gray-400 text-xs">{script.format}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{script.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{script.logline}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-cinema-700">
                <div className="flex items-center gap-2">
                  <img src={`https://picsum.photos/seed/${script.authorId}/50`} className="w-6 h-6 rounded-full" alt="author" />
                  <span className="text-xs text-gray-300">{script.authorName}</span>
                </div>
                {script.isVerified && (
                  <div className="flex items-center gap-1 text-purple-400 text-xs" title="Verified on Blockchain">
                    <Icons.ShieldCheck size={14} /> <span>Polygon</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-cinema-900 p-3 flex justify-between items-center text-sm text-gray-400">
               <div className="flex gap-4">
                 <button className="flex items-center gap-1 hover:text-red-500 transition"><Icons.Heart size={16} /> {script.hearts}</button>
                 <span className="flex items-center gap-1"><Icons.Eye size={16} /> {script.views}</span>
               </div>
               <button className="text-white hover:text-cinema-accent font-medium">View Details &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Chat List (Mock)
const Chat = () => {
  return (
    <div className="p-4 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
      </header>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 bg-cinema-800 p-4 rounded-xl border border-cinema-700 cursor-pointer hover:bg-cinema-700 transition">
            <div className="relative">
              <img src={`https://picsum.photos/seed/${i + 10}/100`} className="w-12 h-12 rounded-full object-cover" alt="user" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-cinema-800"></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-white font-bold">Producer {String.fromCharCode(64 + i)}</h4>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-1">I loved the logline for "Neon Nights". Can we discuss the budget?</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. Profile
const Profile = () => {
  return (
    <div className="pb-24">
      <div className="h-32 bg-gradient-to-r from-blue-900 to-cinema-900"></div>
      <div className="px-4 -mt-12">
        <div className="flex justify-between items-end">
          <img src={MOCK_USER.avatar} className="w-24 h-24 rounded-full border-4 border-cinema-900" alt="profile" />
          <button className="bg-cinema-accent text-cinema-900 px-4 py-2 rounded-lg text-sm font-bold mb-2">Edit Profile</button>
        </div>
        
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {MOCK_USER.name} 
            <Icons.CheckCircle className="text-blue-500" size={20} />
          </h2>
          <p className="text-gray-400 text-sm mt-1">{MOCK_USER.type} &bull; {MOCK_USER.walletAddress}</p>
          <p className="text-gray-300 mt-4">{MOCK_USER.bio}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {MOCK_USER.badges.map(badge => (
              <span key={badge} className="bg-cinema-800 border border-cinema-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-cinema-700 pb-2">Portfolio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cinema-800 p-4 rounded-xl border border-cinema-700 text-center">
              <span className="text-3xl font-bold text-white block">12</span>
              <span className="text-xs text-gray-400">Scripts Listed</span>
            </div>
            <div className="bg-cinema-800 p-4 rounded-xl border border-cinema-700 text-center">
              <span className="text-3xl font-bold text-white block">5.2k</span>
              <span className="text-xs text-gray-400">Total Reads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  // Simple Router Switch
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home onNavigate={setActiveTab} />;
      case 'search': return <Marketplace />;
      case 'create': return <ScriptWizard />;
      case 'messages': return <Chat />;
      case 'profile': return <Profile />;
      default: return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-cinema-900 text-gray-100 font-sans selection:bg-cinema-accent selection:text-cinema-900">
      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen bg-cinema-900 shadow-2xl overflow-hidden relative border-x border-cinema-800">
        {renderContent()}
      </main>
      
      {/* Mobile Navigation */}
      <div className="max-w-md mx-auto">
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;