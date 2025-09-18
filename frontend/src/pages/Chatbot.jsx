import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Chatbot({ embedded = false, height = '400px' }) {
	const { currentUser } = useAuth();
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);

	const sendMessage = async (e) => {
		e && e.preventDefault();
		const content = input.trim();
		if (!content) return;
		setMessages(prev => [...prev, { role: 'user', content }]);
		setInput('');
		setLoading(true);
		try {
			const token = localStorage.getItem('et_token');
			const resp = await fetch(`${API_BASE}/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ message: content })
			});
			const ct = resp.headers.get('content-type') || '';
			const data = ct.includes('application/json') ? await resp.json() : { reply: await resp.text() };
			const reply = data.reply || data.message || 'Sorry, I had trouble understanding that.';
			setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
		} catch (err) {
			setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.message || 'Something went wrong') }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`${embedded ? '' : 'max-w-2xl mx-auto'} h-full flex flex-col gap-4`} style={embedded ? { height } : undefined}>
			<div className="flex-1 overflow-y-auto border border-border rounded-lg p-4 bg-background/80">
				{messages.length === 0 ? (
					<p className="text-sm text-muted">Ask things like: "How much did I spend today?" or "Show my last 5 transactions". You can also say: "Set a reminder for tomorrow 5 PM to add groceries".</p>
				) : (
					<div className="space-y-3">
						{messages.map((m, idx) => (
							<div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
								<div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-primary text-white' : 'bg-muted'}`}>
									{m.content}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			<form onSubmit={sendMessage} className="flex gap-2">
				<input
					type="text"
					className="flex-1 border border-border rounded-lg px-3 py-2 bg-background/90"
					placeholder="Type your message..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white" disabled={loading || !currentUser}>
					{loading ? 'Sending…' : 'Send'}
				</button>
			</form>
		</div>
	);
}
