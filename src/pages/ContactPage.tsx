import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { submitInquiry } from '../lib/firestoreService';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setStatus('error');
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitInquiry({ name, email, orderCode, subject, message });
      setStatus('success');
      setName('');
      setEmail('');
      setOrderCode('');
      setSubject('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMsg('Unable to submit your inquiry right now. Please verify your details and try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5 space-y-6">
          <p className="text-xs uppercase tracking-[0.22em] text-[#B69354]">
            Client Concierge
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#141210]">
            Private Inquiries & Order Support
          </h1>
          <p className="text-sm sm:text-base text-[#2B211B]/80 leading-relaxed">
            Whether you seek bespoke fragrance pairing advice, corporate gifting
            arrangements, or assistance with an existing order, our concierge team is at
            your service.
          </p>

          <div className="border-t border-[#E8DFD1] pt-6 space-y-4 text-sm text-[#2B211B]/85">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/55">
                Boutique Hours
              </p>
              <p className="mt-1">Monday – Saturday · 10:00 AM – 7:00 PM</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/55">
                Client Care Email
              </p>
              <p className="mt-1">concierge@fragrancechamber.com</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#2B211B]/55">
                Complimentary Gift Consultation
              </p>
              <p className="mt-1">Available for bespoke coffrets and milestone occasions.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-[#F3EDE2]/45 border border-[#E8DFD1] p-7 sm:p-10 space-y-5"
          >
            <h2 className="font-serif text-2xl font-medium text-[#141210]">
              Send a Message
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Scent consultation, gifting, order..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                  Order Reference (Optional)
                </label>
                <input
                  type="text"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="e.g. FCC-2026-1042"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#2B211B]/70 mb-1.5">
                Message *
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3.5 bg-[#FAF7F2] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#B69354]"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-7 py-3.5 bg-[#141210] text-[#FAF7F2] text-xs uppercase tracking-[0.18em] hover:bg-[#2B211B] disabled:opacity-50 cursor-pointer"
            >
              {status === 'submitting' ? 'Sending...' : 'Submit Inquiry'}
            </button>

            {status === 'success' && (
              <p className="flex items-center gap-2 text-xs text-[#2B211B]">
                <Check className="w-4 h-4 text-[#B69354]" />
                Thank you. Your inquiry has been recorded by our concierge team.
              </p>
            )}
            {status === 'error' && <p className="text-xs text-red-700">{errorMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};
