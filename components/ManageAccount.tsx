import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, TwoStepAuth, DeviceInfo, PasswordEntry } from '../types';

interface ManageAccountProps {
  user: UserProfile | null;
  onBack: () => void;
  onUpdate: (user: UserProfile) => void;
  onLogout: () => void;
}

const Card = ({ children, title }: { children?: React.ReactNode, title?: string }) => (
  <div className="bg-[#1c1c1e] rounded-[24px] border border-[#2c2c2e] overflow-hidden mb-4">
    {title && <div className="px-5 pt-5 pb-1 text-xl font-bold text-white">{title}</div>}
    <div className="p-5 flex flex-col divide-y divide-[#2c2c2e]">
      {children}
    </div>
  </div>
);

export default function ManageAccount({ user, onBack, onUpdate, onLogout }: ManageAccountProps) {
  const [view, setView] = useState<'MAIN' | 'HOW_TO_SIGNIN' | 'TWO_STEP' | 'DEVICES' | 'CONNECTIONS' | 'SAFE_BROWSING' | 'PASSWORD_MANAGER'>('MAIN');
  
  // Two-Step State
  const [twoStepMethods, setTwoStepMethods] = useState<TwoStepAuth[]>([]);
  const [showAddTwoStep, setShowAddTwoStep] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'security_key' | 'phone' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryStreekxId, setRecoveryStreekxId] = useState('');
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  
  // Devices State
  const [devices, setDevices] = useState<DeviceInfo[]>([
    { 
      id: '1', 
      user_id: user?.id || '', 
      device_name: 'My Current Device', 
      device_type: 'desktop', 
      browser: 'Chrome', 
      os: 'Windows 11', 
      last_active: new Date().toISOString(), 
      is_current: true, 
      created_at: new Date().toISOString() 
    }
  ]);
  
  // Connections State
  const [connections, setConnections] = useState([
    { platform: 'Google', email: 'user@gmail.com', connected: true, lastUsed: '2 days ago' }
  ]);
  
  // Password Manager State
  const [passwords, setPasswords] = useState<PasswordEntry[]>([
    { id: '1', user_id: user?.id || '', website: 'Gmail', username: 'user@gmail.com', password: '••••••••', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ]);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [newPassword, setNewPassword] = useState({ website: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState<string | null>(null);

  // --- How You Sign In ---
  const HowYouSignInView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">How you sign in</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-6">
          {/* Two-Step Verification */}
          <Card title="Two-step verification">
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-bold mb-1">Two-step verification</p>
                  <p className="text-gray-400 text-sm">Add a second layer of security to your account</p>
                </div>
                <div onClick={() => setTwoStepEnabled(!twoStepEnabled)} className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer ${twoStepEnabled ? 'bg-streekx-primary' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${twoStepEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </div>
              
              {twoStepEnabled && (
                <div className="mt-4 space-y-3">
                  <button onClick={() => setSelectedMethod('authenticator')} className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-left text-white font-bold transition-colors">
                    + Add authenticator app
                  </button>
                  <button onClick={() => setSelectedMethod('security_key')} className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-left text-white font-bold transition-colors">
                    + Add security key
                  </button>
                  <button onClick={() => setSelectedMethod('phone')} className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-left text-white font-bold transition-colors">
                    + Add phone number
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Passkeys & Security Keys */}
          <Card title="Passkeys and security keys">
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-4">Use passkeys or security keys to sign in without your password</p>
              <button className="w-full p-3 rounded-lg bg-streekx-primary hover:bg-streekx-primaryLight text-white font-bold transition-colors">
                + Add passkey or security key
              </button>
            </div>
          </Card>

          {/* Password */}
          <Card title="Password">
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-4">Change your password to keep your account secure</p>
              <button className="w-full p-3 rounded-lg border border-[#2c2c2e] hover:bg-[#2c2c2e] text-white font-bold transition-colors">
                Change password
              </button>
            </div>
          </Card>

          {/* Recovery Phone & Recovery ID */}
          <Card title="Recovery options">
            <div className="py-4 space-y-4">
              <div>
                <p className="text-white font-bold mb-2">Recovery phone</p>
                <p className="text-gray-400 text-sm mb-3">Use this number to recover your account</p>
                <button className="w-full p-3 rounded-lg bg-[#2c2c2e] hover:bg-[#3c3c3e] text-white font-bold transition-colors">
                  Add recovery phone
                </button>
              </div>
              <div className="border-t border-[#2c2c2e] pt-4">
                <p className="text-white font-bold mb-2">Recovery StreekX ID</p>
                <p className="text-gray-400 text-sm mb-3">Add another StreekX ID to recover your account</p>
                {recoveryStreekxId ? (
                  <div className="p-3 bg-streekx-primary/10 border border-streekx-primary rounded-lg text-white">
                    {recoveryStreekxId}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter StreekX ID"
                    value={recoveryStreekxId}
                    onChange={(e) => setRecoveryStreekxId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#1c1c1e] border border-[#2c2c2e] text-white placeholder-gray-500 mb-2"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Security Code */}
          <Card title="Security code">
            <div className="py-4">
              <p className="text-gray-400 text-sm mb-4">Your security code helps identify your account</p>
              <div className="p-4 bg-[#2c2c2e] rounded-lg border border-[#3c3c3e]">
                <p className="text-gray-400 text-xs uppercase mb-2">Your Security Code</p>
                <p className="text-white font-bold text-lg font-mono">STREEKX-2024-XYZ123</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // --- Devices View ---
  const DevicesView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Your devices</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">Show only devices that accessed your account in the past 3 months</p>
            <button className="text-streekx-primary font-bold text-sm">Find a lost device</button>
          </div>
          
          {devices.map(device => (
            <Card key={device.id}>
              <div className="py-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white font-bold">{device.device_name}</p>
                    {device.is_current && <span className="text-xs bg-streekx-primary text-white px-2 py-0.5 rounded">Current</span>}
                  </div>
                  <p className="text-gray-400 text-sm">{device.browser} • {device.os}</p>
                  <p className="text-gray-500 text-xs mt-1">Last active: {new Date(device.last_active).toLocaleDateString()}</p>
                </div>
                <button className="text-gray-500 hover:text-white text-sm">Sign out</button>
              </div>
            </Card>
          ))}
          
          <button className="w-full p-3 rounded-lg border border-red-600 hover:bg-red-600/10 text-red-600 font-bold transition-colors">
            Sign out all other sessions
          </button>
        </div>
      </div>
    </div>
  );

  // --- Connections View ---
  const ConnectionsView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Your connections</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          {connections.map(conn => (
            <Card key={conn.platform}>
              <div className="py-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-bold mb-1">{conn.platform}</p>
                  <p className="text-gray-400 text-sm">{conn.email}</p>
                  {conn.lastUsed && <p className="text-gray-500 text-xs mt-1">Last used: {conn.lastUsed}</p>}
                </div>
                <button className="text-red-600 hover:text-red-500 font-bold text-sm">Disconnect</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Password Manager View ---
  const PasswordManagerView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={() => setView('MAIN')} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Password manager</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          {passwords.map(pwd => (
            <Card key={pwd.id}>
              <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-bold">{pwd.website}</p>
                    <p className="text-gray-400 text-sm">{pwd.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowPassword(showPassword === pwd.id ? null : pwd.id)}
                      className="text-gray-500 hover:text-white"
                    >
                      {showPassword === pwd.id ? '🙈' : '👁'}
                    </button>
                    <button className="text-red-600 hover:text-red-500 text-sm font-bold">Delete</button>
                  </div>
                </div>
                {showPassword === pwd.id && (
                  <div className="mt-2 p-2 bg-[#2c2c2e] rounded text-gray-300 text-sm font-mono">{pwd.password}</div>
                )}
              </div>
            </Card>
          ))}
          
          {showAddPassword ? (
            <Card>
              <div className="py-4 space-y-3">
                <input
                  type="text"
                  placeholder="Website"
                  value={newPassword.website}
                  onChange={(e) => setNewPassword({...newPassword, website: e.target.value})}
                  className="w-full p-3 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg text-white placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={newPassword.username}
                  onChange={(e) => setNewPassword({...newPassword, username: e.target.value})}
                  className="w-full p-3 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg text-white placeholder-gray-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword.password}
                  onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                  className="w-full p-3 bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg text-white placeholder-gray-500"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowAddPassword(false)} className="flex-1 p-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600">Cancel</button>
                  <button onClick={() => { setPasswords([...passwords, {id: ''+Date.now(), user_id: user?.id||'', website: newPassword.website, username: newPassword.username, password: newPassword.password, created_at: new Date().toISOString(), updated_at: new Date().toISOString()}]); setShowAddPassword(false); setNewPassword({website:'',username:'',password:''}); }} className="flex-1 p-2 bg-streekx-primary rounded-lg text-white hover:bg-streekx-primaryLight">Save</button>
                </div>
              </div>
            </Card>
          ) : (
            <button onClick={() => setShowAddPassword(true)} className="w-full p-3 rounded-lg bg-streekx-primary hover:bg-streekx-primaryLight text-white font-bold transition-colors">
              + Add password
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // --- Main View ---
  const MainView = () => (
    <div className="h-full bg-[#000000] flex flex-col animate-slide-right">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c1c1e]">
        <button onClick={onBack} className="flex items-center text-gray-400 hover:text-white">
          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back
        </button>
        <h2 className="font-bold text-lg text-white">Manage your account</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-4">
          <div onClick={() => setView('HOW_TO_SIGNIN')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">How you sign in to StreekX</p>
            <p className="text-gray-400 text-sm">Manage passwords, security keys, and 2-step verification</p>
          </div>
          
          <div onClick={() => setView('DEVICES')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Your devices</p>
            <p className="text-gray-400 text-sm">Manage devices where you're signed in</p>
          </div>
          
          <div onClick={() => setView('CONNECTIONS')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Your connections</p>
            <p className="text-gray-400 text-sm">Third-party apps with access to your account</p>
          </div>
          
          <div onClick={() => setView('SAFE_BROWSING')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Enhance safe browsing</p>
            <p className="text-gray-400 text-sm">Get security alerts and protection</p>
          </div>
          
          <div onClick={() => setView('PASSWORD_MANAGER')} className="bg-[#1c1c1e] rounded-2xl p-4 border border-[#2c2c2e] cursor-pointer hover:bg-[#2c2c2e] transition-colors">
            <p className="text-white font-bold mb-1">Password manager</p>
            <p className="text-gray-400 text-sm">Manage your saved passwords securely</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {view === 'MAIN' && <MainView />}
      {view === 'HOW_TO_SIGNIN' && <HowYouSignInView />}
      {view === 'DEVICES' && <DevicesView />}
      {view === 'CONNECTIONS' && <ConnectionsView />}
      {view === 'PASSWORD_MANAGER' && <PasswordManagerView />}
    </>
  );
}
