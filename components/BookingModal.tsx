import React, { useState } from 'react';
import { X, ArrowRight, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Service, Plan, SetupImage, AddOn } from '../types';
import { api } from '../services/apiService';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    selection: {
        decoration: Service;
        setup: SetupImage | null;
        plan: Plan;
        mode: 'INDOOR' | 'OUTDOOR';
    };
    addons: AddOn[];
}

const CheckIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, selection, addons }) => {
    const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});
    const [step, setStep] = useState<'addons' | 'details'>('addons');
    const [userDetails, setUserDetails] = useState({ name: '', phone: '', date: '' });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    // Filter add-ons: exclude if already in plan features
    const filteredAddons = addons.filter(addon => {
        const planFeatures = selection.plan.features.map(f => f.toLowerCase());
        return !planFeatures.some(f => f.includes(addon.name.toLowerCase()));
    });

    const handleAddonChange = (addon: AddOn, value: number) => {
        setSelectedAddons(prev => {
            const next = { ...prev };
            if (value <= 0) delete next[addon.id];
            else next[addon.id] = value;
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const addonSummary = Object.entries(selectedAddons).map(([id, qty]) => {
            const addon = addons.find(a => a.id === Number(id));
            return addon ? `${addon.name} ${addon.type === 'quantity' ? `(x${qty})` : ''}` : '';
        }).join(', ');

        const message = `
*New Booking Inquiry*
*Type:* ${selection.mode}
*Decoration:* ${selection.decoration.title}
*Setup:* ${selection.setup?.title || 'General'}
*Plan:* ${selection.plan.name}
*Add-ons:* ${addonSummary || 'None'}

*Customer Details:*
Name: ${userDetails.name}
Phone: ${userDetails.phone}
Date: ${userDetails.date}
    `.trim();

        try {
            await api.sendInquiry({
                name: userDetails.name,
                email: userDetails.phone, // Using phone as identifier for now or add phone field to API
                type: 'Booking',
                message: message
            });
            alert("Quotation request sent successfully! We will contact you shortly.");
            onClose();
        } catch (error) {
            alert("Failed to send request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in p-4">
            <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-zoom-in max-h-[90vh]">

                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-serif italic text-white">
                            {step === 'addons' ? 'Customize Your Package' : 'Finalize Booking'}
                        </h2>
                        <p className="text-zinc-400 text-xs uppercase tracking-widest">
                            {selection.decoration.title} • {selection.plan.name}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar flex-grow">
                    {step === 'addons' ? (
                        <div className="space-y-4">
                            <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl mb-6">
                                <h4 className="text-brand-primary font-bold text-sm uppercase tracking-wider mb-2">Included in Plan</h4>
                                <ul className="grid grid-cols-2 gap-2">
                                    {selection.plan.features.map((f, i) => (
                                        <li key={i} className="text-xs text-zinc-300 flex items-center gap-2"><CheckIcon /> {f}</li>
                                    ))}
                                </ul>
                            </div>

                            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Available Add-ons</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {filteredAddons.map(addon => (
                                    <div key={addon.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                                        <div>
                                            <p className="font-bold text-zinc-200">{addon.name}</p>
                                            <p className="text-xs text-brand-secondary">{addon.price}</p>
                                        </div>

                                        {addon.type === 'checkbox' ? (
                                            <button
                                                onClick={() => handleAddonChange(addon, selectedAddons[addon.id] ? 0 : 1)}
                                                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${selectedAddons[addon.id] ? 'bg-brand-primary border-brand-primary text-black' : 'border-zinc-600 text-transparent'}`}
                                            >
                                                <CheckIcon size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => handleAddonChange(addon, (selectedAddons[addon.id] || 0) - 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                                                    disabled={!selectedAddons[addon.id]}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{selectedAddons[addon.id] || 0}</span>
                                                <button
                                                    onClick={() => handleAddonChange(addon, (selectedAddons[addon.id] || 0) + 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                                <h4 className="text-zinc-400 text-xs uppercase font-bold">Order Summary</h4>
                                <div className="flex justify-between text-sm text-zinc-200">
                                    <span>{selection.plan.name}</span>
                                    <span>{selection.plan.price}</span>
                                </div>
                                {Object.entries(selectedAddons).map(([id, qty]) => {
                                    const addon = addons.find(a => a.id === Number(id));
                                    if (!addon) return null;
                                    return (
                                        <div key={id} className="flex justify-between text-sm text-zinc-400">
                                            <span>{addon.name} {addon.type === 'quantity' && `x${qty}`}</span>
                                            <span>{addon.price}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={userDetails.name}
                                        onChange={e => setUserDetails({ ...userDetails, name: e.target.value })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={userDetails.phone}
                                        onChange={e => setUserDetails({ ...userDetails, phone: e.target.value })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Event Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={userDetails.date}
                                        onChange={e => setUserDetails({ ...userDetails, date: e.target.value })}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-zinc-950">
                    {step === 'addons' ? (
                        <button
                            onClick={() => setStep('details')}
                            className="w-full py-4 rounded-full bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            Proceed to Details <ArrowRight size={16} />
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('addons')}
                                className="px-6 py-4 rounded-full bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-700 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                form="booking-form"
                                type="submit"
                                disabled={submitting}
                                className="flex-grow py-4 rounded-full bg-brand-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? 'Sending...' : 'Get Quotation'} <ShoppingCart size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
