import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Configure axios base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080/api';
const api = axios.create({ baseURL: API_URL });

export default function MedicalRoutineAssistant() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: '', diagnosis: '', sector: 'emergencia', notes: '',
    clm: false, destination: '', labs: 'pendentes', prescription: false,
    examsPending: false, exams: { xray: '', ct: '', ecg: '' }
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [error, setError] = useState('');

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, []);

  // Fetch patients when user logs in
  useEffect(() => {
    if (!user) return;
    
    const fetchPatients = async () => {
      try {
        const response = await api.get('/patients');
        const data = response.data;
        
        const order = user.email.startsWith('emer')
          ? { emergencia: 0, observacao: 1, isolamento: 2 }
          : { observacao: 0, emergencia: 1, isolamento: 2 };
          
        data.sort((a, b) => order[a.sector] - order[b.sector]);
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    
    fetchPatients();
    
    // Set up polling for updates (replaces Firestore's realtime updates)
    const interval = setInterval(fetchPatients, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setError('');
    } catch (err) {
      setError('Login inválido');
      console.error("Login error:", err);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const handleSubmit = async () => {
    if (!newPatient.name.trim()) return;
    const data = { ...newPatient };
    if (!data.examsPending) data.exams = {};
    if (!data.clm) data.destination = '';

    try {
      if (editingIndex !== null) {
        await api.put(`/patients/${patients[editingIndex].id}`, data);
        setEditingIndex(null);
      } else {
        await api.post('/patients', data);
      }
      
      setNewPatient({
        name: '', diagnosis: '', sector: 'emergencia', notes: '',
        clm: false, destination: '', labs: 'pendentes', prescription: false,
        examsPending: false, exams: { xray: '', ct: '', ecg: '' }
      });
      setFormVisible(false);
      
      // Refresh patient list
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error("Error saving patient:", error);
      alert("Erro ao salvar paciente");
    }
  };

  const handleDelete = async (index) => {
    try {
      await api.delete(`/patients/${patients[index].id}`);
      const updatedPatients = [...patients];
      updatedPatients.splice(index, 1);
      setPatients(updatedPatients);
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Erro ao excluir paciente");
    }
  };

  const handleEdit = (index) => {
    const p = patients[index];
    setNewPatient({ ...p });
    setEditingIndex(index);
    setFormVisible(true);
  };

  const pendingTags = (p) => {
    const tags = [];
    if (p.clm !== true) tags.push('CLM/CLP');
    if (p.labs === 'pendentes') tags.push('Labs');
    if (!p.prescription) tags.push('Prescrição');
    if (p.examsPending) {
      if (p.exams.xray && p.exams.xray !== 'Evoluído') tags.push('Raio-X');
      if (p.exams.ct && p.exams.ct !== 'Evoluído') tags.push('Tomografia');
      if (p.exams.ecg && p.exams.ecg !== 'Evoluído') tags.push('ECG');
    }
    return tags;
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Entrar</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Assistente de Rotina Médica</h1>
      <p>Usuário: {user.email} <button onClick={handleLogout}>Sair</button></p>
      <button onClick={() => setFormVisible(!formVisible)}>
        {formVisible ? 'Ocultar Formulário' : 'Novo Paciente'}
      </button>
      {formVisible && (
        <div style={{ margin: '1rem 0' }}>
          <input value={newPatient.name} placeholder="Nome"
            onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} />
          <input value={newPatient.diagnosis} placeholder="Dx"
            onChange={e => setNewPatient({ ...newPatient, diagnosis: e.target.value })} />
          <select value={newPatient.sector}
            onChange={e => setNewPatient({ ...newPatient, sector: e.target.value })}>
            <option value="emergencia">Emergência</option>
            <option value="observacao">Observação</option>
            <option value="isolamento">Isolamento</option>
          </select>
          <label>
            <input type="checkbox" checked={newPatient.clm}
              onChange={e => setNewPatient({ ...newPatient, clm: e.target.checked })} />
            CLM/CLP?
          </label>
          {newPatient.clm && (
            <input placeholder="Destino"
              value={newPatient.destination}
              onChange={e => setNewPatient({ ...newPatient, destination: e.target.value })} />
          )}
          <select value={newPatient.labs}
            onChange={e => setNewPatient({ ...newPatient, labs: e.target.value })}>
            <option value="pendentes">Labs pendentes</option>
            <option value="evoluidos">Labs evoluídos</option>
          </select>
          <label>
            <input type="checkbox" checked={newPatient.prescription}
              onChange={e => setNewPatient({ ...newPatient, prescription: e.target.checked })} />
            Prescrição
          </label>
          <label>
            <input type="checkbox" checked={newPatient.examsPending}
              onChange={e => setNewPatient({ ...newPatient, examsPending: e.target.checked })} />
            Exames Compl. Pendentes
          </label>
          {newPatient.examsPending && (
            <>
              <select value={newPatient.exams.xray || ''}
                onChange={e => setNewPatient({ ...newPatient, exams: { ...newPatient.exams, xray: e.target.value } })}>
                <option value="">Raio-X</option>
                <option value="Pedido">Pedido</option>
                <option value="Realizado">Realizado</option>
                <option value="Evoluído">Evoluído</option>
              </select>
              <select value={newPatient.exams.ct || ''}
                onChange={e => setNewPatient({ ...newPatient, exams: { ...newPatient.exams, ct: e.target.value } })}>
                <option value="">Tomografia</option>
                <option value="Solicitado">Solicitado</option>
                <option value="Laudo Pendente">Laudo Pendente</option>
                <option value="Evoluído">Evoluído</option>
              </select>
              <select value={newPatient.exams.ecg || ''}
                onChange={e => setNewPatient({ ...newPatient, exams: { ...newPatient.exams, ecg: e.target.value } })}>
                <option value="">ECG</option>
                <option value="Solicitado">Solicitado</option>
                <option value="Evoluído">Evoluído</option>
              </select>
            </>
          )}
          <textarea
            value={newPatient.notes}
            placeholder="Observações"
            onChange={e => setNewPatient({ ...newPatient, notes: e.target.value })} />
          <button onClick={handleSubmit}>Salvar</button>
        </div>
      )}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '20%', paddingRight: 20 }}>
          <h3>Pendências</h3>
          {patients.map((p, i) => {
            const pend = pendingTags(p);
            return pend.length ? (
              <div key={p.id} style={{ border: '1px solid #ccc', margin: 4, padding: 4 }}>
                <strong>{p.name}</strong><br />
                {pend.map((tag, j) => (
                  <span key={j} style={{ background: 'yellow', marginRight: 4, padding: '2px 4px' }}>{tag}</span>
                ))}
              </div>
            ) : null;
          })}
        </div>
        <div style={{ width: '80%' }}>
          <h3>Pacientes</h3>
          {patients.map((p, i) => (
            <div key={p.id} style={{
              border: '1px solid #ccc', padding: 8, margin: 4,
              background: p.sector === 'emergencia' ? '#fff8dc'
                        : p.sector === 'observacao' ? '#e0f0ff'
                        : '#e0ffe0'
            }}>
              <strong>{p.name}</strong> — {p.diagnosis}
              <br />
              {p.clm && <div>CLM: {p.destination}</div>}
              <div>Labs: {p.labs}</div>
              <div>Prescrição: {p.prescription ? '✓' : '—'}</div>
              {p.examsPending && (
                <div>
                  {p.exams.xray && <div>Raio-X: {p.exams.xray}</div>}
                  {p.exams.ct && <div>Tomografia: {p.exams.ct}</div>}
                  {p.exams.ecg && <div>ECG: {p.exams.ecg}</div>}
                </div>
              )}
              {p.notes && <div><em>{p.notes}</em></div>}
              <button onClick={() => handleEdit(i)}>✏️</button>
              <button onClick={() => handleDelete(i)}>❌</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}