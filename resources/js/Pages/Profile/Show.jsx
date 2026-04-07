import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    Search,
    Bell,
    ChevronDown,
    Mail,
    Plus,
    Edit3,
    Check,
    X
} from 'lucide-react';
import LabLayout from '@/Layouts/LabLayout';

export default function Show() {
    const { auth } = usePage().props;
    const user = auth.user;

    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        fullName: user.name || 'Hector Ryan M. Par', 
        nickName: 'Ryan',
        role: 'Administrator',
        gender: 'Male',
        department: 'Science Department',
        email: user.email || 'alexarawles@gmail.com'
    });

    const [tempProfile, setTempProfile] = useState({ ...profile });

    const handleSave = () => {
        setProfile({ ...tempProfile });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempProfile({ ...profile });
        setIsEditing(false);
    };

    const InputField = ({ label, value, onChange, placeholder, isDropdown = false, id, options = [] }) => (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[14px] font-medium text-gray-700">{label}</label>
            <div className="relative">
                {isEditing && isDropdown ? (
                    <select
                        id={id}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-none bg-[#f8fafc] text-[14px] text-gray-800 focus:ring-2 focus:ring-[#4663ac]/20 transition-all appearance-none cursor-pointer"
                    >
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={!isEditing}
                        placeholder={placeholder || 'Enter value'}
                        className={`w-full px-4 py-3 rounded-xl border-none bg-[#f8fafc] text-[14px] text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#4663ac]/20 transition-all ${!isEditing ? 'cursor-default' : 'cursor-text'}`}
                    />
                )}
                {isDropdown && !isEditing && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <LabLayout title="Profile Settings">
            <Head title="Profile Settings" />

            <div className="flex-1 bg-white p-8 overflow-y-auto">


                {/* Main Profile Card Layout */}
                <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    {/* Header Gradient */}
                    <div className="h-40 w-full bg-gradient-to-r from-[#e0e7ff] via-[#f0f9ff] to-[#fef2f2]"></div>
                    
                    <div className="px-8 pb-12">
                        {/* Profile Info Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-[60px] mb-10 gap-4">
                            <div className="flex items-end gap-5">
                                <div className="h-[120px] w-[120px] rounded-full border-[6px] border-white shadow-lg overflow-hidden bg-white shrink-0">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${profile.fullName}&background=4663ac&color=fff&size=120`} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="pb-1">
                                    <h2 className="text-[22px] font-bold text-gray-900 leading-tight">{profile.fullName}</h2>
                                    <p className="text-[#4663ac] text-[12px] font-bold mt-0.5 uppercase tracking-widest opacity-90 leading-none">{profile.role}</p>
                                    <p className="text-gray-400 text-[13px] mt-1 leading-none">{profile.email}</p>
                                </div>
                            </div>

                            <div className="pb-3 flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button 
                                            onClick={handleSave}
                                            className="flex items-center gap-2 bg-[#4663ac] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                                        >
                                            <Check className="w-4 h-4" /> Save Changes
                                        </button>
                                        <button 
                                            onClick={handleCancel}
                                            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all"
                                        >
                                            <X className="w-4 h-4" /> Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-[#4663ac] text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                            <InputField 
                                label="Full Name" 
                                value={isEditing ? tempProfile.fullName : profile.fullName}
                                onChange={(val) => setTempProfile({...tempProfile, fullName: val})}
                                id="fullName"
                            />
                            <InputField 
                                label="Nick Name" 
                                value={isEditing ? tempProfile.nickName : profile.nickName}
                                onChange={(val) => setTempProfile({...tempProfile, nickName: val})}
                                id="nickName"
                            />
                            <InputField 
                                label="Gender" 
                                value={isEditing ? tempProfile.gender : profile.gender}
                                onChange={(val) => setTempProfile({...tempProfile, gender: val})}
                                isDropdown={true}
                                options={['Male', 'Female', 'Rather not say']}
                                id="gender"
                            />
                            <InputField 
                                label="Role" 
                                value={isEditing ? tempProfile.role : profile.role}
                                onChange={(val) => setTempProfile({...tempProfile, role: val})}
                                id="role"
                            />
                            <InputField 
                                label="Department" 
                                value={isEditing ? tempProfile.department : profile.department}
                                onChange={(val) => setTempProfile({...tempProfile, department: val})}
                                id="department"
                            />
                        </div>

                        {/* My Email Address Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-900">My email Address</h3>
                            
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-gray-800">{profile.email}</p>
                                        <p className="text-[12px] text-gray-400 mt-0.5">Primary • Verified</p>
                                    </div>
                                </div>
                                
                                <button className="flex items-center gap-2 bg-[#f0f4ff] text-[#4663ac] px-4 py-2.5 rounded-xl font-bold text-[13px] w-fit hover:bg-[#e0e7ff] transition-all">
                                    <Plus className="w-4 h-4" /> +Add Email Address
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LabLayout>
    );
}
