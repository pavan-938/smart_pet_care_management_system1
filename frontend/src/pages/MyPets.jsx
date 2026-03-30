import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import './MyPets.css';

const MyPets = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddPetModal, setShowAddPetModal] = useState(false);
    const [newPet, setNewPet] = useState({
        name: '',
        species: 'Dog',
        breed: '',
        age: '',
        gender: 'Male',
        weight: '',
        details: ''
    });

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/pets/my-pets');
            setPets(res.data);
        } catch (err) {
            console.error("Error fetching pets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPet = async (e) => {
        e.preventDefault();
        const petData = {
            ...newPet,
            age: newPet.age ? parseInt(newPet.age) : null,
            weight: newPet.weight ? parseFloat(newPet.weight) : null
        };

        try {
            await api.post('/pets/add', petData);
            setNewPet({
                name: '', species: 'Dog', breed: '', age: '',
                gender: 'Male', weight: '', details: ''
            });
            fetchPets();
            setShowAddPetModal(false);
            alert('New companion registered successfully!');
        } catch (err) {
            console.error("Error adding pet:", err);
            alert(err.response?.data?.message || "Failed to add pet");
        }
    };

    const getPetEmoji = (species) => {
        switch (species) {
            case 'Dog': return '🐕';
            case 'Cat': return '🐈';
            case 'Bird': return '🦜';
            case 'Rabbit': return '🐇';
            default: return '🐾';
        }
    };

    if (loading) return <div className="loading-container"><div className="modern-spinner"></div></div>;

    return (
        <div className="container dashboard-container">
            <header className="pets-header">
                <h2>Companion Family</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowAddPetModal(true)}
                    style={{ padding: '14px 28px', borderRadius: '12px', fontWeight: 800 }}
                >
                    + Register Pet
                </button>
            </header>

            <div className="pets-list">
                {pets.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '6rem', borderStyle: 'dashed' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏡</div>
                        <h3 className="text-muted" style={{ fontWeight: 800 }}>No Companions Registered</h3>
                        <p className="text-muted">Start by adding your pet's professional profile to our network.</p>
                    </div>
                ) : (
                    <div className="pets-grid">
                        {pets.map(pet => (
                            <div key={pet.id} className="card pet-card">
                                <span className={`species-badge species-${pet.species}`}>
                                    {pet.species}
                                </span>

                                <div className="pet-avatar">
                                    {getPetEmoji(pet.species)}
                                </div>

                                <div className="pet-card-header">
                                    <h3>{pet.name}</h3>
                                    <div className="pet-breed">{pet.breed || 'Signature Breed'}</div>
                                </div>

                                <div className="pet-stats">
                                    <div className="stat-box">
                                        <label>Temporal Age</label>
                                        <span>{pet.age || '?'} Years</span>
                                    </div>
                                    <div className="stat-box">
                                        <label>Health Metric</label>
                                        <span>{pet.weight || '?'} Kg</span>
                                    </div>
                                    <div className="stat-box">
                                        <label>Gender</label>
                                        <span>{pet.gender}</span>
                                    </div>
                                    <div className="stat-box">
                                        <label>Bio Status</label>
                                        <span>Healthy</span>
                                    </div>
                                </div>

                                <p className="pet-description">
                                    {pet.details || 'Professional medical history and behavioral notes will appear here once updated.'}
                                </p>

                                <div className="pet-actions">
                                    <Link
                                        to={`/pet-health/${pet.id}`}
                                        className="btn-secondary"
                                        style={{ justifyContent: 'center' }}
                                    >
                                        Health Hub
                                    </Link>
                                    <button
                                        onClick={() => navigate('/book-appointment', { state: { petId: pet.id } })}
                                        className="btn-primary"
                                    >
                                        Visit Clinic
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showAddPetModal && (
                <div className="modal-overlay" onClick={() => setShowAddPetModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        background: 'var(--bg-card)',
                        maxWidth: '600px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <button className="modal-close" onClick={() => setShowAddPetModal(false)}>&times;</button>

                        <h2 className="mb-4" style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>New Pet Profile</h2>
                        <p className="text-muted mb-5">Provide accurate clinical data for personalized healthcare.</p>

                        <form className="auth-form" onSubmit={handleAddPet}>
                            <div className="form-group">
                                <label>Registry Name</label>
                                <input
                                    placeholder="e.g. Maverick"
                                    value={newPet.name}
                                    onChange={e => setNewPet({ ...newPet, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Biological Species</label>
                                    <select
                                        value={newPet.species}
                                        onChange={e => setNewPet({ ...newPet, species: e.target.value })}
                                    >
                                        <option value="Dog">Canine (Dog)</option>
                                        <option value="Cat">Feline (Cat)</option>
                                        <option value="Bird">Avian (Bird)</option>
                                        <option value="Rabbit">Lagomorph (Rabbit)</option>
                                        <option value="Other">Other Species</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        value={newPet.gender}
                                        onChange={e => setNewPet({ ...newPet, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Breed / Ancestry</label>
                                <input
                                    placeholder="e.g. Siberian Husky"
                                    value={newPet.breed}
                                    onChange={e => setNewPet({ ...newPet, breed: e.target.value })}
                                />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Age (Numerical)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newPet.age}
                                        onChange={e => setNewPet({ ...newPet, age: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Mass (Kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="0.0"
                                        value={newPet.weight}
                                        onChange={e => setNewPet({ ...newPet, weight: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Medical & Behavioral Notes</label>
                                <textarea
                                    placeholder="Briefly describe any conditions or special care requirements..."
                                    rows="4"
                                    value={newPet.details}
                                    onChange={e => setNewPet({ ...newPet, details: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', marginTop: '1rem' }}>
                                Register Companion
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPets;